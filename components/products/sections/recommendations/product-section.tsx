import React from "react";
import { ProductCard } from "@/components/products/product-card";
import type { ProductWithSource } from "./types";

interface ProductSectionProps {
	title: string;
	description: string;
	products: ProductWithSource[];
	sectionId: string;
	currentProductId: string;
}

export function ProductSection({ title, description, products, sectionId, currentProductId }: ProductSectionProps) {
	if (products.length === 0) return null;

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
			isAvailable: isAnyVariantAvailable || firstVariant?.availableForSale,
		};
	};

	return (
		<div className="mb-16 last:mb-0" id={sectionId}>
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
				<p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
			</div>
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" role="list" aria-label={`${title} products`}>
				{products.slice(0, 12).map(({ product, source }, index) => {
					const stockInfo = getStockInfo(product);
					return (
						<div key={`${sectionId}-${product.id}`} role="listitem" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
							<meta itemProp="position" content={String(index + 1)} />
							<ProductCard product={product} view="grid" variantId={stockInfo.variantId} quantity={stockInfo.quantity} isAvailable={stockInfo.isAvailable} source={source} sectionId={sectionId} />
						</div>
					);
				})}
			</div>
		</div>
	);
}
