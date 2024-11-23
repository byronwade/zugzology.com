"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/stores/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";
import type { CartLine } from "@/lib/types/shopify";

interface CartItemProps {
	item: CartLine;
}

export function CartItem({ item }: CartItemProps) {
	const { removeFromCart, updateLineItem } = useCart();
	const image = item.merchandise.product.images.edges[0]?.node;

	return (
		<div className="flex gap-4 py-4 border-b">
			<div className="relative aspect-square h-24 w-24 min-w-fit overflow-hidden rounded">{image && <Image src={image.url} alt={image.altText || item.merchandise.product.title} fill className="object-cover" sizes="96px" />}</div>

			<div className="flex flex-1 flex-col gap-1">
				<div className="flex justify-between gap-2">
					<Link prefretch={true} href={`/products/${item.merchandise.product.handle}`} className="hover:underline" onClick={() => useCart.getState().closeCart()}>
						<span className="text-sm font-medium">{item.merchandise.product.title}</span>
					</Link>
					<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.id)}>
						<X className="h-4 w-4" />
					</Button>
				</div>

				<span className="text-sm text-muted-foreground">{item.merchandise.title}</span>

				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateLineItem(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
						<Minus className="h-4 w-4" />
					</Button>
					<span className="text-sm">{item.quantity}</span>
					<Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateLineItem(item.id, item.quantity + 1)}>
						<Plus className="h-4 w-4" />
					</Button>
				</div>

				<span className="mt-auto text-sm font-medium">{formatPrice(item.cost.totalAmount.amount, item.cost.totalAmount.currencyCode)}</span>
			</div>
		</div>
	);
}
