"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/features/products/product-card";
import type { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { ProductWithSource } from "./types";

// Custom hook for mobile detection
const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => {
			window.removeEventListener("resize", checkMobile);
		};
	}, []);

	return isMobile;
};

type ProductSectionProps = {
	title: string;
	description: string;
	products: ProductWithSource[];
	sectionId: string;
	currentProductId: string;
	onAddToCart?: () => void;
};

export function ProductSection({
	title,
	description,
	products,
	sectionId,
	currentProductId,
	onAddToCart,
}: ProductSectionProps) {
	const isMobile = useIsMobile();
	const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
	const maxItems = isMobile ? 4 : 12;

	if (products.length === 0) {
		return null;
	}

	// Helper function to get accurate stock information
	const getStockInfo = (product: ShopifyProduct) => {
		// Check all variants for stock
		const variants = product.variants?.nodes || [];
		let totalQuantity = 0;
		let isAnyVariantAvailable = false;
		let firstVariantId: string | null = null;

		variants.forEach((variant: ShopifyProductVariant) => {
			if (variant.availableForSale) {
				isAnyVariantAvailable = true;
			}
			if (typeof variant.quantityAvailable === "number") {
				totalQuantity += variant.quantityAvailable;
			}
			// Store the first variant ID
			if (!firstVariantId && variant.id) {
				firstVariantId = variant.id;
			}
		});

		// Get the first variant as default
		const firstVariant = variants[0];

		return {
			variantId: firstVariantId || firstVariant?.id,
			quantity: totalQuantity,
			isAvailable: isAnyVariantAvailable,
		};
	};

	const handleAddToCart = async (productId: string) => {
		setLoadingStates((prev) => ({ ...prev, [productId]: true }));
		try {
			if (onAddToCart) {
				onAddToCart();
			}
		} finally {
			setLoadingStates((prev) => ({ ...prev, [productId]: false }));
		}
	};

	return (
		<div className="mb-16 last:mb-0" id={sectionId}>
			<div className="mb-8">
				<h2 className="font-bold text-2xl text-neutral-900 dark:text-neutral-100">{title}</h2>
				<p className="mt-2 text-neutral-600 text-sm dark:text-neutral-400">{description}</p>
			</div>
			<div
				aria-label={`${title} products`}
				className={cn(
					"flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800",
					"sm:grid sm:grid-cols-2 sm:gap-4 sm:divide-y-0 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
				)}
				role="list"
			>
				{products.slice(0, maxItems).map(({ product }, index) => {
					const stockInfo = getStockInfo(product);
					return (
						<div
							className="group relative"
							itemProp="itemListElement"
							itemScope
							itemType="https://schema.org/ListItem"
							key={`${sectionId}-${product.id}`}
							role="listitem"
						>
							<meta content={String(index + 1)} itemProp="position" />
							<ProductCard
								isAddingToCartProp={loadingStates[product.id]}
								onAddToCart={() => handleAddToCart(product.id)}
								product={product}
								quantity={stockInfo.quantity}
								variantId={stockInfo.variantId}
								view={isMobile ? "list" : "grid"}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
