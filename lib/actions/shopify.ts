import type { ShopifyProduct, ShopifyCollection, ShopifyBlog, ShopifyBlogArticle, ShopifyCart, CartItem } from "../types";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// Types for menu items
interface MenuItem {
	id: string;
	title: string;
	url: string;
	items?: MenuItem[];
}

// Types for error handling
interface ShopifyError extends Error {
	code?: string;
	type?: string;
}

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Shopify fetch helper with authentication
async function shopifyFetch<T>({ query, variables }: { query: string; variables?: any }): Promise<{ data: T }> {
	const endpoint = `https://${domain}/api/2024-01/graphql.json`;

	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Shopify-Storefront-Access-Token": storefrontAccessToken!,
		},
		body: JSON.stringify({ query, variables }),
	};

	try {
		const response = await fetch(endpoint, options);
		const json = await response.json();

		if (json.errors) {
			throw new Error(json.errors[0].message);
		}

		return json;
	} catch (error) {
		throw error;
	}
}

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
		console.error("Shopify API Error:", {
			message: shopifyError.message,
			code: shopifyError.code,
			type: shopifyError.type,
		});
		return null;
	}

	if (error instanceof Error) {
		console.error("API Error:", error.message);
		return null;
	}

	console.error("Unknown error:", error);
	return null;
}

// Cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();

function getCacheKey(name: string, params?: unknown): string {
	return `${name}:${JSON.stringify(params)}`;
}

async function withCache<T>(key: string, fn: () => Promise<T>): Promise<T> {
	const cacheKey = getCacheKey(key);
	const cached = cache.get(cacheKey);

	if (cached && cached.timestamp > Date.now() - CACHE_TTL) {
		return cached.data;
	}

	const data = await fn();
	cache.set(cacheKey, {
		data,
		timestamp: Date.now(),
	});

	return data;
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

// API Functions with improved error handling and caching
export async function getCollection(handle: string): Promise<ShopifyCollection | null> {
	try {
		return await withCache(`collection:${handle}`, () =>
			withRetry(async () => {
				const { data } = await shopifyFetch<{ collection: ShopifyCollection }>({
					query: `
            query GetCollection($handle: String!) {
              collection(handle: $handle) {
                ...CollectionFragment
              }
            }
            ${COLLECTION_FRAGMENT}
          `,
					variables: { handle },
				});
				return data.collection;
			})
		);
	} catch (error) {
		return handleShopifyError(error);
	}
}

export async function getCollections(): Promise<ShopifyCollection[]> {
	try {
		return await withCache("collections", () =>
			withRetry(async () => {
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
				});
				return data.collections.edges.map((edge) => edge.node);
			})
		);
	} catch (error) {
		return handleShopifyError(error) ?? [];
	}
}

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
	try {
		return await withCache(`product:${handle}`, () =>
			withRetry(async () => {
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
					variables: { handle },
				});
				return data.product;
			})
		);
	} catch (error) {
		return handleShopifyError(error);
	}
}

export async function getProducts(): Promise<ShopifyProduct[]> {
	try {
		return await withCache("products", () =>
			withRetry(async () => {
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
				});

				return data.products.edges.map(({ node }) => ({
					...node,
					rating: parseFloat(node.metafields?.[0]?.value || "0"),
				}));
			})
		);
	} catch (error) {
		return handleShopifyError(error) ?? [];
	}
}

// Get main menu items
export async function getMainMenu(): Promise<MenuItem[]> {
	try {
		return await withCache("mainMenu", () =>
			withRetry(async () => {
				const { data } = await shopifyFetch<{
					menu: {
						items: Array<{
							id: string;
							title: string;
							url: string;
							items?: Array<{
								id: string;
								title: string;
								url: string;
							}>;
						}>;
					};
				}>({
					query: `
						query GetMainMenu {
							menu(handle: "main-menu") {
								items {
									id
									title
									url
									items {
										id
										title
										url
									}
								}
							}
						}
					`,
				});

				return data.menu.items.map((item) => ({
					...item,
					items: item.items?.map((subItem) => ({
						...subItem,
						url: transformShopifyUrl(subItem.url),
					})),
					url: transformShopifyUrl(item.url),
				}));
			})
		);
	} catch (error) {
		console.error("Failed to fetch main menu:", error);
		return [];
	}
}

