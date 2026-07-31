import { Package, Star, Truck, Users } from "lucide-react";
import Image from "next/image";
import { PrefetchLink } from "@/components/ui/prefetch-link";
import type { ShopifyProduct } from "@/lib/types";
import { cn, formatPrice, isIntentionallyFree } from "@/lib/utils";
import { getOpticalIconClasses } from "@/lib/utils/optical-alignment";
import { ProductCardActions } from "./product-card-actions";

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
	aiData?: {
		aiScore?: number;
		aiConfidence?: string;
		aiReasons?: string[];
		trend?: "rising" | "falling" | "stable";
		rank?: number;
	};
};

// Helper functions
const formatRecentPurchases = (count: number) => {
	if (!count || count === 0) return null;
	if (count >= 1000) return `${Math.floor(count / 1000)}k+ bought recently`;
	if (count >= 100) return `${Math.floor(count / 100) * 100}+ bought recently`;
	if (count >= 50) return "50+ bought recently";
	if (count >= 20) return "20+ bought recently";
	if (count > 0) return `${count} bought recently`;
	return null;
};

const StarRating = ({ rating, count }: { rating: number; count: number }) => {
	if (!(rating && count)) return null;
	const fullStars = Math.floor(rating);
	const hasHalfStar = rating % 1 >= 0.5;
	const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

	return (
		<div className="flex items-center gap-1.5">
			<div className="flex items-center gap-px">
				{[...new Array(fullStars)].map((_, i) => (
					<Star
						className={cn("h-3.5 w-3.5 fill-flush text-flush", getOpticalIconClasses("Star", "inline"))}
						key={`full-${i}`}
					/>
				))}
				{hasHalfStar && (
					<div className="relative h-3.5 w-3.5">
						<Star
							className={cn(
								"clip-path-[inset(0_50%_0_0)] absolute h-3.5 w-3.5 fill-flush text-flush",
								getOpticalIconClasses("Star", "inline")
							)}
						/>
						<Star className={cn("absolute h-3.5 w-3.5 text-flush/40", getOpticalIconClasses("Star", "inline"))} />
					</div>
				)}
				{[...new Array(emptyStars)].map((_, i) => (
					<Star
						className={cn("h-3.5 w-3.5 text-flush/30", getOpticalIconClasses("Star", "inline"))}
						key={`empty-${i}`}
					/>
				))}
			</div>
			<span className="font-mono text-muted-foreground text-xs tabular-nums">({count})</span>
		</div>
	);
};

