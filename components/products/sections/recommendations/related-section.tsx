import React from "react";
import { ProductCard } from "./product-card";
import type { ProductWithSource } from "./types";

interface RelatedSectionProps {
	title: string;
	description: string;
	products: ProductWithSource[];
	sectionId: string;
	currentProductId: string;
}

export function RelatedSection({ title, description, products, sectionId, currentProductId }: RelatedSectionProps) {
	if (products.length === 0) return null;

	return (
		<div className="mb-16 last:mb-0" id={sectionId}>
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
				<p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
			</div>
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" role="list" aria-label={`${title} products`}>
				{products.slice(0, 12).map(({ product, source }, index) => (
					<div key={`${sectionId}-${product.id}`} role="listitem" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
						<meta itemProp="position" content={String(index + 1)} />
						<ProductCard product={product} source={source} sectionId={sectionId} currentProductId={currentProductId} />
					</div>
				))}
			</div>
		</div>
	);
}
