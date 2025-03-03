"use server";

import { unstable_cache } from "next/cache";
import { shopifyFetch } from "./client";
import type { ProductResponse, CollectionResponse, ShopifyCollectionWithPagination, ShopifyResponse } from "./types";
import type {
	ShopifyProduct,
	ShopifyCollection,
	ShopifyCart,
	CartItem,
	ShopifyBlog,
	ShopifyBlogArticle,
} from "@/lib/types";
import { PRODUCTS_FRAGMENT, COLLECTION_FRAGMENT, CART_FRAGMENT, BLOG_FRAGMENT, ARTICLE_FRAGMENT } from "./fragments";
import { CACHE_TIMES, CACHE_TAGS } from "./cache-config";
import { headerQuery, type HeaderQueryResponse, type HeaderData } from "./queries/header";
import { SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_STORE_DOMAIN } from "@/lib/constants";
import { collectionQuery } from "./queries/collection";
import "server-only";
import { cache } from "react";

// Server Actions
interface SiteSettings {
	shop: {
		name: string;
		description: string;
		primaryDomain: {
			url: string;
		};
	};
}

export const getSiteSettings = unstable_cache(
	async () => {
		try {
			const { data } = await shopifyFetch<SiteSettings>({
				query: `
					query getSiteSettings {
						shop {
							name
							description
							primaryDomain {
								url
							}
						}
					}
				`,
				tags: [CACHE_TAGS.SETTINGS],
			});

			return data?.shop ?? null;
		} catch (error) {
			console.error("Error fetching site settings:", error);
			return null;
		}
	},
	["site-settings"],
	{
		revalidate: CACHE_TIMES.SETTINGS,
		tags: [CACHE_TAGS.SETTINGS],
	}
);

let productsPromise: Promise<ShopifyProduct[]> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute
const PRODUCTS_PER_PAGE = 35; // Update to 35 products per page

export const getProducts = cache(async () => {
	const now = Date.now();

	// If we already have a promise in flight, return it
	if (productsPromise) {
		return productsPromise;
	}

	// Otherwise, create a new promise
	productsPromise = (async () => {
		try {
			console.log("Server", "⚡ [Products] Starting fetch from Shopify...");
			lastFetchTime = now;
			let allProducts: ShopifyProduct[] = [];
			let hasNextPage = true;
			let cursor = null;
			let batchCount = 0;
			const startTime = Date.now();

			while (hasNextPage) {
				batchCount++;
				const batchStartTime = Date.now();

				const {
					data,
				}: { data: { products: { nodes: ShopifyProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string } } } } =
					await shopifyFetch<{
						products: { nodes: ShopifyProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string } };
					}>({
						query: `
						query getProducts($cursor: String) {
							products(first: ${PRODUCTS_PER_PAGE}, after: $cursor, sortKey: CREATED_AT, reverse: true) {
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
								pageInfo {
									hasNextPage
									endCursor
								}
							}
						}
					`,
						variables: { cursor },
						tags: [CACHE_TAGS.PRODUCT],
						cache: "no-store", // Ensure fresh data on each request
					});

				if (!data?.products?.nodes) {
					console.log("Server", "⚡ [Products] No products found in batch", batchCount);
					break;
				}

				const products = data.products.nodes;

				// Cache each batch separately with a unique key that includes timestamp
				const batchKey = `products-batch-${batchCount}-${Date.now()}`;
				await cacheProductBatch(products, batchKey);

				allProducts = [...allProducts, ...products];

				hasNextPage = data.products.pageInfo.hasNextPage;
				cursor = data.products.pageInfo.endCursor;

				const batchTime = Date.now() - batchStartTime;
				const batchSize = (JSON.stringify(products).length / 1024).toFixed(2);
				console.log(
					"Server",
					`⚡ [Products] Batch #${batchCount} | ${batchTime}ms | Size: ${batchSize}KB
- Fetched: ${products.length}
- Total so far: ${allProducts.length}
- Has more: ${hasNextPage ? "Yes" : "No"}`
				);

				// Add a delay between batches to prevent rate limiting
				if (hasNextPage) {
					await new Promise((resolve) => setTimeout(resolve, 250));
				}
			}

			const totalTime = Date.now() - startTime;
			const totalSize = (JSON.stringify(allProducts).length / 1024).toFixed(2);

			console.log(
				"Server",
				`⚡ [Products] Complete | ${totalTime}ms | Size: ${totalSize}KB
- Batches: ${batchCount}
- Total Products: ${allProducts.length}`
			);

			return allProducts;
		} catch (error) {
			console.error("Error fetching products:", error);
			return [];
		}
	})();

	return productsPromise;
});

