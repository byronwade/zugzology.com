"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/providers/cart-provider";
import { Loader2, ShoppingCart, Clock } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
	variantId: string;
	availableForSale: boolean;
	quantity: number;
	className?: string;
	hasVariants?: boolean;
	productHandle?: string;
}

export function AddToCartButton({ variantId, availableForSale, quantity, className = "", hasVariants = false, productHandle = "" }: AddToCartButtonProps) {
	const { addItem } = useCart();
	const [isLoading, setIsLoading] = useState(false);
	const isPreOrder = quantity <= 0;
	const router = useRouter();

	const handleClick = useCallback(async () => {
		if (hasVariants && productHandle) {
			router.push(`/products/${productHandle}`);
			return;
		}

		if (!hasVariants) {
			if (!variantId || isLoading) return;

			setIsLoading(true);

			try {
				const merchandiseId = variantId.includes("gid://shopify/ProductVariant/") ? variantId : `gid://shopify/ProductVariant/${variantId}`;

				await addItem({
					merchandiseId,
					quantity: 1,
					isPreOrder,
				});
			} catch (error) {
				console.error("Add to cart error:", error);
			} finally {
				setIsLoading(false);
			}
		}
	}, [variantId, addItem, isPreOrder, isLoading, hasVariants, productHandle, router]);

	// Determine button variant and style based on type
	const buttonStyle = cn(
		"relative w-full transition-colors",
		{
			"bg-blue-600 hover:bg-blue-700 text-white": hasVariants,
			"bg-amber-600 hover:bg-amber-700 text-white": isPreOrder && !hasVariants,
			"bg-primary hover:bg-primary/90": !hasVariants && !isPreOrder,
		},
		className
	);

	return (
		<Button onClick={handleClick} disabled={isLoading || (!availableForSale && !isPreOrder)} className={buttonStyle} size="lg">
			{isLoading ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : (
				<div className="flex items-center justify-center gap-2">
					{isPreOrder ? <Clock className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
					<span>{hasVariants ? "Select Options" : isPreOrder ? "Pre-Order Now" : "Add to Cart"}</span>
				</div>
			)}
		</Button>
	);
}

