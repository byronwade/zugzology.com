"use client";

import React, { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { ProductList } from "@/components/products/product-list";
import { ProductsHeader } from "@/components/products/products-header";
import { useSearch } from "@/lib/providers/search-provider";
import { useProductFilters } from "@/lib/hooks/use-product-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { ShopifyProduct, ShopifyCollection, ShopifyBlogArticle } from "@/lib/types";
import type { ShopifyCollectionWithPagination } from "@/lib/api/shopify/types";
import { getProducts, getAllBlogPosts } from "@/lib/actions/shopify";
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

// Constants for prefetching
const PREFETCH_BATCH_SIZE = 5;
const PREFETCH_DELAY = 100;
const MAX_PREFETCH_IMAGES = 20;

// Helper to prefetch images
async function prefetchImages(products: ShopifyProduct[]): Promise<void> {
	if (typeof window === "undefined") return;

	const imageUrls = new Set<string>();

	// Extract image URLs - only take the first image from each product
	products.forEach((product) => {
		if (product.images?.nodes?.[0]?.url) {
			imageUrls.add(product.images.nodes[0].url);
		}
	});

	// Convert to array, limit the number of images, and process in batches
	const urls = Array.from(imageUrls).slice(0, MAX_PREFETCH_IMAGES);

	for (let i = 0; i < urls.length; i += PREFETCH_BATCH_SIZE) {
		const batch = urls.slice(i, i + PREFETCH_BATCH_SIZE);

		// Process batch in parallel
		await Promise.all(
			batch.map(async (url) => {
				try {
					// Create a new Image object to prefetch
					const img = new Image();
					img.src = url;
				} catch (error) {
					// Silently fail on prefetch errors
				}
			})
		);

		// Add delay between batches to prevent overwhelming the network
		if (i + PREFETCH_BATCH_SIZE < urls.length) {
			await new Promise((resolve) => setTimeout(resolve, PREFETCH_DELAY));
		}
	}
}

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
		console.log(`[ProductsContent] Computing rawProducts for ${title}, page ${currentPage}`);
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

	// Apply filters to products
	const { filteredProducts, filters } = useProductFilters(rawProducts);

	// Initialize products and prefetch images
	useEffect(() => {
		if (!mounted) {
			console.log(`[ProductsContent] Component mounted for ${title}, page ${currentPage}`);
			setMounted(true);
		}

		// Only set products and prefetch if we have products and haven't done it yet
		if (rawProducts.length > 0) {
			console.log(`[ProductsContent] Setting ${rawProducts.length} products for search`);
			// Use a stable reference for setAllProducts
			setAllProducts([...rawProducts]);

			// Prefetch images in the background without blocking
			prefetchImages(rawProducts).catch((err) => {
				// Silently handle prefetch errors
				console.debug("Image prefetch error:", err);
			});
		}
	}, [rawProducts, mounted, setAllProducts, title, currentPage]);

	// Fetch additional data with stable dependencies - only fetch blog posts
	useEffect(() => {
		if (!mounted) return;

		let isMounted = true;

		// Use requestIdleCallback to defer non-critical data fetching
		const idleCallback = async () => {
			try {
				console.log(`[ProductsContent] Fetching blog posts in idle callback`);
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
		console.log(
			`[ProductsContent] Rendering content for ${title}, page ${currentPage}, products: ${filteredProducts.length}`
		);

		// Handle empty collection or no filtered results
		if (filteredProducts.length === 0) {
			return (
				<>
					<ProductsHeader title={title} description={description} defaultSort={defaultSort} count={0} />
					<EmptyState
						title={filters.sort !== "featured" ? "No Filtered Results" : "No Products Available"}
						description={
							filters.sort !== "featured"
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
			filters.sort !== "featured"
				? `Showing ${filteredProducts.length} filtered products`
				: isSpecialCollection
				? description || ""
				: description || `${totalProductsCount} products available`;

		return (
			<>
				<ProductsHeader
					title={title}
					description={displayDescription}
					defaultSort={defaultSort}
					count={totalProductsCount}
				/>
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
		title,
		currentPage,
		filteredProducts,
		filters.sort,
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
