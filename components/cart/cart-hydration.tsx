"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/stores/cart";

export function CartHydration() {
	const cart = useCart();

	useEffect(() => {
		cart.hydrate();
	}, [cart]);

	return null;
}
