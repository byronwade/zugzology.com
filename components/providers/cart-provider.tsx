"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { nanoid } from "nanoid";
import type { ShopifyCart, CartItem } from "@/lib/types";
import { createCart, getCart, addToCart, updateCartLine, removeFromCart } from "@/lib/actions/shopify";
import { toast } from "sonner";

interface CartContext {
	cart: ShopifyCart | null;
	cartId: string | null;
	isUpdating: boolean;
	addItem: (item: CartItem) => Promise<void>;
	removeItem: (itemId: string) => Promise<void>;
	updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
}

export const CartContext = createContext<CartContext>({
	cart: null,
	cartId: null,
	isUpdating: false,
	addItem: async () => {},
	removeItem: async () => {},
	updateItemQuantity: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [cart, setCart] = useState<ShopifyCart | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [cartId, setCartId] = useLocalStorage<string | null>("cartId", null);
	const [shouldInitialize, setShouldInitialize] = useState(true);
	const mountedRef = useRef(false);
	const initializingRef = useRef(false);
	const sessionId = useRef(nanoid(7));
	const attemptsRef = useRef(0);
	const [isUpdating, setIsUpdating] = useState(false);

	// Mounting effect
	useEffect(() => {
		console.log(`[Cart Provider ${sessionId.current}] Mounting component, cartId:`, cartId || "none");
		mountedRef.current = true;
		return () => {
			console.log(`[Cart Provider ${sessionId.current}] Unmounting component`);
			mountedRef.current = false;
		};
	}, []);

	// Cart initialization effect
	useEffect(() => {
		const MAX_ATTEMPTS = 3;
		const RETRY_DELAY = 1000;

		async function initCart() {
			// Skip if conditions aren't met
			if (!shouldInitialize || !mountedRef.current || attemptsRef.current >= MAX_ATTEMPTS || initializingRef.current) {
				console.log(`[Cart Provider ${sessionId.current}] Skipping initialization:`, {
					shouldInit: shouldInitialize,
					mounted: mountedRef.current,
					attempts: attemptsRef.current,
					maxAttempts: MAX_ATTEMPTS,
					initializing: initializingRef.current,
				});
				return;
			}

			initializingRef.current = true;
			console.log(`[Cart Provider ${sessionId.current}] Starting initialization attempt ${attemptsRef.current + 1}/${MAX_ATTEMPTS}`);

			try {
				setIsLoading(true);
				setError(null);

				console.log(`[Cart Provider ${sessionId.current}] Sending POST request with cartId:`, cartId || "none");
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
				console.log(`[Cart Provider ${sessionId.current}] Received cart response:`, {
					id: currentCart?.id,
					lines: currentCart?.lines?.edges?.length || 0,
				});

				if (mountedRef.current) {
					if (currentCart.id) {
						setCart(currentCart);
						// Only set cartId if it's different to prevent loops
						if (currentCart.id !== cartId) {
							setCartId(currentCart.id);
						}
						console.log(`[Cart Provider ${sessionId.current}] Cart initialized successfully:`, currentCart.id);
						setShouldInitialize(false);
					} else {
						throw new Error("Invalid cart response");
					}
				}
			} catch (err) {
				console.error(`[Cart Provider ${sessionId.current}] Initialization error:`, err);
				if (mountedRef.current) {
					setError(err instanceof Error ? err : new Error("Failed to create cart"));
					attemptsRef.current += 1;

					if (attemptsRef.current < MAX_ATTEMPTS) {
						console.log(`[Cart Provider ${sessionId.current}] Scheduling retry in ${RETRY_DELAY}ms (attempt ${attemptsRef.current}/${MAX_ATTEMPTS})`);
						setTimeout(() => {
							if (mountedRef.current) {
								initializingRef.current = false;
								initCart();
							}
						}, RETRY_DELAY);
					} else {
						console.log(`[Cart Provider ${sessionId.current}] Max attempts reached, giving up`);
						setShouldInitialize(false);
					}
				}
			} finally {
				if (mountedRef.current) {
					setIsLoading(false);
					if (!error && cart) {
						initializingRef.current = false;
					}
				}
			}
		}

		if (shouldInitialize) {
			initCart();
		}
	}, [shouldInitialize, cartId]);

	// Reset initialization when cartId changes externally
	useEffect(() => {
		if (!cart || cart.id !== cartId) {
			console.log(`[Cart Provider ${sessionId.current}] CartId changed externally, triggering re-initialization`);
			setShouldInitialize(true);
			attemptsRef.current = 0;
		}
	}, [cartId, cart]);

	const addItem = async (item: CartItem) => {
		if (!cart?.id) {
			console.error("No cart ID available");
			toast.error("Unable to add item to cart");
			return;
		}

		setIsLoading(true);
		try {
			const merchandiseId = item.merchandiseId.includes("gid://shopify/ProductVariant/") ? item.merchandiseId : `gid://shopify/ProductVariant/${item.merchandiseId}`;

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
		} catch (error) {
			console.error("Error adding item to cart:", error);
			if (error instanceof Error && error.message.includes("cart not found")) {
				setCart(null);
				setCartId(null);
				toast.error("Cart expired, please try again");
			} else {
				toast.error("Failed to add item to cart");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return <CartContext.Provider value={{ cart, cartId, isUpdating, addItem, removeItem: async () => {}, updateItemQuantity: async () => {} }}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
