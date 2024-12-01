"use client";

import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/types";

interface ProductListProps {
	products: ShopifyProduct[];
	view?: "grid" | "list";
	className?: string;
}

export function ProductList({ products, view = "grid", className }: ProductListProps) {
	if (!products?.length) {
		return (
			<div className="w-full py-12 text-center" role="alert" aria-live="polite">
				<p className="text-muted-foreground">No products found.</p>
			</div>
		);
	}

	const renderProduct = (product: ShopifyProduct) => {
		const firstVariant = product.variants?.edges?.[0]?.node;

		// If there's no variant data, log a warning and skip rendering
		if (!firstVariant) {
			console.warn("Product has no variants:", product.title);
			return null;
		}

		const variantId = firstVariant.id;
		const quantity = firstVariant.quantityAvailable || 0;
		const isAvailable = quantity > 0;

		if (!variantId) {
			console.warn("Variant has no ID:", product.title);
			return null;
		}

		return <ProductCard key={product.id} product={product} view={view} variantId={variantId} availableForSale={isAvailable} quantity={quantity} />;
	};

	if (view === "list") {
		return (
			<div className="flex-1 divide-y divide-neutral-200 dark:divide-neutral-800" role="region" aria-label="Products List">
				{products.map((product) => (
					<div key={product.id} className="relative">
						{renderProduct(product)}
					</div>
				))}
			</div>
		);
	}

	return (
		<div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)} role="region" aria-label="Products Grid">
			{products.map((product) => (
				<div key={product.id} className="relative bg-background rounded-lg">
					{renderProduct(product)}
				</div>
			))}
		</div>
	);
}
