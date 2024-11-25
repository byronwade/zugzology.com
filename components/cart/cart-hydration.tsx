"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/stores/cart";

export function CartHydration() {
	useEffect(() => {
		useCart.persist.rehydrate();
	}, []);

	return null;
}
