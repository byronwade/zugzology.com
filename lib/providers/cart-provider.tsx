"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCart, createCart, addToCart, updateCartLine, removeFromCart } from "@/lib/actions/shopify";
import type { ShopifyCart, CartItem } from "@/lib/types";
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
	createNewCart: (items: CartItem[]) => Promise<ShopifyCart | null>;
}

const CartContext = createContext<CartContext | null>(null);

const CART_ID_KEY = "shopifyCartId";
const CART_DATA_KEY = "shopifyCartData";
const CART_TIMESTAMP_KEY = "shopifyCartTimestamp";
const CART_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [cart, setCart] = useState<ShopifyCart | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const [initializationAttempts, setInitializationAttempts] = useState(0);

	const clearCart = useCallback(() => {
		localStorage.removeItem(CART_ID_KEY);
		localStorage.removeItem(CART_DATA_KEY);
		localStorage.removeItem(CART_TIMESTAMP_KEY);
		setCart(null);
		setIsInitialized(true);
	}, []);

	// Load cart data from localStorage on mount
	useEffect(() => {
		const initCart = async () => {
			// Prevent infinite loops
			if (initializationAttempts >= 3) {
				console.error("Failed to initialize cart after 3 attempts");
				clearCart();
				return;
			}

			try {
				setIsLoading(true);

				// Check cart timestamp
				const timestamp = localStorage.getItem(CART_TIMESTAMP_KEY);
				const now = Date.now();
				if (timestamp && now - parseInt(timestamp) > CART_EXPIRY) {
					console.log("Cart expired, clearing...");
					clearCart();
				}

				// Try to get cart ID from localStorage
				const cartId = localStorage.getItem(CART_ID_KEY);
				const cachedCartData = localStorage.getItem(CART_DATA_KEY);

				if (cartId) {
					// Use cached data while fetching fresh data
					if (cachedCartData) {
						try {
							const parsedCart = JSON.parse(cachedCartData);
							setCart(parsedCart);
						} catch (e) {
							console.warn("Failed to parse cached cart data");
						}
					}

					try {
						// Then fetch fresh cart data from Shopify
						const existingCart = await getCart(cartId);
						if (existingCart) {
							console.log("Found existing cart:", existingCart.id);
							setCart(existingCart);
							localStorage.setItem(CART_DATA_KEY, JSON.stringify(existingCart));
							localStorage.setItem(CART_TIMESTAMP_KEY, now.toString());
							setIsInitialized(true);
							return;
						} else {
							console.log("Cart not found in Shopify, clearing local data");
							clearCart();
						}
					} catch (error) {
						console.error("Error fetching existing cart:", error);
						if (error instanceof Error && error.message.includes("cart not found")) {
							clearCart();
						} else {
							throw error; // Re-throw other errors
						}
					}
				}

				// Create new cart if needed
				console.log("Creating new cart...");
				const newCart = await createCart();
				if (newCart?.id) {
					localStorage.setItem(CART_ID_KEY, newCart.id);
					localStorage.setItem(CART_DATA_KEY, JSON.stringify(newCart));
					localStorage.setItem(CART_TIMESTAMP_KEY, now.toString());
					setCart(newCart);
					console.log("New cart created:", newCart.id);
					setIsInitialized(true);
				} else {
					throw new Error("Failed to create cart - no cart ID returned");
				}
			} catch (error) {
				console.error("Error initializing cart:", error);
				setInitializationAttempts((prev) => prev + 1);
				// Only retry if we haven't exceeded attempts
				if (initializationAttempts < 2) {
					setTimeout(() => setIsInitialized(false), 1000);
				} else {
					clearCart();
				}
			} finally {
				setIsLoading(false);
			}
		};

		if (!isInitialized && !isLoading) {
			initCart();
		}
	}, [isInitialized, isLoading, clearCart, initializationAttempts]);

	const openCart = () => setIsOpen(true);
	const closeCart = () => setIsOpen(false);

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
					},
				]);
			}

			if (!updatedCart) {
				throw new Error("Failed to update cart");
			}

			setCart(updatedCart);
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
	};

	const updateItem = async (lineId: string, quantity: number) => {
		if (!cart?.id) {
			console.error("No cart ID available");
			return;
		}

		setIsLoading(true);
		try {
			const updatedCart = await updateCartLine(cart.id, lineId, quantity);
			if (!updatedCart) {
				throw new Error("Failed to update cart");
			}
			setCart(updatedCart);
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
	};

	const removeItem = async (lineId: string) => {
		if (!cart?.id) {
			console.error("No cart ID available");
			return;
		}

		setIsLoading(true);
		try {
			const updatedCart = await removeFromCart(cart.id, lineId);
			if (!updatedCart) {
				throw new Error("Failed to update cart");
			}
			setCart(updatedCart);
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
	};

	const createNewCart = async (items: CartItem[]) => {
		setIsLoading(true);
		try {
			const formattedItems = items.map((item) => ({
				merchandiseId: item.merchandiseId.includes("gid://shopify/ProductVariant/") ? item.merchandiseId : `gid://shopify/ProductVariant/${item.merchandiseId}`,
				quantity: item.quantity,
			}));

			const newCart = await createCart();
			if (!newCart?.id) {
				throw new Error("Failed to create cart");
			}

			// Add items to the new cart
			if (formattedItems.length > 0) {
				const cartWithItems = await addToCart(newCart.id, formattedItems);
				if (!cartWithItems) {
					throw new Error("Failed to add items to cart");
				}
				return cartWithItems;
			}

			return newCart;
		} catch (error) {
			console.error("Error creating new cart:", error);
			toast.error("Failed to create checkout");
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	const value = {
		cart,
		isLoading,
		isOpen,
		isInitialized,
		openCart,
		closeCart,
		addItem,
		updateItem,
		removeItem,
		createNewCart,
	};

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
