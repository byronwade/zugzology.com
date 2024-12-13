import { useEffect, useState } from "react";
import { addToCart, createCart, getCart, removeFromCart, updateCartLine } from "@/lib/actions/shopify";
import type { Cart } from "@/lib/types";

export function useCart() {
	const [cart, setCart] = useState<Cart | null>(null);
	const [loading, setLoading] = useState(false);
	const [cartId, setCartId] = useState<string | null>(null);

	useEffect(() => {
		const storedCartId = localStorage.getItem("shopifyCartId");
		if (storedCartId) {
			setCartId(storedCartId);
			getCart(storedCartId).then((cart) => {
				if (cart) {
					setCart(cart);
				} else {
					localStorage.removeItem("shopifyCartId");
					setCartId(null);
				}
			});
		}
	}, []);

	const addItem = async (variantId: string, quantity: number) => {
		try {
			setLoading(true);
			let currentCartId = cartId;

			if (!currentCartId) {
				const newCart = await createCart();
				if (!newCart?.id) throw new Error("Failed to create cart");
				currentCartId = newCart.id;
				setCartId(currentCartId);
				localStorage.setItem("shopifyCartId", currentCartId);
			}

			const updatedCart = await addToCart(currentCartId, [
				{
					merchandiseId: variantId,
					quantity,
				},
			]);

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
			const updatedCart = await removeFromCart(cartId, lineId);
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
			const updatedCart = await updateCartLine(cartId, lineId, quantity);
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
