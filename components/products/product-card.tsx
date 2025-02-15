"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, cn } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/types";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Clock, Sparkles, TrendingUp, Star, ShoppingBag, Zap, ArrowRight, ShoppingCart, Loader2 } from "lucide-react";
import { useSearch } from "@/lib/providers/search-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/providers/cart-provider";
import { toast } from "sonner";
import { useState } from "react";

interface ProductCardProps {
	product: ShopifyProduct;
	collectionHandle?: string;
	view?: "grid" | "list";
	variantId?: string;
	quantity?: number;
	source?: "history" | "recommended" | "trending" | "popular" | "complementary" | "related";
	sectionId?: string;
	isAvailable?: boolean;
}

export function ProductCard({ product, collectionHandle, view = "grid", variantId, quantity = 0, source, sectionId, isAvailable: propIsAvailable }: ProductCardProps) {
	const router = useRouter();
	const { setSearchQuery } = useSearch();
	const { createNewCart } = useCart();
	const [isBuyingNow, setIsBuyingNow] = useState(false);
	const firstImage = product.images?.edges?.[0]?.node;
	const firstVariant = product.variants?.edges?.[0]?.node;
	const price = product.priceRange?.minVariantPrice?.amount || "0";
	const productUrl = `/products/${product.handle}`;
	const actualVariantId = variantId || firstVariant?.id;

	// Updated variant check to be more precise
	const hasVariants = product.variants?.edges?.length > 1 || product.options?.some((option) => option?.name !== "Title" && option?.values?.length > 0);

	// Use provided availability or fall back to variant check
	const isAvailable = propIsAvailable ?? firstVariant?.availableForSale ?? false;

	const handleNavigate = () => {
		setSearchQuery("");
	};

	const handleBuyNow = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (hasVariants) {
			// If product has variants, redirect to product page
			router.push(productUrl);
			return;
		}

		if (!actualVariantId) {
			toast.error("Please select a product variant");
			return;
		}

		setIsBuyingNow(true);
		try {
			const merchandiseId = actualVariantId.includes("gid://shopify/ProductVariant/") ? actualVariantId : `gid://shopify/ProductVariant/${actualVariantId}`;

			const cart = await createNewCart([
				{
					merchandiseId,
					quantity: 1,
					isPreOrder: !isAvailable,
				},
			]);

			if (cart?.checkoutUrl) {
				window.location.assign(cart.checkoutUrl);
			} else {
				throw new Error("No checkout URL available");
			}
		} catch (error) {
			console.error("Error in handleBuyNow:", error);
			toast.error("Failed to proceed to checkout");
		} finally {
			setIsBuyingNow(false);
		}
	};

	const ImageContainer = ({ children, isListView = false }: { children: React.ReactNode; isListView?: boolean }) => (
		<div className={cn("relative bg-neutral-100 dark:bg-neutral-800 rounded-md overflow-hidden border border-foreground/10 hover:border-foreground/20 transition-colors duration-200", isListView ? "w-[200px] h-[200px] flex-shrink-0" : "aspect-square w-full")}>
			{product.isGiftCard && (
				<Badge variant="secondary" className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-600 z-10 text-xs font-semibold">
					Digital Item
				</Badge>
			)}
			{source && (
				<div className="absolute top-2 left-2">
					{source === "history" && (
						<Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs">
							<Clock className="w-3 h-3 mr-1" />
							Recent
						</Badge>
					)}
					{source === "recommended" && (
						<Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 text-xs">
							<Sparkles className="w-3 h-3 mr-1" />
							For You
						</Badge>
					)}
					{source === "trending" && (
						<Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
							<TrendingUp className="w-3 h-3 mr-1" />
							Trending
						</Badge>
					)}
					{source === "popular" && (
						<Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 text-xs">
							<Star className="w-3 h-3 mr-1" />
							Popular
						</Badge>
					)}
					{source === "complementary" && (
						<Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100 text-xs">
							<ShoppingBag className="w-3 h-3 mr-1" />
							Pair With
						</Badge>
					)}
					{source === "related" && (
						<Badge variant="secondary" className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100 text-xs">
							<Zap className="w-3 h-3 mr-1" />
							Similar
						</Badge>
					)}
				</div>
			)}
			<div className="w-full h-full rounded-md overflow-hidden">{children}</div>
		</div>
	);

	const ProductImage = ({ isListView = false }: { isListView?: boolean }) =>
		firstImage ? (
			<Image src={firstImage.url} alt={firstImage.altText || product.title} fill className="object-cover hover:scale-105 transition-transform duration-300 rounded-md" sizes={isListView ? "200px" : "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"} priority={view === "grid"} />
		) : (
			<div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 rounded-md">
				<p className="text-sm text-neutral-500 dark:text-neutral-400">No image</p>
			</div>
		);

	const ProductInfo = ({ isListView = false }: { isListView?: boolean }) => {
		const TitleComponent = (
			<div className={cn("flex flex-col", isListView && "min-h-0")}>
				<h2 className={cn("font-medium text-base line-clamp-1", "hover:text-primary transition-colors")}>{product.title}</h2>
				<div className="flex-1" />
			</div>
		);

		// Get the compare at price from the product's price range
		const compareAtPrice = product.priceRange?.maxVariantPrice?.amount;
		const isOnSale = compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price);
		const discountPercentage = isOnSale ? Math.round((1 - parseFloat(price) / parseFloat(compareAtPrice)) * 100) : 0;

		return (
			<div className={cn("flex flex-col", isListView ? "ml-4 flex-grow" : "mt-4 flex-1 justify-between")}>
				<TooltipProvider>
					<Tooltip delayDuration={300}>
						<TooltipTrigger asChild>{TitleComponent}</TooltipTrigger>
						<TooltipContent side="top" className="max-w-[300px]">
							<p className="text-sm">{product.title}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<div className="mt-2 flex items-center gap-2">
					<div className="flex items-center gap-2">
						<span className={cn("text-xl font-bold", isOnSale && "text-red-600 dark:text-red-500")}>{formatPrice(parseFloat(price))}</span>
						{isOnSale && <span className="text-sm text-muted-foreground line-through">{formatPrice(parseFloat(compareAtPrice))}</span>}
					</div>
					{isOnSale && (
						<Badge variant="destructive" className="text-xs font-semibold">
							{discountPercentage}% OFF
						</Badge>
					)}
				</div>
				<div className="mt-2 space-y-1 text-sm">
					{product.isGiftCard ? (
						<p className="text-blue-600 dark:text-blue-500 font-medium">Digital Gift Card - Instant Delivery</p>
					) : (
						<>
							<div className="flex flex-col gap-1">
								{isAvailable ? (
									<p className="text-green-600 dark:text-green-500 font-medium">{quantity > 0 ? `${quantity} in stock` : "In stock"}</p>
								) : (
									<p className="text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1">
										<Clock className="h-4 w-4" />
										Pre-order
									</p>
								)}
								<p className="text-green-600 dark:text-green-500">FREE Shipping</p>
							</div>
						</>
					)}
				</div>
				<div className="mt-3 space-y-2">
					<AddToCartButton className={cn("w-full bg-secondary hover:bg-secondary/80 text-foreground border border-foreground/10 hover:border-foreground/20 shadow-none", isListView && "max-w-[200px]")} variantId={actualVariantId} availableForSale={isAvailable} quantity={quantity} hasVariants={hasVariants} productHandle={product.handle} />
					<Button variant="default" className={cn("w-full flex items-center justify-center", isListView && "max-w-[200px]")} onClick={handleBuyNow} disabled={isBuyingNow}>
						{isBuyingNow ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Processing...
							</>
						) : (
							<>
								Buy Now
								<ArrowRight className="ml-2 h-4 w-4" />
							</>
						)}
					</Button>
				</div>
				{isListView && <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">{product.description}</p>}
			</div>
		);
	};

	const CardContainer = ({ children }: { children: React.ReactNode }) => <div className="group py-4 block">{children}</div>;

	return view === "grid" ? (
		<CardContainer>
			<Link href={productUrl} prefetch={true} onClick={handleNavigate}>
				<ImageContainer>
					<ProductImage />
				</ImageContainer>
			</Link>
			<ProductInfo />
		</CardContainer>
	) : (
		<CardContainer>
			<div className="flex">
				<Link href={productUrl} prefetch={true} onClick={handleNavigate}>
					<ImageContainer isListView>
						<ProductImage isListView />
					</ImageContainer>
				</Link>
				<ProductInfo isListView />
			</div>
		</CardContainer>
	);
}
