"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ProductList } from "@/components/features/products/product-list";
import { ProductsHeader } from "@/components/features/products/products-header";
import { useSearch } from "@/components/providers";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductFilters } from "@/hooks/use-product-filters";
import { getAllBlogPosts } from "@/lib/api/shopify/actions";
import type { ShopifyCollectionWithPagination } from "@/lib/api/shopify/types";
import type { ShopifyBlogArticle, ShopifyProduct } from "@/lib/types";

// Loading component
const _ProductsLoading = () => (
	<div className="space-y-8">
		<div className="mb-8 w-full border-b p-4">
			<Skeleton className="mb-4 h-8 w-64" />
			<Skeleton className="h-4 w-96" />
			<div className="mt-6 flex justify-end">
				<Skeleton className="h-10 w-40" />
			</div>
		</div>
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
			{Array.from({ length: 12 }).map((_, i) => (
				<div className="flex flex-col rounded-lg border border-foreground/10" key={i}>
					<Skeleton className="aspect-square w-full rounded-t-lg" />
					<div className="space-y-3 p-4">
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-5 w-3/4" />
						<Skeleton className="h-4 w-1/3" />
						<Skeleton className="mt-4 h-10 w-full" />
					</div>
				</div>
			))}
		</div>
	</div>
);

// Image prefetching functionality removed

// Add a helper function to safely access the total products count
const getTotalProductsCount = (
	collection?: ShopifyCollectionWithPagination | null,
	initialTotalProducts?: number,
	rawProducts?: ShopifyProduct[]
): number => {
	if (collection?.productsCount !== undefined) {
		return collection.productsCount;
	}

	if (initialTotalProducts !== undefined) {
		return initialTotalProducts;
	}

	return rawProducts?.length || 0;
};

// Update the useTotalProducts hook to use the helper function
const useTotalProducts = (
	collection?: ShopifyCollectionWithPagination | null,
	initialTotalProducts?: number,
	rawProducts: ShopifyProduct[] = [],
	searchResults: any[] = [],
	isSearching = false
) =>
	useMemo(() => {
		if (isSearching) {
			return searchResults.length;
		}

		return getTotalProductsCount(collection, initialTotalProducts, rawProducts);
	}, [collection, initialTotalProducts, isSearching, rawProducts, searchResults]);

type ProductsContentProps = {
	collection?: ShopifyCollectionWithPagination | null;
	products?: ShopifyProduct[];
	title: string;
	description?: string;
	currentPage?: number;
	defaultSort?: string;
	onRemoveFromWishlist?: (handle: string) => void;
	totalProducts?: number;
	searchQuery?: string;
	collectionHandle?: string;
};