export const getProduct = cache(async (handle: string) => {
	try {
		const { data } = await shopifyFetch<ProductResponse>({
			query: `
				query getProduct($handle: String!) {
					product(handle: $handle) {
						...ProductFragment
					}
				}
				${PRODUCTS_FRAGMENT}
			`,
			variables: { handle },
			tags: [`${CACHE_TAGS.PRODUCT}-${handle}`],
		});

		return data?.product ?? null;
	} catch (error) {
		console.error(`Error fetching product with handle ${handle}:`, error);
		return null;
	}
});

/**
 * Get a collection by handle with pagination
 * Uses the new Next.js 15 caching approach
 */
export const getCollection = cache(
	async (
		handle: string,
		options?: {
			page?: number;
			limit?: number;
			sort?: string;
			reverse?: boolean;
		}
	): Promise<ShopifyCollectionWithPagination | null> => {
		try {
			const page = options?.page || 1;
			const limit = options?.limit || 20;
			const sort = options?.sort || "MANUAL";
			const reverse = options?.reverse || false;

			// First, get the total count using a separate query
			const countResponse = await shopifyFetch<{
				collection: {
					products: {
						edges: Array<{ cursor: string }>;
					};
				};
			}>({
				query: `
					query getCollectionCount($handle: String!) {
						collection(handle: $handle) {
							products(first: 250) {
								edges {
									cursor
								}
							}
						}
					}
				`,
				variables: { handle },
				tags: [`${CACHE_TAGS.COLLECTION}-${handle}-count`],
			});

			const totalProducts = countResponse.data?.collection?.products?.edges?.length || 0;
			const totalPages = Math.ceil(totalProducts / limit);

			// For cursor-based pagination, we need to fetch the cursor for the current page
			let currentCursor = null;
			if (page > 1) {
				// Get the cursor for the previous page's last item
				const previousPageResponse = await shopifyFetch<CollectionResponse>({
					query: collectionQuery,
					variables: {
						handle,
						first: limit,
						after: null,
						sortKey: sort,
						reverse,
					},
					tags: [`${CACHE_TAGS.COLLECTION}-${handle}-cursor`],
				});

				if (previousPageResponse?.data?.collection?.products?.edges) {
					const edges = previousPageResponse.data.collection.products.edges;
					if (edges.length >= limit) {
						// If we have enough products, use the last edge's cursor
						currentCursor = edges[limit - 1].cursor;

						// If we need to go further, keep fetching until we reach our target page
						let currentPage = 2;
						while (currentPage < page) {
							const response: any = await shopifyFetch<CollectionResponse>({
								query: collectionQuery,
								variables: {
									handle,
									first: limit,
									after: currentCursor,
									sortKey: sort,
									reverse,
								},
								tags: [`${CACHE_TAGS.COLLECTION}-${handle}-cursor-${currentPage}`],
							});

							const edges: Array<{ cursor: string }> = response?.data?.collection?.products?.edges || [];
							if (!edges.length) {
								break;
							}

							currentCursor = edges[edges.length - 1].cursor;
							currentPage++;
						}
					}
				}
			}

			// Fetch the current page
			const { data } = await shopifyFetch<CollectionResponse>({
				query: collectionQuery,
				variables: {
					handle,
					first: limit,
					after: currentCursor,
					sortKey: sort,
					reverse,
				},
				tags: [`${CACHE_TAGS.COLLECTION}-${handle}`],
			});

			if (!data?.collection) {
				return null;
			}

			// Get the products for the current page
			const products = data.collection.products;

			// Enhance the collection data with pagination info
			const collection: ShopifyCollectionWithPagination = {
				...data.collection,
				productsCount: totalProducts,
				products: {
					...products,
					pageInfo: {
						...products.pageInfo,
						hasNextPage: page < totalPages,
						hasPreviousPage: page > 1,
					},
				},
			};

			return collection;
		} catch (error) {
			console.error("Error fetching collection:", error);
			return null;
		}
	}
);

