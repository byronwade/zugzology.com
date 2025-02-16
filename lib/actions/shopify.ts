"use server";

import type { ShopifyProduct, ShopifyCollection, ShopifyBlog, ShopifyBlogArticle, ShopifyCart, CartItem } from "../types";
import { shopifyFetch as importedShopifyFetch } from "@/lib/shopify";
import { SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_STORE_DOMAIN } from "@/lib/constants";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

// Types for error handling
interface ShopifyError extends Error {
	code?: string;
	type?: string;
}

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Wrapper function for API calls with retry logic
async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		if (retries > 0 && error instanceof Error && (error.message.includes("ENETUNREACH") || error.message.includes("fetch failed"))) {
			console.warn(`API call failed, retrying... (${retries} attempts left)`);
			await delay(RETRY_DELAY);
			return withRetry(fn, retries - 1);
		}
		throw error;
	}
}

// Error handler
function handleShopifyError(error: unknown): null {
	if (error instanceof Error && "code" in error) {
		const shopifyError = error as ShopifyError;
		console.error("❌ [Shopify API] Error:", {
			message: shopifyError.message,
			code: shopifyError.code,
			type: shopifyError.type,
			stack: shopifyError.stack?.split("\n").slice(0, 3),
		});
		return null;
	}

	if (error instanceof Error) {
		console.error("❌ [Shopify API] Error:", {
			message: error.message,
			stack: error.stack?.split("\n").slice(0, 3),
		});
		return null;
	}

	console.error("❌ [Shopify API] Unknown error:", error);
	return null;
}

// Collection fragment for GraphQL queries
const COLLECTION_FRAGMENT = `
  fragment CollectionFragment on Collection {
    id
    title
    handle
    description
    image {
      url
      altText
      width
      height
    }
    products(first: 100) {
      edges {
        node {
          id
          title
          handle
          description
          productType
          vendor
          tags
          availableForSale
          options {
            id
            name
            values
          }
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
          variants(first: 100) {
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
                selectedOptions {
                  name
                  value
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
          publishedAt
        }
      }
    }
  }
`;

// Cart Fragment
const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              product {
                id
                title
                handle
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
          }
        }
      }
    }
  }
