"use client";

import { memo, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ProductCard } from "@/components/products/product-card";
import type { ShopifyProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIntersectionObserver } from "@/lib/hooks/use-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination";

interface ProductListProps {
	products: ShopifyProduct[];
	totalProducts?: number;
	currentPage?: number;
	productsPerPage?: number;
	onRemoveFromWishlist?: (handle: string) => void;
	onAddToWishlist?: (handle: string) => void;
	collectionHandle?: string;
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

// Memoized ProductGrid component
const ProductGrid = memo(({ products, visibleProducts, onRemoveFromWishlist, onAddToWishlist, collectionHandle }: { products: ShopifyProduct[]; visibleProducts: Set<string>; onRemoveFromWishlist?: (handle: string) => void; onAddToWishlist?: (handle: string) => void; collectionHandle?: string }) => {
	// Optimize rendering by only rendering products that are likely to be visible
	// This is a simple virtualization technique that works well for most cases
	const [renderedProducts, setRenderedProducts] = useState<ShopifyProduct[]>([]);

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
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [products, collectionHandle]);

	return (
		<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
			{renderedProducts.map((product) => {
				const stockInfo = useStockInfo(product);
				const isVisible = visibleProducts.has(product.id);

				return <ProductCard key={product.id} product={product} view="grid" variantId={stockInfo.variantId} quantity={stockInfo.quantity} onRemoveFromWishlist={onRemoveFromWishlist} onAddToWishlist={onAddToWishlist} isVisible={isVisible} collectionHandle={collectionHandle} />;
			})}
		</div>
	);
});

ProductGrid.displayName = "ProductGrid";

// Main ProductList component
export function ProductList({ products, totalProducts = 0, currentPage = 1, productsPerPage = 24, onRemoveFromWishlist, onAddToWishlist, collectionHandle }: ProductListProps) {
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
		<div ref={containerRef}>
			<ProductGrid products={products} visibleProducts={visibleProducts} onRemoveFromWishlist={onRemoveFromWishlist} onAddToWishlist={onAddToWishlist} collectionHandle={collectionHandle} />

			<div className="mt-12 mb-8">
				<PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
			</div>
		</div>
	);
}

// Add display name
ProductList.displayName = "ProductList";
