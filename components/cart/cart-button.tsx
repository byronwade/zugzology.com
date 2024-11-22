"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/stores/cart";
import { ShoppingCart } from "lucide-react";

export function CartButton() {
	const { cart, openCart } = useCart();
	const itemCount = cart?.totalQuantity || 0;

	return (
		<Button variant="outline" size="icon" className="relative" onClick={openCart}>
			<ShoppingCart className="h-5 w-5" />
			{itemCount > 0 && <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center">{itemCount}</span>}
		</Button>
	);
}
