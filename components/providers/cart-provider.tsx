"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/stores/cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
	const cart = useCart();

	useEffect(() => {
		if (!cart.isHydrated) {
			cart.hydrate();
		}
	}, [cart]);

	return children;
}
