"use client";

import { memo, useState, useCallback } from "react";
import { ProductCard } from "@/components/products/product-card";
import type { ShopifyProduct } from "@/lib/types";
import { ViewToggle } from "@/components/view-toggle";
import { cn } from "@/lib/utils";

interface ProductListProps {
	products: ShopifyProduct[];
	onRemoveFromWishlist?: (handle: string) => void;
	onAddToWishlist?: (handle: string) => void;
}

// Memoize individual product card to prevent unnecessary re-renders
const MemoizedProductCard = memo(ProductCard, (prevProps, nextProps) => {
	return prevProps.product.id === nextProps.product.id && prevProps.view === nextProps.view && prevProps.variantId === nextProps.variantId;
});
MemoizedProductCard.displayName = "MemoizedProductCard";

export function ProductList({ products, onRemoveFromWishlist, onAddToWishlist }: ProductListProps) {
	const [view, setView] = useState<"grid" | "list">("grid");

	const handleViewChange = useCallback((newView: "grid" | "list") => {
		setView(newView);
	}, []);

	if (!products?.length) {
		return null;
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-end">
				<ViewToggle view={view} onChange={handleViewChange} />
			</div>
			<div className={cn("gap-4", view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8" : "flex flex-col")} role="region" aria-label="Products List">
				{products.map((product) => (
					<div key={product.id} className={cn(view === "list" && "[&:not(:last-child)]:border-b [&:not(:last-child)]:border-neutral-200 [&:not(:last-child)]:dark:border-neutral-800", "pb-4")}>
						<MemoizedProductCard product={product} view={view} variantId={product.variants?.edges?.[0]?.node?.id} onRemoveFromWishlist={onRemoveFromWishlist} onAddToWishlist={onAddToWishlist} />
					</div>
				))}
			</div>
		</div>
	);
}
