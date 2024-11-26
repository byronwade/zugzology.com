"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/stores/cart";
import { ShoppingBag } from "lucide-react";

export function CartButton() {
	const cart = useCart();
	const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

	return (
		<Button variant="ghost" size="icon" className="relative" onClick={() => cart.toggleCart()}>
			<ShoppingBag className="h-6 w-6" />
			{itemCount > 0 && <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-blue-600 text-[11px] font-medium text-white flex items-center justify-center">{itemCount}</div>}
		</Button>
	);
}
