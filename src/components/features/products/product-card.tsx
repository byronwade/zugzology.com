"use client";

import { Clock, Heart, Info, Loader2, Package, ShoppingCart, Star, Truck, Users } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useWishlist } from "@/components/providers";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { PrefetchLink } from "@/components/ui/prefetch-link";
import { analytics } from "@/lib/analytics/tracker";
import type { ShopifyProduct } from "@/lib/types";
import { cn, formatPrice, isIntentionallyFree } from "@/lib/utils";
import { getOpticalIconClasses } from "@/lib/utils/optical-alignment";

export type ProductCardProps = {
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
	priority?: boolean;
	// AI enhancement props
	aiData?: {
		aiScore?: number;
		aiConfidence?: string;
		aiReasons?: string[];
		trend?: "rising" | "falling" | "stable";
		rank?: number;
	};
};

// Helper function to format recent purchases
const formatRecentPurchases = (count: number) => {
	if (!count || count === 0) {
		return null;
	}
	if (count >= 1000) {
		return `${Math.floor(count / 1000)}k+ bought recently`;
	}
	if (count >= 100) {
		return `${Math.floor(count / 100) * 100}+ bought recently`;
	}
	if (count >= 50) {
		return "50+ bought recently";
	}
	if (count >= 20) {
		return "20+ bought recently";
	}
	if (count > 0) {
		return `${count} bought recently`;
	}
	return null;
};