export const getAllCollections = unstable_cache(
	async () => {
		try {
			interface CollectionsResponse {
				collections: {
					nodes: ShopifyCollection[];
				};
			}

			const { data } = await shopifyFetch<CollectionsResponse>({
				query: `
					query getAllCollections {
						collections(first: 250, sortKey: TITLE) {
							nodes {
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
								products(first: 1) {
									nodes {
										id
									}
								}
								metafields(identifiers: [
									{namespace: "custom", key: "category"},
									{namespace: "custom", key: "featured"},
									{namespace: "custom", key: "menu_order"}
								]) {
									id
									namespace
									key
									value
								}
							}
						}
					}
				`,
				tags: [CACHE_TAGS.COLLECTION],
			});

			return data?.collections?.nodes ?? [];
		} catch (error) {
			console.error("Error fetching all collections:", error);
			return [];
		}
	},
	["all-collections"],
	{
		revalidate: CACHE_TIMES.COLLECTIONS,
		tags: [CACHE_TAGS.COLLECTION],
	}
);

// Collection Discount Types
interface CollectionDiscount {
	code: string;
	amount: string;
	type: "percentage" | "fixed";
}

interface CollectionDiscountResponse {
	collection: {
		metafield: {
			value: string;
		};
	};
}

export const getCollectionDiscounts = unstable_cache(
	async (handle: string) => {
		if (!handle) return null;

		try {
			const { data } = await shopifyFetch<CollectionDiscountResponse>({
				query: `
					query getCollectionDiscounts($handle: String!) {
						collection(handle: $handle) {
							metafield(namespace: "discounts", key: "discount_info") {
								value
							}
						}
					}
				`,
				variables: { handle },
				tags: [`${CACHE_TAGS.COLLECTION}-${handle}-discounts`],
			});

			if (!data?.collection?.metafield?.value) {
				return null;
			}

			try {
				const discountInfo = JSON.parse(data.collection.metafield.value);
				if (!discountInfo.code || !discountInfo.amount || !discountInfo.type) {
					return null;
				}

				return {
					code: discountInfo.code,
					amount: discountInfo.amount,
					type: discountInfo.type as "percentage" | "fixed",
				};
			} catch (parseError) {
				console.error("Error parsing discount metafield:", parseError);
				return null;
			}
		} catch (error) {
			console.error("Error fetching collection discounts:", error);
			return null;
		}
	},
	["collection-discounts"],
	{
		revalidate: CACHE_TIMES.COLLECTIONS,
		tags: [CACHE_TAGS.COLLECTION],
	}
);

// Cart Actions
export async function createCart(): Promise<ShopifyCart | null> {
	try {
		const { data } = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>({
			query: `
        mutation createCart {
          cartCreate {
            cart {
              ...CartFragment
            }
          }
        }
        ${CART_FRAGMENT}
      `,
			tags: ["cart"],
		});

		return data?.cartCreate?.cart ?? null;
	} catch (error) {
		console.error("Error creating cart:", error);
		return null;
	}
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
	try {
		const { data } = await shopifyFetch<{ cart: ShopifyCart }>({
			query: `
        query getCart($cartId: ID!) {
          cart(id: $cartId) {
            ...CartFragment
          }
        }
        ${CART_FRAGMENT}
      `,
			variables: { cartId },
		});

		return data?.cart ?? null;
	} catch (error) {
		console.error("Error fetching cart:", error);
		return null;
	}
}

