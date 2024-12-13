"use server";

import type { ShopifyProduct, ShopifyCollection, ShopifyBlog, ShopifyBlogArticle, ShopifyCart, CartItem } from "../types";
import { shopifyFetch } from "@/lib/shopify";

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
          availableForSale
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
                availableForSale
                quantityAvailable
                selectedOptions {
                  name
                  value
                }
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
    }
  }
`;

// Cart Fragment
const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
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
			const { data } = await shopifyFetch<{
				collections: {
					edges: Array<{
						node: ShopifyCollection;
					}>;
				};
			}>({
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
			return data.collections.edges.map((edge) => edge.node);
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
							handle
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
										compareAtPrice {
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

export async function getProducts(): Promise<ShopifyProduct[]> {
	const startTime = performance.now();

	try {
		const result = await withRetry(async () => {
			const { data } = await shopifyFetch<{
				products: {
					edges: Array<{
						node: ShopifyProduct & {
							metafields: Array<{
								value: string;
							}>;
						};
					}>;
				};
			}>({
				query: `
					query GetProducts {
						products(first: 100) {
							edges {
								node {
									id
									title
									handle
									description
									availableForSale
									productType
									vendor
									options {
										id
										name
										values
									}
									metafields(identifiers: [
										{namespace: "custom", key: "rating"}
									]) {
										value
									}
									priceRange {
										minVariantPrice {
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
												selectedOptions {
													name
													value
												}
												price {
													amount
													currencyCode
												}
											}
										}
									}
									images(first: 10) {
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
				`,
				cache: "force-cache",
			});

			return data.products.edges.map(({ node }) => ({
				...node,
				rating: parseFloat(node.metafields?.[0]?.value || "0"),
			}));
		});

		if (result.length > 0) {
			logPerformance(startTime, "Products", {
				count: result.length,
				imagesCount: result.reduce((acc, p) => acc + (p.images?.edges?.length || 0), 0),
				variantsCount: result.reduce((acc, p) => acc + (p.variants?.edges?.length || 0), 0),
			});
		}

		return result;
	} catch (error) {
		console.error("❌ [Products] Error:", error instanceof Error ? error.message : "Unknown error");
		return handleShopifyError(error) ?? [];
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

			return data.blogs.edges.map(({ node }) => node);
		});

		if (result.length > 0) {
			logPerformance(startTime, "Blogs", {
				count: result.length,
				articlesCount: result.reduce((acc, blog) => acc + (blog.articles?.edges?.length || 0), 0),
			});
		}

		return result;
	} catch (error) {
		console.error("❌ [Blogs] Error:", error instanceof Error ? error.message : "Unknown error");
		return handleShopifyError(error) ?? [];
	}
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
	if (!cartId || typeof cartId !== "string") {
		console.error("Invalid cart ID:", cartId);
		return null;
	}

	try {
		const { data } = await shopifyFetch<{ cart: ShopifyCart }>({
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
		});

		return data.cart;
	} catch (error) {
		console.error(
			"❌ [Cart] Error fetching cart:",
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

export async function createCart(lines?: CartItem[]): Promise<ShopifyCart | null> {
	try {
		const { data } = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>({
			query: `
				mutation CreateCart($lines: [CartLineInput!]) {
					cartCreate(input: { lines: $lines }) {
						cart {
							...CartFragment
						}
					}
				}
				${CART_FRAGMENT}
			`,
			variables: { lines },
			cache: "no-store",
		});

		return data.cartCreate.cart;
	} catch (error) {
		console.error(
			"❌ [Cart] Error creating cart:",
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

export async function addToCart(cartId: string, lines: CartItem[]): Promise<ShopifyCart | null> {
	if (!cartId || !lines?.length) {
		console.error("Invalid cart parameters:", { cartId, lines });
		return null;
	}

	try {
		const { data } = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart } }>({
			query: `
				mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
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
		});

		return data.cartLinesAdd.cart;
	} catch (error) {
		console.error(
			"❌ [Cart] Error adding to cart:",
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

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<ShopifyCart | null> {
	if (!cartId || !lineId || typeof quantity !== "number") {
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
