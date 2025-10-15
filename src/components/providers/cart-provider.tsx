"use client";

import { nanoid } from "nanoid";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { addToCart, removeFromCart, updateCartLine } from "@/lib/actions/shopify";
import { analytics } from "@/lib/analytics/tracker";
import type { CartItem, ShopifyCart } from "@/lib/types";

type CartContext = {
	cart: ShopifyCart | null;
	cartId: string | null;
	isUpdating: boolean;
	isLoading: boolean;
	isOpen: boolean;
	addItem: (item: CartItem) => Promise<void>;
	removeItem: (itemId: string) => Promise<void>;
	updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
	updateItem: (itemId: string, quantity: number) => Promise<void>;
	openCart: () => void;
	closeCart: () => void;
	getItemCount: () => number;
};

export const CartContext = createContext<CartContext>({
	cart: null,
	cartId: null,
	isUpdating: false,
	isLoading: false,
	isOpen: false,
	addItem: async () => {},
	removeItem: async () => {},
	updateItemQuantity: async () => {},
	updateItem: async () => {},
	openCart: () => {},
	closeCart: () => {},
	getItemCount: () => 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [cart, setCart] = useState<ShopifyCart | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [_error, setError] = useState<Error | null>(null);
	const [cartId, setCartId] = useLocalStorage<string | null>("cartId", null);
	const [shouldInitialize, setShouldInitialize] = useState(true);
	const mountedRef = useRef(false);
	const initializingRef = useRef(false);
	const sessionId = useRef<string | null>(null);
	const attemptsRef = useRef(0);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const cartQuantity = cart?.totalQuantity ?? 0;
	const getItemCount = useCallback(() => cartQuantity, [cartQuantity]);

	const initialCartIdRef = useRef(cartId);
	const sessionIdValueRef = useRef<string | null>(null);

	// Mounting effect
	useEffect(() => {
		// Generate sessionId on mount to avoid server-side crypto issues
		if (!sessionId.current) {
			sessionId.current = nanoid(7);
			sessionIdValueRef.current = sessionId.current;
		}

		const _sessionIdLabel = sessionIdValueRef.current;
		const _initialCartId = initialCartIdRef.current;
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	// Cart initialization effect
	useEffect(() => {
		const MAX_ATTEMPTS = 3;
		const RETRY_DELAY = 1000;

		async function initCart() {
			// Skip if conditions aren't met
			if (!(shouldInitialize && mountedRef.current) || attemptsRef.current >= MAX_ATTEMPTS || initializingRef.current) {
				return;
			}

			initializingRef.current = true;

			try {
				setIsLoading(true);
				setError(null);
				const response = await fetch("/api/cart", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ cartId }),
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const currentCart = await response.json();

				if (mountedRef.current) {
					if (currentCart.id) {
						setCart(currentCart);
						// Only set cartId if it's different to prevent loops
						if (currentCart.id !== cartId) {
							setCartId(currentCart.id);
						}
						setShouldInitialize(false);
					} else {
						throw new Error("Invalid cart response");
					}
				}
			} catch (err) {
				if (mountedRef.current) {
					setError(err instanceof Error ? err : new Error("Failed to create cart"));
					attemptsRef.current += 1;

					if (attemptsRef.current < MAX_ATTEMPTS) {
						setTimeout(() => {
							if (mountedRef.current) {
								initializingRef.current = false;
								initCart();
							}
						}, RETRY_DELAY);
					} else {
						setShouldInitialize(false);
					}
				}
			} finally {
				if (mountedRef.current) {
					setIsLoading(false);
					initializingRef.current = false;
				}
			}
		}

		if (shouldInitialize) {
			initCart();
		}
	}, [shouldInitialize, cartId, setCartId]);

	// Reset initialization when cartId changes externally
	useEffect(() => {
		if (!cart || cart.id !== cartId) {
			setShouldInitialize(true);
			attemptsRef.current = 0;
		}
	}, [cartId, cart]);

	const addItem = async (item: CartItem) => {
		if (!cart?.id) {
			toast.error("Unable to add item to cart");
			return;
		}

		setIsUpdating(true);
		try {
			const merchandiseId = item.merchandiseId.includes("gid://shopify/ProductVariant/")
				? item.merchandiseId
				: `gid://shopify/ProductVariant/${item.merchandiseId}`;

			const existingLine = cart.lines.edges.find(({ node }) => node.merchandise.id === merchandiseId);

			let updatedCart;
			if (existingLine) {
				updatedCart = await updateCartLine(cart.id, existingLine.node.id, existingLine.node.quantity + item.quantity);
			} else {
				updatedCart = await addToCart(cart.id, [
					{
						merchandiseId,
						quantity: item.quantity,
						attributes: item.attributes?.map((attr) => ({
							key: attr.key,
							value: attr.value,
						})),
					},
				]);
			}

			if (!updatedCart) {
				throw new Error("Failed to update cart");
			}

			setCart(updatedCart);
			toast.success(item.isPreOrder ? "Pre-order added to cart" : "Added to cart");

			// Track add to cart analytics
			analytics.addToCart({
				productId: item.productId ?? item.merchandiseId,
				quantity: item.quantity,
				variant: item.merchandiseId,
				price: item.price,
				cartValue: updatedCart.cost?.totalAmount?.amount,
				itemCount: updatedCart.totalQuantity,
			});

			// Emit cart add event for other systems
			if (typeof window !== "undefined") {
				const trackedProductId = item.productId ?? item.merchandiseId;
				window.dispatchEvent(
					new CustomEvent("cart-add", {
						detail: {
							productId: trackedProductId,
							quantity: item.quantity,
							variant: item.merchandiseId,
						},
					})
				);
			}

			// Open cart sheet after adding item
			setIsOpen(true);
		} catch (error) {
			if (error instanceof Error && error.message.includes("cart not found")) {
				setCart(null);
				setCartId(null);
				toast.error("Cart expired, please try again");
			} else {
				toast.error("Failed to add item to cart");
			}
		} finally {
			setIsUpdating(false);
		}
	};

	const removeItem = async (itemId: string) => {
		if (!cart?.id) {
			toast.error("Unable to remove item from cart");
			return;
		}

		// Find the product ID and quantity before removing
		const cartLine = cart.lines.edges.find(({ node }) => node.id === itemId);
		const productId = cartLine?.node.merchandise.product?.id;
		const removedQuantity = cartLine?.node.quantity;

		setIsUpdating(true);
		try {
			const updatedCart = await removeFromCart(cart.id, [itemId]);
			if (!updatedCart) {
				throw new Error("Failed to remove item from cart");
			}
			setCart(updatedCart);
			toast.success("Item removed from cart");

			// Track remove from cart analytics
			if (productId) {
				analytics.removeFromCart({
					productId,
					quantity: removedQuantity,
				});
			}

			// Emit cart remove event
			if (typeof window !== "undefined") {
				window.dispatchEvent(
					new CustomEvent("cart-remove", {
						detail: { itemId, productId },
					})
				);
			}
		} catch (error) {
			if (error instanceof Error && error.message.includes("cart not found")) {
				setCart(null);
				setCartId(null);
				toast.error("Cart expired, please try again");
			} else {
				toast.error("Failed to remove item from cart");
			}
		} finally {
			setIsUpdating(false);
		}
	};

	const updateItemQuantity = async (itemId: string, quantity: number) => {
		if (!cart?.id) {
			toast.error("Unable to update cart");
			return;
		}

		// Find the product and old quantity before updating
		const cartLine = cart.lines.edges.find(({ node }) => node.id === itemId);
		const productId = cartLine?.node.merchandise.product?.id;
		const oldQuantity = cartLine?.node.quantity;

		setIsUpdating(true);
		try {
			const updatedCart = await updateCartLine(cart.id, itemId, quantity);
			if (!updatedCart) {
				throw new Error("Failed to update cart");
			}
			setCart(updatedCart);
			toast.success("Cart updated");

			// Track cart quantity update analytics
			if (productId) {
				analytics.updateCartQuantity({
					productId,
					quantity,
					oldQuantity,
				});
			}

			// Emit cart update event
			if (typeof window !== "undefined") {
				window.dispatchEvent(
					new CustomEvent("cart-update", {
						detail: { itemId, quantity },
					})
				);
			}
		} catch (error) {
			if (error instanceof Error && error.message.includes("cart not found")) {
				setCart(null);
				setCartId(null);
				toast.error("Cart expired, please try again");
			} else {
				toast.error("Failed to update cart");
			}
		} finally {
			setIsUpdating(false);
		}
	};

	const updateItem = updateItemQuantity; // Alias for compatibility

	const openCart = () => {
		setIsOpen(true);
		// Track cart open analytics
		analytics.cartOpen({
			itemCount: cart?.totalQuantity,
			cartValue: cart?.cost?.totalAmount?.amount,
		});
	};

	const closeCart = () => {
		setIsOpen(false);
		// Track cart close analytics
		analytics.cartClose({
			itemCount: cart?.totalQuantity,
			cartValue: cart?.cost?.totalAmount?.amount,
		});
	};

	return (
		<CartContext.Provider
			value={{
				cart,
				cartId,
				isUpdating,
				isLoading,
				isOpen,
				addItem,
				removeItem,
				updateItemQuantity,
				updateItem,
				openCart,
				closeCart,
				getItemCount,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
