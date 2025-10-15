"use client";

import { Clock, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOpticalIconClasses } from "@/lib/utils/optical-alignment";

type AddToCartButtonProps = {
	variantId: string;
	availableForSale: boolean;
	quantity: number;
	className?: string;
	hasVariants?: boolean;
	productHandle?: string;
	isPreOrder?: boolean;
	onAddToCartSuccess?: () => void;
	onAddToCartError?: (error: Error) => void;
};

export const AddToCartButton = memo(function AddToCartButton({
	variantId,
	availableForSale,
	quantity,
	className = "",
	hasVariants = false,
	productHandle = "",
	isPreOrder: isPreOrderProp,
	onAddToCartSuccess,
	onAddToCartError,
}: AddToCartButtonProps) {
	const { addItem, cart, updateItemQuantity, isUpdating } = useCart();
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	// Determine if this is a pre-order item
	const isPreOrder = isPreOrderProp || (!availableForSale && quantity <= 0);

	// Check if this variant is already in the cart and get its details
	const cartItem = useMemo(() => {
		if (!(cart?.lines?.edges && variantId)) {
			return null;
		}

		const merchandiseId = variantId.includes("gid://shopify/ProductVariant/")
			? variantId
			: `gid://shopify/ProductVariant/${variantId}`;

		const found = cart.lines.edges.find((edge) => edge.node.merchandise.id === merchandiseId);

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
			if (!variantId || isLoading) {
				return;
			}

			setIsLoading(true);

			try {
				// Ensure variant ID is in the correct format
				const merchandiseId = variantId.includes("gid://shopify/ProductVariant/")
					? variantId
					: `gid://shopify/ProductVariant/${variantId}`;

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
				toast.error("Failed to add to cart");
				if (callbacksRef.current.onError) {
					callbacksRef.current.onError(error instanceof Error ? error : new Error("Failed to add to cart"));
				}
			} finally {
				setIsLoading(false);
			}
		}
	}, [variantId, addItem, isPreOrder, isLoading, hasVariants, productHandle, router]);

	// Handle quantity increase
	const handleIncreaseQuantity = useCallback(async () => {
		if (!cartItem || isUpdating) {
			return;
		}

		try {
			await updateItemQuantity(cartItem.id, cartQuantity + 1);
		} catch (_error) {
			toast.error("Failed to update quantity");
		}
	}, [cartItem, cartQuantity, updateItemQuantity, isUpdating]);

	// Handle quantity decrease
	const handleDecreaseQuantity = useCallback(async () => {
		if (!cartItem || isUpdating || cartQuantity <= 1) {
			return;
		}

		try {
			await updateItemQuantity(cartItem.id, cartQuantity - 1);
		} catch (_error) {
			toast.error("Failed to update quantity");
		}
	}, [cartItem, cartQuantity, updateItemQuantity, isUpdating]);

	// Determine button style based on type
	const buttonStyle = cn(
		"relative w-full rounded-md font-medium transition-colors",
		{
			"bg-primary text-primary-foreground hover:bg-primary/90": hasVariants || !(hasVariants || isPreOrder),
			"bg-amber-600 text-white hover:bg-amber-700": isPreOrder && !hasVariants,
		},
		className
	);

	// If product is in cart and doesn't have variants, show quantity selector
	if (isInCart && !hasVariants) {
		return (
			<div
				className={cn("flex w-full items-center rounded-md border border bg-white dark:border dark:bg-card", className)}
			>
				<Button
					aria-label="Decrease quantity"
					className="h-10 w-10 rounded-r-none rounded-l-md border-0 hover:bg-muted disabled:opacity-50 dark:hover:bg-muted"
					disabled={isUpdating || cartQuantity <= 1}
					onClick={handleDecreaseQuantity}
					size="sm"
					variant="ghost"
				>
					<Minus className={cn("h-4 w-4", getOpticalIconClasses("Minus", "button"))} />
				</Button>

				<div className="flex h-10 flex-1 items-center justify-center border border-x bg-muted/50 dark:border dark:bg-muted">
					{isUpdating ? (
						<Loader2 className={cn("h-4 w-4 animate-spin text-primary", "translate-y-optical-icon-down")} />
					) : (
						<span className="font-medium text-foreground text-sm">{cartQuantity}</span>
					)}
				</div>

				<Button
					aria-label="Increase quantity"
					className="h-10 w-10 rounded-r-md rounded-l-none border-0 hover:bg-muted disabled:opacity-50 dark:hover:bg-muted"
					disabled={isUpdating}
					onClick={handleIncreaseQuantity}
					size="sm"
					variant="ghost"
				>
					<Plus className={cn("h-4 w-4", getOpticalIconClasses("Plus", "button"))} />
				</Button>
			</div>
		);
	}

	// Default add to cart button
	return (
		<Button
			aria-label={hasVariants ? "Select Options" : isPreOrder ? "Pre-Order Now" : "Add to Cart"}
			className={buttonStyle}
			disabled={isLoading || !(availableForSale || isPreOrder)}
			onClick={handleClick}
			size="lg"
		>
			{isLoading ? (
				<div className="flex items-center justify-center gap-2">
					<Loader2 className={cn("h-4 w-4 animate-spin", "translate-y-optical-icon-down")} />
					<span className="text-sm">Loading...</span>
				</div>
			) : (
				<div className="flex items-center justify-center gap-2">
					{isPreOrder ? (
						<Clock className={cn("h-4 w-4", getOpticalIconClasses("Clock", "button"))} />
					) : (
						<ShoppingCart className={cn("h-4 w-4", getOpticalIconClasses("ShoppingCart", "button"))} />
					)}
					<span className="text-sm">
						{hasVariants ? "Select Options" : isPreOrder ? "Pre-Order Now" : "Add to Cart"}
					</span>
				</div>
			)}
		</Button>
	);
});

AddToCartButton.displayName = "AddToCartButton";
