"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/features/products/product-card";
import { PaginationControls } from "@/components/ui/pagination";
import type { ShopifyProduct } from "@/lib/types";

export type ProductListProps = {
	products: ShopifyProduct[];
	totalProducts?: number;
	currentPage?: number;
	productsPerPage?: number;
	onRemoveFromWishlist?: (handle: string) => void;
	onAddToWishlist?: (handle: string) => void;
	collectionHandle?: string;
	showPagination?: boolean;
	initialSearchParams?: string;
};

// ProductSkeleton component for loading states
const ProductSkeleton = memo(() => (
	<div className="flex animate-pulse flex-col rounded-lg border border-neutral-200 bg-white dark:border-neutral-900 dark:bg-black">
		<div className="aspect-square w-full rounded-t-lg bg-neutral-200 dark:bg-neutral-800" />
		<div className="space-y-3 p-4">
			<div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
			<div className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
			<div className="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
			<div className="mt-4 h-10 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
		</div>
	</div>
));

ProductSkeleton.displayName = "ProductSkeleton";

// Memoized stock info calculator
const getStockInfo = (product: ShopifyProduct) => {
	const variants = product.variants?.nodes || [];
	let totalQuantity = 0;

	for (const variant of variants) {
		if (typeof variant.quantityAvailable === "number") {
			totalQuantity += variant.quantityAvailable;
		}
	}

	return {
		variantId: variants[0]?.id,
		quantity: totalQuantity,
	};
};

// ProductGrid component
const ProductGrid = memo(
	({
		products,
		visibleProducts,
		onRemoveFromWishlist,
		onAddToWishlist,
		collectionHandle,
	}: {
		products: ShopifyProduct[];
		visibleProducts: Set<string>;
		onRemoveFromWishlist?: (handle: string) => void;
		onAddToWishlist?: (handle: string) => void;
		collectionHandle?: string;
	}) => {
		// Optimize rendering by only rendering products that are likely to be visible
		// This is a simple virtualization technique that works well for most cases
		const [renderedProducts, setRenderedProducts] = useState<ShopifyProduct[]>([]);
		const [isInitialRender, setIsInitialRender] = useState(true);

		useEffect(() => {
			// Check if this is the "All Products" collection
			const isAllProductsCollection = collectionHandle === "all";

			// For the "All Products" page, use more aggressive virtualization
			if (isAllProductsCollection && products.length > 12) {
				// Initially render only the first 8 products
				setRenderedProducts(products.slice(0, 8));

				// After a short delay, render the first 12 products
				const timer1 = setTimeout(() => {
					setRenderedProducts(products.slice(0, 12));
					setIsInitialRender(false);

					// After another delay, render all products
					const timer2 = setTimeout(() => {
						setRenderedProducts(products);
					}, 300);

					return () => clearTimeout(timer2);
				}, 100);

				return () => clearTimeout(timer1);
			}
			// For other collections, use the standard approach
			// Initially render only the first 12 products
			setRenderedProducts(products.slice(0, 12));

			// After a short delay, render the rest
			const timer = setTimeout(() => {
				setRenderedProducts(products);
				setIsInitialRender(false);
			}, 100);

			return () => clearTimeout(timer);
		}, [products, collectionHandle]);

		return (
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
				{renderedProducts.map((product, index) => {
					const stockInfo = getStockInfo(product);
					const isVisible = visibleProducts.has(product.id);

					// Use priority loading only for the first 4 products
					const isPriority = index < 4 && isInitialRender;

					return (
						<ProductCard
							collectionHandle={collectionHandle}
							isVisible={isVisible}
							key={product.id}
							onAddToWishlist={onAddToWishlist}
							onRemoveFromWishlist={onRemoveFromWishlist}
							priority={isPriority}
							product={product}
							quantity={stockInfo.quantity}
							variantId={stockInfo.variantId}
							view="grid"
						/>
					);
				})}
			</div>
		);
	}
);

ProductGrid.displayName = "ProductGrid";

// Inner component that uses useSearchParams
function ProductListInner({
	products,
	totalProducts = 0,
	currentPage = 1,
	productsPerPage = 24,
	onRemoveFromWishlist,
	onAddToWishlist,
	collectionHandle,
	showPagination = false,
	initialSearchParams,
}: ProductListProps) {
	const [visibleProducts, setVisibleProducts] = useState<Set<string>>(new Set());
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const containerRef = useRef<HTMLDivElement>(null);

	// Calculate total pages
	const totalPages = Math.max(1, Math.ceil((totalProducts || products.length) / productsPerPage));

	// Optimize rendering by only tracking visibility for visible products
	// This reduces the number of IntersectionObserver instances
	const _handleVisibilityChange = useCallback((productId: string, isVisible: boolean) => {
		setVisibleProducts((prev) => {
			const newSet = new Set(prev);
			if (isVisible) {
				newSet.add(productId);
			}
			return newSet;
		});
	}, []);

	// Optimize page navigation
	const handlePageChange = useCallback(
		(page: number) => {
			if (page === currentPage) {
				return;
			}

			// Create new URLSearchParams
			const params = new URLSearchParams(searchParams.toString());
			params.set("page", page.toString());

			// Use shallow routing to avoid full page reload
			router.push(`${pathname}?${params.toString()}`);

			// No scrolling - let the browser handle the navigation naturally
		},
		[currentPage, pathname, router, searchParams]
	);

	// Optimize initial visibility tracking
	useEffect(() => {
		// Mark first 8 products as visible by default
		const initialVisible = new Set<string>();
		products.slice(0, 8).forEach((product) => {
			initialVisible.add(product.id);
		});
		setVisibleProducts(initialVisible);
	}, [products]);

	return (
		<div className="space-y-6" ref={containerRef}>
			{/* Mobile list view */}
			<div className="space-y-3 sm:hidden">
				{products.map((product, index) => {
					const stockInfo = getStockInfo(product);
					return (
						<ProductCard
							collectionHandle={collectionHandle}
							key={`${product.id}-mobile`}
							onAddToWishlist={onAddToWishlist}
							onRemoveFromWishlist={onRemoveFromWishlist}
							priority={index < 2}
							product={product}
							quantity={stockInfo.quantity}
							variantId={stockInfo.variantId}
							view="list"
						/>
					);
				})}
			</div>

			{/* Grid view for tablet/desktop */}
			<div className="hidden sm:block">
				<ProductGrid
					collectionHandle={collectionHandle}
					onAddToWishlist={onAddToWishlist}
					onRemoveFromWishlist={onRemoveFromWishlist}
					products={products}
					visibleProducts={visibleProducts}
				/>
			</div>

			{showPagination && (
				<div className="mt-12 mb-8">
					<PaginationControls currentPage={currentPage} onPageChange={handlePageChange} totalPages={totalPages} />
				</div>
			)}
		</div>
	);
}

// Main ProductList component with Suspense boundary
export function ProductList(props: ProductListProps) {
	return (
		<Suspense
			fallback={
				<div className="space-y-6">
					<div className="space-y-3 sm:hidden">
						{Array.from({ length: 4 }).map((_, index) => (
							<ProductSkeleton key={`mobile-skeleton-${index}`} />
						))}
					</div>
					<div className="hidden sm:block">
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
							{Array.from({ length: 8 }).map((_, index) => (
								<ProductSkeleton key={`grid-skeleton-${index}`} />
							))}
						</div>
					</div>
					{props.showPagination && (
						<div className="mt-12 mb-8 flex justify-center">
							<div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
						</div>
					)}
				</div>
			}
		>
			<ProductListInner {...props} />
		</Suspense>
	);
}

// Add display name
ProductList.displayName = "ProductList";
