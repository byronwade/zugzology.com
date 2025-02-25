"use client";

import Image from "next/image";
import { Link } from "@/components/ui/link";
import { formatPrice, cn } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, ShoppingBag, Loader2, Package, Clock, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/providers/cart-provider";
import { toast } from "sonner";
import { useState, useMemo, useCallback, memo, useRef, useEffect } from "react";
import { useWishlist } from "@/lib/providers/wishlist-provider";

export interface ProductCardProps {
	product: ShopifyProduct;
	collectionHandle?: string;
	view?: "grid" | "list";
	variantId?: string;
	quantity?: number;
	onAddToCart?: () => void;
	isAddingToCartProp?: boolean;
	onRemoveFromWishlist?: (handle: string) => void;
	onAddToWishlist?: (handle: string) => void;
	isVisible?: boolean;
}

// Helper function to format recent purchases
const formatRecentPurchases = (count: number) => {
	if (!count || count === 0) return null;
	if (count >= 1000) return `${Math.floor(count / 1000)}k+ bought recently`;
	if (count >= 100) return `${Math.floor(count / 100) * 100}+ bought recently`;
	if (count >= 50) return "50+ bought recently";
	if (count >= 20) return "20+ bought recently";
	if (count > 0) return `${count} bought recently`;
	return null;
};

// Helper function to render star rating
const StarRating = memo(({ rating, count }: { rating: number; count: number }) => {
	if (!rating || !count) return null;
	const fullStars = Math.floor(rating);
	const hasHalfStar = rating % 1 >= 0.5;
	const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

	return (
		<div className="flex items-center gap-1.5">
			<div className="flex items-center">
				{[...Array(fullStars)].map((_, i) => (
					<Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
				))}
				{hasHalfStar && (
					<div className="relative w-4 h-4">
						<Star className="absolute w-4 h-4 text-yellow-400 fill-yellow-400 clip-path-[inset(0_50%_0_0)]" />
						<Star className="absolute w-4 h-4 text-yellow-400" />
					</div>
				)}
				{[...Array(emptyStars)].map((_, i) => (
					<Star key={`empty-${i}`} className="w-4 h-4 text-yellow-400" />
				))}
			</div>
			<span className="text-sm text-muted-foreground">({count})</span>
		</div>
	);
});

StarRating.displayName = "StarRating";

const formatDeliveryDate = () => {
	const today = new Date();
	// Add 3-5 business days for standard shipping
	const deliveryDate = new Date(today);
	deliveryDate.setDate(today.getDate() + 5); // Using max delivery time for conservative estimate

	return deliveryDate.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
};

// Optimized metafield checks
const getRatingData = (product: ShopifyProduct) => {
	const metafields = product.metafields || [];
	return {
		rating: parseFloat(metafields.find((field) => field?.namespace === "custom" && field?.key === "rating")?.value || "0"),
		ratingCount: parseInt(metafields.find((field) => field?.namespace === "custom" && field?.key === "rating_count")?.value || "0", 10),
		recentPurchases: parseInt(metafields.find((field) => field?.namespace === "custom" && field?.key === "recent_purchases")?.value || "0", 10),
	};
};

// Calculate discount percentage
const calculateDiscountPercentage = (compareAtPrice: string, price: string) => {
	if (!compareAtPrice || !price) return 0;
	return Math.round(((parseFloat(compareAtPrice) - parseFloat(price)) / parseFloat(compareAtPrice)) * 100);
};