// Helper function to render star rating
const StarRating = memo(({ rating, count }: { rating: number; count: number }) => {
	if (!(rating && count)) {
		return null;
	}
	const fullStars = Math.floor(rating);
	const hasHalfStar = rating % 1 >= 0.5;
	const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

	return (
		<div className="flex items-center gap-1.5">
			<div className="flex items-center">
				{[...new Array(fullStars)].map((_, i) => (
					<Star
						className={cn("h-4 w-4 fill-yellow-400 text-yellow-400", getOpticalIconClasses("Star", "inline"))}
						key={`full-${i}`}
					/>
				))}
				{hasHalfStar && (
					<div className="relative h-4 w-4">
						<Star
							className={cn(
								"clip-path-[inset(0_50%_0_0)] absolute h-4 w-4 fill-yellow-400 text-yellow-400",
								getOpticalIconClasses("Star", "inline")
							)}
						/>
						<Star className={cn("absolute h-4 w-4 text-yellow-400", getOpticalIconClasses("Star", "inline"))} />
					</div>
				)}
				{[...new Array(emptyStars)].map((_, i) => (
					<Star className={cn("h-4 w-4 text-yellow-400", getOpticalIconClasses("Star", "inline"))} key={`empty-${i}`} />
				))}
			</div>
			<span className="text-muted-foreground text-sm">({count})</span>
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
		rating: Number.parseFloat(
			metafields.find((field) => field?.namespace === "custom" && field?.key === "rating")?.value || "0"
		),
		ratingCount: Number.parseInt(
			metafields.find((field) => field?.namespace === "custom" && field?.key === "rating_count")?.value || "0",
			10
		),
		recentPurchases: Number.parseInt(
			metafields.find((field) => field?.namespace === "custom" && field?.key === "recent_purchases")?.value || "0",
			10
		),
	};
};

// Calculate discount percentage
const calculateDiscountPercentage = (compareAtPrice: string, price: string) => {
	if (!(compareAtPrice && price)) {
		return 0;
	}
	return Math.round(
		((Number.parseFloat(compareAtPrice) - Number.parseFloat(price)) / Number.parseFloat(compareAtPrice)) * 100
	);
};

// Add helper function to format quantity display, consistent with ProductActions
const _formatQuantityDisplay = (quantity: number, isAvailableForSale = true) => {
	// Only show as backorder if quantity is 0 AND product is NOT available for sale
	if (quantity === 0 && !isAvailableForSale) {
		return "Backorder";
	}
	if (quantity === 0 && isAvailableForSale) {
		// If quantity is 0 but product is available for sale, it means inventory tracking is disabled in Shopify
		return "In Stock";
	}
	if (quantity === 1) {
		return "Last One";
	}
	if (quantity <= 5) {
		return `Last ${quantity} In Stock`;
	}
	if (quantity <= 10) {
		return `${quantity} available`;
	}
	if (quantity <= 20) {
		return "10+";
	}
	if (quantity <= 50) {
		return "20+";
	}
	if (quantity <= 100) {
		return "50+";
	}
	if (quantity <= 500) {
		return "100+";
	}
	if (quantity <= 1000) {
		return "500+";
	}
	return "1000+";
};

// Memoize the ProductCard component
export const ProductCard = memo(function ProductCard({
	product,
	collectionHandle,
	view = "grid",
	variantId,
	quantity: quantityProp,
	onAddToCart,
	isAddingToCartProp,
	onRemoveFromWishlist,
	onAddToWishlist,
	isVisible = true,
	priority = false,
	aiData,
}: ProductCardProps) {
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
		const hasDiscount = compareAtPrice && Number.parseFloat(compareAtPrice) > Number.parseFloat(price);
		const discountPercentage = hasDiscount ? calculateDiscountPercentage(compareAtPrice, price) : 0;
		const firstImage = product.images?.nodes?.[0];

		// Determine the actual quantity to use
		// Use quantityProp if explicitly provided, otherwise use the variant's quantityAvailable
		const actualQuantity = quantityProp !== undefined ? quantityProp : (firstVariant?.quantityAvailable ?? 0);

		// Removed console.log for performance

		// A product is on backorder only if its quantity is strictly 0 AND it's NOT available for sale
		// This ensures products marked as available for sale are never shown as backorder items
		const isBackorder = !!firstVariant?.id && firstVariant.availableForSale === false && actualQuantity === 0;

		// Check if this is an intentionally free product using the utility function
		const isFreeProduct = isIntentionallyFree(product) || Number.parseFloat(price) === 0;

		// All products should have a valid price - if price is 0, treat as free product
		const hasValidPrice = true;

		return {
			firstVariant,
			price,
			compareAtPrice,
			hasDiscount,
			discountPercentage,
			imageUrl: firstImage?.url,
			imageAlt: firstImage?.altText || product.title,
			isAvailable: firstVariant?.availableForSale ?? false,
			isBackorder,
			hasValidPrice,
			isFreeProduct,
			quantity: actualQuantity,
		};
	}, [product, quantityProp]);

	const isWishlisted = useMemo(() => isInWishlist(product.handle), [isInWishlist, product.handle]);
	const isAddingToCartState = isAddingToCartLocal || isAddingToCartProp;
	const _isLowStock = productDetails.quantity > 0 && productDetails.quantity <= 10;

	// Determine if product can be added to cart:
	// 1. It must be available OR on backorder
	// 2. It must have a valid price (greater than 0)
	const canAddToCart = (productDetails.isAvailable || productDetails.isBackorder) && productDetails.hasValidPrice;

	// Memoize the product URL
	const productUrl = useMemo(
		() =>
			`/products/${product.handle}${collectionHandle ? `?collection=${collectionHandle}` : ""}${
				variantId ? `${collectionHandle ? "&" : "?"}variant=${variantId}` : ""
			}`,
		[product.handle, collectionHandle, variantId]
	);

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
				const merchandiseId = variantId.includes("gid://shopify/ProductVariant/")
					? variantId
					: `gid://shopify/ProductVariant/${variantId}`;

				await addItem({
					merchandiseId,
					quantity: 1,
				});

				if (handlersRef.current.addToCart) {
					handlersRef.current.addToCart();
				}

				toast.success("Added to cart");

				// If this product was added from wishlist, remove it from wishlist
				if (isWishlisted && handlersRef.current.removeFromWishlist) {
					removeFromWishlist(product.handle);
					handlersRef.current.removeFromWishlist(product.handle);
				}

				// Cart will be opened automatically by the cart provider
			} catch (_error) {
				toast.error("Failed to add to cart");
			} finally {
				setIsAddingToCartLocal(false);
			}
		},
		[variantId, addItem, isWishlisted, removeFromWishlist, product.handle]
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

	const handleProductClick = useCallback(() => {
		// Track product click analytics
		analytics.productClick({
			productId: product.id,
			source: collectionHandle || "direct",
			collection: collectionHandle,
		});
	}, [product.id, collectionHandle]);

	// Get rating data - memoized to prevent recalculation on every render
	const ratingData = useMemo(() => getRatingData(product), [product]);
	const { rating, ratingCount, recentPurchases } = ratingData;
	const hasRating = rating > 0 && ratingCount > 0;
	const purchaseText = useMemo(() => formatRecentPurchases(recentPurchases), [recentPurchases]);

	// Calculate discount percentage if there's a sale
	const discountPercentage = productDetails.hasDiscount ? productDetails.discountPercentage : 0;

	// Use product's availability if not explicitly provided
	const _isAvailable = productDetails.isAvailable;

	// Extract product images for prefetching (limit to first 3 for performance)
	const productImages = useMemo(() => {
		const images: string[] = [];

		if (product.images?.nodes && Array.isArray(product.images.nodes)) {
			product.images.nodes.forEach((img) => {
				if (img?.url) {
					images.push(img.url);
				}
			});
		}

		// Fallback to first image if available
		if (images.length === 0 && product.images?.nodes?.[0]?.url) {
			images.push(product.images.nodes[0].url);
		}

		// Check variants for images
		if (product.variants?.nodes) {
			product.variants.nodes.forEach((variant) => {
				if (variant.image?.url && !images.includes(variant.image.url)) {
					images.push(variant.image.url);
				}
			});
		}

		// Limit to first 3 images for optimal prefetch performance
		return images.slice(0, 3);
	}, [product]);

	return (
		<div
			className={cn(
				"group relative h-full",
				view === "grid"
					? "flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all duration-300 sm:rounded-xl dark:border-neutral-900 dark:bg-black"
					: "flex flex-row gap-3 border-foreground/10 border-b py-3 last:border-b-0 sm:gap-4 sm:py-4"
			)}
			data-product-id={product.id}
			data-view={view}
		>
			<Button
				className={cn("absolute z-[1]", view === "grid" ? "top-1.5 right-1.5 sm:top-2 sm:right-2" : "top-0 right-0")}
				data-product-id={product.id}
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

			{/* Product Image */}
			<PrefetchLink
				className={cn("block shrink-0", view === "grid" ? "w-full" : "w-24 sm:w-28 md:w-32")}
				href={productUrl}
				onClick={handleProductClick}
				prefetchImages={productImages}
				prefetchPriority={priority ? "high" : "low"}
			>
				<div
					className={cn(
						"relative overflow-hidden bg-muted transition-all duration-300",
						view === "grid"
							? "aspect-square w-full group-hover:scale-105"
							: "aspect-square h-24 w-24 rounded-lg sm:h-28 sm:w-28 md:h-32 md:w-32"
					)}
				>
					{productDetails.imageUrl ? (
						<Image
							alt={productDetails.imageAlt}
							className="object-cover transition-transform duration-300 hover:scale-105"
							fill
							loading={priority ? "eager" : isVisible ? "eager" : "lazy"}
							priority={priority}
							sizes={
								view === "grid"
									? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
									: "96px"
							}
							src={productDetails.imageUrl}
						/>
					) : (
						<div className="absolute inset-0 flex items-center justify-center">
							<Package className={cn("h-8 w-8 text-neutral-400", getOpticalIconClasses("Package", "standalone"))} />
						</div>
					)}

					{/* AI data badges - only in development */}
					{process.env.NODE_ENV === "development" && aiData && (
						<>
							{aiData.aiScore && aiData.aiScore > 70 && (
								<div className="absolute bottom-2 left-2 rounded bg-primary px-2 py-1 font-bold text-primary-foreground text-xs opacity-75">
									AI: {aiData.aiScore.toFixed(0)}
								</div>
							)}
							{aiData.trend && aiData.trend !== "stable" && (
								<div
									className={`absolute right-2 bottom-2 rounded px-1 py-0.5 font-bold text-xs ${
										aiData.trend === "rising" ? "bg-green-500 text-white" : "bg-orange-500 text-white"
									}`}
								>
									{aiData.trend === "rising" ? "↗️" : "↘️"}
								</div>
							)}
						</>
					)}
				</div>
			</PrefetchLink>

			{/* Product Info */}
			<div
				className={cn(
					"flex flex-col",
					view === "grid" ? "mt-3 flex-1 px-3 pb-3 sm:mt-4 sm:px-4 sm:pb-4" : "min-w-0 flex-1 py-0.5 sm:py-1"
				)}
			>
				<PrefetchLink
					className="flex-1"
					href={productUrl}
					onClick={handleProductClick}
					prefetchImages={productImages}
					prefetchPriority={priority ? "high" : "low"}
				>
					{/* Vendor */}
					<p className="mb-0.5 text-[10px] text-muted-foreground sm:mb-1 sm:text-xs">{product.vendor || "Zugzology"}</p>

					{/* AI confidence and rank - only in development */}
					{process.env.NODE_ENV === "development" && aiData && aiData.aiConfidence && aiData.aiConfidence !== "low" && (
						<div className="mb-1 text-primary text-xs">
							{aiData.aiConfidence} confidence
							{aiData.rank && ` • Rank #${aiData.rank}`}
						</div>
					)}

					{/* Title */}
					<h2
						className={cn(
							"mb-2 font-semibold text-foreground transition-colors group-hover:text-primary sm:mb-3",
							view === "grid"
								? "line-clamp-2 min-h-[2.5rem] text-sm sm:min-h-[3rem] sm:text-base"
								: "line-clamp-2 text-sm sm:line-clamp-1 sm:text-base"
						)}
					>
						{product.title}
					</h2>

					{/* Reviews */}
					{hasRating ? (
						<div className="mt-1 flex items-center gap-2">
							<StarRating count={ratingCount} rating={rating} />
						</div>
					) : (
						<div className="mt-1">
							<p className="text-muted-foreground text-xs">Be the first to review</p>
						</div>
					)}

					{/* Price Section */}
					<div className="mt-auto">
						{productDetails.hasDiscount && (
							<div className="mb-1 flex items-center gap-2">
								<span className="text-muted-foreground text-sm line-through">
									{formatPrice(Number.parseFloat(productDetails.compareAtPrice || "0"))}
								</span>
								<span className="font-medium text-red-600 text-xs dark:text-red-400">Save {discountPercentage}%</span>
							</div>
						)}
						<div className="flex items-baseline gap-2">
							{productDetails.hasValidPrice ? (
								<span
									aria-label={`Price: ${formatPrice(Number.parseFloat(productDetails.price))}`}
									className="font-bold text-foreground text-xl"
								>
									{productDetails.isFreeProduct ? (
										"Free"
									) : (
										<>
											<span className="text-sm">$</span>
											<span>{Math.floor(Number.parseFloat(productDetails.price))}</span>
											<span className="text-sm">
												{(Number.parseFloat(productDetails.price) % 1).toFixed(2).substring(1)}
											</span>
										</>
									)}
								</span>
							) : (
								<span className="font-bold text-foreground text-xl">
									{productDetails.isBackorder ? "Price TBD (Backorder)" : "Price TBD"}
								</span>
							)}
						</div>
					</div>
				</PrefetchLink>

				{/* Stock and Shipping Info */}
				<div className="mt-2 space-y-0.5 sm:mt-3 sm:space-y-1">
					{/* Stock Status */}
					<div className="flex items-center gap-1">
						{productDetails.isAvailable ? (
							<>
								<div className="h-1.5 w-1.5 rounded-full bg-green-500 sm:h-2 sm:w-2" />
								<span className="text-[10px] text-muted-foreground sm:text-xs">
									{productDetails.isBackorder ? "Available for Pre-Order" : "In Stock"}
								</span>
							</>
						) : (
							<>
								<div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 sm:h-2 sm:w-2" />
								<span className="text-[10px] text-muted-foreground sm:text-xs">Out of Stock</span>
							</>
						)}
					</div>

					{/* Shipping Info */}
					<p className="flex items-center gap-1 text-[10px] text-muted-foreground sm:gap-1.5 sm:text-xs">
						<Truck className={cn("h-2.5 w-2.5 sm:h-3 sm:w-3", getOpticalIconClasses("Truck", "inline"))} />
						{productDetails.isBackorder ? `Ships ${formatDeliveryDate()}` : "Free Shipping"}
					</p>
				</div>

				{/* Recent Purchases - Premium Badge */}
				{recentPurchases > 0 && (
					<div className="mt-2 sm:mt-3">
						<div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 sm:gap-1.5 sm:px-3 sm:py-1.5 dark:bg-primary/20">
							<Users
								className={cn("h-3 w-3 text-primary sm:h-3.5 sm:w-3.5", getOpticalIconClasses("Users", "inline"))}
							/>
							<span className="font-medium text-[10px] text-primary sm:text-xs">{purchaseText}</span>
						</div>
					</div>
				)}

				{/* Add to Cart Button */}
				<div className="mt-3 sm:mt-4">
					<Button
						className="h-10 w-full rounded-lg font-semibold text-sm transition-all duration-300 group-hover:shadow-lg sm:h-11 sm:text-base"
						data-cart-add
						data-product-id={product.id}
						disabled={isAddingToCartState || !variantId || !canAddToCart}
						onClick={handleAddToCart}
					>
						<div className="flex w-full items-center justify-center">
							{isAddingToCartState ? (
								<>
									<Loader2 className={cn("mr-2 h-4 w-4 animate-spin", "translate-y-optical-icon-down")} />
									<span>Adding...</span>
								</>
							) : productDetails.isBackorder ? (
								<>
									<Clock className={cn("mr-2 h-4 w-4", getOpticalIconClasses("Clock", "button"))} />
									<span>Pre-Order</span>
								</>
							) : productDetails.hasValidPrice ? (
								<>
									<ShoppingCart className={cn("mr-2 h-4 w-4", getOpticalIconClasses("ShoppingCart", "button"))} />
									<span>{productDetails.isFreeProduct ? "Claim Free" : "Add to Cart"}</span>
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
			</div>
		</div>
	);
});

ProductCard.displayName = "ProductCard";
