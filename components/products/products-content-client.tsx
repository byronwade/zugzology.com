"use client";

import { useSearch } from "@/lib/providers/search-provider";
import { ProductList } from "@/components/products/product-list";
import { ProductsHeader } from "@/components/products/products-header";
import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { Link } from "@/components/ui/link";
import type { ShopifyCollection, ShopifyProduct, ShopifyBlogArticle } from "@/lib/types";
import { useProductFilters } from "@/lib/hooks/use-product-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { getProducts, getAllBlogPosts } from "@/lib/actions/shopify";

interface ProductsContentClientProps {
	collection: {
		id: string;
		handle: string;
		title: string;
		description?: string;
		image?: {
			url: string;
			altText?: string;
			width?: number;
			height?: number;
		};
		products: {
			nodes: ShopifyProduct[];
		};
	};
	searchQuery?: string;
}

// Constants for prefetching
const PREFETCH_BATCH_SIZE = 10;
const PREFETCH_DELAY = 50;
const PREFETCH_RETRY_LIMIT = 3;
const PREFETCH_CACHE = new Map<string, Promise<void>>();
const PREFETCH_PRIORITY = new Map<string, number>();

// Add these types
type PrefetchStatus = {
	success: number;
	failed: number;
	total: number;
	inProgress: number;
};

type PrefetchOptions = {
	priority?: number;
	timeout?: number;
};

// Helper to check if image is in viewport or close to it
const isNearViewport = (url: string): boolean => {
	if (typeof window === "undefined") return false;
	const images = document.querySelectorAll(`img[src="${url}"]`);
	if (!images.length) return false;

	const viewportHeight = window.innerHeight;
	const buffer = viewportHeight * 2; // Look 2 screens ahead

	return Array.from(images).some((img) => {
		const rect = img.getBoundingClientRect();
		return rect.top <= viewportHeight + buffer;
	});
};

// Optimized prefetch function
async function batchPrefetchImages(products: ShopifyProduct[], onProgress?: (status: PrefetchStatus) => void, options: PrefetchOptions = {}): Promise<void> {
	const status: PrefetchStatus = {
		success: 0,
		failed: 0,
		total: 0,
		inProgress: 0,
	};

	// Extract and prioritize image URLs
	const imageUrlsWithPriority = products.reduce((acc: [string, number][], product) => {
		product.images?.nodes?.forEach((image) => {
			if (image?.url) {
				const priority = PREFETCH_PRIORITY.get(image.url) || 0;
				acc.push([image.url, priority]);
			}
		});
		return acc;
	}, []);

	// Sort by priority
	imageUrlsWithPriority.sort(([, a], [, b]) => b - a);
	const allImageUrls = imageUrlsWithPriority.map(([url]) => url);

	status.total = allImageUrls.length;
	onProgress?.(status);

	const prefetchWithTimeout = async (url: string, timeout: number): Promise<void> => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			await fetch(url, {
				method: "HEAD",
				signal: controller.signal,
			});
			status.success++;
		} catch (error: any) {
			if (error?.name === "AbortError") {
				console.warn(`Prefetch timeout for ${url}`);
			}
			status.failed++;
		} finally {
			clearTimeout(timeoutId);
			status.inProgress--;
			onProgress?.(status);
		}
	};

	// Process in batches with priority
	for (let i = 0; i < allImageUrls.length; i += PREFETCH_BATCH_SIZE) {
		const batchUrls = allImageUrls.slice(i, i + PREFETCH_BATCH_SIZE);
		const batchPromises = batchUrls.map(async (url) => {
			if (PREFETCH_CACHE.has(url)) {
				return PREFETCH_CACHE.get(url);
			}

			// Increase priority for visible images
			if (isNearViewport(url)) {
				PREFETCH_PRIORITY.set(url, (PREFETCH_PRIORITY.get(url) || 0) + 5);
			}

			status.inProgress++;
			onProgress?.(status);

			const promise = prefetchWithTimeout(url, options.timeout || 5000);
			PREFETCH_CACHE.set(url, promise);
			return promise;
		});

		await Promise.all(batchPromises);

		if (i + PREFETCH_BATCH_SIZE < allImageUrls.length) {
			await new Promise((resolve) => setTimeout(resolve, PREFETCH_DELAY));
		}
	}
}

