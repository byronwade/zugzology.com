"use client";

import React, { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { ProductList } from "@/components/features/products/product-list";
import { ProductsHeader } from "@/components/features/products/products-header";
import { AIProductsHeader } from "@/components/features/products/ai-products-header";
import { useSearch } from "@/components/providers";
import { useProductFilters } from "@/hooks/use-product-filters";
import { useAIProductFilters } from "@/hooks/use-ai-product-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { ShopifyProduct, ShopifyCollection, ShopifyBlogArticle } from "@/lib/types";
import type { ShopifyCollectionWithPagination } from "@/lib/api/shopify/types";
import { getAllBlogPosts } from "@/lib/api/shopify/actions";
import { PaginationControls } from "@/components/ui/pagination";

// Loading component
const ProductsLoading = () => (
	<div className="space-y-8">
		<div className="w-full border-b p-4 mb-8">
			<Skeleton className="h-8 w-64 mb-4" />
			<Skeleton className="h-4 w-96" />
			<div className="flex justify-end mt-6">
				<Skeleton className="h-10 w-40" />
			</div>
		</div>
		<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
			{Array.from({ length: 12 }).map((_, i) => (
				<div key={i} className="flex flex-col border border-foreground/10 rounded-lg">
					<Skeleton className="aspect-square w-full rounded-t-lg" />
					<div className="p-4 space-y-3">
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-5 w-3/4" />
						<Skeleton className="h-4 w-1/3" />
						<Skeleton className="h-10 w-full mt-4" />
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
) => {
	return useMemo(() => {
		if (isSearching) {
			return searchResults.length;
		}

		return getTotalProductsCount(collection, initialTotalProducts, rawProducts);
	}, [collection, initialTotalProducts, isSearching, rawProducts, searchResults]);
};

interface ProductsContentProps {
	collection?: ShopifyCollectionWithPagination | null;
	products?: ShopifyProduct[];
	title: string;
	description?: string;
	currentPage?: number;
	defaultSort?: string;
	onRemoveFromWishlist?: (handle: string) => void;
	totalProducts?: number;
	searchQuery?: string;
	// AI-specific props
	useAI?: boolean;
	collectionHandle?: string;
}

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
	useAI = true,
	collectionHandle,
}: ProductsContentProps) {
	// Get search context but don't let it affect main content rendering
	const { setAllProducts } = useSearch();

	// Track component mounting
	const [mounted, setMounted] = useState(false);

	// Reduce state variables to only what's necessary
	const [additionalData, setAdditionalData] = useState<{
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
	}, [collection, initialProducts, title, currentPage]);

	// Get total count without considering search results
	const totalProductsCount = useTotalProducts(collection, initialTotalProducts, rawProducts, [], false);

	// Calculate total pages - memoize to prevent recalculation
	const totalPages = useMemo(() => {
		const PRODUCTS_PER_PAGE = 24; // Match the value used in the collection page
		return Math.ceil(totalProductsCount / PRODUCTS_PER_PAGE);
	}, [totalProductsCount]);

	// Determine the page context for AI filtering
	const pageContext = useMemo(() => {
		if (searchQuery) return 'search' as const;
		if (collectionHandle === 'all' || collectionHandle === 'all-products') return 'all-products' as const;
		if (collectionHandle) return 'collection' as const;
		return 'home' as const;
	}, [searchQuery, collectionHandle]);

	// Apply AI filters or traditional filters based on useAI prop
	const aiFilterResult = useAIProductFilters(rawProducts, {
		page: pageContext,
		searchQuery,
		collectionHandle: collectionHandle || collection?.handle,
	});

	const traditionalFilterResult = useProductFilters(rawProducts);

	// Choose which filtering system to use
	const activeFilterResult = useAI ? aiFilterResult : traditionalFilterResult;
	const filteredProducts = activeFilterResult.filteredProducts;
	const filters = activeFilterResult.filters;

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
	}, [rawProducts, mounted, setAllProducts, currentPage]);

	// Fetch additional data with stable dependencies - only fetch blog posts
	useEffect(() => {
		if (!mounted) return;

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
			} catch (error) {
				console.error("Error fetching blog posts:", error);
			}
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
			const HeaderComponent = useAI ? AIProductsHeader : ProductsHeader;
			return (
				<>
					<HeaderComponent title={title} description={description} defaultSort={defaultSort} count={0} />
					<EmptyState
						title={filters.sort !== "featured" && filters.sort !== "recommended" ? "No Filtered Results" : "No Products Available"}
						description={
							filters.sort !== "featured" && filters.sort !== "recommended"
								? "No products match your current filters. Try adjusting your selection or browse all products."
								: "This collection is currently empty. Check out our other collections or browse all products."
						}
						showCollectionCards={true}
					/>
				</>
			);
		}

		// Check if we should hide the count (for special collections)
		const isSpecialCollection =
			title === "Today's Sale" || title === "Best Sellers" || title === "Todays Sale" || title === "Sale";

		// Determine description text based on filters only
		const displayDescription =
			filters.sort !== "featured" && filters.sort !== "recommended"
				? `Showing ${filteredProducts.length} filtered products`
				: isSpecialCollection
				? description || ""
				: description || `${totalProductsCount} products available`;

		// Render appropriate header based on AI usage
		const HeaderComponent = useAI ? AIProductsHeader : ProductsHeader;
		const headerProps = useAI && 'metadata' in activeFilterResult
			? {
				title,
				description: displayDescription,
				defaultSort,
				count: totalProductsCount,
				aiMetadata: activeFilterResult.metadata,
				showAIInsights: true,
				onUpdateFilter: activeFilterResult.updateFilter,
				filters: filters
			}
			: {
				title,
				description: displayDescription,
				defaultSort,
				count: totalProductsCount
			};

		return (
			<>
				<HeaderComponent {...headerProps} />
				<ProductList products={filteredProducts} onRemoveFromWishlist={onRemoveFromWishlist} />
				{totalPages > 1 && (
					<div className="mt-8">
						<PaginationControls
							currentPage={currentPage}
							totalPages={totalPages}
							baseUrl={searchQuery ? "/search" : collection?.handle ? `/collections/${collection.handle}` : undefined}
						/>
					</div>
				)}
			</>
		);
	}, [
		useAI,
		activeFilterResult,
		title,
		currentPage,
		filteredProducts,
		filters,
		description,
		defaultSort,
		totalProductsCount,
		totalPages,
		searchQuery,
		collection?.handle,
		onRemoveFromWishlist,
	]);

	// Always return a consistent structure to avoid hook issues
	return (
		<main className="w-full px-4" itemScope itemType="https://schema.org/CollectionPage">
			<meta itemProp="name" content={`${title} - Zugzology`} />
			<meta itemProp="description" content={description || "Browse our collection of products"} />
			{renderContent()}
		</main>
	);
});

ProductsContent.displayName = "ProductsContent";
