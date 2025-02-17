"use client";

import React, { useState, useEffect } from "react";
import { ProductCard } from "@/components/products/product-card";
import type { ProductWithSource } from "./types";

// Custom hook for mobile detection
function useIsMobile() {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 640);
		};

		// Initial check
		checkMobile();

		// Add event listener
		window.addEventListener("resize", checkMobile);

		// Cleanup
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return isMobile;
}

interface ProductSectionProps {
	title: string;
	description: string;
	products: ProductWithSource[];
	sectionId: string;
	currentProductId: string;
}

export function ProductSection({ title, description, products, sectionId, currentProductId }: ProductSectionProps) {
	if (products.length === 0) return null;

	const isMobile = useIsMobile();
	const maxItems = isMobile ? 4 : 12;

	// Helper function to get accurate stock information
	const getStockInfo = (product: any) => {
		// Check all variants for stock
		const variants = product.variants?.edges || [];
		let totalQuantity = 0;
		let isAnyVariantAvailable = false;

		variants.forEach(({ node }: any) => {
			if (node.availableForSale) {
				isAnyVariantAvailable = true;
			}
			if (typeof node.quantityAvailable === "number") {
				totalQuantity += node.quantityAvailable;
			}
		});

		// Get the first variant as default
		const firstVariant = variants[0]?.node;

		return {
			variantId: firstVariant?.id,
			quantity: totalQuantity,
		};
	};

	return (
		<div className="mb-16 last:mb-0" id={sectionId}>
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
				<p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
			</div>
			<div className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8 gap-4 flex-1 divide-y divide-neutral-200 dark:divide-neutral-800 sm:divide-y-0" role="list" aria-label={`${title} products`}>
				{products.slice(0, maxItems).map(({ product }, index) => {
					const stockInfo = getStockInfo(product);
					return (
						<div key={`${sectionId}-${product.id}`} role="listitem" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
							<meta itemProp="position" content={String(index + 1)} />
							<ProductCard product={product} view={isMobile ? "list" : "grid"} variantId={stockInfo.variantId} quantity={stockInfo.quantity} />
						</div>
					);
				})}
			</div>
		</div>
	);
}
