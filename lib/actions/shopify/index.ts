"use server";

import { shopifyFetch } from "@/lib/api/shopify/client";
import { PRODUCTS_FRAGMENT, COLLECTION_FRAGMENT } from "@/lib/api/shopify/fragments";
import type { ShopifyProduct, ShopifyCollection } from "@/lib/types";
import type { ProductResponse, CollectionResponse } from "@/lib/api/shopify/types";

// Import specific async functions from the actions file instead of re-exporting everything
import { 
	createCart,
	getCart,
	addToCart,
	updateCartLine,
	removeFromCart,
	getBlogByHandle,
	getProductPageData,
	getAllProducts,
	getPaginatedProducts as getPaginatedProductsFromActions
} from "@/lib/api/shopify/actions";

// Re-export only the async functions we need
export { 
	createCart,
	getCart,
	addToCart,
	updateCartLine,
	removeFromCart,
	getBlogByHandle,
	getProductPageData,
	getAllProducts
};

/**
 * Get a product by handle using the new use cache directive
 */
export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
	"use cache";

	if (!handle) return null;

	try {
		const { data } = await shopifyFetch<ProductResponse>({
			query: `
        query getProduct($handle: String!) {
          product(handle: $handle) {
            ${PRODUCTS_FRAGMENT}
          }
        }
      `,
			variables: {
				handle,
			},
		});

		return data?.product ?? null;
	} catch (error) {
		console.error(`Error fetching product with handle ${handle}:`, error);
		return null;
	}
}

/**
 * Get a collection by handle using the new use cache directive
 */
export async function getCollectionByHandle(handle: string): Promise<any> {
	"use cache";

	if (!handle) return null;

	try {
		const { data } = await shopifyFetch<CollectionResponse>({
			query: `
        query getCollection($handle: String!) {
          collection(handle: $handle) {
            ${COLLECTION_FRAGMENT}
          }
        }
      `,
			variables: {
				handle,
			},
		});

		return data?.collection ?? null;
	} catch (error) {
		console.error(`Error fetching collection with handle ${handle}:`, error);
		return null;
	}
}

/**
 * Get all collections using the new use cache directive
 */
export async function getAllCollections(): Promise<ShopifyCollection[]> {
	"use cache";

	try {
		const { data } = await shopifyFetch<{ collections: { nodes: ShopifyCollection[] } }>({
			query: `
        query getAllCollections {
          collections(first: 250) {
            nodes {
              ${COLLECTION_FRAGMENT}
            }
          }
        }
      `,
		});

		return data?.collections?.nodes ?? [];
	} catch (error) {
		console.error("Error fetching all collections:", error);
		return [];
	}
}

/**
 * Get all products using the new use cache directive
 */