`;

// Blog fragment
const BLOG_FRAGMENT = `
  fragment BlogFragment on Blog {
    id
    title
    handle
    articles(first: 100) {
      edges {
        node {
          id
          title
          handle
          content
          contentHtml
          excerpt
          publishedAt
          author {
            name
          }
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

// Products fragment for GraphQL queries
const PRODUCTS_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    title
    handle
    description
    descriptionHtml
    productType
    vendor
    tags
    isGiftCard
    availableForSale
    options {
      id
      name
      values
    }
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
    variants(first: 100) {
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
          selectedOptions {
            name
            value
          }
          image {
            url
            altText
            width
            height
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
    publishedAt
  }
`;

// Helper function for performance logging
function logPerformance(startTime: number, operation: string, data?: any) {
	const duration = performance.now() - startTime;
	const stats = data
		? {
				count: data?.edges?.length || 0,
				dataSize: (JSON.stringify(data).length / 1024).toFixed(2) + "KB",
		  }
		: {};

	if (duration > 100 || stats.count === 0) {
		console.log(`⚡ [${operation}] ${duration.toFixed(2)}ms`, Object.keys(stats).length ? stats : "");
	}
}

const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

// Update shopifyFetch response type
interface ShopifyResponse<T> {
	data: T;
}

async function shopifyFetch<T>({ query, variables = {}, cache = "force-cache", tags = [] }: { query: string; variables?: Record<string, any>; cache?: RequestCache; tags?: string[] }): Promise<ShopifyResponse<T>> {
	try {
		const result = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
			},
			body: JSON.stringify({ query, variables }),
			cache,
			...(tags?.length && { next: { tags } }),
		});

		if (!result.ok) {
			const errorText = await result.text();
			throw new Error(`Failed to fetch from Shopify: ${result.statusText}\n${errorText}`);
		}

		const response = await result.json();

		if (response.errors) {
			throw new Error(`GraphQL Errors: ${JSON.stringify(response.errors)}`);
		}

		if (!response.data) {
			throw new Error("No data returned from Shopify");
		}

		return response;
	} catch (error) {
		if (error instanceof Error) {
			console.error("Error in shopifyFetch:", {
				message: error.message,
				query: query.slice(0, 100) + "...",
				variables,
			});
		} else {
			console.error("Unknown error in shopifyFetch:", error);
		}
		throw error;
	}
}

// Add at the top of the file after imports
const CACHE_TIMES = {
	PRODUCTS: 60 * 5, // 5 minutes
	COLLECTIONS: 60 * 5, // 5 minutes
	BLOGS: 60 * 15, // 15 minutes
	SETTINGS: 60 * 60, // 1 hour
} as const;

// Add this cache map
const MEMORY_CACHE = new Map<string, { data: any; timestamp: number }>();

// Add these constants at the top after imports
const PRODUCT_CACHE_TIME = 60 * 5; // 5 minutes
const COLLECTION_CACHE_TIME = 60 * 5; // 5 minutes
const MENU_CACHE_TIME = 60 * 15; // 15 minutes

// Add this near the top with other cache constants
const REQUEST_DEDUPLICATION_CACHE = new Map<string, Promise<any>>();

// Add these near the top with other constants
const GLOBAL_CACHE_KEY = "global_data";
const GLOBAL_CACHE_TIME = 60 * 15; // 15 minutes

// Replace the getProducts function
export async function getProducts(): Promise<ShopifyProduct[]> {
	"use cache";

	const cacheKey = "all_products";
	const now = Date.now();
	const cached = MEMORY_CACHE.get(cacheKey);

	// Return cached data if it exists and is not expired
	if (cached && now - cached.timestamp < CACHE_TIMES.PRODUCTS * 1000) {
		return cached.data;
	}

	const startTime = performance.now();

	try {
		type ProductsResponse = {
			products: {
				pageInfo: { hasNextPage: boolean; endCursor: string };
				edges: Array<{ node: ShopifyProduct }>;
			};
		};

		const allProducts: ShopifyProduct[] = [];
		let hasNextPage = true;
		let cursor: string | null = null;

		while (hasNextPage) {
			const query: string = `
				query GetProducts${cursor ? "($cursor: String!)" : ""} {
					products(first: 100${cursor ? ", after: $cursor" : ""}) {
						pageInfo {
							hasNextPage
							endCursor
						}
						edges {
							node {
								...ProductFragment
							}
						}
					}
				}
				${PRODUCTS_FRAGMENT}
			`;

			const response: ShopifyResponse<ProductsResponse> = await shopifyFetch<ProductsResponse>({
				query,
				variables: cursor ? { cursor } : {},
				cache: "force-cache",
				tags: ["products"],
			});

			const products = response.data.products.edges.map(({ node }: { node: ShopifyProduct }) => node);
			allProducts.push(...products);

			hasNextPage = response.data.products.pageInfo.hasNextPage;
			cursor = response.data.products.pageInfo.endCursor;
		}

		const duration = performance.now() - startTime;
		if (duration > 100) {
			console.log(`⚡ [Products] Fetched in ${duration.toFixed(2)}ms`, {
				count: allProducts.length,
				dataSize: (JSON.stringify(allProducts).length / 1024).toFixed(2) + "KB",
			});
		}

		// Cache the results
		MEMORY_CACHE.set(cacheKey, { data: allProducts, timestamp: now });

		return allProducts;
	} catch (error) {
		console.error("Failed to fetch products:", error);
		// Return cached data if available, even if expired
		return cached?.data || [];
	}
}

// Replace the getCollections function
export async function getCollections(): Promise<ShopifyCollection[]> {
	"use cache";

	const cacheKey = "all_collections";
	const now = Date.now();
	const cached = MEMORY_CACHE.get(cacheKey);

	// Return cached data if it exists and is not expired
	if (cached && now - cached.timestamp < CACHE_TIMES.COLLECTIONS * 1000) {
		return cached.data;
	}

	const startTime = performance.now();

	try {
		const { data } = await shopifyFetch<{
			collections: {
				edges: Array<{
					node: ShopifyCollection;
				}>;
			};
		}>({
			query: `
				query GetCollections {
					collections(first: 100, sortKey: TITLE) {
						edges {
							node {
								...CollectionFragment
							}
						}
					}
				}
				${COLLECTION_FRAGMENT}
			`,
			cache: "force-cache",
			tags: ["collections"],
		});

		const collections = data.collections.edges.map(({ node }) => node);

		// Cache the results
		MEMORY_CACHE.set(cacheKey, { data: collections, timestamp: now });

		const duration = performance.now() - startTime;
		if (duration > 100) {
			console.log(`⚡ [Collections] Fetched in ${duration.toFixed(2)}ms`, {
				count: collections.length,
				dataSize: (JSON.stringify(collections).length / 1024).toFixed(2) + "KB",
			});
		}

		return collections;
	} catch (error) {
		console.error("Failed to fetch collections:", error);
		// Return cached data if available, even if expired
		return cached?.data || [];
	}
}

// Add cache cleanup
function cleanupCache() {
	const now = Date.now();
	for (const [key, value] of MEMORY_CACHE.entries()) {
		const cacheTime = key.startsWith("all_products") ? CACHE_TIMES.PRODUCTS : key.startsWith("all_collections") ? CACHE_TIMES.COLLECTIONS : key.startsWith("blogs") ? CACHE_TIMES.BLOGS : CACHE_TIMES.SETTINGS;

		if (now - value.timestamp > cacheTime * 1000) {
			MEMORY_CACHE.delete(key);
		}
	}
}

// Run cache cleanup every minute
if (typeof setInterval !== "undefined") {
	setInterval(cleanupCache, 60 * 1000);
}

export async function getCollection(handle: string): Promise<ShopifyCollection | null> {
	if (!handle || typeof handle !== "string") {
		console.error("Invalid collection handle:", handle);
		return null;
	}

	const startTime = performance.now();
	try {
		const result = await withRetry(async () => {
			const { data } = await shopifyFetch<{ collection: ShopifyCollection }>({
				query: `
					query GetCollection($handle: String!) {
						collection(handle: $handle) {
							...CollectionFragment
						}
					}
					${COLLECTION_FRAGMENT}
				`,
				variables: { handle: handle.toLowerCase().trim() },
				cache: "force-cache",
				tags: [`collection-${handle}`],
			});

			if (!data?.collection) {
				console.warn(`Collection not found: ${handle}`);
				return null;
			}

			return data.collection;
		});

		const duration = performance.now() - startTime;
		if (duration > 100) {
			console.log(`⚡ [Collection] Fetched in ${duration.toFixed(2)}ms`);
		}

		return result;
	} catch (error) {
		console.error(
			`❌ [Collection] Error fetching "${handle}":`,
			error instanceof Error
				? {
						message: error.message,
						stack: error.stack?.split("\n").slice(0, 3),
				  }
				: "Unknown error"
		);
		return handleShopifyError(error);
	}
}

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
	"use cache";

	const cacheKey = `product_${handle}`;
	const now = Date.now();
	const cached = MEMORY_CACHE.get(cacheKey);

	if (cached && now - cached.timestamp < PRODUCT_CACHE_TIME * 1000) {
		return cached.data;
	}

	const query = `
		query getProduct($handle: String!) {
			product(handle: $handle) {
				...ProductFragment
				media(first: 20) {
					edges {
						node {
							... on MediaImage {
								id
								mediaContentType
								image {
									url
									altText
									width
									height
								}
							}
							... on Video {
								id
								mediaContentType
								sources {
									url
									mimeType
									format
									height
									width
								}
								previewImage {
									url
									altText
									width
									height
								}
							}
							... on ExternalVideo {
								id
								mediaContentType
								embedUrl
								host
								previewImage {
									url
									altText
									width
									height
								}
							}
						}
					}
				}
				youtubeVideos: metafield(namespace: "custom", key: "youtube_videos") {
					id
					value
					type
					references(first: 10) {
						edges {
							node {
								... on Metaobject {
									type
									fields {
										key
										value
										type
									}
								}
							}
						}
					}
				}
				recommendations: metafield(namespace: "shopify--discovery--product_recommendation", key: "related_products") {
					id
					value
					type
					references(first: 10) {
						edges {
							node {
								... on Product {
									...ProductFragment
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
												selectedOptions {
													name
													value
												}
											}
										}
									}
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
						}
					}
				}
			}
		}
		${PRODUCTS_FRAGMENT}
	`;

	try {
		const { data } = await shopifyFetch<{
			product: ShopifyProduct | null;
		}>({
			query,
			variables: { handle },
			cache: "force-cache",
			tags: [`product-${handle}`],
		});

		// Cache the result
		if (data?.product) {
			MEMORY_CACHE.set(cacheKey, {
				data: data.product,
				timestamp: now,
			});
		}

		return data?.product ?? null;
	} catch (error) {
		console.error("Error fetching product:", error);
		// Return cached data if available, even if expired
		return cached?.data || null;
	}
}

export async function getBlogs(): Promise<ShopifyBlog[]> {
	const startTime = performance.now();

	try {
		const result = await withRetry(async () => {
			const { data } = await shopifyFetch<{
				blogs: {
					edges: Array<{
						node: ShopifyBlog;
					}>;
				};
			}>({
				query: `
					query GetBlogs {
						blogs(first: 100, sortKey: HANDLE) {
							edges {
								node {
									...BlogFragment
								}
							}
						}
					}
					${BLOG_FRAGMENT}
				`,
				cache: "force-cache",
			});

			return data.blogs.edges.map(({ node }: { node: ShopifyBlog }) => node);
		});

		if (result.length > 0) {
			logPerformance(startTime, "Blogs", {
				count: result.length,
				articlesCount: result.reduce((acc: number, blog: ShopifyBlog) => acc + (blog.articles?.edges?.length || 0), 0),
			});
		}

		return result;
	} catch (error) {
		console.error("❌ [Blogs] Error:", error instanceof Error ? error.message : "Unknown error");
		return handleShopifyError(error) ?? [];
	}
}

export async function getCart(cartId: string) {
	const startTime = performance.now();

	try {
		const res = await shopifyFetch<{ cart: ShopifyCart }>({
			query: `
				query GetCart($cartId: ID!) {
					cart(id: $cartId) {
						...CartFragment
					}
				}
				${CART_FRAGMENT}
			`,
			variables: { cartId },
			cache: "no-store",
			tags: ["cart"],
		});

		logPerformance(startTime, "Cart", res.data.cart);
		return res.data.cart;
	} catch (error) {
		handleShopifyError(error);
		throw error;
	}
}

export async function createCart() {
	const startTime = performance.now();

	try {
		const res = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>({
			query: `
				mutation CreateCart {
					cartCreate {
						cart {
							...CartFragment
						}
					}
				}
				${CART_FRAGMENT}
			`,
			cache: "no-store",
			tags: ["cart"],
		});

		logPerformance(startTime, "Cart Create", res.data.cartCreate.cart);
		return res.data.cartCreate.cart;
	} catch (error) {
		handleShopifyError(error);
		throw error;
	}
}

export async function addToCart(cartId: string, lines: CartItem[]) {
	const startTime = performance.now();

	try {
		const res = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart } }>({
			query: `
				mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
					cartLinesAdd(cartId: $cartId, lines: $lines) {
						cart {
							...CartFragment
						}
					}
				}
				${CART_FRAGMENT}
			`,
			variables: { cartId, lines },
			cache: "no-store",
			tags: ["cart"],
		});

		logPerformance(startTime, "Add to Cart", res.data.cartLinesAdd.cart);
		return res.data.cartLinesAdd.cart;
	} catch (error) {
		handleShopifyError(error);
		throw error;
	}
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<ShopifyCart | null> {
	if (!cartId || !lineId || quantity < 0) {
		console.error("Invalid cart update parameters:", { cartId, lineId, quantity });
		return null;
	}

	try {
		const { data } = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart } }>({
			query: `
				mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
					cartLinesUpdate(cartId: $cartId, lines: $lines) {
						cart {
							...CartFragment
						}
					}
				}
				${CART_FRAGMENT}
			`,
			variables: {
				cartId,
				lines: [
					{
						id: lineId,
						quantity,
					},
				],
			},
			cache: "no-store",
		});

		return data.cartLinesUpdate.cart;
	} catch (error) {
		console.error(
			"❌ [Cart] Error updating cart line:",
			error instanceof Error
				? {
						message: error.message,
						stack: error.stack?.split("\n").slice(0, 3),
				  }
				: "Unknown error"
		);
		return null;
	}
}

export async function removeFromCart(cartId: string, lineId: string): Promise<ShopifyCart | null> {
	if (!cartId || !lineId) {
		console.error("Invalid cart remove parameters:", { cartId, lineId });
		return null;
	}

	try {
		const { data } = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart } }>({
			query: `
					mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
						cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
							cart {
								...CartFragment
							}
						}
					}
					${CART_FRAGMENT}
				`,
			variables: {
				cartId,
				lineIds: [lineId],
			},
			cache: "no-store",
		});

		return data.cartLinesRemove.cart;
	} catch (error) {
		console.error(
			"❌ [Cart] Error removing from cart:",
			error instanceof Error
				? {
						message: error.message,
						stack: error.stack?.split("\n").slice(0, 3),
				  }
				: "Unknown error"
		);
		return null;
	}
}

export async function getBlogByHandle(handle: string): Promise<ShopifyBlog | null> {
	if (!handle || typeof handle !== "string") {
		console.error("Invalid blog handle:", handle);
		return null;
	}

	const startTime = performance.now();

	try {
		const result = await withRetry(async () => {
			const { data } = await shopifyFetch<{
				blog: ShopifyBlog;
			}>({
				query: `
					query GetBlog($handle: String!) {
						blog(handle: $handle) {
							...BlogFragment
						}
					}
					${BLOG_FRAGMENT}
				`,
				variables: { handle: handle.toLowerCase().trim() },
				cache: "force-cache",
				tags: [`blog-${handle}`],
			});

			if (!data?.blog) {
				console.warn(`Blog not found: ${handle}`);
				return null;
			}

			return data.blog;
		});

		const duration = performance.now() - startTime;
		if (duration > 100) {
			const articleCount = result?.articles?.edges?.length || 0;
			console.log(`⚡ [Blog] Fetched "${handle}" in ${duration.toFixed(2)}ms | Articles: ${articleCount}`);
		}

		return result;
	} catch (error) {
		console.error(
			`❌ [Blog] Error fetching "${handle}":`,
			error instanceof Error
				? {
						message: error.message,
						stack: error.stack?.split("\n").slice(0, 3),
				  }
				: "Unknown error"
		);
		return handleShopifyError(error);
	}
}

export async function getBlogArticle(blogHandle: string, articleHandle: string): Promise<ShopifyBlogArticle | null> {
	if (!blogHandle || !articleHandle) {
		console.error("Invalid blog article parameters:", { blogHandle, articleHandle });
		return null;
	}

	try {
		const result = await withRetry(async () => {
			const { data } = await shopifyFetch<{
				blog: {
					articleByHandle: ShopifyBlogArticle;
				};
			}>({
				query: `
					query GetBlogArticle($blogHandle: String!, $articleHandle: String!) {
						blog(handle: $blogHandle) {
							articleByHandle(handle: $articleHandle) {
								id
								title
								handle
								content
								contentHtml
								excerpt
								publishedAt
								author {
									name
								}
								image {
									url
									altText
									width
									height
								}
							}
						}
					}
				`,
				variables: {
					blogHandle: blogHandle.toLowerCase().trim(),
					articleHandle: articleHandle.toLowerCase().trim(),
				},
				cache: "force-cache",
				tags: [`blog-${blogHandle}-article-${articleHandle}`],
			});

			if (!data?.blog?.articleByHandle) {
				console.warn(`Blog article not found: ${blogHandle}/${articleHandle}`);
				return null;
			}

			return data.blog.articleByHandle;
		});

		return result;
	} catch (error) {
		console.error(
			`❌ [Blog Article] Error fetching "${blogHandle}/${articleHandle}":`,
			error instanceof Error
				? {
						message: error.message,
						stack: error.stack?.split("\n").slice(0, 3),
				  }
				: "Unknown error"
		);
		return handleShopifyError(error);
	}
}

// Add revalidation helper
export async function revalidateCache(tags: string[]) {
	tags.forEach((tag) => revalidateTag(tag));
}

export async function getAllBlogPosts() {
	const blogs = await getBlogs();
	const allPosts = blogs.flatMap((blog) =>
		blog.articles.edges.map(({ node }) => ({
			...node,
			blogHandle: blog.handle,
			blogTitle: blog.title,
		}))
	);

	// Sort by date
	return allPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export interface SiteSettings {
	name: string;
	description: string;
	url: string;
	keywords: string[];
	images: Array<{
		url: string;
		width: number;
		height: number;
		altText?: string;
	}>;
	productsPageTitle: string;
	productsPageDescription: string;
	productsPageSections: Array<{
		title: string;
		content: string;
	}>;
}

// Replace the getSiteSettings function
export async function getSiteSettings(): Promise<SiteSettings> {
	const startTime = performance.now();

	try {
		const query = `
			query GetSiteSettings {
				shop {
					name
					description
					primaryDomain {
						url
					}
					metafields(identifiers: [
						{ namespace: "site_settings", key: "keywords" }
						{ namespace: "site_settings", key: "images" }
						{ namespace: "site_settings", key: "products_page_title" }
						{ namespace: "site_settings", key: "products_page_description" }
						{ namespace: "site_settings", key: "products_page_sections" }
					]) {
						key
						value
						type
					}
				}
			}
		`;

		const { data } = await shopifyFetch<{
			shop: {
				name: string;
				description: string;
				primaryDomain: {
					url: string;
				};
				metafields: Array<{
					key: string;
					value: string;
					type: string;
				}> | null;
			};
		}>({
			query,
			cache: "force-cache",
			tags: ["settings"],
		});

		if (!data?.shop) {
			throw new Error("No shop data returned");
		}

		// Parse and prepare settings
		const settings: SiteSettings = {
			name: data.shop.name || "Zugzology",
			description: data.shop.description || "Premium mushroom cultivation supplies and equipment",
			url: (data.shop.primaryDomain?.url || "https://zugzology.com").replace(/\/$/, ""),
			keywords: [],
			images: [],
			productsPageTitle: "Premium Mushroom Growing Supplies",
			productsPageDescription: "Discover our extensive collection of high-quality mushroom cultivation equipment and supplies.",
			productsPageSections: [],
		};

		// Parse metafields
		if (data.shop.metafields) {
			for (const metafield of data.shop.metafields) {
				if (!metafield?.key) continue;
				try {
					if (metafield.type === "json_string" && metafield.value) {
						const parsedValue = JSON.parse(metafield.value);
						if (metafield.key === "keywords" || metafield.key === "images" || metafield.key === "productsPageSections") {
							settings[metafield.key] = Array.isArray(parsedValue) ? parsedValue : [];
						} else {
							(settings as any)[metafield.key] = parsedValue;
						}
					} else {
						(settings as any)[metafield.key] = metafield.value;
					}
				} catch (e) {
					console.warn(`Failed to parse metafield ${metafield.key}:`, e);
				}
			}
		}

		const duration = performance.now() - startTime;
		console.log(`⚡ [Settings] Fetched in ${duration.toFixed(2)}ms`);

		return settings;
	} catch (error) {
		console.error("Failed to fetch site settings:", error);
		return {
			name: "Zugzology",
			description: "Premium mushroom cultivation supplies and equipment",
			url: "https://zugzology.com",
			keywords: [],
			images: [],
			productsPageTitle: "Premium Mushroom Growing Supplies",
			productsPageDescription: "Discover our extensive collection of high-quality mushroom cultivation equipment and supplies.",
			productsPageSections: [],
		};
	}
}

// Update getMenuItems to use caching
export async function getMenuItems() {
	"use cache";

	const cacheKey = "menu_items";
	const now = Date.now();
	const cached = MEMORY_CACHE.get(cacheKey);

	if (cached && now - cached.timestamp < MENU_CACHE_TIME * 1000) {
		return cached.data;
	}

	// ... rest of getMenuItems implementation
}

// Add this function for global data caching
async function getGlobalData() {
	const cacheKey = GLOBAL_CACHE_KEY;
	const now = Date.now();
	const cached = MEMORY_CACHE.get(cacheKey);

	if (cached && now - cached.timestamp < GLOBAL_CACHE_TIME * 1000) {
		return cached.data;
	}

	if (REQUEST_DEDUPLICATION_CACHE.has(cacheKey)) {
		return REQUEST_DEDUPLICATION_CACHE.get(cacheKey);
	}

	const fetchPromise = (async () => {
		try {
			const [menuItems, blogs, products] = await Promise.all([getMenuItems(), getBlogs(), getProducts()]);

			const result = { menuItems, blogs, products };

			MEMORY_CACHE.set(cacheKey, {
				data: result,
				timestamp: now,
			});

			return result;
		} finally {
			REQUEST_DEDUPLICATION_CACHE.delete(cacheKey);
		}
	})();

	REQUEST_DEDUPLICATION_CACHE.set(cacheKey, fetchPromise);
	return fetchPromise;
}

// Update getProductPageData to use global data
export async function getProductPageData(handle: string) {
	"use cache";

	const cacheKey = `product_page_${handle}`;
	const now = Date.now();
	const cached = MEMORY_CACHE.get(cacheKey);

	if (cached && now - cached.timestamp < PRODUCT_CACHE_TIME * 1000) {
		return cached.data;
	}

	if (REQUEST_DEDUPLICATION_CACHE.has(cacheKey)) {
		return REQUEST_DEDUPLICATION_CACHE.get(cacheKey);
	}

	const startTime = performance.now();

	const fetchPromise = (async () => {
		try {
			// Get the full product data with media and metafields
			const product = await getProduct(handle);

			// Get global data for menu and blogs
			const globalData = await getGlobalData();

			const result = {
				product: product || null,
				menuItems: globalData.menuItems,
				blogs: globalData.blogs,
			};

			MEMORY_CACHE.set(cacheKey, {
				data: result,
				timestamp: now,
			});

			const duration = performance.now() - startTime;
			if (duration > 100) {
				console.log(`⚡ [Product Page Data] ${duration.toFixed(2)}ms`, {
					productHandle: handle,
					hasProduct: !!product,
					menuItems: globalData.menuItems?.length ?? 0,
					blogs: globalData.blogs?.length ?? 0,
				});
			}

			return result;
		} catch (error) {
			console.error("Failed to fetch product page data:", error);
			return cached?.data || { product: null, menuItems: [], blogs: [] };
		} finally {
			REQUEST_DEDUPLICATION_CACHE.delete(cacheKey);
		}
	})();

	REQUEST_DEDUPLICATION_CACHE.set(cacheKey, fetchPromise);
	return fetchPromise;
}
