"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { formatPrice } from "@/lib/utils";

interface CartItemProps {
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
}

export function CartItem({ item }: CartItemProps) {
	const { updateItem, removeItem, isLoading } = useCart();
	const productImage = item.merchandise.product.images.edges[0]?.node;

	const handleUpdateQuantity = async (quantity: number) => {
		try {
			await updateItem(item.id, quantity);
		} catch (error) {
			console.error("Update quantity error:", error);
		}
	};

	const handleRemoveItem = async () => {
		try {
			await removeItem(item.id);
		} catch (error) {
			console.error("Remove item error:", error);
		}
	};

	return (
		<div className="flex gap-4 py-4 border-b">
			{productImage ? (
				<div className="relative w-20 h-20">
					<Image src={productImage.url} alt={productImage.altText || item.merchandise.product.title} fill className="object-cover rounded-md" sizes="80px" />
				</div>
			) : (
				<div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-md flex items-center justify-center">
					<ShoppingCart className="h-8 w-8 text-neutral-400" />
				</div>
			)}

			<div className="flex-1">
				<h3 className="font-medium">{item.merchandise.product.title}</h3>
				<p className="text-sm text-muted-foreground">{item.merchandise.title !== "Default Title" && item.merchandise.title}</p>
				<div className="flex items-center gap-2 mt-2">
					<select value={item.quantity} onChange={(e) => handleUpdateQuantity(Number(e.target.value))} className="h-8 w-20 rounded-md border bg-background" disabled={isLoading}>
						{[...Array(10)].map((_, i) => (
							<option key={i + 1} value={i + 1}>
								{i + 1}
							</option>
						))}
					</select>
					<Button variant="ghost" size="icon" onClick={handleRemoveItem} disabled={isLoading}>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
				<p className="mt-2 font-medium">{formatPrice(parseFloat(item.cost.totalAmount.amount))}</p>
			</div>
		</div>
	);
}
