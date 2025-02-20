"use client";

import React, { useState, useEffect } from "react";
import { ProductCard } from "@/components/products/product-card";
import type { ProductWithSource } from "./types";
import { cn } from "@/lib/utils";

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

interface RelatedSectionProps {
	title: string;
	description: string;
	products: ProductWithSource[];
	sectionId: string;
	currentProductId: string;
}

export function RelatedSection({ title, description, products, sectionId, currentProductId }: RelatedSectionProps) {
	if (products.length === 0) return null;

	const isMobile = useIsMobile();
	const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

	const handleAddToCart = async (productId: string) => {
		setLoadingStates((prev) => ({ ...prev, [productId]: true }));
		try {
			// Your add to cart logic here
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
			<div className={cn("flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800", "sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 sm:gap-4 sm:divide-y-0")} role="list" aria-label={`${title} products`}>
				{products.slice(0, 12).map(({ product }, index) => (
					<div key={`${sectionId}-${product.id}`} className="group relative">
						<meta itemProp="position" content={String(index + 1)} />
						<ProductCard product={product} view={isMobile ? "list" : "grid"} variantId={product.variants?.nodes?.[0]?.id} isAddingToCartProp={loadingStates[product.id]} onAddToCart={() => handleAddToCart(product.id)} />
					</div>
				))}
			</div>
		</div>
	);
}