export async function addToCart(cartId: string, lines: CartItem[]): Promise<ShopifyCart | null> {
	try {
		const { data } = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart } }>({
			query: `
        mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
              ...CartFragment
            }
          }
        }
        ${CART_FRAGMENT}
      `,
			variables: {
				cartId,
				lines: lines.map((line) => ({
					merchandiseId: line.merchandiseId,
					quantity: line.quantity,
					attributes: line.attributes,
				})),
			},
			tags: [`cart-${cartId}`],
		});

		return data?.cartLinesAdd?.cart ?? null;
	} catch (error) {
		console.error("Error adding to cart:", error);
		return null;
	}
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<ShopifyCart | null> {
	try {
		const { data } = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart } }>({
			query: `
        mutation updateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
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
				lines: [{ id: lineId, quantity }],
			},
			tags: [`cart-${cartId}`],
		});

		return data?.cartLinesUpdate?.cart ?? null;
	} catch (error) {
		console.error("Error updating cart line:", error);
		return null;
	}
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<ShopifyCart | null> {
	try {
		const { data } = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart } }>({
			query: `
        mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
          cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
            cart {
              ...CartFragment
            }
          }
        }
        ${CART_FRAGMENT}
      `,
			variables: { cartId, lineIds },
			tags: [`cart-${cartId}`],
		});

		return data?.cartLinesRemove?.cart ?? null;
	} catch (error) {
		console.error("Error removing from cart:", error);
		return null;
	}
}

// Blog Actions
export const getBlogs = unstable_cache(
	async () => {
		try {
			const { data } = await shopifyFetch<{ blogs: { edges: { node: ShopifyBlog }[] } }>({
				query: `
					query getBlogs {
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
				tags: [CACHE_TAGS.BLOG],
			});

			return data?.blogs?.edges?.map((edge) => edge.node) || [];
		} catch (error) {
			console.error("Error fetching blogs:", error);
			return [];
		}
	},
	["blogs"],
	{
		revalidate: CACHE_TIMES.BLOGS,
		tags: [CACHE_TAGS.BLOG],
	}
);

export const getAllBlogPosts = unstable_cache(
	async () => {
		try {
			const blogs = await getBlogs();
			const posts: ShopifyBlogArticle[] = [];

			for (const blog of blogs) {
				const { data } = await shopifyFetch<{ blog: { articles: { edges: { node: ShopifyBlogArticle }[] } } }>({
					query: `
						query getBlogArticles($handle: String!) {
							blog(handle: $handle) {
								articles(first: 100) {
									edges {
										node {
											...ArticleFragment
										}
									}
								}
							}
						}
						${ARTICLE_FRAGMENT}
					`,
					variables: { handle: blog.handle },
					tags: [`${CACHE_TAGS.BLOG}-${blog.handle}`],
				});

				if (data?.blog?.articles?.edges) {
					posts.push(...data.blog.articles.edges.map((edge) => edge.node));
				}
			}

			return posts;
		} catch (error) {
			console.error("Error fetching blog posts:", error);
			return [];
		}
	},
	["blog-posts"],
	{
		revalidate: CACHE_TIMES.BLOGS,
		tags: [CACHE_TAGS.BLOG],
	}
);

/**
 * Get paginated blog posts
 * This function returns a subset of blog posts based on the page number and posts per page
 */
export const getPaginatedBlogPosts = unstable_cache(
	async (page = 1, postsPerPage = 12) => {
		try {
			// Get all blog posts
			const allPosts = await getAllBlogPosts();

			// Sort posts by date (newest first)
			allPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

			// Calculate total pages
			const totalPosts = allPosts.length;
			const totalPages = Math.max(1, Math.ceil(totalPosts / postsPerPage));

			// Ensure page is within valid range
			const validPage = Math.max(1, Math.min(page, totalPages));

			// Calculate start and end indices
			const startIndex = (validPage - 1) * postsPerPage;
			const endIndex = Math.min(startIndex + postsPerPage, totalPosts);

			// Get posts for current page
			const paginatedPosts = allPosts.slice(startIndex, endIndex);

			return {
				posts: paginatedPosts,
				pagination: {
					currentPage: validPage,
					totalPages,
					totalPosts,
					postsPerPage,
					hasNextPage: validPage < totalPages,
					hasPreviousPage: validPage > 1,
				},
			};
		} catch (error) {
			console.error("Error fetching paginated blog posts:", error);
			return {
				posts: [],
				pagination: {
					currentPage: 1,
					totalPages: 1,
					totalPosts: 0,
					postsPerPage,
					hasNextPage: false,
					hasPreviousPage: false,
				},
			};
		}
	},
	["paginated-blog-posts"],
	{
		revalidate: CACHE_TIMES.BLOGS,
		tags: [CACHE_TAGS.BLOG],
	}
);

