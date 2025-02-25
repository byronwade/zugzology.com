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
const PREFETCH_BATCH_SIZE = 10;
const PREFETCH_DELAY = 50;

// Helper to prefetch images
async function prefetchImages(products: ShopifyProduct[]): Promise<void> {
	if (typeof window === "undefined") return;

	const imageUrls = new Set<string>();

	// Extract image URLs
	products.forEach((product) => {
		product.images?.nodes?.forEach((image) => {
			if (image?.url) {
				imageUrls.add(image.url);
			}
		});
	});

	// Convert to array and process in batches
	const urls = Array.from(imageUrls);

	for (let i = 0; i < urls.length; i += PREFETCH_BATCH_SIZE) {
		const batch = urls.slice(i, i + PREFETCH_BATCH_SIZE);

		// Process batch in parallel
		await Promise.all(
			batch.map(async (url) => {
				try {
					// Use HEAD request to cache the image without downloading it fully
					await fetch(url, { method: "HEAD" });
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
const useTotalProducts = (collection?: ShopifyCollectionWithPagination | null, initialTotalProducts?: number, rawProducts: ShopifyProduct[] = [], searchResults: ShopifyProduct[] = [], isSearching = false) => {
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
	const { searchQuery: debouncedQuery, searchResults, isSearching, setAllProducts } = useSearch();
	const [mounted, setMounted] = useState(false);
	const [randomProducts, setRandomProducts] = useState<ShopifyProduct[]>([]);
	const [recommendedProducts, setRecommendedProducts] = useState<ShopifyProduct[]>([]);
	const [recentPosts, setRecentPosts] = useState<ShopifyBlogArticle[]>([]);

	// Get products from either collection, direct props, or search results
	const rawProducts = useMemo(() => {
		if (isSearching) {
			return searchResults.filter((result): result is { type: "product"; item: ShopifyProduct } => result.type === "product").map((result) => result.item);
		}

		return collection ? collection.products.edges.map((edge) => edge.node) : initialProducts || [];
	}, [collection, initialProducts, isSearching, searchResults]);

	// Get total count
	const totalProducts = useTotalProducts(collection, initialTotalProducts, rawProducts, searchResults, isSearching);

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
	}, [rawProducts.length, mounted, setAllProducts]);

	// Fetch additional data with stable dependencies
	useEffect(() => {
		if (!mounted) return;

		let isMounted = true;
		const fetchData = async () => {
			try {
				const [allProducts, posts] = await Promise.all([getProducts(), getAllBlogPosts()]);

				// Only update state if component is still mounted
				if (!isMounted) return;

				if (allProducts?.length) {
					// Create a stable set of IDs for filtering
					const currentIds = new Set(rawProducts.map((p) => p.id));
					const availableForRandom = allProducts.filter((p) => !currentIds.has(p.id));

					// Create stable arrays for state updates
					const shuffled = [...availableForRandom].sort(() => 0.5 - Math.random()).slice(0, 20);

					setRandomProducts(shuffled);
					setRecommendedProducts(shuffled.slice(0, 8));
				}

				if (posts?.length) {
					setRecentPosts(posts.slice(0, 3));
				}
			} catch (error) {
				console.error("Error fetching additional data:", error);
			}
		};

		fetchData();

		// Cleanup function
		return () => {
			isMounted = false;
		};
	}, [mounted, rawProducts]);

	// Handle empty search results
	if (isSearching && filteredProducts.length === 0) {
		return (
			<main className="w-full" itemScope itemType="https://schema.org/SearchResultsPage">
				<meta itemProp="name" content={`Search Results for "${debouncedQuery}" - Zugzology`} />
				<meta itemProp="description" content={`No products found matching your search for "${debouncedQuery}"`} />
				<ProductsHeader title={`Search Results for "${debouncedQuery}"`} description="No products found matching your search." defaultSort={defaultSort} />
				<EmptyState title="No Search Results" description={`We couldn't find any products matching "${debouncedQuery}". Try adjusting your search terms or browse our collections.`} showCollectionCards={true} />
			</main>
		);
	}

	// Handle empty collection or no filtered results
	if (!isSearching && filteredProducts.length === 0) {
		return (
			<main className="w-full" itemScope itemType="https://schema.org/CollectionPage">
				<meta itemProp="name" content={`${title} - Zugzology`} />
				<meta itemProp="description" content={description || "Browse our collection of products"} />
				<ProductsHeader title={title} description={description} defaultSort={defaultSort} />
				<EmptyState title={filters.sort !== "featured" ? "No Filtered Results" : "No Products Available"} description={filters.sort !== "featured" ? "No products match your current filters. Try adjusting your selection or browse all products." : "This collection is currently empty. Check out our other collections or browse all products."} showCollectionCards={true} />
			</main>
		);
	}

	// Determine description text
	const displayDescription = useMemo(() => {
		if (isSearching) {
			return `Found ${filteredProducts.length} products matching your search`;
		}

		if (filters.sort !== "featured") {
			return `Showing ${filteredProducts.length} filtered products`;
		}

		return description || `${totalProducts} products available`;
	}, [description, filteredProducts.length, filters.sort, isSearching, totalProducts]);

	// Determine title text
	const displayTitle = isSearching ? `Search Results for "${debouncedQuery}"` : title;

	return (
		<main className="w-full" itemScope itemType="https://schema.org/CollectionPage">
			<meta itemProp="name" content={`${displayTitle} - Zugzology`} />
			<meta itemProp="description" content={displayDescription} />
			<meta itemProp="numberOfItems" content={String(filteredProducts.length)} />

			<div id="products-top" className="scroll-mt-16" />

			<ProductsHeader title={displayTitle} description={displayDescription} defaultSort={defaultSort} />

			<Suspense fallback={<ProductsLoading />}>
				<section className="px-4 py-6" aria-label={isSearching ? "Search Results" : "Product Catalog"}>
					<ProductList products={filteredProducts} totalProducts={totalProducts} currentPage={currentPage} productsPerPage={24} onRemoveFromWishlist={onRemoveFromWishlist} {...(collection?.handle ? { collectionHandle: collection.handle } : {})} />
				</section>
			</Suspense>
		</main>
	);
}

ProductsContent.displayName = "ProductsContent";
