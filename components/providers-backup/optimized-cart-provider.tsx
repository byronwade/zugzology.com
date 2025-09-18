"use client";

import { createContext, useContext, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { nanoid } from "nanoid";
import type { ShopifyCart, CartItem } from "@/lib/types";
import { createCart, getCart, addToCart, updateCartLine, removeFromCart } from "@/lib/actions/shopify";
import { toast } from "sonner";

interface CartContext {
	cart: ShopifyCart | null;
	cartId: string | null;
	isUpdating: boolean;
	isLoading: boolean;
	isOpen: boolean;
	// Optimistic updates
	optimisticCart: ShopifyCart | null;
	addItem: (item: CartItem) => Promise<void>;
	removeItem: (itemId: string) => Promise<void>;
	updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
	updateItem: (itemId: string, quantity: number) => Promise<void>;
	openCart: () => void;
	closeCart: () => void;
	// Performance helpers
	getItemCount: () => number;
	getTotalAmount: () => number;
}

const CartContext = createContext<CartContext>({
	cart: null,
	cartId: null,
	isUpdating: false,
	isLoading: false,
	isOpen: false,
	optimisticCart: null,
	addItem: async () => {},
	removeItem: async () => {},
	updateItemQuantity: async () => {},
	updateItem: async () => {},
	openCart: () => {},
	closeCart: () => {},
	getItemCount: () => 0,
	getTotalAmount: () => 0,
});

export function OptimizedCartProvider({ children }: { children: React.ReactNode }) {
	const [cart, setCart] = useState<ShopifyCart | null>(null);
	const [optimisticCart, setOptimisticCart] = useState<ShopifyCart | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [cartId, setCartId] = useLocalStorage<string | null>("cartId", null);
	
	const initializingRef = useRef(false);
	const sessionId = useRef(nanoid(7));

	// Memoized cart calculations to prevent unnecessary recalculations
	const cartMetrics = useMemo(() => {
		const currentCart = optimisticCart || cart;
		if (!currentCart?.lines?.edges) {
			return { itemCount: 0, totalAmount: 0 };
		}

		const itemCount = currentCart.lines.edges.reduce((total, { node }) => total + node.quantity, 0);
		const totalAmount = parseFloat(currentCart.cost?.totalAmount?.amount || "0");

		return { itemCount, totalAmount };
	}, [optimisticCart, cart]);

	// Performance-optimized callbacks
	const getItemCount = useCallback(() => cartMetrics.itemCount, [cartMetrics.itemCount]);
	const getTotalAmount = useCallback(() => cartMetrics.totalAmount, [cartMetrics.totalAmount]);
	const openCart = useCallback(() => setIsOpen(true), []);
	const closeCart = useCallback(() => setIsOpen(false), []);

	// Simplified cart initialization
	useEffect(() => {
		async function initCart() {
			if (initializingRef.current) return;
			initializingRef.current = true;

			try {
				setIsLoading(true);
				const response = await fetch("/api/cart", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ cartId }),
				});

				if (response.ok) {
					const currentCart = await response.json();
					setCart(currentCart);
					setOptimisticCart(currentCart);
					if (currentCart.id !== cartId) {
						setCartId(currentCart.id);
					}
				}
			} catch (error) {
				console.error("Cart initialization error:", error);
			} finally {
				setIsLoading(false);
				initializingRef.current = false;
			}
		}

		initCart();
	}, [cartId, setCartId]);

	// Optimistic update helper
	const updateOptimisticCart = useCallback((updater: (cart: ShopifyCart) => ShopifyCart) => {
		setOptimisticCart(current => {
			const baseCart = current || cart;
			return baseCart ? updater(baseCart) : null;
		});
	}, [cart]);

	// Optimized addItem with optimistic updates
	const addItem = useCallback(async (item: CartItem) => {
		if (!cart?.id) {
			toast.error("Unable to add item to cart");
			return;
		}

		const merchandiseId = item.merchandiseId.includes("gid://shopify/ProductVariant/") 
			? item.merchandiseId 
			: `gid://shopify/ProductVariant/${item.merchandiseId}`;

		// Optimistic update
		updateOptimisticCart(currentCart => {
			const existingLineIndex = currentCart.lines.edges.findIndex(
				({ node }) => node.merchandise.id === merchandiseId
			);

			if (existingLineIndex >= 0) {
				// Update existing item quantity
				const newEdges = [...currentCart.lines.edges];
				newEdges[existingLineIndex] = {
					...newEdges[existingLineIndex],
					node: {
						...newEdges[existingLineIndex].node,
						quantity: newEdges[existingLineIndex].node.quantity + item.quantity
					}
				};
				return { ...currentCart, lines: { ...currentCart.lines, edges: newEdges } };
			} else {
				// Add new item (simplified optimistic update)
				return currentCart; // Keep current state for new items
			}
		});

		setIsUpdating(true);
		try {
			const existingLine = cart.lines.edges.find(({ node }) => node.merchandise.id === merchandiseId);
			
			const updatedCart = existingLine
				? await updateCartLine(cart.id, existingLine.node.id, existingLine.node.quantity + item.quantity)
				: await addToCart(cart.id, [{
					merchandiseId,
					quantity: item.quantity,
					attributes: item.attributes?.map(attr => ({ key: attr.key, value: attr.value })),
				}]);

			if (updatedCart) {
				setCart(updatedCart);
				setOptimisticCart(updatedCart);
				toast.success(item.isPreOrder ? "Pre-order added to cart" : "Added to cart");
			}
		} catch (error) {
			// Revert optimistic update on error
			setOptimisticCart(cart);
			console.error("Error adding item to cart:", error);
			toast.error("Failed to add item to cart");
		} finally {
			setIsUpdating(false);
		}
	}, [cart, updateOptimisticCart]);

	// Optimized removeItem with optimistic updates
	const removeItem = useCallback(async (itemId: string) => {
		if (!cart?.id) {
			toast.error("Unable to remove item from cart");
			return;
		}

		// Optimistic update
		updateOptimisticCart(currentCart => ({
			...currentCart,
			lines: {
				...currentCart.lines,
				edges: currentCart.lines.edges.filter(({ node }) => node.id !== itemId)
			}
		}));

		setIsUpdating(true);
		try {
			const updatedCart = await removeFromCart(cart.id, itemId);
			if (updatedCart) {
				setCart(updatedCart);
				setOptimisticCart(updatedCart);
				toast.success("Item removed from cart");
			}
		} catch (error) {
			// Revert optimistic update
			setOptimisticCart(cart);
			console.error("Error removing item from cart:", error);
			toast.error("Failed to remove item from cart");
		} finally {
			setIsUpdating(false);
		}
	}, [cart, updateOptimisticCart]);

	// Optimized updateItemQuantity
	const updateItemQuantity = useCallback(async (itemId: string, quantity: number) => {
		if (!cart?.id) {
			toast.error("Unable to update cart");
			return;
		}

		// Optimistic update
		updateOptimisticCart(currentCart => ({
			...currentCart,
			lines: {
				...currentCart.lines,
				edges: currentCart.lines.edges.map(({ node, ...edge }) => 
					node.id === itemId ? { ...edge, node: { ...node, quantity } } : { node, ...edge }
				)
			}
		}));

		setIsUpdating(true);
		try {
			const updatedCart = await updateCartLine(cart.id, itemId, quantity);
			if (updatedCart) {
				setCart(updatedCart);
				setOptimisticCart(updatedCart);
				toast.success("Cart updated");
			}
		} catch (error) {
			setOptimisticCart(cart);
			console.error("Error updating cart:", error);
			toast.error("Failed to update cart");
		} finally {
			setIsUpdating(false);
		}
	}, [cart, updateOptimisticCart]);

	// Memoized context value to prevent unnecessary re-renders
	const contextValue = useMemo(() => ({
		cart,
		cartId,
		isUpdating,
		isLoading,
		isOpen,
		optimisticCart,
		addItem,
		removeItem,
		updateItemQuantity,
		updateItem: updateItemQuantity, // Alias
		openCart,
		closeCart,
		getItemCount,
		getTotalAmount,
	}), [
		cart,
		cartId,
		isUpdating,
		isLoading,
		isOpen,
		optimisticCart,
		addItem,
		removeItem,
		updateItemQuantity,
		openCart,
		closeCart,
		getItemCount,
		getTotalAmount,
	]);

	return (
		<CartContext.Provider value={contextValue}>
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

// Re-export for compatibility
export { OptimizedCartProvider as CartProvider };