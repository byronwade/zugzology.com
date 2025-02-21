"use client";

import { memo, useState, useEffect, useRef, useCallback, useMemo, useTransition } from "react";
import { ProductCard } from "@/components/products/product-card";
import type { ShopifyProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useViewport } from "@/lib/hooks/use-viewport";

interface ProductListProps {
	products: ShopifyProduct[];
	onRemoveFromWishlist?: (handle: string) => void;
	onAddToWishlist?: (handle: string) => void;
	title?: string;
	description?: string;
}

// Memoize individual product card to prevent unnecessary re-renders
const MemoizedProductCard = memo(ProductCard, (prevProps, nextProps) => {
	return prevProps.product.id === nextProps.product.id && prevProps.view === nextProps.view && prevProps.quantity === nextProps.quantity && prevProps.isAddingToCartProp === nextProps.isAddingToCartProp;
});
MemoizedProductCard.displayName = "MemoizedProductCard";

// Memoized stock info calculator
const useStockInfo = (product: ShopifyProduct) => {
	return useMemo(() => {
		const variants = product.variants?.nodes || [];
		let totalQuantity = 0;

		variants.forEach((variant) => {
			if (typeof variant.quantityAvailable === "number") {
				totalQuantity += variant.quantityAvailable;
			}
		});

		return {
			variantId: variants[0]?.id,
			quantity: totalQuantity,
		};
	}, [product.variants?.nodes]);
};

// Memoized product grid component
const ProductGrid = memo(function ProductGrid({ products, view, onRemoveFromWishlist, onAddToWishlist, onAddToCart, isLoading }: { products: ShopifyProduct[]; view: "grid" | "list"; onRemoveFromWishlist?: (handle: string) => void; onAddToWishlist?: (handle: string) => void; onAddToCart: (id: string) => void; isLoading: boolean }) {
	return (
		<div className={cn("flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800", view === "list" ? "divide-y divide-neutral-200 dark:divide-neutral-800" : "", "sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 sm:gap-4 sm:divide-y-0")} role="region" aria-label="Products List" data-view={view}>
			{products.map((product, index) => {
				const stockInfo = useStockInfo(product);
				return (
					<div key={product.id} className="group relative" role="listitem" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
						<meta itemProp="position" content={String(index + 1)} />
						<MemoizedProductCard product={product} view={view} variantId={stockInfo.variantId} quantity={stockInfo.quantity} onRemoveFromWishlist={onRemoveFromWishlist} onAddToWishlist={onAddToWishlist} isAddingToCartProp={isLoading} onAddToCart={() => onAddToCart(product.id)} />
					</div>
				);
			})}
		</div>
	);
});

export function ProductList({ products, onRemoveFromWishlist, onAddToWishlist, title, description }: ProductListProps) {
	const { isMobile } = useViewport();
	const [visibleProducts, setVisibleProducts] = useState<ShopifyProduct[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isPreloading, setIsPreloading] = useState(false);
	const [isPending, startTransition] = useTransition();
	const loadMoreRef = useRef<HTMLDivElement>(null);
	const preloadRef = useRef<HTMLDivElement>(null);
	const batchQueue = useRef<ShopifyProduct[][]>([]);
	const initialLoadCount = 24;
	const loadMoreCount = 24;
	const preloadThreshold = 0.5;

	// Initialize with first batch of products
	useEffect(() => {
		const initialBatch = products.slice(0, initialLoadCount);
		setVisibleProducts(initialBatch);

		// Pre-calculate next batches
		const remainingProducts = products.slice(initialLoadCount);
		batchQueue.current = Array.from({ length: Math.ceil(remainingProducts.length / loadMoreCount) }, (_, i) => remainingProducts.slice(i * loadMoreCount, (i + 1) * loadMoreCount));
	}, [products, initialLoadCount, loadMoreCount]);

	// Preload next batch of products
	const preloadNextBatch = useCallback(() => {
		if (isPreloading || isLoading || visibleProducts.length >= products.length) return;

		setIsPreloading(true);
		const nextBatch = batchQueue.current[0];

		if (nextBatch) {
			startTransition(() => {
				setVisibleProducts((prev) => [...prev, ...nextBatch]);
				batchQueue.current = batchQueue.current.slice(1);
				setIsPreloading(false);
			});
		}
	}, [isPreloading, isLoading, products.length, visibleProducts.length]);

	// Main load more handler
	const handleLoadMore = useCallback(() => {
		if (isLoading || visibleProducts.length >= products.length) return;

		setIsLoading(true);
		const nextBatch = batchQueue.current[0];

		if (nextBatch) {
			startTransition(() => {
				setVisibleProducts((prev) => [...prev, ...nextBatch]);
				batchQueue.current = batchQueue.current.slice(1);
				setIsLoading(false);
			});
		}
	}, [isLoading, products.length, visibleProducts.length]);

	// Optimized add to cart handler
	const handleAddToCart = useCallback(async (productId: string) => {
		setIsLoading(true);
		try {
			// Your add to cart logic here
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Set up Intersection Observers
	useEffect(() => {
		const loadMoreObserver = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isPending) {
					handleLoadMore();
				}
			},
			{ threshold: 0.1 }
		);

		const preloadObserver = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isPending) {
					preloadNextBatch();
				}
			},
			{
				rootMargin: "50% 0px",
				threshold: preloadThreshold,
			}
		);

		if (loadMoreRef.current) {
			loadMoreObserver.observe(loadMoreRef.current);
		}

		if (preloadRef.current) {
			preloadObserver.observe(preloadRef.current);
		}

		return () => {
			loadMoreObserver.disconnect();
			preloadObserver.disconnect();
		};
	}, [handleLoadMore, preloadNextBatch, isPending]);

	if (!products?.length || !visibleProducts.length) return null;

	const view = isMobile ? "list" : "grid";

	return (
		<div className="mb-16 last:mb-0 p-4">
			{(title || description) && (
				<div className="mb-8">
					{title && <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>}
					{description && <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>}
				</div>
			)}

			<ProductGrid products={visibleProducts} view={view} onRemoveFromWishlist={onRemoveFromWishlist} onAddToWishlist={onAddToWishlist} onAddToCart={handleAddToCart} isLoading={isLoading} />

			{/* Preload trigger */}
			{visibleProducts.length < products.length && <div ref={preloadRef} className="w-full h-1 opacity-0 pointer-events-none" aria-hidden="true" />}

			{/* Load more trigger */}
			{visibleProducts.length < products.length && (
				<div ref={loadMoreRef} className="w-full h-16 flex items-center justify-center mt-8">
					{isLoading || isPreloading || isPending ? (
						<div className="animate-pulse flex items-center gap-2">
							<div className="h-2 w-2 bg-purple-500 rounded-full" />
							<div className="h-2 w-2 bg-purple-500 rounded-full animation-delay-200" />
							<div className="h-2 w-2 bg-purple-500 rounded-full animation-delay-400" />
						</div>
					) : (
						<div className="h-16" />
					)}
				</div>
			)}
		</div>
	);
}
