"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/providers/cart-provider";
import { Loader2, ShoppingCart, Clock } from "lucide-react";
import { useState, useCallback, memo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AddToCartButtonProps {
	variantId: string;
	availableForSale: boolean;
	quantity: number;
	className?: string;
	hasVariants?: boolean;
	productHandle?: string;
	isPreOrder?: boolean;
	onAddToCartSuccess?: () => void;
	onAddToCartError?: (error: Error) => void;
}

export const AddToCartButton = memo(function AddToCartButton({ variantId, availableForSale, quantity, className = "", hasVariants = false, productHandle = "", isPreOrder: isPreOrderProp, onAddToCartSuccess, onAddToCartError }: AddToCartButtonProps) {
	const { addItem } = useCart();
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	// Determine if this is a pre-order item
	const isPreOrder = isPreOrderProp || (!availableForSale && quantity <= 0);

	// Use refs for callbacks to maintain stable references
	const callbacksRef = useRef({
		onSuccess: onAddToCartSuccess,
		onError: onAddToCartError,
	});

	// Update refs when props change
	useEffect(() => {
		callbacksRef.current = {
			onSuccess: onAddToCartSuccess,
			onError: onAddToCartError,
		};
	}, [onAddToCartSuccess, onAddToCartError]);

	const handleClick = useCallback(async () => {
		// If product has variants, redirect to product page
		if (hasVariants && productHandle) {
			router.push(`/products/${productHandle}`);
			return;
		}

		// Handle add to cart
		if (!hasVariants) {
			if (!variantId || isLoading) return;

			setIsLoading(true);

			try {
				// Ensure variant ID is in the correct format
				const merchandiseId = variantId.includes("gid://shopify/ProductVariant/") ? variantId : `gid://shopify/ProductVariant/${variantId}`;

				await addItem({
					merchandiseId,
					quantity: 1,
					isPreOrder,
				});

				toast.success("Added to cart");
				if (callbacksRef.current.onSuccess) {
					callbacksRef.current.onSuccess();
				}
			} catch (error) {
				console.error("Add to cart error:", error);
				toast.error("Failed to add to cart");
				if (callbacksRef.current.onError) {
					callbacksRef.current.onError(error instanceof Error ? error : new Error("Failed to add to cart"));
				}
			} finally {
				setIsLoading(false);
			}
		}
	}, [variantId, addItem, isPreOrder, isLoading, hasVariants, productHandle, router]);

	// Determine button style based on type
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
		<Button onClick={handleClick} disabled={isLoading || (!availableForSale && !isPreOrder)} className={buttonStyle} size="lg" aria-label={hasVariants ? "Select Options" : isPreOrder ? "Pre-Order Now" : "Add to Cart"}>
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
});

AddToCartButton.displayName = "AddToCartButton";

