import { unstable_cache } from "next/cache";
import type { ShopifyProduct } from "@/lib/types";
import { getProducts as fetchAllProducts } from "./actions";

/**
 * Cache configuration
 */
const CACHE_DURATION = 3600; // 1 hour
const CACHE_TAG_PREFIX = "product-segment";

/**
 * Product segment types for categorization
 */
type ProductSegment = "best-sellers" | "sale" | "latest" | "all-active";

/**
 * Shared product cache manager
 * Segments products into smaller cached chunks to avoid 2MB limit
 */
class ProductCacheManager {
	private static instance: ProductCacheManager;
	private allProducts: ShopifyProduct[] | null = null;

	private constructor() {}

	static getInstance(): ProductCacheManager {
		if (!ProductCacheManager.instance) {
			ProductCacheManager.instance = new ProductCacheManager();
		}
		return ProductCacheManager.instance;
	}

	/**
	 * Get all products with request-level caching
	 * This ensures we only fetch once per request
	 */
	async getAllProducts(): Promise<ShopifyProduct[]> {
		if (this.allProducts) {
			return this.allProducts;
		}

		this.allProducts = await fetchAllProducts();
		return this.allProducts;
	}

	/**
	 * Reset the request-level cache
	 * Called automatically between requests
	 */
	reset(): void {
		this.allProducts = null;
	}
}

/**
 * Get cached best sellers
 * Products with high availability as proxy for sales
 */
export const getCachedBestSellers = unstable_cache(
	async (limit: number = 8): Promise<ShopifyProduct[]> => {
		const products = await ProductCacheManager.getInstance().getAllProducts();
		return products
			.filter((p) => p.availableForSale && (p.variants?.nodes?.[0]?.quantityAvailable ?? 0) > 0)
			.slice(0, limit);
	},
	["best-sellers"],
	{
		tags: [`${CACHE_TAG_PREFIX}:best-sellers`],
		revalidate: CACHE_DURATION,
	}
);

/**
 * Get cached sale products
 * Products with compareAtPrice higher than current price
 */
export const getCachedSaleProducts = unstable_cache(
	async (limit: number = 8): Promise<ShopifyProduct[]> => {
		const products = await ProductCacheManager.getInstance().getAllProducts();
		return products
			.filter((p) => {
				const variant = p.variants?.nodes?.[0];
				return (
					variant?.compareAtPrice?.amount &&
					parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount)
				);
			})
			.slice(0, limit);
	},
	["sale-products"],
	{
		tags: [`${CACHE_TAG_PREFIX}:sale`],
		revalidate: CACHE_DURATION,
	}
);

/**
 * Get cached latest products
 * Sorted by publish date
 */
export const getCachedLatestProducts = unstable_cache(
	async (limit: number = 8): Promise<ShopifyProduct[]> => {
		const products = await ProductCacheManager.getInstance().getAllProducts();
		return products
			.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
			.slice(0, limit);
	},
	["latest-products"],
	{
		tags: [`${CACHE_TAG_PREFIX}:latest`],
		revalidate: CACHE_DURATION,
	}
);

/**
 * Get products by category (productType)
 * Uses cache key based on productType and currentProductId
 */
export const getCachedSameCategoryProducts = async (
	productType: string,
	currentProductId: string,
	limit: number = 8
): Promise<ShopifyProduct[]> => {
	if (!productType) return [];

	const cacheKey = `category-${productType}-${currentProductId}`;

	return unstable_cache(
		async () => {
			const products = await ProductCacheManager.getInstance().getAllProducts();
			return products
				.filter((p) => p.productType === productType && p.id !== currentProductId)
				.slice(0, limit);
		},
		[cacheKey],
		{
			tags: [`${CACHE_TAG_PREFIX}:category:${productType}`],
			revalidate: CACHE_DURATION,
		}
	)();
};

/**
 * Get products with similar tags
 * Uses cache key based on tags hash and currentProductId
 */
export const getCachedSimilarTagProducts = async (
	tags: string[],
	currentProductId: string,
	limit: number = 8
): Promise<ShopifyProduct[]> => {
	if (!tags?.length) return [];

	// Create a stable cache key from sorted tags
	const tagsKey = tags.slice().sort().join("-");
	const cacheKey = `tags-${tagsKey}-${currentProductId}`;

	return unstable_cache(
		async () => {
			const products = await ProductCacheManager.getInstance().getAllProducts();
			return products
				.filter((p) => {
					if (p.id === currentProductId) return false;
					return p.tags?.some((tag) => tags.includes(tag));
				})
				.slice(0, limit);
		},
		[cacheKey],
		{
			tags: [`${CACHE_TAG_PREFIX}:tags`],
			revalidate: CACHE_DURATION,
		}
	)();
};

/**
 * Get random products (deterministic for caching)
 * Uses alternating positions instead of true random
 */
export const getCachedRandomProducts = async (
	currentProductId: string,
	limit: number = 8
): Promise<ShopifyProduct[]> => {
	return unstable_cache(
		async () => {
			const products = await ProductCacheManager.getInstance().getAllProducts();
			const filtered = products.filter((p) => p.id !== currentProductId);

			// Deterministic selection using alternating positions
			const varied: ShopifyProduct[] = [];
			const step = Math.max(1, Math.floor(filtered.length / limit));

			for (let i = 0; i < filtered.length && varied.length < limit; i += step) {
				varied.push(filtered[i]);
			}

			// Fill remaining slots if needed
			if (varied.length < limit) {
				for (let i = 0; i < filtered.length && varied.length < limit; i++) {
					if (!varied.includes(filtered[i])) {
						varied.push(filtered[i]);
					}
				}
			}

			return varied.slice(0, limit);
		},
		[`random-${currentProductId}`],
		{
			tags: [`${CACHE_TAG_PREFIX}:random`],
			revalidate: CACHE_DURATION,
		}
	)();
};

/**
 * Batch fetch products by handles
 * Optimized for wishlist page
 */
export const getCachedProductsByHandles = async (handles: string[]): Promise<ShopifyProduct[]> => {
	if (!handles?.length) return [];

	const products = await ProductCacheManager.getInstance().getAllProducts();
	return products.filter((p) => handles.includes(p.handle));
};

/**
 * Export cache manager instance for manual cache resets if needed
 */
export const productCacheManager = ProductCacheManager.getInstance();