// Memoize the entire ProductsContent component to prevent unnecessary re-renders
export const ProductsContent = React.memo(function ProductsContent({
	collection,
	products: initialProducts,
	title,
	description,
	currentPage = 1,
	defaultSort = "featured",
	onRemoveFromWishlist,
	totalProducts: initialTotalProducts,
	searchQuery,
	collectionHandle,
}: ProductsContentProps) {
	// Get search context but don't let it affect main content rendering
	const { setAllProducts } = useSearch();

	// Get router for pagination
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Track component mounting
	const [mounted, setMounted] = useState(false);

	// Reduce state variables to only what's necessary
	const [_additionalData, setAdditionalData] = useState<{
		recentPosts: ShopifyBlogArticle[];
	}>({
		recentPosts: [],
	});

	// Get products from collection or direct props, NOT search results for main content
	const rawProducts = useMemo(() => {
		// Removed console.log for performance
		// For the main collection content, never use search results
		// This prevents the main content from changing during search
		return collection ? collection.products.edges.map((edge) => edge.node) : initialProducts || [];
	}, [collection, initialProducts]);

	// Get total count without considering search results
	const totalProductsCount = useTotalProducts(collection, initialTotalProducts, rawProducts, [], false);

	// Calculate total pages - memoize to prevent recalculation
	const totalPages = useMemo(() => {
		const PRODUCTS_PER_PAGE = 24; // Match the value used in the collection page
		return Math.ceil(totalProductsCount / PRODUCTS_PER_PAGE);
	}, [totalProductsCount]);

	// Apply traditional product filters
	const filterResult = useProductFilters(rawProducts);
	const filteredProducts = filterResult.filteredProducts;
	const filters = filterResult.filters;

	// Handle page changes
	const handlePageChange = useCallback(
		(page: number) => {
			if (page === currentPage) {
				return;
			}

			const params = new URLSearchParams(searchParams.toString());
			params.set("page", page.toString());
			router.push(`${pathname}?${params.toString()}`);
		},
		[currentPage, pathname, router, searchParams]
	);

	// Initialize products and prefetch images
	useEffect(() => {
		if (!mounted) {
			// Removed console.log for performance
			setMounted(true);
		}

		// Only set products and prefetch if we have products and haven't done it yet
		if (rawProducts.length > 0) {
			// Removed console.log for performance
			// Use a stable reference for setAllProducts
			setAllProducts([...rawProducts]);

			// Image prefetching disabled
		}
	}, [rawProducts, mounted, setAllProducts]);

	// Fetch additional data with stable dependencies - only fetch blog posts
	useEffect(() => {
		if (!mounted) {
			return;
		}

		let isMounted = true;

		// Use requestIdleCallback to defer non-critical data fetching
		const idleCallback = async () => {
			try {
				// Removed console.log for performance
				const posts = await getAllBlogPosts();

				if (posts?.length && isMounted) {
					setAdditionalData((prev) => ({
						...prev,
						recentPosts: posts.slice(0, 3),
					}));
				}
			} catch (_error) {}
		};

		if (typeof window !== "undefined" && "requestIdleCallback" in window) {
			(window as any).requestIdleCallback(idleCallback);
		} else {
			// Fallback to setTimeout for browsers that don't support requestIdleCallback
			setTimeout(idleCallback, 200);
		}

		// Cleanup function
		return () => {
			isMounted = false;
		};
	}, [mounted]);

	// Render content based on filter state only, NOT search state
	const renderContent = useCallback(() => {
		// Removed console.log for performance

		// Handle empty collection or no filtered results
		if (filteredProducts.length === 0) {
			return (
				<>
					<ProductsHeader count={0} defaultSort={defaultSort} description={description} title={title} />
					<EmptyState
						description={
							filters.sort !== "featured"
								? "No products match your current filters. Try adjusting your selection or browse all products."
								: "This collection is currently empty. Check out our other collections or browse all products."
						}
						title={filters.sort !== "featured" ? "No Filtered Results" : "No Products Available"}
					/>
				</>
			);
		}

		// Check if we should hide the count (for special collections)
		const isSpecialCollection =
			title === "Today's Sale" || title === "Best Sellers" || title === "Todays Sale" || title === "Sale";

		// Determine description text based on filters only
		const displayDescription =
			filters.sort !== "featured"
				? `Showing ${filteredProducts.length} filtered products`
				: isSpecialCollection
					? description || ""
					: description || `${totalProductsCount} products available`;

		return (
			<>
				<ProductsHeader
					count={totalProductsCount}
					defaultSort={defaultSort}
					description={displayDescription}
					title={title}
				/>
				<ProductList onRemoveFromWishlist={onRemoveFromWishlist} products={filteredProducts} />
				{totalPages > 1 && (
					<div className="mt-8">
						<PaginationControls currentPage={currentPage} onPageChange={handlePageChange} totalPages={totalPages} />
					</div>
				)}
			</>
		);
	}, [
		title,
		currentPage,
		filteredProducts,
		filters,
		description,
		defaultSort,
		totalProductsCount,
		totalPages,
		onRemoveFromWishlist,
		handlePageChange,
	]);

	// Always return a consistent structure to avoid hook issues
	return (
		<main className="w-full px-4" itemScope itemType="https://schema.org/CollectionPage">
			<meta content={`${title} - Zugzology`} itemProp="name" />
			<meta content={description || "Browse our collection of products"} itemProp="description" />
			{renderContent()}
		</main>
	);
});

ProductsContent.displayName = "ProductsContent";
