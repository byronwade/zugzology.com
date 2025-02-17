"use server";

import type { ShopifyProduct, ShopifyCollection, ShopifyBlog, ShopifyBlogArticle, ShopifyCart, CartItem } from "../types";
import { SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_STORE_DOMAIN } from "@/lib/constants";
import { revalidateTag } from "next/cache";

// Cache Configuration
const CACHE_TIMES = {
	PRODUCTS: 60 * 60 * 24, // 24 hours
	COLLECTIONS: 60 * 60 * 12, // 12 hours
	BLOGS: 60 * 60 * 6, // 6 hours
	SETTINGS: 60 * 60 * 24, // 24 hours
	MENU: 60 * 60 * 6, // 6 hours
	HEADER: 60 * 60 * 1, // 1 hour
	GLOBAL: 60 * 60 * 1, // 1 hour
} as const;

// Memory Cache Setup
const MEMORY_CACHE = new Map<string, { data: any; timestamp: number; size?: number }>();
const REQUEST_DEDUPLICATION_CACHE = new Map<string, Promise<any>>();
const MAX_CACHE_SIZE = 100;
const MAX_CACHE_AGE = 60 * 60 * 24; // 24 hours
const MAX_CACHE_MEMORY = 50 * 1024 * 1024; // 50MB

// Types
interface ShopifyFetchParams<T> {
	query: string;
	variables?: Record<string, any>;
	tags?: string[];
	next?: {
		tags: string[];
	};
}

interface ShopifyResponse<T> {
	data: T;
}

interface ProductResponse {
	product: ShopifyProduct | null;
}

interface CollectionResponse {
	collection: ShopifyCollection | null;
}

// Helper Functions
function getObjectSize(obj: any): number {
	const str = JSON.stringify(obj);
	return str.length * 2;
}

// Shopify API Functions
async function shopifyFetch<T>({ query, variables = {}, tags = [] }: ShopifyFetchParams<T>): Promise<ShopifyResponse<T>> {
	const result = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
		},
		body: JSON.stringify({ query, variables }),
		next: tags.length ? { tags } : undefined,
	});

	if (!result.ok) {
		throw new Error(`Failed to fetch from Shopify: ${result.statusText}`);
	}

	const response = await result.json();
	return response;
}

// Cache Management
function cleanupCache() {
	const startTime = performance.now();
	const now = Date.now();
	let totalMemory = 0;
	let deletedCount = 0;

	// Delete expired entries and calculate memory usage
	for (const [key, value] of MEMORY_CACHE.entries()) {
		if (!value.size) {
			value.size = getObjectSize(value.data);
		}
		totalMemory += value.size;

		if (now - value.timestamp > MAX_CACHE_AGE * 1000) {
			MEMORY_CACHE.delete(key);
			totalMemory -= value.size;
			deletedCount++;
		}
	}

	// Remove entries if over memory limit
	if (totalMemory > MAX_CACHE_MEMORY) {
		const entries = Array.from(MEMORY_CACHE.entries()).sort((a, b) => (a[1].size || 0) - (b[1].size || 0));

		while (totalMemory > MAX_CACHE_MEMORY && entries.length > 0) {
			const [key, value] = entries.pop()!;
			MEMORY_CACHE.delete(key);
			totalMemory -= value.size || 0;
			deletedCount++;
		}
	}

	// Clear request cache
	REQUEST_DEDUPLICATION_CACHE.clear();

	const duration = performance.now() - startTime;
	if (deletedCount > 0) {
		console.log(`⚡ [Cache Cleanup] ${duration.toFixed(2)}ms | Deleted: ${deletedCount} | Memory: ${(totalMemory / 1024 / 1024).toFixed(2)}MB`);
	}
}

// Run cache cleanup every minute
if (typeof setInterval !== "undefined") {
	setInterval(cleanupCache, 60 * 1000);
}

// Exported Functions
export async function getProduct(handle: string) {
	"use cache";

	const cacheKey = `product_${handle}`;
	const now = Date.now();
	const cached = MEMORY_CACHE.get(cacheKey);

	if (cached && now - cached.timestamp < CACHE_TIMES.PRODUCTS * 1000) {
		return cached.data;
	}

	try {
		const { data } = await shopifyFetch<ProductResponse>({
			query: `
        query getProduct($handle: String!) {
          product(handle: $handle) {
            id
            title
            handle
            description
            descriptionHtml
            availableForSale
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      `,
			variables: { handle },
			tags: [`product-${handle}`],
		});

		if (data?.product) {
			const size = getObjectSize(data.product);
			MEMORY_CACHE.set(cacheKey, {
				data: data.product,
				timestamp: now,
				size,
			});
		}

		return data?.product ?? null;
	} catch (error) {
		console.error("Error fetching product:", error);
		return cached?.data || null;
	}
}

export async function getCollection(handle: string) {
	"use cache";

	const cacheKey = `collection_${handle}`;
	const now = Date.now();
	const cached = MEMORY_CACHE.get(cacheKey);

	if (cached && now - cached.timestamp < CACHE_TIMES.COLLECTIONS * 1000) {
		return cached.data;
	}

	try {
		const { data } = await shopifyFetch<CollectionResponse>({
			query: `
        query getCollection($handle: String!) {
          collection(handle: $handle) {
            id
            title
            handle
            description
            products(first: 100) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }
          }
        }
      `,
			variables: { handle },
			tags: [`collection-${handle}`],
		});

		if (data?.collection) {
			const size = getObjectSize(data.collection);
			MEMORY_CACHE.set(cacheKey, {
				data: data.collection,
				timestamp: now,
				size,
			});
		}

		return data?.collection ?? null;
	} catch (error) {
		console.error("Error fetching collection:", error);
		return cached?.data || null;
	}
}

// Add other export functions here...
