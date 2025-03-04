"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, cn, isIntentionallyFree } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, ShoppingBag, Loader2, Package, Clock, Users, Heart, Info, Truck } from "lucide-react";
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
	priority?: boolean;
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
		rating: parseFloat(
			metafields.find((field) => field?.namespace === "custom" && field?.key === "rating")?.value || "0"
		),
		ratingCount: parseInt(
			metafields.find((field) => field?.namespace === "custom" && field?.key === "rating_count")?.value || "0",
			10
		),
		recentPurchases: parseInt(
			metafields.find((field) => field?.namespace === "custom" && field?.key === "recent_purchases")?.value || "0",
			10
		),
	};
};

// Calculate discount percentage
const calculateDiscountPercentage = (compareAtPrice: string, price: string) => {
	if (!compareAtPrice || !price) return 0;
	return Math.round(((parseFloat(compareAtPrice) - parseFloat(price)) / parseFloat(compareAtPrice)) * 100);
};

// Add helper function to format quantity display, consistent with ProductActions
const formatQuantityDisplay = (quantity: number, isAvailableForSale: boolean = true) => {
	// Only show as backorder if quantity is 0 AND product is NOT available for sale
	if (quantity === 0 && !isAvailableForSale) {
		return "Backorder";
	} else if (quantity === 0 && isAvailableForSale) {
		// If quantity is 0 but product is available for sale, it means inventory tracking is disabled in Shopify
		return "In Stock";
	} else if (quantity === 1) {
		return "Last One";
	} else if (quantity <= 5) {
		return `Last ${quantity} In Stock`;
	} else if (quantity <= 10) {
		return `${quantity} available`;
	} else if (quantity <= 20) {
		return "10+";
	} else if (quantity <= 50) {
		return "20+";
	} else if (quantity <= 100) {
		return "50+";
	} else if (quantity <= 500) {
		return "100+";
	} else if (quantity <= 1000) {
		return "500+";
	} else {
		return "1000+";
	}
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
}: ProductCardProps) {
	const { addItem, openCart } = useCart();
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

		// Determine the actual quantity to use
		// Use quantityProp if explicitly provided, otherwise use the variant's quantityAvailable
		let actualQuantity = quantityProp !== undefined ? quantityProp : firstVariant?.quantityAvailable ?? 0;

		// Log the actual quantity for debugging
		console.log(
			`[Stock Debug] Product "${product.title}" (${product.handle}): quantityAvailable=${actualQuantity}, availableForSale=${firstVariant?.availableForSale}`
		);

		// A product is on backorder only if its quantity is strictly 0 AND it's NOT available for sale
		// This ensures products marked as available for sale are never shown as backorder items
		const isBackorder = !!firstVariant?.id && firstVariant.availableForSale === false && actualQuantity === 0;

		// Check if this is an intentionally free product using the utility function
		const isFreeProduct = isIntentionallyFree(product) || parseFloat(price) === 0;

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
	const isLowStock = productDetails.quantity > 0 && productDetails.quantity <= 10;

	// Determine if product can be added to cart:
	// 1. It must be available OR on backorder
	// 2. It must have a valid price (greater than 0)
	const canAddToCart = (productDetails.isAvailable || productDetails.isBackorder) && productDetails.hasValidPrice;

	// Memoize the product URL
	const productUrl = useMemo(() => {
		return `/products/${product.handle}${collectionHandle ? `?collection=${collectionHandle}` : ""}${
			variantId ? `${collectionHandle ? "&" : "?"}variant=${variantId}` : ""
		}`;
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

				// Cart will be opened automatically by the cart provider
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
		<div
			className={cn(
				"group relative h-full",
				view === "grid"
					? "flex flex-col sm:border sm:border-foreground/10 sm:hover:border-foreground/20 transition-colors duration-200 sm:rounded-lg sm:my-0.5"
					: "flex flex-row gap-4 border-b border-foreground/10 last:border-b-0 py-4"
			)}
			data-view={view}
		>
			<Button
				variant="ghost"
				size="icon"
				className={cn("absolute z-[1]", view === "grid" ? "right-2 top-2" : "right-0 top-0")}
				onClick={handleWishlistToggle}
			>
				<Heart
					className={cn(
						"h-5 w-5 transition-colors duration-200",
						isWishlisted
							? "fill-red-500 stroke-red-500"
							: "fill-secondary stroke-foreground/60 group-hover:stroke-foreground/80"
					)}
				/>
			</Button>

			{/* Product Image */}
			<Link href={productUrl} className={cn("block shrink-0", view === "grid" ? "w-full" : "w-24 sm:w-32")}>
				<div
					className={cn(
						"relative bg-neutral-100 dark:bg-neutral-800 overflow-hidden border border-foreground/10 hover:border-foreground/20 transition-colors sm:border-0",
						view === "grid"
							? "aspect-square w-full sm:rounded-t-lg"
							: "aspect-square w-24 h-24 sm:w-32 sm:h-32 rounded-lg"
					)}
				>
					{productDetails.imageUrl ? (
						<Image
							src={productDetails.imageUrl}
							alt={productDetails.imageAlt}
							fill
							loading={priority ? "eager" : isVisible ? "eager" : "lazy"}
							priority={priority}
							className="object-cover hover:scale-105 transition-transform duration-300"
							sizes={
								view === "grid"
									? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
									: "96px"
							}
							onLoad={(event) => {
								if (isVisible || priority) {
									// Once the image loads, prefetch the product page
									const link = document.createElement("link");
									link.rel = "prefetch";
									link.href = productUrl;
									document.head.appendChild(link);
								}
							}}
						/>
					) : (
						<div className="absolute inset-0 flex items-center justify-center">
							<Package className="h-8 w-8 text-neutral-400" />
						</div>
					)}
				</div>
			</Link>

			{/* Product Info */}
			<div className={cn("flex flex-col", view === "grid" ? "mt-3 flex-1 p-2" : "flex-1 min-w-0 py-1")}>
				<Link href={productUrl} className="flex-1">
					{/* Vendor */}
					<p className="text-xs text-gray-500 mb-1">{product.vendor || "Zugzology"}</p>

					{/* Title */}
					<h2
						className={cn(
							"font-medium text-gray-900 group-hover:text-purple-600 transition-colors",
							view === "grid" ? "line-clamp-2" : "line-clamp-2 sm:line-clamp-1"
						)}
					>
						{product.title}
					</h2>

					{/* Reviews */}
					{hasRating ? (
						<div className="mt-1 flex items-center gap-2">
							<StarRating rating={rating} count={ratingCount} />
						</div>
					) : (
						<div className="mt-1">
							<p className="text-xs text-gray-500">Be the first to review</p>
						</div>
					)}

					{/* Price Section */}
					<div className="mt-2">
						{productDetails.hasDiscount && (
							<div className="flex items-center gap-1">
								<span className="text-sm text-gray-500 line-through">
									List Price: {formatPrice(parseFloat(productDetails.compareAtPrice || "0"))}
								</span>
							</div>
						)}
						<div className="flex items-baseline gap-2">
							{productDetails.hasValidPrice ? (
								<span
									className="text-base font-medium text-gray-900"
									aria-label={`Price: ${formatPrice(parseFloat(productDetails.price))}`}
								>
									{productDetails.isFreeProduct ? (
										"Free"
									) : (
										<>
											<span className="text-sm">$</span>
											<span>{Math.floor(parseFloat(productDetails.price))}</span>
											<span className="text-sm">{(parseFloat(productDetails.price) % 1).toFixed(2).substring(1)}</span>
										</>
									)}
								</span>
							) : (
								<span className="text-base font-medium text-gray-900">
									{productDetails.isBackorder ? "Price TBD (Backorder)" : "Price TBD"}
								</span>
							)}
							{productDetails.hasDiscount && (
								<span className="text-xs font-medium text-red-600">
									Save {discountPercentage}% (
									{formatPrice(parseFloat(productDetails.compareAtPrice || "0") - parseFloat(productDetails.price))})
								</span>
							)}
						</div>
					</div>
				</Link>

				{/* Stock and Shipping Info */}
				<div className="mt-2 space-y-1">
					{/* Stock Status */}
					<div className="flex items-center gap-1.5">
						{productDetails.isAvailable ? (
							<>
								<div className="w-2 h-2 rounded-full bg-green-500"></div>
								<span className="text-xs text-gray-700">
									{productDetails.isBackorder ? "Available for Pre-Order" : "In Stock"}
								</span>
							</>
						) : (
							<>
								<div className="w-2 h-2 rounded-full bg-gray-300"></div>
								<span className="text-xs text-gray-500">Out of Stock</span>
							</>
						)}
					</div>

					{/* Shipping Info */}
					<p className="text-xs text-gray-500 flex items-center gap-1.5">
						<Truck className="h-3 w-3" />
						{productDetails.isBackorder ? `Ships ${formatDeliveryDate()}` : "Free Shipping"}
					</p>
				</div>

				{/* Recent Purchases */}
				{recentPurchases > 0 && (
					<div className="mt-2 pt-2 border-t border-gray-200">
						<p className="text-xs text-gray-500 flex items-center gap-1.5">
							<Users className="h-3 w-3" />
							{purchaseText}
						</p>
					</div>
				)}

				{/* Add to Cart Button */}
				<div className="mt-3">
					<Button
						variant="secondary"
						className="w-full h-9 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md"
						onClick={handleAddToCart}
						disabled={isAddingToCartState || !variantId || !canAddToCart}
					>
						<div className="flex items-center justify-center w-full">
							{isAddingToCartState ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									<span>Adding...</span>
								</>
							) : (
								<>
									{productDetails.isBackorder ? (
										<>
											<Clock className="h-4 w-4 mr-2" />
											<span>Pre-Order</span>
										</>
									) : !productDetails.hasValidPrice ? (
										<>
											<Info className="h-4 w-4 mr-2" />
											<span>Contact for Pricing</span>
										</>
									) : (
										<>
											<ShoppingCart className="h-4 w-4 mr-2" />
											<span>{productDetails.isFreeProduct ? "Claim Free" : "Add to Cart"}</span>
										</>
									)}
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
