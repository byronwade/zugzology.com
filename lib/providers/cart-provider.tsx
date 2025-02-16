"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { getCart, createCart, addToCart, updateCartLine, removeFromCart } from "@/lib/actions/shopify";
import type { CartItem, ShopifyCart } from "@/lib/types";
import { toast } from "sonner";

interface CartContext {
	cart: ShopifyCart | null;
	isLoading: boolean;
	isOpen: boolean;
	isInitialized: boolean;
	openCart: () => void;
	closeCart: () => void;
	addItem: (item: CartItem) => Promise<void>;
	updateItem: (lineId: string, quantity: number) => Promise<void>;
	removeItem: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContext | null>(null);

// Constants for caching
const CART_ID_KEY = "shopifyCartId";
const CART_CACHE_KEY = "shopifyCartCache";
const CART_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CartCache {
	cart: ShopifyCart;
	timestamp: number;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [cart, setCart] = useState<ShopifyCart | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const initializationPromise = useRef<Promise<void>>();
	const initializationAttempts = useRef(0);

	const clearCart = useCallback(() => {
		localStorage.removeItem(CART_ID_KEY);
		localStorage.removeItem(CART_CACHE_KEY);
		setCart(null);
		setIsInitialized(true);
	}, []);

	const initializeCart = useCallback(async () => {
		if (isInitialized || isLoading || initializationAttempts.current >= 3) {
			return;
		}

		try {
			setIsLoading(true);
			initializationAttempts.current += 1;

			// Try to get cached cart data
			const cachedData = localStorage.getItem(CART_CACHE_KEY);
			if (cachedData) {
				try {
					const { cart: cachedCart, timestamp }: CartCache = JSON.parse(cachedData);
					if (Date.now() - timestamp < CART_CACHE_DURATION) {
						setCart(cachedCart);
						setIsInitialized(true);
						return;
					}
				} catch (e) {
					console.warn("Failed to parse cached cart:", e);
				}
			}

			// Try to get existing cart
			const cartId = localStorage.getItem(CART_ID_KEY);
			if (cartId) {
				const existingCart = await getCart(cartId);
				if (existingCart) {
					setCart(existingCart);
					localStorage.setItem(
						CART_CACHE_KEY,
						JSON.stringify({
							cart: existingCart,
							timestamp: Date.now(),
						})
					);
					setIsInitialized(true);
					return;
				}
			}

			// Create new cart
			const newCart = await createCart();
			if (!newCart?.id) {
				throw new Error("Failed to create new cart");
			}

			localStorage.setItem(CART_ID_KEY, newCart.id);
			localStorage.setItem(
				CART_CACHE_KEY,
				JSON.stringify({
					cart: newCart,
					timestamp: Date.now(),
				})
			);
			setCart(newCart);
			setIsInitialized(true);
		} catch (error) {
			console.error("Cart initialization error:", error);
			if (initializationAttempts.current < 3) {
				// Retry after a delay
				await new Promise((resolve) => setTimeout(resolve, 1000));
				await initializeCart();
			} else {
				clearCart();
			}
		} finally {
			setIsLoading(false);
		}
	}, [isInitialized, isLoading, clearCart]);

	// Initialize cart on mount
	useEffect(() => {
		if (!isInitialized && !initializationPromise.current) {
			initializationPromise.current = initializeCart();
		}
	}, [isInitialized, initializeCart]);

	const openCart = useCallback(() => {
		setIsOpen(true);
	}, []);

	const closeCart = useCallback(() => {
		setIsOpen(false);
	}, []);

	const addItem = useCallback(
		async (item: CartItem) => {
			// Ensure cart is initialized
			if (!isInitialized) {
				await initializationPromise.current;
			}

			if (!cart?.id) {
				try {
					await initializeCart();
					if (!cart?.id) {
						throw new Error("Failed to initialize cart");
					}
				} catch (error) {
					console.error("Failed to initialize cart for adding item:", error);
					toast.error("Unable to add item to cart. Please try again.");
					return;
				}
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
						},
					]);
				}

				if (!updatedCart) {
					throw new Error("Failed to update cart");
				}

				setCart(updatedCart);
				localStorage.setItem(
					CART_CACHE_KEY,
					JSON.stringify({
						cart: updatedCart,
						timestamp: Date.now(),
					})
				);
				openCart();
				toast.success(item.isPreOrder ? "Pre-order added to cart" : "Added to cart");
			} catch (error) {
				console.error("Error adding item to cart:", error);
				if (error instanceof Error && error.message.includes("cart not found")) {
					clearCart();
					toast.error("Cart expired, please try again");
				} else {
					toast.error("Failed to add item to cart");
				}
			} finally {
				setIsLoading(false);
			}
		},
		[cart, isInitialized, initializeCart, clearCart, openCart]
	);

	const updateItem = useCallback(
		async (lineId: string, quantity: number) => {
			if (!cart?.id) return;

			setIsLoading(true);
			try {
				const updatedCart = await updateCartLine(cart.id, lineId, quantity);
				if (!updatedCart) {
					throw new Error("Failed to update cart");
				}
				setCart(updatedCart);
				localStorage.setItem(
					CART_CACHE_KEY,
					JSON.stringify({
						cart: updatedCart,
						timestamp: Date.now(),
					})
				);
				toast.success("Cart updated");
			} catch (error) {
				console.error("Error updating cart item:", error);
				if (error instanceof Error && error.message.includes("cart not found")) {
					clearCart();
					toast.error("Cart expired, please try again");
				} else {
					toast.error("Failed to update item");
				}
			} finally {
				setIsLoading(false);
			}
		},
		[cart, clearCart]
	);

	const removeItem = useCallback(
		async (lineId: string) => {
			if (!cart?.id) return;

			setIsLoading(true);
			try {
				const updatedCart = await removeFromCart(cart.id, lineId);
				if (!updatedCart) {
					throw new Error("Failed to update cart");
				}
				setCart(updatedCart);
				localStorage.setItem(
					CART_CACHE_KEY,
					JSON.stringify({
						cart: updatedCart,
						timestamp: Date.now(),
					})
				);
				toast.success("Item removed from cart");
			} catch (error) {
				console.error("Error removing cart item:", error);
				if (error instanceof Error && error.message.includes("cart not found")) {
					clearCart();
					toast.error("Cart expired, please try again");
				} else {
					toast.error("Failed to remove item");
				}
			} finally {
				setIsLoading(false);
			}
		},
		[cart, clearCart]
	);

	const value = useMemo(
		() => ({
			cart,
			isLoading,
			isOpen,
			isInitialized,
			openCart,
			closeCart,
			addItem,
			updateItem,
			removeItem,
		}),
		[cart, isLoading, isOpen, isInitialized, openCart, closeCart, addItem, updateItem, removeItem]
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
