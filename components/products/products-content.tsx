"use client";

import { Suspense, useState, useEffect, useMemo, useCallback } from "react";
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
const getTotalProductsCount = (collection?: ShopifyCollectionWithPagination | null, initialTotalProducts?: number, rawProducts?: ShopifyProduct[]): number => {
	if (collection?.productsCount !== undefined) {
		return collection.productsCount;
	}

	if (initialTotalProducts !== undefined) {
		return initialTotalProducts;
	}

	return rawProducts?.length || 0;
};

// Update the useTotalProducts hook to use the helper function
const useTotalProducts = (collection?: ShopifyCollectionWithPagination | null, initialTotalProducts?: number, rawProducts: ShopifyProduct[] = [], searchResults: any[] = [], isSearching = false) => {
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

export function ProductsContent({ collection, products: initialProducts, title, description, currentPage = 1, defaultSort = "featured", onRemoveFromWishlist, totalProducts: initialTotalProducts, searchQuery }: ProductsContentProps) {
	// Get search context but don't let it affect main content rendering
	const searchContext = useSearch();
	// Only extract what we need for the dropdown UI
	const { setAllProducts } = searchContext;

	// Don't use these values for main content rendering
	// Instead, only use them for the dropdown UI
	const debouncedQuery = searchContext.searchQuery;
	const searchResults = searchContext.searchResults;
	const isSearching = searchContext.isSearching;

	const [mounted, setMounted] = useState(false);
	const [randomProducts, setRandomProducts] = useState<ShopifyProduct[]>([]);
	const [recommendedProducts, setRecommendedProducts] = useState<ShopifyProduct[]>([]);
	const [recentPosts, setRecentPosts] = useState<ShopifyBlogArticle[]>([]);

	// Get products from collection or direct props, NOT search results for main content
	const rawProducts = useMemo(() => {
		// For the main collection content, never use search results
		// This prevents the main content from changing during search
		return collection ? collection.products.edges.map((edge) => edge.node) : initialProducts || [];
	}, [collection, initialProducts]);

	// Get total count without considering search results
	const totalProductsCount = useTotalProducts(collection, initialTotalProducts, rawProducts, [], false);

	// Calculate total pages
	const PRODUCTS_PER_PAGE = 20; // Match the value used in the collection page
	const totalPages = Math.ceil(totalProductsCount / PRODUCTS_PER_PAGE);

	// Apply filters to products
	const { filteredProducts, filters, updateFilter } = useProductFilters(rawProducts);

	// Initialize products and prefetch images
	useEffect(() => {
		if (!mounted) {
			setMounted(true);
		}

		// Only set products and prefetch if we have products and haven't done it yet
		if (rawProducts.length > 0) {
			// Use a stable reference for setAllProducts
			const productsToSet = [...rawProducts];
			setAllProducts(productsToSet);

			// Check if this is the "All Products" page
			const isAllProductsPage = title === "All Products";

			// Only prefetch images for non-All Products pages or if we have few products
			if (!isAllProductsPage || rawProducts.length < 10) {
				// Prefetch images in the background without blocking
				const prefetchPromise = prefetchImages(productsToSet).catch((err) => {
					// Silently handle prefetch errors
					console.debug("Image prefetch error:", err);
				});

				// Return cleanup function
				return () => {
					// Cancel prefetch if component unmounts (though this isn't directly possible)
					prefetchPromise.catch(() => {});
				};
			}
		}
	}, [rawProducts.length, mounted, setAllProducts, title]);

	// Fetch additional data with stable dependencies
	useEffect(() => {
		if (!mounted) return;

		let isMounted = true;
		const fetchData = async () => {
			try {
				// Only fetch additional data if we have fewer than 10 products
				// This avoids unnecessary API calls when we already have enough products
				if (rawProducts.length < 10) {
					const [allProducts, posts] = await Promise.all([getProducts(), getAllBlogPosts()]);

					// Only update state if component is still mounted
					if (!isMounted) return;

					if (allProducts?.length) {
						// Create a stable set of IDs for filtering
						const currentIds = new Set(rawProducts.map((p) => p.id));
						const availableForRandom = allProducts.filter((p) => !currentIds.has(p.id));

						// Create stable arrays for state updates
						const shuffled = [...availableForRandom].sort(() => 0.5 - Math.random()).slice(0, 12);

						setRandomProducts(shuffled);
						setRecommendedProducts(shuffled.slice(0, 6));
					}

					if (posts?.length) {
						setRecentPosts(posts.slice(0, 3));
					}
				} else {
					// If we have enough products, just use a subset of the existing ones
					const shuffled = [...rawProducts].sort(() => 0.5 - Math.random()).slice(0, 12);
					setRandomProducts(shuffled);
					setRecommendedProducts(shuffled.slice(0, 6));

					// Fetch blog posts separately as they're still needed
					const posts = await getAllBlogPosts();
					if (posts?.length && isMounted) {
						setRecentPosts(posts.slice(0, 3));
					}
				}
			} catch (error) {
				console.error("Error fetching additional data:", error);
			}
		};

		// Use requestIdleCallback to defer non-critical data fetching
		if (typeof window !== "undefined" && "requestIdleCallback" in window) {
			(window as any).requestIdleCallback(() => fetchData());
		} else {
			// Fallback to setTimeout for browsers that don't support requestIdleCallback
			setTimeout(fetchData, 200);
		}

		// Cleanup function
		return () => {
			isMounted = false;
		};
	}, [mounted, rawProducts]);

	// Render content based on filter state only, NOT search state
	const renderContent = () => {
		// Handle empty collection or no filtered results
		if (filteredProducts.length === 0) {
			return (
				<>
					<ProductsHeader title={title} description={description} defaultSort={defaultSort} count={0} />
					<EmptyState title={filters.sort !== "featured" ? "No Filtered Results" : "No Products Available"} description={filters.sort !== "featured" ? "No products match your current filters. Try adjusting your selection or browse all products." : "This collection is currently empty. Check out our other collections or browse all products."} showCollectionCards={true} />
				</>
			);
		}

		// Check if we should hide the count (for special collections)
		const isSpecialCollection = title === "Today's Sale" || title === "Best Sellers" || title === "Todays Sale" || title === "Sale";

		// Determine description text based on filters only
		const displayDescription = filters.sort !== "featured" ? `Showing ${filteredProducts.length} filtered products` : isSpecialCollection ? description || "" : description || `${totalProductsCount} products available`;

		return (
			<>
				<ProductsHeader title={title} description={displayDescription} defaultSort={defaultSort} count={totalProductsCount} />
				<ProductList products={filteredProducts} onRemoveFromWishlist={onRemoveFromWishlist} />
				{totalPages > 1 && (
					<div className="mt-8">
						<PaginationControls currentPage={currentPage} totalPages={totalPages} baseUrl={searchQuery ? "/search" : collection?.handle ? `/collections/${collection.handle}` : undefined} />
					</div>
				)}
			</>
		);
	};

	// Always return a consistent structure to avoid hook issues
	return (
		<main className="w-full px-4" itemScope itemType="https://schema.org/CollectionPage">
			<meta itemProp="name" content={`${title} - Zugzology`} />
			<meta itemProp="description" content={description || "Browse our collection of products"} />
			{renderContent()}
		</main>
	);
}

ProductsContent.displayName = "ProductsContent";
