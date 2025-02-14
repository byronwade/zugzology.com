"use server";

import type { ShopifyProduct, ShopifyCollection, ShopifyBlog, ShopifyBlogArticle, ShopifyCart, CartItem, ProductWithEdges } from "../types";
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
			throw new Error(`HTTP error! status: ${result.status}`);
		}

		const body = await result.json();

		if (body.errors) {
			throw new Error(body.errors[0].message);
		}

		return body;
	} catch (error) {
		throw error;
	}
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

export async function getCollections(): Promise<ShopifyCollection[]> {
	const startTime = performance.now();
	try {
		const result = await withRetry(async () => {
			const { data } = await shopifyFetch<
				ShopifyResponse<{
					collections: {
						edges: Array<{
							node: ShopifyCollection;
						}>;
					};
				}>
			>({
				query: `
					query GetCollections {
						collections(first: 100) {
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
			});
			return data.collections.edges.map((edge: { node: ShopifyCollection }) => edge.node);
		});

		logPerformance(startTime, "Collections", { edges: result });
		return result;
	} catch (error) {
		console.error("❌ [Collections] Error:", error instanceof Error ? error.message : "Unknown error");
		return handleShopifyError(error) ?? [];
	}
}

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
	if (!handle || typeof handle !== "string") {
		console.error("Invalid product handle:", handle);
		return null;
	}

	try {
		return await withRetry(async () => {
			const { data } = await shopifyFetch<{ product: ShopifyProduct }>({
				query: `
					query GetProduct($handle: String!) {
						product(handle: $handle) {
							id
							title
							description
							descriptionHtml
							handle
							productType
							vendor
							tags
							isGiftCard
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
										price {
											amount
											currencyCode
										}
										selectedOptions {
											name
											value
										}
										requiresShipping
										image {
											url
											altText
											width
											height
										}
									}
								}
							}
							images(first: 20) {
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
				`,
				variables: { handle: handle.toLowerCase().trim() },
				cache: "force-cache",
				tags: [`product-${handle}`],
			});

			if (!data?.product) {
				console.warn(`Product not found: ${handle}`);
				return null;
			}

			return data.product;
		});
	} catch (error) {
		console.error(
			`❌ [Product] Error fetching "${handle}":`,
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

// Get all products with pagination
export async function getProducts(): Promise<ShopifyProduct[]> {
	const startTime = performance.now();
	const allProducts: ShopifyProduct[] = [];
	let hasNextPage = true;
	let cursor: string | null = null;

	try {
		while (hasNextPage) {
			const query = `
				query GetProducts($cursor: String) {
					products(first: 100, after: $cursor) {
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

			const response = await shopifyFetch<{
				products: {
					pageInfo: { hasNextPage: boolean; endCursor: string };
					edges: { node: ShopifyProduct }[];
				};
			}>({
				query,
				variables: cursor ? { cursor } : {},
				cache: "force-cache",
				tags: ["products"],
			});

			const products = response.data.products.edges.map(({ node }) => node);
			allProducts.push(...products);

			hasNextPage = response.data.products.pageInfo.hasNextPage;
			cursor = response.data.products.pageInfo.endCursor;
		}

		logPerformance(startTime, "getProducts", { edges: allProducts });
		console.log("[SHOPIFY] Fetched products:", allProducts.length);
		return allProducts;
	} catch (error) {
		console.error("Failed to fetch products:", error);
		return [];
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
