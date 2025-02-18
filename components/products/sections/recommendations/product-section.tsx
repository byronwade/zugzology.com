"use client";

import React, { useState, useEffect } from "react";
import { ProductCard } from "@/components/products/product-card";
import type { ProductWithSource } from "./types";
import { type ShopifyProduct, type ShopifyProductVariant } from "@/lib/types";

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

interface ProductSectionProps {
	title: string;
	description: string;
	products: ProductWithSource[];
	sectionId: string;
	currentProductId: string;
	onAddToCart?: () => void;
}

export function ProductSection({ title, description, products, sectionId, currentProductId, onAddToCart }: ProductSectionProps) {
	if (products.length === 0) return null;

	const isMobile = useIsMobile();
	const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
	const maxItems = isMobile ? 4 : 12;

	// Helper function to get accurate stock information
	const getStockInfo = (product: ShopifyProduct) => {
		// Check all variants for stock
		const variants = product.variants?.nodes || [];
		let totalQuantity = 0;
		let isAnyVariantAvailable = false;

		variants.forEach((variant: ShopifyProductVariant) => {
			if (variant.availableForSale) {
				isAnyVariantAvailable = true;
			}
			if (typeof variant.quantityAvailable === "number") {
				totalQuantity += variant.quantityAvailable;
			}
		});

		// Get the first variant as default
		const firstVariant = variants[0];

		return {
			variantId: firstVariant?.id,
			quantity: totalQuantity,
		};
	};

	const handleAddToCart = async (productId: string) => {
		setLoadingStates((prev) => ({ ...prev, [productId]: true }));
		try {
			const product = products.find((p) => p.product.id === productId)?.product;
			if (!product) {
				throw new Error("Product not found");
			}
			const stockInfo = getStockInfo(product);
			if (!stockInfo.variantId) {
				throw new Error("No variant available");
			}
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
				<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
				<p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
			</div>
			<div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 sm:gap-4 sm:divide-y-0" role="list" aria-label={`${title} products`}>
				{products.slice(0, maxItems).map(({ product }, index) => {
					const stockInfo = getStockInfo(product);
					return (
						<div key={`${sectionId}-${product.id}`} role="listitem" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="group relative flex flex-col sm:block first:pt-0 sm:first:pt-0 pt-4 sm:pt-0">
							<meta itemProp="position" content={String(index + 1)} />
							<div className="relative aspect-square w-full overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 group-hover:border-neutral-300 dark:group-hover:border-neutral-700 transition-colors">
								<ProductCard product={product} view={isMobile ? "list" : "grid"} variantId={stockInfo.variantId} quantity={stockInfo.quantity} isAddingToCartProp={loadingStates[product.id]} onAddToCart={() => handleAddToCart(product.id)} />
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