export function ProductsContentClient({ collection, searchQuery }: ProductsContentClientProps) {
	const { searchQuery: debouncedQuery, searchResults, isSearching, setAllProducts } = useSearch();
	const initRef = useRef(false);
	const [prefetchProgress, setPrefetchProgress] = useState<PrefetchStatus | null>(null);

	// Get initial products from collection with memoization
	const initialProducts = useMemo(() => {
		return collection?.products?.nodes || [];
	}, [collection?.products?.nodes]);

	// Memoize the progress callback
	const handlePrefetchProgress = useCallback((status: PrefetchStatus) => {
		setPrefetchProgress(status);
	}, []);

	// Initialize products and start prefetching
	useEffect(() => {
		if (initRef.current || !initialProducts.length) return;

		setAllProducts(initialProducts);
		initRef.current = true;

		batchPrefetchImages(initialProducts, handlePrefetchProgress)
			.catch((err) => console.error("Error prefetching images:", err))
			.finally(() => {
				setTimeout(() => setPrefetchProgress(null), 3000);
			});

		console.log("[PRODUCTS] Initialized with:", initialProducts.length);
	}, [initialProducts, setAllProducts, handlePrefetchProgress]);

	// Apply filters to products with optimized memoization
	const { filteredProducts, filters, updateFilter } = useProductFilters(initialProducts);

	// Optimize search results filtering
	const searchFilteredProducts = useMemo(() => {
		if (!isSearching) return filteredProducts;

		return searchResults.filter((result): result is { type: "product"; item: ShopifyProduct } => result.type === "product").map((result) => result.item);
	}, [isSearching, searchResults, filteredProducts]);

	// Memoize product-related values
	const memoizedProduct = useMemo(() => searchFilteredProducts[0] || null, [searchFilteredProducts]);

	const memoizedHistoryIds = useMemo(() => new Set(searchFilteredProducts.map((p) => p.id)), [searchFilteredProducts]);

	// Add these at the top of the component, after the state declarations
	const [randomProducts, setRandomProducts] = useState<ShopifyProduct[]>([]);
	const [recommendedProducts, setRecommendedProducts] = useState<ShopifyProduct[]>([]);
	const [recentPosts, setRecentPosts] = useState<ShopifyBlogArticle[]>([]);
	const [mounted, setMounted] = useState(false);

	// Optimize data fetching
	useEffect(() => {
		if (!mounted) {
			setMounted(true);
			return;
		}

		const fetchData = async () => {
			try {
				const [allProducts, posts] = await Promise.all([getProducts(), getAllBlogPosts()]);

				if (allProducts?.length) {
					const availableForRandom = allProducts.filter((p: ShopifyProduct) => p.id !== memoizedProduct?.id && !memoizedHistoryIds.has(p.id));

					const shuffled = availableForRandom.sort(() => 0.5 - Math.random()).slice(0, 20);

					setRandomProducts(shuffled);
					setRecommendedProducts(shuffled.slice(0, 8));
				}

				if (posts?.length) {
					setRecentPosts(posts.slice(0, 3));
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, [mounted, memoizedProduct?.id, memoizedHistoryIds]);

	// Handle empty search results
	if (isSearching && !searchFilteredProducts.length) {
		return (
			<main className="w-full" itemScope itemType="https://schema.org/SearchResultsPage">
				<meta itemProp="name" content={`Search Results for "${debouncedQuery}" - Zugzology`} />
				<meta itemProp="description" content={`No products found matching your search for "${debouncedQuery}"`} />
				<ProductsHeader title={`Search Results for "${debouncedQuery}"`} description="No products found matching your search." count={0} filters={filters} onUpdateFilter={updateFilter} />
				<EmptyState title="No Search Results" description={`We couldn't find any products matching "${debouncedQuery}". Try adjusting your search terms or browse our collections.`} />
			</main>
		);
	}

	// Handle empty collection or no filtered results
	if (!isSearching && !searchFilteredProducts.length) {
		return (
			<main className="w-full" itemScope itemType="https://schema.org/CollectionPage">
				<meta itemProp="name" content={`${collection?.title || "Products"} - Zugzology`} />
				<meta itemProp="description" content={collection?.description || "Browse our collection of products"} />
				<ProductsHeader title={collection?.title || "Products"} description={collection?.description} count={0} filters={filters} onUpdateFilter={updateFilter} image={collection?.image} />
				<EmptyState title={filters.sort !== "featured" ? "No Filtered Results" : "No Products Available"} description={filters.sort !== "featured" ? "No products match your current filters. Try adjusting your selection or browse all products." : "This collection is currently empty. Check out our other collections or browse all products."} />
			</main>
		);
	}

	return (
		<main className="w-full" itemScope itemType="https://schema.org/CollectionPage">
			<meta itemProp="name" content={`${isSearching ? `Search Results for "${debouncedQuery}"` : collection.title} - Zugzology`} />
			<meta itemProp="description" content={isSearching ? `Found ${searchFilteredProducts.length} products matching your search` : collection.description} />
			<meta itemProp="numberOfItems" content={String(searchFilteredProducts.length)} />

			<ProductsHeader title={isSearching ? `Search Results for "${debouncedQuery}"` : collection.title} description={isSearching ? `Found ${searchFilteredProducts.length} products matching your search` : filters.sort !== "featured" ? `Showing ${searchFilteredProducts.length} filtered products` : collection.description} count={searchFilteredProducts.length} filters={filters} onUpdateFilter={updateFilter} image={collection?.image} />

			<section className="px-4 py-6 space-y-4" aria-label={isSearching ? "Search Results" : "Product Catalog"} itemScope itemType="https://schema.org/ItemList">
				<meta itemProp="name" content={isSearching ? `Search Results for "${debouncedQuery}"` : collection.title} />
				<meta itemProp="numberOfItems" content={String(searchFilteredProducts.length)} />
				<ProductList products={searchFilteredProducts} />
			</section>
		</main>
	);
}
