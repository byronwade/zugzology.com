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
import { useState } from "react";
import { useWishlist } from "@/lib/providers/wishlist-provider";

export interface ProductCardProps {
	product: ShopifyProduct;
	collectionHandle?: string;
	view?: "grid" | "list";
	variantId?: string;
	quantity?: number;
	onAddToCart?: () => void;
	isAddingToCart?: boolean;
	onRemoveFromWishlist?: (handle: string) => void;
	onAddToWishlist?: (handle: string) => void;
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
const StarRating = ({ rating, count }: { rating: number; count: number }) => {
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
};

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

// Remove all console.log statements and optimize metafield checks
const getRatingData = (product: ShopifyProduct) => {
	const metafields = product.metafields?.edges || [];
	return {
		rating: parseFloat(metafields.find((edge) => edge.node.namespace === "custom" && edge.node.key === "rating")?.node.value || "0"),
		ratingCount: parseInt(metafields.find((edge) => edge.node.namespace === "custom" && edge.node.key === "rating_count")?.node.value || "0", 10),
		recentPurchases: parseInt(metafields.find((edge) => edge.node.namespace === "custom" && edge.node.key === "recent_purchases")?.node.value || "0", 10),
	};
};

export function ProductCard({ product, collectionHandle, view = "grid", variantId, quantity = 0, onAddToCart, isAddingToCart, onRemoveFromWishlist, onAddToWishlist }: ProductCardProps) {
	const { addItem } = useCart();
	const [isAddingToCartState, setIsAddingToCart] = useState(false);
	const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
	const isWishlisted = isInWishlist(product.handle);

	// Get the first variant and its price
	const firstVariant = product.variants?.edges?.[0]?.node;
	const price = firstVariant?.price?.amount || "0";
	const compareAtPrice = firstVariant?.compareAtPrice?.amount;
	const hasDiscount = compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price);

	// Get the first image
	const firstImage = product.images?.edges?.[0]?.node;
	const imageUrl = firstImage?.url;
	const imageAlt = firstImage?.altText || product.title;

	// Use product's availability if not explicitly provided
	const isAvailable = firstVariant?.availableForSale ?? false;
	const isLowStock = quantity > 0 && quantity <= 10;

	// Calculate discount percentage if there's a sale
	const discountPercentage = hasDiscount ? Math.round(((parseFloat(compareAtPrice) - parseFloat(price)) / parseFloat(compareAtPrice)) * 100) : 0;

	// Get rating data
	const { rating, ratingCount, recentPurchases } = getRatingData(product);
	const hasRating = rating > 0 && ratingCount > 0;
	const purchaseText = formatRecentPurchases(recentPurchases);

	// Determine product URL with collection and variant params if available
	const productUrl = `/products/${product.handle}${collectionHandle ? `?collection=${collectionHandle}` : ""}${variantId ? `${collectionHandle ? "&" : "?"}variant=${variantId}` : ""}`;

	const handleAddToCart = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (onAddToCart) {
			onAddToCart();
		} else {
			setIsAddingToCart(true);
			try {
				await addItem({
					merchandiseId: variantId,
					quantity: 1,
				});
				toast.success("Added to cart");
			} catch (error) {
				console.error("Error adding to cart:", error);
				toast.error("Failed to add to cart");
			} finally {
				setIsAddingToCart(false);
			}
		}
	};

	const handleWishlistToggle = () => {
		if (isWishlisted) {
			removeFromWishlist(product.handle);
		} else {
			addToWishlist(product.handle);
		}
	};

	return (
		<div className={cn("group relative h-full sm:border sm:border-foreground/10 sm:hover:border-foreground/20 transition-colors duration-200 sm:rounded-lg sm:my-0.5", view === "grid" ? "flex flex-col" : "flex flex-row gap-4 py-4")}>
			<Button variant="ghost" size="icon" className="absolute right-2 top-2 z-10" onClick={handleWishlistToggle}>
				<Heart className={cn("h-5 w-5 transition-colors duration-200", isWishlisted ? "fill-red-500 stroke-red-500" : "stroke-foreground/60 group-hover:stroke-foreground/80")} />
			</Button>

			{/* Product Image */}
			<Link href={productUrl} className={cn("block shrink-0", view === "grid" ? "w-full" : "w-24 sm:w-32")}>
				<div className={cn("relative bg-neutral-100 dark:bg-neutral-800 overflow-hidden", view === "grid" ? "aspect-square w-full sm:rounded-t-lg" : "aspect-square w-24 h-24 sm:w-32 sm:h-32 rounded-lg")}>
					{firstImage ? (
						<Image src={firstImage.url} alt={firstImage.altText || product.title} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes={view === "grid" ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : "96px"} priority />
					) : (
						<div className="absolute inset-0 flex items-center justify-center">
							<Package className="h-8 w-8 text-neutral-400" />
						</div>
					)}
				</div>
			</Link>

			{/* Product Info */}
			<div className={cn("flex flex-col p-2", view === "grid" ? "mt-3 flex-1" : "flex-1 min-w-0")}>
				<Link href={productUrl} className="flex-1">
					{/* Vendor */}
					<p className="text-sm text-muted-foreground mb-1">{product.vendor || "Zugzology"}</p>

					{/* Title */}
					<h2 className={cn("font-medium text-base group-hover:text-primary transition-colors", view === "grid" ? "line-clamp-2" : "line-clamp-2 sm:line-clamp-1")}>{product.title}</h2>

					{/* Reviews */}
					{hasRating ? (
						<div className="mt-1 flex items-center gap-2">
							<StarRating rating={rating} count={ratingCount} />
							<span className="text-sm text-muted-foreground">({ratingCount})</span>
						</div>
					) : (
						<div className="mt-1">
							<p className="text-sm text-muted-foreground">Be the first to review</p>
						</div>
					)}

					{/* Price Section */}
					<div className="mt-2">
						{hasDiscount && (
							<div className="flex items-center gap-1">
								<span className="text-sm text-muted-foreground line-through">List Price: {formatPrice(parseFloat(compareAtPrice || "0"))}</span>
							</div>
						)}
						<div className="flex items-baseline gap-2">
							<span className="text-xl font-medium" aria-label={`Price: ${formatPrice(parseFloat(price))}`}>
								<span className="text-sm">$</span>
								<span>{Math.floor(parseFloat(price))}</span>
								<span className="text-sm">{(parseFloat(price) % 1).toFixed(2).substring(1)}</span>
							</span>
							{hasDiscount && (
								<span className="text-sm text-red-600 font-medium">
									Save {discountPercentage}% ({formatPrice(parseFloat(compareAtPrice || "0") - parseFloat(price))})
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

				{/* Add to Cart and Wishlist Buttons */}
				<div className="flex items-stretch gap-2 mt-2">
					<Button variant="outline" className="flex-1 min-w-0 h-10" onClick={handleAddToCart} disabled={isAddingToCart || !isAvailable || !variantId}>
						<div className="flex items-center justify-center w-full">
							{isAddingToCart ? (
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
}
