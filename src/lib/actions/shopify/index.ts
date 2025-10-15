"use server";

// Import specific async functions from the actions file instead of re-exporting everything
import {
	addToCart,
	createCart,
	getAllBlogPosts,
	getAllProducts,
	getBlogByHandle,
	getCart,
	getProductPageData,
	getSiteSettings as getSiteSettingsFromActions,
	removeFromCart,
	updateCartLine,
} from "@/lib/api/shopify/actions";
import { shopifyFetch } from "@/lib/api/shopify/client";
import { COLLECTION_FRAGMENT, PRODUCTS_FRAGMENT } from "@/lib/api/shopify/fragments";
import type { CollectionResponse, ProductResponse } from "@/lib/api/shopify/types";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/types";

// Re-export only the async functions we need
export {
	createCart,
	getCart,
	addToCart,
	updateCartLine,
	removeFromCart,
	getBlogByHandle,
	getProductPageData,
	getAllProducts,
	getSiteSettingsFromActions as getSiteSettings,
	getAllBlogPosts,
};

/**
 * Get a product by handle using the new use cache directive
 */
export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
	if (!handle) {
		return null;
	}

	try {
		const { data } = await shopifyFetch<ProductResponse>({
			query: `
        ${PRODUCTS_FRAGMENT}
        query getProduct($handle: String!) {
          product(handle: $handle) {
            ...ProductFragment
          }
        }
      `,
			variables: {
				handle,
			},
		});

		return data?.product ?? null;
	} catch (_error) {
		return null;
	}
}

/**
 * Get a collection by handle using the new use cache directive
 */
export async function getCollectionByHandle(handle: string): Promise<any> {
	if (!handle) {
		return null;
	}

	try {
		const { data } = await shopifyFetch<CollectionResponse>({
			query: `
        ${COLLECTION_FRAGMENT}
        query getCollection($handle: String!) {
          collection(handle: $handle) {
            ...CollectionFragment
          }
        }
      `,
			variables: {
				handle,
			},
		});

		return data?.collection ?? null;
	} catch (_error) {
		return null;
	}
}

/**
 * Get all collections using the new use cache directive
 */
export async function getAllCollections(): Promise<ShopifyCollection[]> {
	try {
		const { data } = await shopifyFetch<{ collections: { nodes: ShopifyCollection[] } }>({
			query: `
        ${COLLECTION_FRAGMENT}
        query getAllCollections {
          collections(first: 250) {
            nodes {
              ...CollectionFragment
            }
          }
        }
      `,
		});

		return data?.collections?.nodes ?? [];
	} catch (_error) {
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
				// Default to featured - use BEST_SELLING since MANUAL is not supported
				sortKey = "BEST_SELLING";
				reverse = false;
		}

		// Calculate pagination - we need to fetch products after a certain cursor
		// For the first page, we don't need a cursor
		let after = null;

		// For pages beyond the first, we need to get the cursor for pagination
		if (page > 1) {
			// Generate a cache key for this cursor
			const cursorKey = `product_cursor_${sort}_${(page - 1) * perPage}`;

			// Check if we have this cursor in memory
			const cachedCursor = getCachedCursor(cursorKey);

			if (cachedCursor) {
				after = cachedCursor;
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
					cache: "force-cache",
				});

				const edges = cursorResponse.data?.products?.edges || [];
				if (edges.length > 0) {
					after = edges.at(-1).cursor;
					// Store this cursor for future use
					storeCachedCursor(cursorKey, after);
				} else {
				}
			}
		}

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
			cache: "no-store",
		});

		const products = data?.products?.nodes || [];

		return products;
	} catch (_error) {
		return [];
	}
}

// Helper functions for cursor caching
// These are private functions (not exported) to avoid "use server" restrictions

/**
 * Get paginated products with total count using the new use cache directive
 */
export async function getPaginatedProducts(page = 1, sort = "featured", perPage = 24) {
	// Use the new Next.js 15 cache directive

	try {
		// Create a performance marker for timing
		const _startTime = Date.now();

		// Get products for the current page
		const products = await getProducts(page, perPage, sort);

		// Get total product count (cached separately to avoid fetching all products)
		const totalCount = await getProductCount();

		// Log performance metrics
		const _endTime = Date.now();

		return {
			products,
			totalCount,
		};
	} catch (_error) {
		return {
			products: [],
			totalCount: 0,
		};
	}
}

/**
 * Get total product count using the new use cache directive
 */
export async function getProductCount() {
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
	} catch (_error) {
		return 0;
	}
}

/**
 * Get a limited number of products for blog pages
 * This optimized version only fetches the exact number of products needed
 */
export async function getLimitedProducts(limit = 4) {
	try {
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
				first: limit,
			},
			cache: "force-cache",
		});

		const products = data?.products?.nodes || [];

		return products;
	} catch (_error) {
		return [];
	}
}

/**
 * Get products that match specific tags
 * This is optimized for blog pages that need to show related products
 */
export async function getProductsByTags(tags: string[], limit = 3) {
	if (!tags || tags.length === 0) {
		return [];
	}

	try {
		// Create a query with tag filter
		const tagFilter = tags.map((tag) => `tag:${tag}`).join(" OR ");

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
				first: limit,
			},
			cache: "force-cache",
		});

		const products = data?.products?.nodes || [];

		return products;
	} catch (_error) {
		return [];
	}
}
function getCachedCursor(key: string): string | null {
	// Only use memory cache on server
	if ((globalThis as any).__CURSOR_CACHE?.[key]) {
		return (globalThis as any).__CURSOR_CACHE[key];
	}
	return null;
}

function storeCachedCursor(key: string, cursor: string): void {
	// Only use memory cache on server
	if (!(globalThis as any).__CURSOR_CACHE) {
		(globalThis as any).__CURSOR_CACHE = {};
	}
	(globalThis as any).__CURSOR_CACHE[key] = cursor;
}
