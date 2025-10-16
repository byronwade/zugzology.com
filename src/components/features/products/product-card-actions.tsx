"use client";

import { Clock, Heart, Info, Loader2, ShoppingCart } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useWishlist } from "@/components/providers";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOpticalIconClasses } from "@/lib/utils/optical-alignment";

type ProductCardActionsProps = {
	productId: string;
	productHandle: string;
	variantId?: string;
	canAddToCart: boolean;
	isBackorder: boolean;
	hasValidPrice: boolean;
	isFreeProduct: boolean;
	view?: "grid" | "list";
	onAddToCart?: () => void;
	onRemoveFromWishlist?: (handle: string) => void;
	onAddToWishlist?: (handle: string) => void;
};

// Minimal client component - only interactive elements
export function ProductCardActions({
	productId,
	productHandle,
	variantId,
	canAddToCart,
	isBackorder,
	hasValidPrice,
	isFreeProduct,
	view = "grid",
	onAddToCart,
	onRemoveFromWishlist,
	onAddToWishlist,
}: ProductCardActionsProps) {
	const { addItem } = useCart();
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

	const isWishlisted = isInWishlist(productHandle);

	const handleAddToCart = useCallback(
		async (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (!variantId) {
				toast.error("Please select a product variant");
				return;
			}

			setIsAddingToCart(true);
			try {
				const merchandiseId = variantId.includes("gid://shopify/ProductVariant/")
					? variantId
					: `gid://shopify/ProductVariant/${variantId}`;

				await addItem({
					merchandiseId,
					quantity: 1,
				});

				if (onAddToCart) {
					onAddToCart();
				}

				toast.success("Added to cart");

				// If this product was added from wishlist, remove it from wishlist
				if (isWishlisted && onRemoveFromWishlist) {
					removeFromWishlist(productHandle);
					onRemoveFromWishlist(productHandle);
				}
			} catch (_error) {
				toast.error("Failed to add to cart");
			} finally {
				setIsAddingToCart(false);
			}
		},
		[variantId, addItem, isWishlisted, removeFromWishlist, productHandle, onAddToCart, onRemoveFromWishlist]
	);

	const handleWishlistToggle = useCallback(() => {
		if (isWishlisted) {
			removeFromWishlist(productHandle);
			if (onRemoveFromWishlist) {
				onRemoveFromWishlist(productHandle);
			}
		} else {
			addToWishlist(productHandle);
			if (onAddToWishlist) {
				onAddToWishlist(productHandle);
			}
		}
	}, [isWishlisted, productHandle, removeFromWishlist, addToWishlist, onRemoveFromWishlist, onAddToWishlist]);

	return (
		<>
			{/* Wishlist Button */}
			<Button
				className={cn("absolute z-[1]", view === "grid" ? "top-1.5 right-1.5 sm:top-2 sm:right-2" : "top-0 right-0")}
				data-product-id={productId}
				data-wishlist-add
				onClick={handleWishlistToggle}
				size="icon"
				variant="ghost"
			>
				<Heart
					className={cn(
						"h-4 w-4 transition-colors duration-200 sm:h-5 sm:w-5",
						isWishlisted
							? "fill-red-500 stroke-red-500"
							: "fill-secondary stroke-foreground/60 group-hover:stroke-foreground/80",
						getOpticalIconClasses("Heart", "button")
					)}
				/>
			</Button>

			{/* Add to Cart Button */}
			<div className="mt-3 sm:mt-4">
				<Button
					className="h-10 w-full rounded-lg font-semibold text-sm transition-all duration-300 group-hover:shadow-lg sm:h-11 sm:text-base"
					data-cart-add
					data-product-id={productId}
					disabled={isAddingToCart || !variantId || !canAddToCart}
					onClick={handleAddToCart}
				>
					<div className="flex w-full items-center justify-center">
						{isAddingToCart ? (
							<>
								<Loader2 className={cn("mr-2 h-4 w-4 animate-spin", "translate-y-optical-icon-down")} />
								<span>Adding...</span>
							</>
						) : isBackorder ? (
							<>
								<Clock className={cn("mr-2 h-4 w-4", getOpticalIconClasses("Clock", "button"))} />
								<span>Pre-Order</span>
							</>
						) : hasValidPrice ? (
							<>
								<ShoppingCart className={cn("mr-2 h-4 w-4", getOpticalIconClasses("ShoppingCart", "button"))} />
								<span>{isFreeProduct ? "Claim Free" : "Add to Cart"}</span>
							</>
						) : (
							<>
								<Info className={cn("mr-2 h-4 w-4", getOpticalIconClasses("Info", "button"))} />
								<span>Contact for Pricing</span>
							</>
						)}
					</div>
				</Button>
			</div>
		</>
	);
}
