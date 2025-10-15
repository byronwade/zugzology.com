"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export type CartItemProps = {
	item: {
		id: string;
		quantity: number;
		cost: {
			totalAmount: {
				amount: string;
			};
		};
		merchandise: {
			title: string;
			product: {
				title: string;
				images: {
					edges: Array<{
						node: {
							url: string;
							altText: string | null;
						};
					}>;
				};
			};
		};
	};
};

export function CartItem({ item }: CartItemProps) {
	const { updateItem, removeItem, isLoading } = useCart();
	const productImage = item.merchandise.product.images.edges[0]?.node;

	const handleUpdateQuantity = async (quantity: number) => {
		try {
			await updateItem(item.id, quantity);
		} catch (_error) {}
	};

	const handleRemoveItem = async () => {
		try {
			await removeItem(item.id);
		} catch (_error) {}
	};

	return (
		<div className="flex gap-4 border-b py-4">
			{productImage ? (
				<div className="relative h-20 w-20">
					<Image
						alt={productImage.altText || item.merchandise.product.title}
						className="rounded-md object-cover"
						fill
						sizes="80px"
						src={productImage.url}
					/>
				</div>
			) : (
				<div className="flex h-20 w-20 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800">
					<ShoppingCart className="h-8 w-8 text-neutral-400" />
				</div>
			)}

			<div className="flex-1">
				<h3 className="font-medium">{item.merchandise.product.title}</h3>
				<p className="text-muted-foreground text-sm">
					{item.merchandise.title !== "Default Title" && item.merchandise.title}
				</p>
				<div className="mt-2 flex items-center gap-2">
					<select
						className="h-8 w-20 rounded-md border bg-background"
						disabled={isLoading}
						onChange={(e) => handleUpdateQuantity(Number(e.target.value))}
						value={item.quantity}
					>
						{[...new Array(10)].map((_, i) => (
							<option key={i + 1} value={i + 1}>
								{i + 1}
							</option>
						))}
					</select>
					<Button disabled={isLoading} onClick={handleRemoveItem} size="icon" variant="ghost">
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
				<p className="mt-2 font-medium">{formatPrice(Number.parseFloat(item.cost.totalAmount.amount))}</p>
			</div>
		</div>
	);
}
