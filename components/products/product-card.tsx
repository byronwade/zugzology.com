"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, cn } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/types";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useSearch } from "@/lib/providers/search-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductCardProps {
	product: ShopifyProduct;
	collectionHandle?: string;
	view?: "grid" | "list";
	variantId?: string;
	availableForSale?: boolean;
	quantity?: number;
}

export function ProductCard({ product, collectionHandle, view = "grid", variantId, availableForSale = false, quantity = 0 }: ProductCardProps) {
	const { setSearchQuery } = useSearch();
	const firstImage = product.images?.edges?.[0]?.node;
	const price = product.priceRange?.minVariantPrice?.amount || "0";
	const productUrl = `/products/${product.handle}`;
	const firstVariant = product.variants?.edges?.[0]?.node;
	const actualVariantId = variantId || firstVariant?.id;
	const actualQuantity = quantity || firstVariant?.quantityAvailable || 0;
	const isPreOrder = actualQuantity <= 0;

	// Updated variant check to be more precise
	const hasVariants = product.variants?.edges?.length > 1 || product.options?.some((option) => option?.values?.length > 1 || (option?.name !== "Title" && option?.values?.length > 0));

	const handleNavigate = () => {
		setSearchQuery("");
	};

	const ImageContainer = ({ children, isListView = false }: { children: React.ReactNode; isListView?: boolean }) => (
		<div className={cn("relative bg-neutral-100 dark:bg-neutral-800 rounded-md overflow-hidden", isListView ? "w-[200px] h-[200px] flex-shrink-0" : "aspect-square w-full")}>
			{isPreOrder && (
				<Badge variant="secondary" className="absolute top-2 right-2 bg-amber-600 hover:bg-amber-600 z-10">
					Pre-Order
				</Badge>
			)}
			{children}
		</div>
	);

	const ProductImage = ({ isListView = false }: { isListView?: boolean }) =>
		firstImage ? (
			<Image src={firstImage.url} alt={firstImage.altText || product.title} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes={isListView ? "200px" : "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"} priority={view === "grid"} />
		) : (
			<div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-700">
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
						<Badge variant="destructive" className="text-xs">
							{discountPercentage}% OFF
						</Badge>
					)}
				</div>
				<div className="mt-2 space-y-1 text-sm">
					<p className="text-neutral-600 dark:text-neutral-300">FREE delivery</p>
					{isPreOrder ? (
						<p className="text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1">
							<Clock className="h-4 w-4" />
							Ships in 2-3 weeks
						</p>
					) : (
						<p className="text-green-600 dark:text-green-500 font-medium">{actualQuantity} in stock</p>
					)}
				</div>
				{actualVariantId && <AddToCartButton className={cn("mt-3", isListView && "max-w-[200px]")} variantId={actualVariantId} availableForSale={!isPreOrder} quantity={actualQuantity} hasVariants={hasVariants} productHandle={product.handle} />}
				{isListView && <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">{product.description}</p>}
			</div>
		);
	};

	return view === "grid" ? (
		<Link href={productUrl} prefetch={true} className="group py-4 block" onClick={handleNavigate}>
			<ImageContainer>
				<ProductImage />
			</ImageContainer>
			<ProductInfo />
		</Link>
	) : (
		<Link href={productUrl} prefetch={true} className="flex group py-4" onClick={handleNavigate}>
			<ImageContainer isListView>
				<ProductImage isListView />
			</ImageContainer>
			<ProductInfo isListView />
		</Link>
	);
}
