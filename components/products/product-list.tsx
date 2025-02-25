"use client";

import { memo, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ProductCard } from "@/components/products/product-card";
import type { ShopifyProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useInView } from "react-intersection-observer";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIntersectionObserver } from "@/lib/hooks/use-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";

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
	return (
		<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
			{products.map((product) => {
				const stockInfo = useStockInfo(product);
				const isVisible = visibleProducts.has(product.id);

				return <ProductCard key={product.id} product={product} view="grid" variantId={stockInfo.variantId} quantity={stockInfo.quantity} onRemoveFromWishlist={onRemoveFromWishlist} onAddToWishlist={onAddToWishlist} isVisible={isVisible} collectionHandle={collectionHandle} />;
			})}
		</div>
	);
});

ProductGrid.displayName = "ProductGrid";

// Pagination component
const Pagination = memo(({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => {
	if (totalPages <= 1) return null;

	return (
		<div className="flex items-center justify-center mt-8 space-x-2">
			<Button variant="outline" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page">
				<ChevronLeft className="h-4 w-4" />
			</Button>

			<div className="flex items-center space-x-2">
				{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
					<Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => onPageChange(page)} aria-label={`Page ${page}`} aria-current={currentPage === page ? "page" : undefined}>
						{page}
					</Button>
				))}
			</div>

			<Button variant="outline" size="icon" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="Next page">
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
});

Pagination.displayName = "Pagination";

// Main ProductList component
export function ProductList({ products, totalProducts = 0, currentPage = 1, productsPerPage = 24, onRemoveFromWishlist, onAddToWishlist, collectionHandle }: ProductListProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const [visibleProducts, setVisibleProducts] = useState<Set<string>>(new Set());
	const observerRef = useRef<IntersectionObserver | null>(null);
	const productRefs = useRef<Map<string, HTMLElement>>(new Map());

	// Calculate total pages
	const totalPages = Math.max(1, Math.ceil((totalProducts || products.length) / productsPerPage));

	// Handle page change
	const handlePageChange = useCallback(
		(page: number) => {
			const params = new URLSearchParams(searchParams.toString());
			params.set("page", page.toString());
			router.push(`${pathname}?${params.toString()}#products-top`);
		},
		[router, searchParams, pathname]
	);

	// Setup intersection observer to track visible products
	useEffect(() => {
		// Cleanup previous observer
		if (observerRef.current) {
			observerRef.current.disconnect();
		}

		// Create new observer with a stable callback
		const handleIntersection = (entries: IntersectionObserverEntry[]) => {
			const updatedVisibleProducts = new Set(visibleProducts);
			let hasChanges = false;

			entries.forEach((entry) => {
				const productId = entry.target.getAttribute("data-product-id");
				if (productId) {
					if (entry.isIntersecting && !updatedVisibleProducts.has(productId)) {
						updatedVisibleProducts.add(productId);
						hasChanges = true;
					}
				}
			});

			// Only update state if there are changes
			if (hasChanges) {
				setVisibleProducts(updatedVisibleProducts);
			}
		};

		observerRef.current = new IntersectionObserver(handleIntersection, {
			rootMargin: "200px",
			threshold: 0.1,
		});

		// Observe all product elements
		productRefs.current.forEach((ref) => {
			if (observerRef.current) {
				observerRef.current.observe(ref);
			}
		});

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, []); // Empty dependency array to ensure this only runs once

	// Set up refs for each product with a stable callback
	const setProductRef = useCallback((element: HTMLElement | null, productId: string) => {
		if (element) {
			element.setAttribute("data-product-id", productId);
			productRefs.current.set(productId, element);

			// Observe immediately if observer exists
			if (observerRef.current) {
				observerRef.current.observe(element);
			}
		} else if (productRefs.current.has(productId)) {
			// Only delete if it exists to avoid unnecessary updates
			productRefs.current.delete(productId);
		}
	}, []);

	// If no products, show loading skeleton
	if (!products.length) {
		return (
			<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
				{Array.from({ length: 12 }).map((_, i) => (
					<ProductSkeleton key={i} />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Product Grid */}
			<div className="relative">
				<ProductGrid products={products} visibleProducts={visibleProducts} onRemoveFromWishlist={onRemoveFromWishlist} onAddToWishlist={onAddToWishlist} collectionHandle={collectionHandle} />

				{/* Product Refs - Hidden elements for intersection observer */}
				<div className="sr-only" aria-hidden="true">
					{products.map((product) => (
						<div key={`ref-${product.id}`} ref={(el) => setProductRef(el, product.id)} data-product-id={product.id} />
					))}
				</div>
			</div>

			{/* Pagination */}
			{totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
		</div>
	);
}

// Add display name
ProductList.displayName = "ProductList";
