"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/cart-provider";
import { Loader2, ShoppingCart, Clock, Plus, Minus } from "lucide-react";
import { useState, useCallback, memo, useRef, useEffect, useMemo } from "react";
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
	const { addItem, cart, updateItemQuantity, isUpdating } = useCart();
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	// Determine if this is a pre-order item
	const isPreOrder = isPreOrderProp || (!availableForSale && quantity <= 0);

	// Check if this variant is already in the cart and get its details
	const cartItem = useMemo(() => {
		if (!cart?.lines?.edges || !variantId) return null;
		
		const merchandiseId = variantId.includes("gid://shopify/ProductVariant/") 
			? variantId 
			: `gid://shopify/ProductVariant/${variantId}`;
		
		const found = cart.lines.edges.find(
			edge => edge.node.merchandise.id === merchandiseId
		);
		
		return found ? found.node : null;
	}, [cart?.lines?.edges, variantId]);

	const isInCart = !!cartItem;
	const cartQuantity = cartItem?.quantity || 0;

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

				// Cart will be opened automatically by the cart provider

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
	}, [variantId, addItem, isPreOrder, isLoading, hasVariants, productHandle, router, isInCart, cartQuantity, cartItem]);

	// Handle quantity increase
	const handleIncreaseQuantity = useCallback(async () => {
		if (!cartItem || isUpdating) return;
		
		try {
			await updateItemQuantity(cartItem.id, cartQuantity + 1);
		} catch (error) {
			console.error("Error increasing quantity:", error);
			toast.error("Failed to update quantity");
		}
	}, [cartItem, cartQuantity, updateItemQuantity, isUpdating]);

	// Handle quantity decrease
	const handleDecreaseQuantity = useCallback(async () => {
		if (!cartItem || isUpdating || cartQuantity <= 1) return;
		
		try {
			await updateItemQuantity(cartItem.id, cartQuantity - 1);
		} catch (error) {
			console.error("Error decreasing quantity:", error);
			toast.error("Failed to update quantity");
		}
	}, [cartItem, cartQuantity, updateItemQuantity, isUpdating]);

	// Determine button style based on type
	const buttonStyle = cn(
		"relative w-full transition-colors font-medium rounded-md",
		{
			"bg-purple-600 hover:bg-purple-700 text-white": hasVariants || (!hasVariants && !isPreOrder),
			"bg-amber-600 hover:bg-amber-700 text-white": isPreOrder && !hasVariants,
		},
		className
	);

	// If product is in cart and doesn't have variants, show quantity selector
	if (isInCart && !hasVariants) {
		return (
			<div className={cn("w-full flex items-center border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900", className)}>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleDecreaseQuantity}
					disabled={isUpdating || cartQuantity <= 1}
					className="h-10 w-10 rounded-l-md rounded-r-none border-0 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
					aria-label="Decrease quantity"
				>
					<Minus className="h-4 w-4" />
				</Button>
				
				<div className="flex-1 flex items-center justify-center h-10 border-x border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
					{isUpdating ? (
						<Loader2 className="h-4 w-4 animate-spin text-purple-600" />
					) : (
						<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
							{cartQuantity}
						</span>
					)}
				</div>
				
				<Button
					variant="ghost"
					size="sm"
					onClick={handleIncreaseQuantity}
					disabled={isUpdating}
					className="h-10 w-10 rounded-r-md rounded-l-none border-0 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
					aria-label="Increase quantity"
				>
					<Plus className="h-4 w-4" />
				</Button>
			</div>
		);
	}

	// Default add to cart button
	return (
		<Button onClick={handleClick} disabled={isLoading || (!availableForSale && !isPreOrder)} className={buttonStyle} size="lg" aria-label={hasVariants ? "Select Options" : isPreOrder ? "Pre-Order Now" : "Add to Cart"}>
			{isLoading ? (
				<div className="flex items-center justify-center gap-2">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span className="text-sm">Loading...</span>
				</div>
			) : (
				<div className="flex items-center justify-center gap-2">
					{isPreOrder ? <Clock className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
					<span className="text-sm">{hasVariants ? "Select Options" : isPreOrder ? "Pre-Order Now" : "Add to Cart"}</span>
				</div>
			)}
		</Button>
	);
});

AddToCartButton.displayName = "AddToCartButton";

