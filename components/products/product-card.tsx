"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface ProductCardProps {
	product: ShopifyProduct;
	collectionHandle?: string;
	view?: "grid" | "list";
	variantId?: string;
	availableForSale?: boolean;
	quantity?: number;
}

export function ProductCard({ product, collectionHandle, view = "grid", variantId, availableForSale = false, quantity = 0 }: ProductCardProps) {
	const router = useRouter();
	const firstImage = product.images?.edges?.[0]?.node;
	const price = product.priceRange?.minVariantPrice?.amount || "0";
	const productUrl = `/products/${product.handle}`;
	const firstVariant = product.variants?.edges?.[0]?.node;
	const actualVariantId = variantId || firstVariant?.id;
	const actualQuantity = quantity || firstVariant?.quantityAvailable || 0;
	const isPreOrder = actualQuantity <= 0;

	// Check for both multiple variants and option types
	const hasVariants = product.variants?.edges?.length > 1 || product.options?.length > 1 || (product.options?.length === 1 && product.options[0]?.values?.length > 1);

	const handleClick = (e: React.MouseEvent) => {
		// If the click is on the button or its children, prevent navigation
		if ((e.target as HTMLElement).closest("button")) {
			e.preventDefault();
			return;
		}

		e.preventDefault();
		router.push(productUrl);
	};

	const ImageContainer = ({ children, isListView = false }: { children: React.ReactNode; isListView?: boolean }) => (
		<div className={cn("relative bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center rounded-md overflow-hidden", isListView ? "w-[200px] h-[200px] flex-shrink-0" : "aspect-[4/3] w-full")}>
			{isPreOrder && (
				<Badge variant="secondary" className="absolute top-2 right-2 bg-amber-600 hover:bg-amber-600">
					Pre-Order
				</Badge>
			)}
			{children}
		</div>
	);

	const ProductImage = ({ isListView = false }: { isListView?: boolean }) =>
		firstImage ? (
			<Image src={firstImage.url} alt={firstImage.altText || product.title} fill className="object-contain" sizes={isListView ? "200px" : "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"} priority={view === "grid"} />
		) : (
			<div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-700">
				<p className="text-sm text-neutral-500 dark:text-neutral-400">No image</p>
			</div>
		);

	const ProductInfo = ({ isListView = false }: { isListView?: boolean }) => (
		<div className={cn("flex flex-col", isListView ? "ml-4 flex-grow" : "mt-4 flex-1 justify-between")}>
			<h2 className="font-medium text-base line-clamp-2">{product.title}</h2>
			<div className="mt-2">
				<span className="text-xl font-bold">{formatPrice(parseFloat(price))}</span>
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

	return view === "grid" ? (
		<div className="group p-4 cursor-pointer" onClick={handleClick}>
			<ImageContainer>
				<ProductImage />
			</ImageContainer>
			<ProductInfo />
		</div>
	) : (
		<div className="flex group p-4 cursor-pointer" onClick={handleClick}>
			<ImageContainer isListView>
				<ProductImage isListView />
			</ImageContainer>
			<ProductInfo isListView />
		</div>
	);
}
