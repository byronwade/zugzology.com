import { useEffect, useState } from "react";
import { addToCart, createCart, getCart, removeFromCart, updateCart } from "@/lib/actions/shopify";
import type { Cart, CartLine } from "@/lib/types";

export function useCart() {
	const [cartId, setCartId] = useState<string | null>(null);
	const [cart, setCart] = useState<Cart | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// Get cart ID from cookies
		const cartIdFromCookie = document.cookie
			.split("; ")
			.find((row) => row.startsWith("cartId="))
			?.split("=")[1];

		if (cartIdFromCookie) {
			setCartId(cartIdFromCookie);
			void fetchCart(cartIdFromCookie);
		}
	}, []);

	const fetchCart = async (id: string) => {
		try {
			setLoading(true);
			const cartData = await getCart(id);
			setCart(cartData);
		} catch (error) {
			console.error("Error fetching cart:", error);
		} finally {
			setLoading(false);
		}
	};

	const initializeCart = async () => {
		try {
			setLoading(true);
			const newCart = await createCart();
			if (newCart?.id) {
				setCartId(newCart.id);
				setCart(newCart);
			}
			return newCart;
		} catch (error) {
			console.error("Error creating cart:", error);
			return null;
		} finally {
			setLoading(false);
		}
	};

	const addItem = async (variantId: string, quantity: number) => {
		try {
			setLoading(true);
			let currentCartId = cartId;

			if (!currentCartId) {
				const newCart = await initializeCart();
				if (!newCart?.id) return;
				currentCartId = newCart.id;
			}

			const updatedCart = await addToCart(currentCartId, variantId, quantity);
			if (updatedCart) {
				setCart(updatedCart);
			}
		} catch (error) {
			console.error("Error adding item to cart:", error);
		} finally {
			setLoading(false);
		}
	};

	const removeItem = async (lineId: string) => {
		if (!cartId) return;

		try {
			setLoading(true);
			const updatedCart = await removeFromCart(cartId, [lineId]);
			if (updatedCart) {
				setCart(updatedCart);
			}
		} catch (error) {
			console.error("Error removing item from cart:", error);
		} finally {
			setLoading(false);
		}
	};

	const updateItem = async (lineId: string, quantity: number) => {
		if (!cartId) return;

		try {
			setLoading(true);
			const updatedCart = await updateCart(cartId, [{ id: lineId, quantity }]);
			if (updatedCart) {
				setCart(updatedCart);
			}
		} catch (error) {
			console.error("Error updating cart item:", error);
		} finally {
			setLoading(false);
		}
	};

	return {
		cart,
		loading,
		addItem,
		removeItem,
		updateItem,
	};
}