export async function getProducts(page = 1, perPage = 24, sort = "featured") {
	// Remove "use cache" directive as it's no longer the recommended approach in Next.js 15
	// Instead, we'll use the cache option in fetch

	try {
		console.log(`[getProducts] Fetching page ${page} with ${perPage} products per page, sort: ${sort}`);
		
		// Determine sort key and direction
		let sortKey = "CREATED_AT";
		let reverse = true;

		switch (sort) {
			case "price-asc":
				sortKey = "PRICE";
				reverse = false;
				break;
			case "price-desc":
				sortKey = "PRICE";
				reverse = true;
				break;
			case "title-asc":
				sortKey = "TITLE";
				reverse = false;
				break;
			case "title-desc":
				sortKey = "TITLE";
				reverse = true;
				break;
			case "best-selling":
				sortKey = "BEST_SELLING";
				reverse = false;
				break;
			case "newest":
				sortKey = "CREATED_AT";
				reverse = true;
				break;
			case "oldest":
				sortKey = "CREATED_AT";
				reverse = false;
				break;
			default:
				// Default to featured
				sortKey = "MANUAL";
				reverse = false;
		}

		// Calculate pagination - we need to fetch products after a certain cursor
		// For the first page, we don't need a cursor
		let after = null;
		
		// For pages beyond the first, we need to get the cursor for pagination
		if (page > 1) {
			console.log(`[getProducts] Getting cursor for page ${page}`);
			
			// Generate a cache key for this cursor
			const cursorKey = `product_cursor_${sort}_${(page - 1) * perPage}`;
			
			// Check if we have this cursor in memory
			const cachedCursor = getCachedCursor(cursorKey);
			
			if (cachedCursor) {
				after = cachedCursor;
				console.log(`[getProducts] Using cached cursor for page ${page}: ${after.substring(0, 20)}...`);
			} else {
				// First, get the cursor for the last product of the previous page
				const cursorResponse = await shopifyFetch<{
					products: {
						edges: Array<{
							cursor: string;
						}>;
					};
				}>({
					query: `
						query getProductCursor($first: Int!, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
							products(first: $first, sortKey: $sortKey, reverse: $reverse) {
								edges {
									cursor
								}
							}
						}
					`,
					variables: {
						first: (page - 1) * perPage,
						sortKey,
						reverse,
					},
					// Use force-cache for cursor calculation to improve performance
					cache: 'force-cache',
				});

				const edges = cursorResponse.data?.products?.edges || [];
				if (edges.length > 0) {
					after = edges[edges.length - 1].cursor;
					// Store this cursor for future use
					storeCachedCursor(cursorKey, after);
					console.log(`[getProducts] Found and cached cursor for page ${page}: ${after.substring(0, 20)}...`);
				} else {
					console.log(`[getProducts] No cursor found for page ${page}, using null cursor`);
				}
			}
		}

		// Fetch products for the current page using the cursor
		console.log(`[getProducts] Fetching products with cursor: ${after ? after.substring(0, 20) + '...' : 'null'}`);
		
		const { data } = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>({
			query: `
				query getProducts($first: Int!, $after: String, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
					products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
						nodes {
							id
							title
							handle
							description
							productType
							vendor
							availableForSale
							tags
							priceRange {
								minVariantPrice {
									amount
									currencyCode
								}
								maxVariantPrice {
									amount
									currencyCode
								}
							}
							variants(first: 1) {
								nodes {
									id
									title
									availableForSale
									price {
										amount
										currencyCode
									}
									compareAtPrice {
										amount
										currencyCode
									}
									quantityAvailable
								}
							}
							images(first: 1) {
								nodes {
									url
									altText
									width
									height
								}
							}
							publishedAt
						}
					}
				}
			`,
			variables: {
				first: perPage,
				after,
				sortKey,
				reverse,
			},
			// Use no-store to ensure fresh product data
			cache: 'no-store',
		});

		const products = data?.products?.nodes || [];
		console.log(`[getProducts] Fetched ${products.length} products for page ${page}`);
		
		return products;
	} catch (error) {
		console.error("Error fetching products:", error);
		return [];
	}
}

// Helper functions for cursor caching
// These are private functions (not exported) to avoid "use server" restrictions
function getCachedCursor(key: string): string | null {
	// Check memory cache first
	if ((globalThis as any).__CURSOR_CACHE?.[key]) {
		return (globalThis as any).__CURSOR_CACHE[key];
	}
	
	// Then check localStorage if available
	if (typeof window !== 'undefined') {
		try {
			const stored = localStorage.getItem(`cursor_${key}`);
			if (stored) return JSON.parse(stored);
		} catch (e) {
			// Silently fail on localStorage errors
		}
	}
	
	return null;
}

function storeCachedCursor(key: string, cursor: string): void {
	// Store in memory
	if (!(globalThis as any).__CURSOR_CACHE) (globalThis as any).__CURSOR_CACHE = {};
	(globalThis as any).__CURSOR_CACHE[key] = cursor;
	
	// Store in localStorage if available
	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem(`cursor_${key}`, JSON.stringify(cursor));
		} catch (e) {
			// Silently fail on localStorage errors
		}
	}
}