// Memoize the ProductCard component
export const ProductCard = memo(function ProductCard({ product, collectionHandle, view = "grid", variantId, quantity = 0, onAddToCart, isAddingToCartProp, onRemoveFromWishlist, onAddToWishlist, isVisible = true }: ProductCardProps) {
	const { addItem } = useCart();
	const [isAddingToCartLocal, setIsAddingToCartLocal] = useState(false);
	const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

	// Use refs for event handlers to maintain stable references
	const handlersRef = useRef({
		addToCart: onAddToCart,
		addToWishlist: onAddToWishlist,
		removeFromWishlist: onRemoveFromWishlist,
	});

	// Update refs when props change
	useEffect(() => {
		handlersRef.current = {
			addToCart: onAddToCart,
			addToWishlist: onAddToWishlist,
			removeFromWishlist: onRemoveFromWishlist,
		};
	}, [onAddToCart, onAddToWishlist, onRemoveFromWishlist]);

	// Memoize expensive calculations
	const productDetails = useMemo(() => {
		const firstVariant = product.variants?.nodes?.[0];
		const price = firstVariant?.price?.amount || "0";
		const compareAtPrice = firstVariant?.compareAtPrice?.amount;
		const hasDiscount = compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price);
		const discountPercentage = hasDiscount ? calculateDiscountPercentage(compareAtPrice, price) : 0;
		const firstImage = product.images?.nodes?.[0];

		return {
			firstVariant,
			price,
			compareAtPrice,
			hasDiscount,
			discountPercentage,
			imageUrl: firstImage?.url,
			imageAlt: firstImage?.altText || product.title,
			isAvailable: firstVariant?.availableForSale ?? false,
		};
	}, [product]);

	const isWishlisted = useMemo(() => isInWishlist(product.handle), [isInWishlist, product.handle]);
	const isAddingToCartState = isAddingToCartLocal || isAddingToCartProp;
	const isLowStock = quantity > 0 && quantity <= 10;

	// Memoize the product URL
	const productUrl = useMemo(() => {
		return `/products/${product.handle}${collectionHandle ? `?collection=${collectionHandle}` : ""}${variantId ? `${collectionHandle ? "&" : "?"}variant=${variantId}` : ""}`;
	}, [product.handle, collectionHandle, variantId]);

	const handleAddToCart = useCallback(
		async (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (!variantId) {
				toast.error("Please select a product variant");
				return;
			}

			setIsAddingToCartLocal(true);
			try {
				const merchandiseId = variantId.includes("gid://shopify/ProductVariant/") ? variantId : `gid://shopify/ProductVariant/${variantId}`;

				await addItem({
					merchandiseId,
					quantity: 1,
				});

				if (handlersRef.current.addToCart) {
					handlersRef.current.addToCart();
				}

				toast.success("Added to cart");
			} catch (error) {
				console.error("Error in handleAddToCart:", error);
				toast.error("Failed to add to cart");
			} finally {
				setIsAddingToCartLocal(false);
			}
		},
		[variantId, addItem]
	);

	const handleWishlistToggle = useCallback(() => {
		if (isWishlisted) {
			removeFromWishlist(product.handle);
			if (handlersRef.current.removeFromWishlist) {
				handlersRef.current.removeFromWishlist(product.handle);
			}
		} else {
			addToWishlist(product.handle);
			if (handlersRef.current.addToWishlist) {
				handlersRef.current.addToWishlist(product.handle);
			}
		}
	}, [isWishlisted, product.handle, removeFromWishlist, addToWishlist]);

	// Get rating data
	const { rating, ratingCount, recentPurchases } = getRatingData(product);
	const hasRating = rating > 0 && ratingCount > 0;
	const purchaseText = formatRecentPurchases(recentPurchases);

	// Calculate discount percentage if there's a sale
	const discountPercentage = productDetails.hasDiscount ? productDetails.discountPercentage : 0;

	// Use product's availability if not explicitly provided
	const isAvailable = productDetails.isAvailable;

	return (
		<div className={cn("group relative h-full", view === "grid" ? "flex flex-col sm:border sm:border-foreground/10 sm:hover:border-foreground/20 transition-colors duration-200 sm:rounded-lg sm:my-0.5" : "flex flex-row gap-4 border-b border-foreground/10 last:border-b-0 py-4")} data-view={view}>
			<Button variant="ghost" size="icon" className={cn("absolute z-[1]", view === "grid" ? "right-2 top-2" : "right-0 top-0")} onClick={handleWishlistToggle}>
				<Heart className={cn("h-5 w-5 transition-colors duration-200", isWishlisted ? "fill-red-500 stroke-red-500" : "fill-secondary stroke-foreground/60 group-hover:stroke-foreground/80")} />
			</Button>

			{/* Product Image */}
			<Link href={productUrl} className={cn("block shrink-0", view === "grid" ? "w-full" : "w-24 sm:w-32")}>
				<div className={cn("relative bg-neutral-100 dark:bg-neutral-800 overflow-hidden border border-foreground/10 hover:border-foreground/20 transition-colors sm:border-0", view === "grid" ? "aspect-square w-full sm:rounded-t-lg" : "aspect-square w-24 h-24 sm:w-32 sm:h-32 rounded-lg")}>
					{productDetails.imageUrl ? (
						<Image
							src={productDetails.imageUrl}
							alt={productDetails.imageAlt}
							fill
							priority={isVisible}
							unoptimized={true}
							loading={isVisible ? "eager" : "lazy"}
							className="object-cover hover:scale-105 transition-transform duration-300"
							sizes={view === "grid" ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw" : "96px"}
							onError={(e) => {
								console.error(`Failed to load image: ${productDetails.imageUrl}`);
								const target = e.target as HTMLImageElement;
								target.src = "/placeholder-product.png"; // Fallback image
							}}
						/>
					) : (
						// Placeholder when no image is available
						<div className="absolute inset-0 flex items-center justify-center bg-neutral-200 dark:bg-neutral-800">
							<ShoppingBag className="h-12 w-12 text-neutral-400" />
							<span className="sr-only">No product image available</span>
						</div>
					)}
				</div>
			</Link>

			{/* Product Info */}
			<div className={cn("flex flex-col", view === "grid" ? "mt-3 flex-1 p-2" : "flex-1 min-w-0 py-1")}>
				<Link href={productUrl} className="flex-1">
					{/* Vendor */}
					<p className="text-sm text-muted-foreground mb-1">{product.vendor || "Zugzology"}</p>

					{/* Title */}
					<h2 className={cn("font-medium text-base group-hover:text-primary transition-colors", view === "grid" ? "line-clamp-2" : "line-clamp-2 sm:line-clamp-1")}>{product.title}</h2>

					{/* Reviews */}
					{hasRating ? (
						<div className="mt-1 flex items-center gap-2">
							<StarRating rating={rating} count={ratingCount} />
						</div>
					) : (
						<div className="mt-1">
							<p className="text-sm text-muted-foreground">Be the first to review</p>
						</div>
					)}

					{/* Price Section */}
					<div className="mt-2">
						{productDetails.hasDiscount && (
							<div className="flex items-center gap-1">
								<span className="text-sm text-muted-foreground line-through">List Price: {formatPrice(parseFloat(productDetails.compareAtPrice || "0"))}</span>
							</div>
						)}
						<div className="flex items-baseline gap-2">
							<span className="text-xl font-medium" aria-label={`Price: ${formatPrice(parseFloat(productDetails.price))}`}>
								<span className="text-sm">$</span>
								<span>{Math.floor(parseFloat(productDetails.price))}</span>
								<span className="text-sm">{(parseFloat(productDetails.price) % 1).toFixed(2).substring(1)}</span>
							</span>
							{productDetails.hasDiscount && (
								<span className="text-sm text-red-600 font-medium">
									Save {discountPercentage}% ({formatPrice(parseFloat(productDetails.compareAtPrice || "0") - parseFloat(productDetails.price))})
								</span>
							)}
						</div>
					</div>

					{/* Stock and Shipping Info */}
					<div className={cn("space-y-1.5", view === "grid" ? "mt-2" : "mt-1.5")}>
						<div className="flex items-center justify-between">
							<span className={cn("text-sm font-medium", isAvailable ? "text-green-600" : "text-red-600")}>{isAvailable ? "In Stock" : "Out of Stock"}</span>
							{isAvailable && quantity > 0 && quantity <= 10 && <span className="text-xs text-muted-foreground">Only {quantity} left</span>}
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-primary">FREE Shipping</span>
							<span className="text-xs text-muted-foreground">Delivery by {formatDeliveryDate()}</span>
						</div>
					</div>

					{/* Recent Purchases */}
					{recentPurchases > 0 && <p className="mt-2 text-xs text-muted-foreground">{purchaseText}</p>}
				</Link>

				{/* Add to Cart Button */}
				<div className="flex items-stretch gap-2 mt-2">
					<Button variant="secondary" className="w-full bg-secondary hover:bg-secondary/80 text-foreground border border-foreground/10 hover:border-foreground/20 shadow-none" onClick={handleAddToCart} disabled={isAddingToCartState || !isAvailable || !variantId}>
						<div className="flex items-center justify-center w-full">
							{isAddingToCartState ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									<span>Adding...</span>
								</>
							) : (
								<>
									<ShoppingCart className="h-4 w-4 mr-2" />
									<span>Add to Cart</span>
								</>
							)}
						</div>
					</Button>
				</div>
			</div>
		</div>
	);
});

ProductCard.displayName = "ProductCard";
