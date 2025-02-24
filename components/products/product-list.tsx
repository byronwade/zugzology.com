"use client";

import { memo, useState, useEffect, useRef, useCallback, useMemo, useTransition } from "react";
import { ProductCard } from "@/components/products/product-card";
import type { ShopifyProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useViewport } from "@/lib/hooks/use-viewport";
import { useInView } from "react-intersection-observer";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIntersectionObserver } from "../../lib/hooks/use-intersection-observer";

interface ProductListProps {
	products: ShopifyProduct[];
	preloadedProducts?: ShopifyProduct[];
	onRemoveFromWishlist?: (handle: string) => void;
	onAddToWishlist?: (handle: string) => void;
	title?: string;
	description?: string;
	totalProducts: number;
	currentPage: number;
	productsPerPage: number;
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
	const [visibleProducts, setVisibleProducts] = useState<string[]>([]);
	const gridRef = useRef<HTMLDivElement>(null);

	// Set up intersection observer for the grid
	useIntersectionObserver(
		gridRef,
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const productId = entry.target.getAttribute("data-product-id");
					if (productId && !visibleProducts.includes(productId)) {
						setVisibleProducts((prev) => [...prev, productId]);
					}
				}
			});
		},
		{
			threshold: 0.1,
			rootMargin: "50px",
		}
	);

	return (
		<div ref={gridRef} className={cn("flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800", view === "list" ? "divide-y divide-neutral-200 dark:divide-neutral-800" : "", "sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 sm:gap-4 sm:divide-y-0")} role="region" aria-label="Products List" data-view={view}>
			{products.map((product, index) => {
				const stockInfo = useStockInfo(product);
				const isVisible = visibleProducts.includes(product.id);

				return (
					<div key={product.id} className="group relative" role="listitem" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" data-product-id={product.id}>
						<meta itemProp="position" content={String(index + 1)} />
						<MemoizedProductCard product={product} view={view} variantId={stockInfo.variantId} quantity={stockInfo.quantity} onRemoveFromWishlist={onRemoveFromWishlist} onAddToWishlist={onAddToWishlist} isAddingToCartProp={isLoading} onAddToCart={() => onAddToCart(product.id)} isVisible={isVisible} />
					</div>
				);
			})}
		</div>
	);
});

export function ProductList({ products, onRemoveFromWishlist, onAddToWishlist, title, description, totalProducts, currentPage = 1, productsPerPage = 50 }: ProductListProps) {
	const { isMobile } = useViewport();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);

	// Calculate total pages
	const totalPages = Math.ceil(totalProducts / productsPerPage);

	// Handle page change
	const handlePageChange = useCallback(
		(page: number) => {
			const current = new URLSearchParams(Array.from(searchParams.entries()));
			current.set("page", page.toString());
			const search = current.toString();
			const query = search ? `?${search}` : "";

			// Use replace to avoid adding to history stack
			router.replace(`${pathname}${query}#products-top`, { scroll: false });
		},
		[searchParams, pathname, router]
	);

	// Optimized add to cart handler
	const handleAddToCart = useCallback(async (productId: string) => {
		setIsLoading(true);
		try {
			// Your add to cart logic here
		} finally {
			setIsLoading(false);
		}
	}, []);

	if (!products?.length) {
		return (
			<div className="w-full min-h-[50vh] flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold mb-2">No products found</h2>
					<p className="text-muted-foreground">Try adjusting your filters or check back later</p>
				</div>
			</div>
		);
	}

	const view = isMobile ? "list" : "grid";

	return (
		<div className="w-full space-y-8">
			<ProductGrid products={products} view={view} onRemoveFromWishlist={onRemoveFromWishlist} onAddToWishlist={onAddToWishlist} onAddToCart={handleAddToCart} isLoading={isLoading} />

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex justify-center items-center gap-2 py-8">
					<Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} className="h-8 w-8 p-0">
						<ChevronLeft className="h-4 w-4" />
						<span className="sr-only">Previous page</span>
					</Button>

					{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
						// Show first page, last page, current page, and pages around current
						const shouldShow = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2;

						if (!shouldShow) {
							// Show ellipsis for skipped pages
							if (page === 2 || page === totalPages - 1) {
								return (
									<span key={`ellipsis-${page}`} className="px-2">
										...
									</span>
								);
							}
							return null;
						}

						return (
							<Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => handlePageChange(page)} className="h-8 min-w-[2rem] px-3">
								{page}
							</Button>
						);
					})}

					<Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="h-8 w-8 p-0">
						<ChevronRight className="h-4 w-4" />
						<span className="sr-only">Next page</span>
					</Button>
				</div>
			)}
		</div>
	);
}