/**
 * Get paginated products with total count using the new use cache directive
 */
export async function getPaginatedProducts(page = 1, sort = "featured", perPage = 24) {
	// Use the new Next.js 15 cache directive
	"use cache";

	try {
		console.log(`[getPaginatedProducts] Starting for page ${page}, sort: ${sort}, perPage: ${perPage}`);
		
		// Create a performance marker for timing
		const startTime = Date.now();
		
		// Get products for the current page
		const products = await getProducts(page, perPage, sort);
		
		// Get total product count (cached separately to avoid fetching all products)
		const totalCount = await getProductCount();
		
		// Log performance metrics
		const endTime = Date.now();
		console.log(`[getPaginatedProducts] Completed in ${endTime - startTime}ms`);
		console.log(`[getPaginatedProducts] Returning ${products.length} products out of ${totalCount} total`);
		
		return {
			products,
			totalCount
		};
	} catch (error) {
		console.error("Error fetching paginated products:", error);
		return {
			products: [],
			totalCount: 0
		};
	}
}

/**
 * Get total product count using the new use cache directive
 */
export async function getProductCount() {
	"use cache";

	try {
		const { data } = await shopifyFetch<{ products: { totalCount: number } }>({
			query: `
				query getProductCount {
					products {
						totalCount
					}
				}
			`,
		});

		return data?.products?.totalCount || 0;
	} catch (error) {
		console.error("Error fetching product count:", error);
		return 0;
	}
}

/**
 * Get a limited number of products for blog pages
 * This optimized version only fetches the exact number of products needed
 */
export async function getLimitedProducts(limit = 4) {
	"use cache";
	
	try {
		console.log(`[getLimitedProducts] Fetching ${limit} products for blog page`);
		
		const { data } = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>({
			query: `
				query getLimitedProducts($first: Int!) {
					products(first: $first, sortKey: BEST_SELLING) {
						nodes {
							id
							title
							handle
							availableForSale
							tags
							priceRange {
								minVariantPrice {
									amount
									currencyCode
								}
							}
							variants(first: 1) {
								nodes {
									id
									availableForSale
									price {
										amount
										currencyCode
									}
								}
							}
							images(first: 1) {
								nodes {
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
			variables: {
				first: limit
			},
			cache: 'force-cache',
		});

		const products = data?.products?.nodes || [];
		console.log(`[getLimitedProducts] Fetched ${products.length} products`);
		
		return products;
	} catch (error) {
		console.error("Error fetching limited products:", error);
		return [];
	}
}

/**
 * Get products that match specific tags
 * This is optimized for blog pages that need to show related products
 */
export async function getProductsByTags(tags: string[], limit = 3) {
	"use cache";
	
	if (!tags || tags.length === 0) {
		console.log("[getProductsByTags] No tags provided, returning empty array");
		return [];
	}
	
	try {
		console.log(`[getProductsByTags] Fetching products with tags: ${tags.join(', ')}`);
		
		// Create a query with tag filter
		const tagFilter = tags.map(tag => `tag:${tag}`).join(' OR ');
		
		const { data } = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>({
			query: `
				query getProductsByTags($query: String!, $first: Int!) {
					products(first: $first, query: $query) {
						nodes {
							id
							title
							handle
							availableForSale
							tags
							priceRange {
								minVariantPrice {
									amount
									currencyCode
								}
							}
							variants(first: 1) {
								nodes {
									id
									availableForSale
									price {
										amount
										currencyCode
									}
								}
							}
							images(first: 1) {
								nodes {
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
			variables: {
				query: tagFilter,
				first: limit
			},
			cache: 'force-cache',
		});

		const products = data?.products?.nodes || [];
		console.log(`[getProductsByTags] Fetched ${products.length} products matching tags`);
		
		return products;
	} catch (error) {
		console.error("Error fetching products by tags:", error);
		return [];
	}
}
