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
	ensureCart: () => Promise<ShopifyCart | null>;
	addItem: (item: CartItem) => Promise<void>;
	updateItem: (lineId: string, quantity: number) => Promise<void>;
	removeItem: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContext | null>(null);

// Constants for caching
const CART_ID_KEY = "shopifyCartId";
const CART_CACHE_KEY = "shopifyCartCache";
const CART_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for better performance
const THROTTLE_DURATION = 500; // Throttle operations by 500ms

interface CartCache {
	cart: ShopifyCart;
	timestamp: number;
}

// Utility function for throttling operations
function throttle<T extends (...args: any[]) => any>(
	func: T,
	delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
	let lastCall = 0;
	let pendingCall: any = null;

	return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
		const now = Date.now();
		const timeSinceLastCall = now - lastCall;

		if (timeSinceLastCall >= delay) {
			lastCall = now;
			return func(...args);
		}

		// Clear any existing pending call
		if (pendingCall) {
			clearTimeout(pendingCall.timeout);
		}

		// Set up a new pending call
		return new Promise((resolve, reject) => {
			pendingCall = {
				timeout: setTimeout(() => {
					lastCall = Date.now();
					try {
						const result = func(...args);
						resolve(result);
					} catch (error) {
						reject(error);
					}
					pendingCall = null;
				}, delay - timeSinceLastCall),
			};
		});
	};
}

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [cart, setCart] = useState<ShopifyCart | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const initializationPromise = useRef<Promise<void>>();
	const initializationAttempts = useRef(0);
	const lastCartUpdate = useRef<number>(0);

	const clearCart = useCallback(() => {
		localStorage.removeItem(CART_ID_KEY);
		localStorage.removeItem(CART_CACHE_KEY);
		setCart(null);
		setIsInitialized(true);
	}, []);

	// Update cache when cart changes
	const updateCartCache = useCallback((updatedCart: ShopifyCart) => {
		if (!updatedCart) return;

		try {
			localStorage.setItem(
				CART_CACHE_KEY,
				JSON.stringify({
					cart: updatedCart,
					timestamp: Date.now(),
				})
			);
			lastCartUpdate.current = Date.now();
		} catch (e) {
			console.warn("Failed to update cart cache:", e);
		}
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
					updateCartCache(existingCart);
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
			updateCartCache(newCart);
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
	}, [isInitialized, isLoading, clearCart, updateCartCache]);

	// Initialize cart on mount
	useEffect(() => {
		if (!isInitialized && !initializationPromise.current) {
			initializationPromise.current = initializeCart();
		}
	}, [isInitialized, initializeCart]);

	// Add a function to ensure cart is ready
	const ensureCart = useCallback(async () => {
		if (!isInitialized) {
			// If initialization hasn't started yet, start it
			if (!initializationPromise.current) {
				initializationPromise.current = initializeCart();
			}
			// Wait for initialization to complete
			await initializationPromise.current;
		}
		return cart;
	}, [isInitialized, initializeCart, cart]);

	// Recheck cart status periodically
	useEffect(() => {
		// If cart initialization failed, retry after 5 seconds
		if (isInitialized && !cart) {
			const timer = setTimeout(() => {
				initializationAttempts.current = 0;
				setIsInitialized(false);
				initializationPromise.current = undefined;
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [isInitialized, cart]);

	// Define document body class for cart open state
	useEffect(() => {
		if (isOpen) {
			document.body.classList.add("cart-open");
		} else {
			document.body.classList.remove("cart-open");
		}
		return () => {
			document.body.classList.remove("cart-open");
		};
	}, [isOpen]);

	const openCart = useCallback(() => {
		setIsOpen(true);
	}, []);

	const closeCart = useCallback(() => {
		setIsOpen(false);
	}, []);

	// Add throttling to cart operations - fixed type issues
	const throttledAddToCart = useMemo(
		() => throttle((cartId: string, items: CartItem[]) => addToCart(cartId, items), THROTTLE_DURATION),
		[]
	);
	const throttledUpdateCartLine = useMemo(() => throttle(updateCartLine, THROTTLE_DURATION), []);
	const throttledRemoveFromCart = useMemo(
		() => throttle((cartId: string, lineIds: string[]) => removeFromCart(cartId, lineIds), THROTTLE_DURATION),
		[]
	);

	const addItem = useCallback(
		async (item: CartItem) => {
			if (isLoading) {
				toast.error("Please wait while we process your request");
				return;
			}

			setIsLoading(true);
			try {
				// Use ensureCart instead of checking cart.id directly
				const currentCart = await ensureCart();

				// Ensure cart ID exists
				if (!currentCart?.id) {
					throw new Error("Cart not initialized");
				}

				const merchandiseId = item.merchandiseId.includes("gid://shopify/ProductVariant/")
					? item.merchandiseId
					: `gid://shopify/ProductVariant/${item.merchandiseId}`;

				const existingLine = currentCart.lines.edges.find(({ node }) => node.merchandise.id === merchandiseId);

				let updatedCart;
				if (existingLine) {
					updatedCart = await throttledUpdateCartLine(
						currentCart.id,
						existingLine.node.id,
						existingLine.node.quantity + item.quantity
					);
				} else {
					updatedCart = await throttledAddToCart(currentCart.id, [
						{
							merchandiseId,
							quantity: item.quantity,
						},
					]);
				}

				if (updatedCart) {
					setCart(updatedCart);
					updateCartCache(updatedCart);
					toast.success(item.isPreOrder ? "Pre-order added to cart" : "Added to cart");

					// Automatically open the cart when an item is successfully added
					setIsOpen(true);
				}
			} catch (error) {
				console.error("Failed to add item to cart:", error);
				toast.error("Failed to add item to cart");
			} finally {
				setIsLoading(false);
			}
		},
		[isLoading, ensureCart, throttledAddToCart, throttledUpdateCartLine, updateCartCache]
	);

	const updateItem = useCallback(
		async (lineId: string, quantity: number) => {
			setIsLoading(true);

			try {
				const currentCart = await ensureCart();

				if (!currentCart?.id) {
					throw new Error("Cart not initialized");
				}

				const updatedCart = await throttledUpdateCartLine(currentCart.id, lineId, quantity);

				if (updatedCart) {
					setCart(updatedCart);
					updateCartCache(updatedCart);
				}
			} catch (error) {
				console.error("Failed to update item:", error);
				toast.error("Failed to update item");
			} finally {
				setIsLoading(false);
			}
		},
		[ensureCart, throttledUpdateCartLine, updateCartCache]
	);

	const removeItem = useCallback(
		async (lineId: string) => {
			setIsLoading(true);

			try {
				const currentCart = await ensureCart();

				if (!currentCart?.id) {
					throw new Error("Cart not initialized");
				}

				const updatedCart = await throttledRemoveFromCart(currentCart.id, [lineId]);

				if (updatedCart) {
					setCart(updatedCart);
					updateCartCache(updatedCart);
					toast.success("Item removed from cart");
				}
			} catch (error) {
				console.error("Failed to remove item:", error);
				toast.error("Failed to remove item");
			} finally {
				setIsLoading(false);
			}
		},
		[ensureCart, throttledRemoveFromCart, updateCartCache]
	);

	const value = useMemo(
		() => ({
			cart,
			isLoading,
			isOpen,
			isInitialized,
			openCart,
			closeCart,
			ensureCart,
			addItem,
			updateItem,
			removeItem,
		}),
		[cart, isLoading, isOpen, isInitialized, openCart, closeCart, ensureCart, addItem, updateItem, removeItem]
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
