"use client";

import { memo } from "react";
import { ProductCard } from "@/components/products/product-card";
import type { ShopifyProduct } from "@/lib/types";

interface ProductListProps {
	products: ShopifyProduct[];
	view?: "grid" | "list";
}

// Memoize individual product card to prevent unnecessary re-renders
const MemoizedProductCard = memo(ProductCard);

export function ProductList({ products, view = "grid" }: ProductListProps) {
	if (!products?.length) {
		return null;
	}

	return (
		<div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4" : "flex-1 divide-y divide-neutral-200 dark:divide-neutral-800"} role="region" aria-label={`Products ${view === "grid" ? "Grid" : "List"}`}>
			{products.map((product) => (
				<MemoizedProductCard key={product.id} product={product} view={view} variantId={product.variants?.edges?.[0]?.node?.id} quantity={product.variants?.edges?.[0]?.node?.quantityAvailable} />
			))}
		</div>
	);
}
