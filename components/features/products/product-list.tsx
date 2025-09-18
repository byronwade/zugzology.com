"use client";

import { memo, useState, useEffect, useRef, useCallback, Suspense } from "react";
import { ProductCard } from "@/components/features/products/product-card";
import type { ShopifyProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination";

export interface ProductListProps {
	products: ShopifyProduct[];
	totalProducts?: number;
	currentPage?: number;
	productsPerPage?: number;
	onRemoveFromWishlist?: (handle: string) => void;
	onAddToWishlist?: (handle: string) => void;
	collectionHandle?: string;
	showPagination?: boolean;
	initialSearchParams?: string;
}

// ProductSkeleton component for loading states
const ProductSkeleton = memo(() => (
	<div className="flex flex-col border border-foreground/10 rounded-lg animate-pulse">
		<div className="aspect-square w-full bg-neutral-200 dark:bg-neutral-800 rounded-t-lg"></div>
		<div className="p-4 space-y-3">
			<div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
			<div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
			<div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3"></div>
			<div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-full mt-4"></div>
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
			} else {
				// For other collections, use the standard approach
				// Initially render only the first 12 products
				setRenderedProducts(products.slice(0, 12));

				// After a short delay, render the rest
				const timer = setTimeout(() => {
					setRenderedProducts(products);
					setIsInitialRender(false);
				}, 100);

				return () => clearTimeout(timer);
			}
		}, [products, collectionHandle]);

		return (
			<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
				{renderedProducts.map((product, index) => {
					const stockInfo = getStockInfo(product);
					const isVisible = visibleProducts.has(product.id);

					// Use priority loading only for the first 4 products
					const isPriority = index < 4 && isInitialRender;

					return (
						<ProductCard
							key={product.id}
							product={product}
							view="grid"
							variantId={stockInfo.variantId}
							quantity={stockInfo.quantity}
							onRemoveFromWishlist={onRemoveFromWishlist}
							onAddToWishlist={onAddToWishlist}
							isVisible={isVisible}
							collectionHandle={collectionHandle}
							priority={isPriority}
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
	const handleVisibilityChange = useCallback((productId: string, isVisible: boolean) => {
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
			if (page === currentPage) return;

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
		<div ref={containerRef} className="space-y-6">
			{/* Mobile list view */}
			<div className="sm:hidden space-y-3">
				{products.map((product, index) => {
					const stockInfo = getStockInfo(product);
					return (
						<ProductCard
							key={`${product.id}-mobile`}
							product={product}
							view="list"
							variantId={stockInfo.variantId}
							quantity={stockInfo.quantity}
							onRemoveFromWishlist={onRemoveFromWishlist}
							onAddToWishlist={onAddToWishlist}
							collectionHandle={collectionHandle}
							priority={index < 2}
						/>
					);
				})}
			</div>

			{/* Grid view for tablet/desktop */}
			<div className="hidden sm:block">
				<ProductGrid
					products={products}
					visibleProducts={visibleProducts}
					onRemoveFromWishlist={onRemoveFromWishlist}
					onAddToWishlist={onAddToWishlist}
					collectionHandle={collectionHandle}
				/>
			</div>

			{showPagination && (
				<div className="mt-12 mb-8">
					<PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
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
					<div className="sm:hidden space-y-3">
						{Array.from({ length: 4 }).map((_, index) => (
							<ProductSkeleton key={`mobile-skeleton-${index}`} />
						))}
					</div>
					<div className="hidden sm:block">
						<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
							{Array.from({ length: 8 }).map((_, index) => (
								<ProductSkeleton key={`grid-skeleton-${index}`} />
							))}
						</div>
					</div>
					{props.showPagination && (
						<div className="mt-12 mb-8 flex justify-center">
							<div className="h-10 w-64 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
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