const formatDeliveryDate = () => {
	const today = new Date();
	const deliveryDate = new Date(today);
	deliveryDate.setDate(today.getDate() + 5);
	return deliveryDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

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

const calculateDiscountPercentage = (compareAtPrice: string, price: string) => {
	if (!(compareAtPrice && price)) return 0;
	return Math.round(
		((Number.parseFloat(compareAtPrice) - Number.parseFloat(price)) / Number.parseFloat(compareAtPrice)) * 100
	);
};

// Server Component - renders static content
export function ProductCard({
	product,
	collectionHandle,
	view = "grid",
	variantId,
	quantity: quantityProp,
	onAddToCart,
	onRemoveFromWishlist,
	onAddToWishlist,
	priority = false,
	aiData,
}: ProductCardProps) {
	// Calculate product details on server
	const firstVariant = product.variants?.nodes?.[0];
	const price = firstVariant?.price?.amount || "0";
	const compareAtPrice = firstVariant?.compareAtPrice?.amount;
	const hasDiscount = compareAtPrice && Number.parseFloat(compareAtPrice) > Number.parseFloat(price);
	const discountPercentage = hasDiscount ? calculateDiscountPercentage(compareAtPrice, price) : 0;
	const firstImage = product.images?.nodes?.[0];

	const actualQuantity = quantityProp !== undefined ? quantityProp : (firstVariant?.quantityAvailable ?? 0);
	const isBackorder = !!firstVariant?.id && firstVariant.availableForSale === false && actualQuantity === 0;
	const isFreeProduct = isIntentionallyFree(product) || Number.parseFloat(price) === 0;
	const hasValidPrice = true;
	const isAvailable = firstVariant?.availableForSale ?? false;

	const canAddToCart = (isAvailable || isBackorder) && hasValidPrice;

	const productUrl = `/products/${product.handle}${collectionHandle ? `?collection=${collectionHandle}` : ""}${
		variantId ? `${collectionHandle ? "&" : "?"}variant=${variantId}` : ""
	}`;

	const { rating, ratingCount, recentPurchases } = getRatingData(product);
	const hasRating = rating > 0 && ratingCount > 0;
	const purchaseText = formatRecentPurchases(recentPurchases);

	// Extract product images for prefetching (limit to first 3)
	const productImages: string[] = [];
	if (product.images?.nodes && Array.isArray(product.images.nodes)) {
		product.images.nodes.forEach((img) => {
			if (img?.url) productImages.push(img.url);
		});
	}
	if (product.variants?.nodes) {
		product.variants.nodes.forEach((variant) => {
			if (variant.image?.url && !productImages.includes(variant.image.url)) {
				productImages.push(variant.image.url);
			}
		});
	}
	const prefetchImages = productImages.slice(0, 3);

	return (
		<div
			className={cn(
				"group relative h-full",
				view === "grid"
					? "flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors duration-300 hover:border-foreground/25"
					: "flex flex-row gap-3 border-border border-b py-3 last:border-b-0 sm:gap-4 sm:py-4"
			)}
			data-product-id={product.id}
			data-view={view}
		>
			{/* Product Image - Server Rendered */}
			<PrefetchLink
				className={cn("block shrink-0", view === "grid" ? "w-full" : "w-24 sm:w-28 md:w-32")}
				href={productUrl}
				prefetchImages={prefetchImages}
				prefetchPriority={priority ? "high" : "low"}
			>
				<div
					className={cn(
						"relative overflow-hidden bg-muted",
						view === "grid"
							? "aspect-square w-full border-border border-b"
							: "aspect-square h-24 w-24 rounded-md border border-border sm:h-28 sm:w-28 md:h-32 md:w-32"
					)}
				>
					{firstImage?.url ? (
						<Image
							alt={firstImage.altText || product.title}
							// The plate catches a little more light and pushes in on hover.
							className="object-cover brightness-[0.97] transition-[transform,filter] duration-500 ease-out group-hover:scale-[1.04] group-hover:brightness-100"
							fill
							loading={priority ? "eager" : "lazy"}
							priority={priority}
							sizes={
								view === "grid"
									? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
									: "96px"
							}
							src={firstImage.url}
						/>
					) : (
						<div className="absolute inset-0 flex items-center justify-center">
							<Package
								className={cn("h-8 w-8 text-muted-foreground/50", getOpticalIconClasses("Package", "standalone"))}
							/>
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

			{/* Product Info - Server Rendered */}
			<div
				className={cn(
					"flex flex-col",
					view === "grid" ? "mt-3 flex-1 px-3 pb-3 sm:mt-4 sm:px-4 sm:pb-4" : "min-w-0 flex-1 py-0.5 sm:py-1"
				)}
			>
				<PrefetchLink
					className="flex-1"
					href={productUrl}
					prefetchImages={prefetchImages}
					prefetchPriority={priority ? "high" : "low"}
				>
					{/* Vendor — set on the slate, same register as every other label */}
					<p className="slate mb-2 text-muted-foreground/70">{product.vendor || "Zugzology"}</p>

					{/* AI confidence - only in development */}
					{process.env.NODE_ENV === "development" && aiData && aiData.aiConfidence && aiData.aiConfidence !== "low" && (
						<div className="mb-1 text-primary text-xs">
							{aiData.aiConfidence} confidence
							{aiData.rank && ` • Rank #${aiData.rank}`}
						</div>
					)}

					{/* Title */}
					{/* Product names stay in the body face — the display face is for section headings. */}
					<h2
						className={cn(
							"mb-2 font-medium font-sans text-foreground leading-snug tracking-[-0.01em] transition-colors [font-variation-settings:normal] group-hover:text-primary sm:mb-3",
							view === "grid"
								? "line-clamp-2 min-h-[2.5rem] text-sm sm:min-h-[2.75rem] sm:text-[0.9375rem]"
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

					{/* Price — mono and tabular so figures line up down a column of cards */}
					<div className="mt-auto pt-3">
						{hasDiscount && (
							<div className="mb-1.5 flex items-center gap-2">
								<span className="font-mono text-muted-foreground text-xs tabular-nums line-through">
									{formatPrice(Number.parseFloat(compareAtPrice || "0"))}
								</span>
								<span className="slate text-flush">Save {discountPercentage}%</span>
							</div>
						)}
						<div className="flex items-baseline gap-2">
							{hasValidPrice ? (
								<span
									aria-label={`Price: ${formatPrice(Number.parseFloat(price))}`}
									className="font-medium font-mono text-[1.375rem] text-foreground tabular-nums leading-none"
								>
									{isFreeProduct ? (
										"Free"
									) : (
										<>
											<span className="mr-0.5 text-muted-foreground text-sm">$</span>
											<span>{Math.floor(Number.parseFloat(price))}</span>
											<span className="text-sm">{(Number.parseFloat(price) % 1).toFixed(2).substring(1)}</span>
										</>
									)}
								</span>
							) : (
								<span className="font-medium font-mono text-foreground text-lg">
									{isBackorder ? "Price TBD (Backorder)" : "Price TBD"}
								</span>
							)}
						</div>
					</div>
				</PrefetchLink>

				{/* Stock and shipping — a status readout, so it runs on the slate */}
				<div className="mt-3 space-y-1.5 border-border/60 border-t pt-3">
					<div className="flex items-center gap-2">
						{isAvailable ? (
							<>
								<span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_hsl(var(--success)/0.6)]" />
								<span className="slate text-muted-foreground">{isBackorder ? "Pre-order" : "In stock"}</span>
							</>
						) : (
							<>
								<span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
								<span className="slate text-muted-foreground/60">Out of stock</span>
							</>
						)}
					</div>

					<p className="flex items-center gap-1.5 text-muted-foreground text-xs">
						<Truck className={cn("h-3 w-3", getOpticalIconClasses("Truck", "inline"))} />
						{isBackorder ? `Ships ${formatDeliveryDate()}` : "Free shipping"}
					</p>
				</div>

				{/* Recent purchases */}
				{recentPurchases > 0 && (
					<div className="mt-3">
						<div className="inline-flex items-center gap-1.5 rounded-sm border border-flush/25 bg-flush/10 px-2 py-1">
							<Users className={cn("h-3 w-3 text-flush", getOpticalIconClasses("Users", "inline"))} />
							<span className="slate text-flush">{purchaseText}</span>
						</div>
					</div>
				)}

				{/* Client Component for interactions */}
				<ProductCardActions
					canAddToCart={canAddToCart}
					hasValidPrice={hasValidPrice}
					isBackorder={isBackorder}
					isFreeProduct={isFreeProduct}
					onAddToCart={onAddToCart}
					onAddToWishlist={onAddToWishlist}
					onRemoveFromWishlist={onRemoveFromWishlist}
					productHandle={product.handle}
					productId={product.id}
					variantId={variantId}
					view={view}
				/>
			</div>
		</div>
	);
}