// Helper to transform Shopify URLs
function transformShopifyUrl(shopifyUrl: string): string {
	// Remove domain if present
	const url = shopifyUrl.replace(/^https?:\/\/[^\/]+/, "");

	// Special case for "all products" collection
	if (url.includes("/collections/all")) {
		return "/products";
	}

	// Transform collection URLs
	if (url.includes("/collections/")) {
		return `/collections/${url.split("/collections/")[1]}`;
	}

	// Transform product URLs
	if (url.includes("/products/")) {
		return `/products/${url.split("/products/")[1]}`;
	}

	// Transform pages
	if (url.includes("/pages/")) {
		return `/pages/${url.split("/pages/")[1]}`;
	}

	return url;
}

// Get all blogs
export async function getBlogs(): Promise<ShopifyBlog[]> {
	try {
		return await withCache("blogs", () =>
			withRetry(async () => {
				const { data } = await shopifyFetch<{
					blogs: {
						edges: Array<{
							node: ShopifyBlog;
						}>;
					};
				}>({
					query: `
            query GetBlogs {
              blogs(first: 100) {
                edges {
                  node {
                    ...BlogFragment
                  }
                }
              }
            }
            ${BLOG_FRAGMENT}
          `,
				});
				return data.blogs.edges.map(({ node }) => node);
			})
		);
	} catch (error) {
		return handleShopifyError(error) ?? [];
	}
}

// Get single blog
export async function getBlogByHandle(handle: string): Promise<ShopifyBlog | null> {
	try {
		return await withCache(`blog:${handle}`, () =>
			withRetry(async () => {
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
					variables: { handle },
				});
				return data.blog;
			})
		);
	} catch (error) {
		return handleShopifyError(error);
	}
}

// Add this function to fetch a single blog article
export async function getBlogArticle(blogHandle: string, articleHandle: string): Promise<ShopifyBlogArticle | null> {
	try {
		return await withCache(`article:${blogHandle}:${articleHandle}`, () =>
			withRetry(async () => {
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
						blogHandle,
						articleHandle,
					},
				});
				return data.blog.articleByHandle;
			})
		);
	} catch (error) {
		return handleShopifyError(error);
	}
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
	try {
		const { data } = await shopifyFetch<{ cart: ShopifyCart }>({
			query: `
				query GetCart($cartId: ID!) {
					cart(id: $cartId) {
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
											product {
												title
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
						}
					}
				}
			`,
			variables: {
				cartId,
			},
		});

		return data.cart;
	} catch (error) {
		console.error("Error getting cart:", error);
		return null;
	}
}

export async function createCart(lines?: CartItem[]): Promise<ShopifyCart> {
	try {
		const { data } = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>({
			query: `
					mutation CartCreate($input: CartInput) {
						cartCreate(input: $input) {
							cart {
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
													product {
														title
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
								}
							}
						}
					}
				`,
			variables: lines
				? {
						input: {
							lines: lines.map((line) => ({
								merchandiseId: line.merchandiseId,
								quantity: line.quantity,
							})),
						},
				  }
				: undefined,
		});

		return data.cartCreate.cart;
	} catch (error) {
		console.error("Error creating cart:", error);
		throw error;
	}
}

export async function addToCart(cartId: string, lines: CartItem[]): Promise<ShopifyCart> {
	try {
		const { data } = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart } }>({
			query: `
				mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
					cartLinesAdd(cartId: $cartId, lines: $lines) {
						cart {
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
												product {
													title
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
							}
						}
					}
				}
			`,
			variables: {
				cartId,
				lines,
			},
		});

		return data.cartLinesAdd.cart;
	} catch (error) {
		console.error("Error adding to cart:", error);
		throw error;
	}
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<ShopifyCart> {
	try {
		const { data } = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart } }>({
			query: `
				mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
					cartLinesUpdate(cartId: $cartId, lines: $lines) {
						cart {
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
												product {
													title
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
							}
						}
					}
				}
			`,
			variables: {
				cartId,
				lines: [{ id: lineId, quantity }],
			},
		});

		return data.cartLinesUpdate.cart;
	} catch (error) {
		console.error("Error updating cart line:", error);
		throw error;
	}
}

export async function removeFromCart(cartId: string, lineId: string): Promise<ShopifyCart> {
	try {
		const { data } = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart } }>({
			query: `
				mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
					cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
						cart {
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
												product {
													title
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
							}
						}
					}
				}
			`,
			variables: {
				cartId,
				lineIds: [lineId],
			},
		});

		return data.cartLinesRemove.cart;
	} catch (error) {
		console.error("Error removing from cart:", error);
		throw error;
	}
}
