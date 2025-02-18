"use client";

import { memo, useState } from "react";
import { ProductCard } from "@/components/products/product-card";
import type { ShopifyProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useViewport } from "@/lib/hooks/use-viewport";

interface ProductListProps {
	products: ShopifyProduct[];
	onRemoveFromWishlist?: (handle: string) => void;
	onAddToWishlist?: (handle: string) => void;
}

// Memoize individual product card to prevent unnecessary re-renders
const MemoizedProductCard = memo(ProductCard, (prevProps, nextProps) => {
	return prevProps.product.id === nextProps.product.id && prevProps.variantId === nextProps.variantId;
});
MemoizedProductCard.displayName = "MemoizedProductCard";

export function ProductList({ products, onRemoveFromWishlist, onAddToWishlist }: ProductListProps) {
	const { isMobile } = useViewport();
	const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

	if (!products?.length) {
		return null;
	}

	const handleAddToCart = async (productId: string) => {
		setLoadingStates((prev) => ({ ...prev, [productId]: true }));
		try {
			// Your add to cart logic here
		} finally {
			setLoadingStates((prev) => ({ ...prev, [productId]: false }));
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 sm:gap-4" role="region" aria-label="Products List">
				{products.map((product) => (
					<div key={product.id} className={cn("group relative", isMobile && "p-4 first:pt-0 border-b border-neutral-200 dark:border-neutral-800 last:border-0")}>
						<MemoizedProductCard product={product} view={isMobile ? "list" : "grid"} variantId={product.variants?.nodes?.[0]?.id} onRemoveFromWishlist={onRemoveFromWishlist} onAddToWishlist={onAddToWishlist} isAddingToCartProp={loadingStates[product.id]} onAddToCart={() => handleAddToCart(product.id)} />
					</div>
				))}
			</div>
		</div>
	);
}