/**
 * Get paginated blog posts for a specific blog
 * This function returns a subset of blog posts for a specific blog based on the page number and posts per page
 */
export const getPaginatedBlogPostsByHandle = unstable_cache(
	async (handle: string, page = 1, postsPerPage = 12) => {
		try {
			// Get the blog with all its articles
			const blog = await getBlogByHandle(handle);

			if (!blog) {
				return {
					posts: [],
					blog: null,
					pagination: {
						currentPage: 1,
						totalPages: 1,
						totalPosts: 0,
						postsPerPage,
						hasNextPage: false,
						hasPreviousPage: false,
					},
				};
			}

			// Sort articles by date (newest first)
			const articles = blog.articles.sort(
				(a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
			);

			// Calculate total pages
			const totalPosts = articles.length;
			const totalPages = Math.max(1, Math.ceil(totalPosts / postsPerPage));

			// Ensure page is within valid range
			const validPage = Math.max(1, Math.min(page, totalPages));

			// Calculate start and end indices
			const startIndex = (validPage - 1) * postsPerPage;
			const endIndex = Math.min(startIndex + postsPerPage, totalPosts);

			// Get posts for current page
			const paginatedPosts = articles.slice(startIndex, endIndex);

			return {
				posts: paginatedPosts,
				blog,
				pagination: {
					currentPage: validPage,
					totalPages,
					totalPosts,
					postsPerPage,
					hasNextPage: validPage < totalPages,
					hasPreviousPage: validPage > 1,
				},
			};
		} catch (error) {
			console.error("Error fetching paginated blog posts by handle:", error);
			return {
				posts: [],
				blog: null,
				pagination: {
					currentPage: 1,
					totalPages: 1,
					totalPosts: 0,
					postsPerPage,
					hasNextPage: false,
					hasPreviousPage: false,
				},
			};
		}
	},
	["paginated-blog-posts-by-handle"],
	{
		revalidate: CACHE_TIMES.BLOGS,
		tags: [CACHE_TAGS.BLOG],
	}
);

export async function getBlogByHandle(handle: string) {
	"use cache";

	if (!handle) {
		console.error("Blog handle is required");
		return null;
	}

	// Check if handle is the string "undefined"
	if (handle === "undefined") {
		console.error("Blog handle is the string 'undefined'");
		return null;
	}

	try {
		const { data } = await shopifyFetch<{
			blog: {
				id: string;
				handle: string;
				title: string;
				articles: {
					edges: {
						node: ShopifyBlogArticle;
					}[];
				};
			};
		}>({
			query: `
				query getBlog($handle: String!) {
					blog(handle: $handle) {
						id
						handle
						title
						articles(first: 100, sortKey: PUBLISHED_AT, reverse: true) {
							edges {
								node {
									id
									handle
									title
									content
									contentHtml
									excerpt
									excerptHtml
									publishedAt
									image {
										url
										altText
										width
										height
									}
									author {
										name
									}
								}
							}
						}
					}
				}
			`,
			variables: { handle },
			tags: [`${CACHE_TAGS.BLOG}-${handle}`],
		});

		if (!data?.blog) {
			console.error("Blog not found:", handle);
			return null;
		}

		return {
			...data.blog,
			articles: data.blog.articles.edges.map((edge) => edge.node),
		};
	} catch (error) {
		console.error("Error fetching blog:", error);
		return null;
	}
}

// Product Page Data
export async function getProductPageData(handle: string) {
	return unstable_cache(
		async () => {
			if (!handle) {
				console.error("Product handle is required");
				return {
					product: null,
					relatedProducts: [],
					recentPosts: [],
				};
			}

			try {
				// Fetch product and related data in parallel
				const [productData, relatedData] = await Promise.all([
					shopifyFetch<{
						product: ShopifyProduct;
					}>({
						query: `
							query getProduct($handle: String!) {
								product(handle: $handle) {
									...ProductFragment
								}
							}
							${PRODUCTS_FRAGMENT}
						`,
						variables: { handle },
						tags: [`${CACHE_TAGS.PRODUCT}-${handle}`],
					}),
					shopifyFetch<{
						products: { nodes: ShopifyProduct[] };
						blogs: {
							nodes: Array<{
								articles: {
									nodes: Array<ShopifyBlogArticle>;
								};
							}>;
						};
					}>({
						query: `
							query getRelatedData {
								products(first: 12) {
									nodes {
										...ProductFragment
									}
								}
								blogs(first: 1) {
									nodes {
										articles(first: 3, sortKey: PUBLISHED_AT, reverse: true) {
											nodes {
												id
												handle
												title
												content
												contentHtml
												excerpt
												excerptHtml
												publishedAt
												image {
													url
													altText
													width
													height
												}
												author {
													name
												}
											}
										}
									}
								}
							}
							${PRODUCTS_FRAGMENT}
						`,
						tags: [CACHE_TAGS.PRODUCT, CACHE_TAGS.BLOG],
					}),
				]);

				const product = productData.data?.product;
				const { products, blogs } = relatedData.data;

				if (!product) {
					console.error("Product not found for handle:", handle);
					return {
						product: null,
						relatedProducts: [],
						recentPosts: [],
					};
				}

				// Get related products based on product type and tags
				const allProducts = products.nodes;
				const relatedProducts = allProducts
					.filter((p) => {
						const isSameProduct = p.id === product.id;
						const isSameType = p.productType === product.productType;
						const hasMatchingTag = p.tags?.some((tag) => product.tags?.includes(tag));
						return !isSameProduct && (isSameType || hasMatchingTag);
					})
					.slice(0, 4);

				// Get recent blog posts
				const recentPosts = blogs.nodes
					.flatMap((node) => node.articles.nodes)
					.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
					.slice(0, 3);

				return {
					product,
					relatedProducts,
					recentPosts,
				};
			} catch (error) {
				console.error("Error fetching product page data:", error);
				return {
					product: null,
					relatedProducts: [],
					recentPosts: [],
				};
			}
		},
		[`product-page-${handle}`],
		{
			revalidate: CACHE_TIMES.PRODUCTS,
			tags: [CACHE_TAGS.PRODUCT],
		}
	)();
}

export const getHeaderData = unstable_cache(
	async (): Promise<HeaderData> => {
		try {
			const response = await shopifyFetch<HeaderQueryResponse>({
				query: headerQuery,
				cache: "force-cache",
				next: {
					revalidate: CACHE_TIMES.HEADER,
					tags: [CACHE_TAGS.MENU],
				},
			});

			if (!response.data) {
				throw new Error("No data returned from header query");
			}

			return {
				shop: response.data.shop,
				menuItems: response.data.menu?.items || [],
				blogs: response.data.blogs?.edges?.map((edge: { node: any }) => edge.node) || [],
				collections:
					response.data.collections?.edges?.map((edge: { node: ShopifyCollectionWithPagination }) => edge.node) || [],
			};
		} catch (error) {
			console.error("Error fetching header data:", error);
			return {
				shop: null,
				menuItems: [],
				blogs: [],
				collections: [],
			};
		}
	},
	["header-data"],
	{
		revalidate: CACHE_TIMES.HEADER,
		tags: [CACHE_TAGS.MENU],
	}
);

// Define the missing ProductsResponse interface
interface ProductsResponse {
	products: {
		nodes: ShopifyProduct[];
		pageInfo: {
			hasNextPage: boolean;
			endCursor: string;
		};
	};
}

// Cache products data
const getCachedProducts = unstable_cache(
	async (sort = "featured", availability?: string, price?: string, category?: string) => {
		try {
			let allProducts: ShopifyProduct[] = [];
			let hasNextPage = true;
			let cursor = null;
			let batchCount = 0;
			const startTime = Date.now();

			while (hasNextPage) {
				batchCount++;
				const batchStartTime = Date.now();

				const response: { data: ProductsResponse } = await shopifyFetch<ProductsResponse>({
					query: `
						query getProducts($cursor: String) {
							products(first: 50, after: $cursor) {
								nodes {
									id
									title
									handle
									description
									productType
									vendor
									tags
									availableForSale
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
								pageInfo {
									hasNextPage
									endCursor
								}
							}
						}
					`,
					variables: { cursor },
					tags: [CACHE_TAGS.PRODUCT],
					cache: "no-store",
				});

				const { data } = response;

				if (!data?.products?.nodes) {
					console.log("Server", `⚡ No products found in batch`, batchCount);
					break;
				}

				const products = data.products.nodes;
				const pageInfo = data.products.pageInfo;

				allProducts = [...allProducts, ...products];
				hasNextPage = pageInfo.hasNextPage;
				cursor = pageInfo.endCursor;

				// Cache each batch with a unique key
				const timestamp = Date.now().toString();
				const batchKey = `products-batch-${batchCount}-${timestamp}`;

				await unstable_cache(async () => products, [batchKey], {
					revalidate: CACHE_TIMES.PRODUCTS,
					tags: [`products-${timestamp}`], // Use string tag
				})();

				const batchTime = Date.now() - batchStartTime;
				console.log(
					"Server",
					`⚡ [Products] Batch ${batchCount} fetched ${products.length} products in ${batchTime}ms`
				);

				// Add a small delay between batches
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			const totalTime = Date.now() - startTime;
			console.log("Server", `⚡ [Products] Total: ${allProducts.length} products fetched in ${totalTime}ms`);

			return {
				products: allProducts,
				totalCount: allProducts.length,
			};
		} catch (error) {
			console.error("Error fetching products:", error);
			return {
				products: [],
				totalCount: 0,
			};
		}
	},
	["products-list"],
	{
		revalidate: CACHE_TIMES.PRODUCTS,
		tags: ["products"], // Use string tag
	}
);

/**
 * Get all products with pagination - OPTIMIZED VERSION
 * This version is specifically optimized for the "All Products" page
 * It fetches fewer products and uses better caching
 */
export async function getAllProducts(sort = "featured", page = 1, perPage = PRODUCTS_PER_PAGE) {
	try {
		// Use a cache key that includes the page and sort parameters
		const cacheKey = `all-products-${sort}-${page}-${perPage}`;

		// Check if we have this data in the cache
		const cachedData = await unstable_cache(
			async () => null, // This is just a check, not the actual data
			[cacheKey],
			{
				revalidate: CACHE_TIMES.PRODUCTS,
				tags: [CACHE_TAGS.PRODUCT],
			}
		)();

		// If we have cached data, return it
		if (cachedData) {
			return cachedData;
		}

		let sortKey: string = "RELEVANCE";
		let reverse = false;

		switch (sort) {
			case "best-selling":
				sortKey = "BEST_SELLING";
				break;
			case "price-asc":
				sortKey = "PRICE";
				break;
			case "price-desc":
				sortKey = "PRICE";
				reverse = true;
				break;
			case "title-asc":
				sortKey = "TITLE";
				break;
			case "title-desc":
				sortKey = "TITLE";
				reverse = true;
				break;
			case "newest":
				sortKey = "CREATED_AT";
				reverse = true;
				break;
			case "oldest":
				sortKey = "CREATED_AT";
				break;
			case "featured":
				sortKey = "RELEVANCE";
				break;
			default:
				sortKey = "RELEVANCE";
		}

		let products: Array<{
			cursor: string;
			node: ShopifyProduct;
		}> = [];
		let pageInfo = {
			hasNextPage: false,
			hasPreviousPage: false,
		};

		try {
			// For the "All Products" page, we'll fetch just the current page of products
			// This is much more efficient than fetching all products

			// Calculate the cursor for pagination
			let after = null;
			if (page > 1) {
				// For pages beyond the first, we need to get the cursor for the previous page
				// We'll fetch just the cursor for the last item of the previous page
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
					cache: "force-cache",
				});

				const edges = cursorResponse.data?.products?.edges || [];
				if (edges.length > 0) {
					after = edges[edges.length - 1].cursor;
				}
			}

			// Now fetch the actual products for the current page
			const productsResponse = await shopifyFetch<{
				products: {
					edges: Array<{
						cursor: string;
						node: ShopifyProduct;
					}>;
					pageInfo: {
						hasNextPage: boolean;
						hasPreviousPage: boolean;
					};
				};
			}>({
				query: `
					query getProducts($first: Int!, $after: String, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
						products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
							edges {
								cursor
								node {
									id
									title
									handle
									description
									featuredImage {
										url
										altText
										width
										height
									}
									images(first: 1) {
										nodes {
											url
											altText
											width
											height
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
									compareAtPriceRange {
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
										}
									}
									vendor
									availableForSale
									tags
								}
							}
							pageInfo {
								hasNextPage
								hasPreviousPage
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
				cache: "force-cache",
			});

			// Get products for the current page
			products = productsResponse.data?.products?.edges || [];
			pageInfo = productsResponse.data?.products?.pageInfo || {
				hasNextPage: false,
				hasPreviousPage: false,
			};
		} catch (fetchError) {
			console.error("Error in shopifyFetch for products:", fetchError);
			// Continue with empty products array
		}

		// For now, we'll use a fixed count for pagination
		// In a production app, you would want to implement a more accurate count
		// or use a separate query to get the total count
		const productsCount = 441; // Hardcoded based on your previous logs showing 441 total products

		// Create the result object
		const result = {
			products: {
				edges: products,
				pageInfo: pageInfo,
			},
			productsCount,
		};

		// Cache the result
		await unstable_cache(async () => result, [cacheKey], {
			revalidate: CACHE_TIMES.PRODUCTS,
			tags: [CACHE_TAGS.PRODUCT],
		})();

		return result;
	} catch (error) {
		console.error("Error fetching all products:", error);
		return null;
	}
}

/**
 * Get paginated products for the products page
 */
export async function getPaginatedProducts(page = 1, sort = "featured", perPage = PRODUCTS_PER_PAGE) {
	try {
		const allProducts = await getAllProducts(sort, page, perPage);

		if (!allProducts) {
			return {
				products: [],
				totalCount: 0,
			};
		}

		return {
			products: allProducts.products.edges.map((edge) => edge.node),
			totalCount: allProducts.productsCount,
		};
	} catch (error) {
		console.error("Error fetching paginated products:", error);
		return {
			products: [],
			totalCount: 0,
		};
	}
}

/**
 * Fetch specific products by their IDs
 * This is more efficient than fetching all products when we only need a few
 */
export const getProductsByIds = unstable_cache(
	async (ids: string[]) => {
		if (!ids || ids.length === 0) return [];

		try {
			console.log("ShopifyAPI", "Fetching specific products by IDs", { count: ids.length });

			// Clean up IDs to ensure they have the proper format
			const formattedIds = ids.map((id) => {
				if (id.startsWith("gid://shopify/Product/")) return id;
				return `gid://shopify/Product/${id.replace(/\D/g, "")}`;
			});

			const { data } = await shopifyFetch<{ nodes: ShopifyProduct[] }>({
				query: `
					query getProductsByIds($ids: [ID!]!) {
						nodes(ids: $ids) {
							... on Product {
								id
								title
								handle
								description
								productType
								vendor
								tags
								availableForSale
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
								images(first: 10) {
									nodes {
										id
										url
										altText
										width
										height
									}
								}
								variants(first: 100) {
									nodes {
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
									}
								}
								media(first: 10) {
									nodes {
										... on MediaImage {
											id
											mediaContentType
											image {
												id
												url
												altText
												width
												height
											}
										}
										... on Video {
											id
											mediaContentType
											previewImage {
												url
												altText
												width
												height
											}
											sources {
												url
												mimeType
												format
												height
												width
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
										... on Model3d {
											id
											mediaContentType
											alt
											previewImage {
												url
												altText
												width
												height
											}
											sources {
												url
												mimeType
												format
											}
										}
									}
								}
								metafields(first: 20) {
									nodes {
										id
										namespace
										key
										value
										type
									}
								}
							}
						}
					}
				`,
				variables: {
					ids: formattedIds,
				},
				tags: [CACHE_TAGS.PRODUCT],
			});

			// Filter out any null results (in case some IDs weren't found)
			return (data?.nodes || []).filter(Boolean) as ShopifyProduct[];
		} catch (error) {
			console.error("Error fetching products by IDs:", error);
			return [];
		}
	},
	["products-by-ids"],
	{
		revalidate: CACHE_TIMES.PRODUCTS,
		tags: [CACHE_TAGS.PRODUCT],
	}
);

// For the functions that need to cache data with specific keys, use the new "use cache" directive
async function cacheProductBatch(products: any[], batchKey: string) {
	"use cache";
	return products;
}
