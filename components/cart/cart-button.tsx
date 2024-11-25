"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/stores/cart";
import { ShoppingCart } from "lucide-react";

export function CartButton() {
	const { cart, openCart } = useCart();
	const itemCount = cart?.totalQuantity || 0;

	return (
		<Button variant="outline" size="sm" className="h-8 w-8 relative" onClick={openCart}>
			<ShoppingCart className="h-4 w-4" />
			{itemCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center">{itemCount}</span>}
		</Button>
	);
}
