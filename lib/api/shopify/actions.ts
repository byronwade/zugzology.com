"use server";

import { unstable_cache } from "next/cache";
import { shopifyFetch } from "./client";
import type { ProductResponse, CollectionResponse, ShopifyCollectionWithPagination, ShopifyResponse } from "./types";
import type { ShopifyProduct, ShopifyCollection, ShopifyCart, CartItem, ShopifyBlog, ShopifyBlogArticle } from "@/lib/types";
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

export const getProducts = unstable_cache(
	async () => {
		const now = Date.now();

		// If there's a valid cached promise and it's not expired, return it
		if (productsPromise && now - lastFetchTime < CACHE_DURATION) {
			return productsPromise;
		}

		// Start a new request
		try {
			console.log("Server", "⚡ [Products] Starting fetch from Shopify...");
			lastFetchTime = now;
			productsPromise = (async () => {
				let allProducts: ShopifyProduct[] = [];
				let hasNextPage = true;
				let cursor = null;
				let batchCount = 0;
				const startTime = Date.now();

				while (hasNextPage) {
					batchCount++;
					const batchStartTime = Date.now();

					const { data }: { data: { products: { nodes: ShopifyProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string } } } } = await shopifyFetch<{ products: { nodes: ShopifyProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string } } }>({
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
					await unstable_cache(async () => products, [batchKey], {
						revalidate: CACHE_TIMES.PRODUCTS,
						tags: [CACHE_TAGS.PRODUCT],
					})();

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
			})();

			const result = await productsPromise;
			return result;
		} catch (error) {
			console.error("Server", "⚡ [Products] Error:", error);
			productsPromise = null; // Clear the promise on error
			lastFetchTime = 0; // Reset the fetch time on error
			return [];
		}
	},
	["products-list"],
	{
		revalidate: CACHE_TIMES.PRODUCTS,
		tags: [CACHE_TAGS.PRODUCT],
	}
);

export const getProduct = unstable_cache(
	async (handle: string) => {
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
			console.error("Error fetching product:", error);
			return null;
		}
	},
	["product"],
	{
		revalidate: CACHE_TIMES.PRODUCTS,
		tags: [CACHE_TAGS.PRODUCT],
	}
);

// Create a module-level cache for collections to prevent duplicate requests
const collectionsCache = new Map<string, ShopifyCollectionWithPagination | null>();

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
			const { page = 1, limit = PRODUCTS_PER_PAGE, sort = "MANUAL", reverse = false } = options || {};

			// Get the paginated collection data
			const response = await shopifyFetch({
				query: collectionQuery,
				variables: {
					handle,
					first: limit,
					sortKey: sort,
					reverse,
					after: page > 1 ? btoa(`arrayconnection:${(page - 1) * limit - 1}`) : null,
				},
				tags: [CACHE_TAGS.COLLECTION],
			});

			// Type assertion for the response
			const data = response.data as any;

			if (!data?.collection) {
				return null;
			}

			// Get the total product count from the current page
			// In a production environment, you would want to implement a more accurate count
			const totalProducts = data.collection.products.edges.length;

			return {
				...data.collection,
				productsCount: totalProducts,
				products: data.collection.products,
			};
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

export const getBlogByHandle = unstable_cache(
	async (handle: string) => {
		if (!handle) {
			console.error("Blog handle is required");
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
	},
	["blog"],
	{
		revalidate: CACHE_TIMES.BLOGS,
		tags: [CACHE_TAGS.BLOG],
	}
);

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
				collections: response.data.collections?.edges?.map((edge: { node: ShopifyCollectionWithPagination }) => edge.node) || [],
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
				console.log("Server", `⚡ [Products] Batch ${batchCount} fetched ${products.length} products in ${batchTime}ms`);

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
 * Get all products with pagination
 */
export async function getAllProducts(sort = "featured", page = 1, perPage = PRODUCTS_PER_PAGE) {
	try {
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

		// For pagination, we'll fetch all products and then slice the results
		// This is more reliable than trying to use cursors directly
		const allProductsResponse = await shopifyFetch<{
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
				query getProducts($first: Int!, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
					products(first: $first, sortKey: $sortKey, reverse: $reverse) {
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
								images(first: 10) {
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
								variants(first: 10) {
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
								options {
									id
									name
									values
								}
								tags
								vendor
								metafields(identifiers: [
									{namespace: "custom", key: "specifications"},
									{namespace: "custom", key: "features"},
									{namespace: "custom", key: "instructions"}
								]) {
									key
									namespace
									value
									type
								}
								media(first: 10) {
									nodes {
										mediaContentType
										alt
										... on MediaImage {
											id
											image {
												url
												width
												height
												altText
											}
										}
										... on Video {
											id
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
											}
										}
										... on ExternalVideo {
											id
											embedUrl
											host
											previewImage {
												url
												altText
											}
										}
										... on Model3d {
											id
											sources {
												url
												mimeType
												format
											}
											previewImage {
												url
												altText
											}
										}
									}
								}
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
				first: 250, // Fetch a large number of products
				sortKey,
				reverse,
			},
			cache: "no-store",
		});

		// Get all products
		const allProducts = allProductsResponse.data?.products?.edges || [];
		const productsCount = allProducts.length;

		// Calculate pagination
		const startIndex = (page - 1) * perPage;
		const endIndex = startIndex + perPage;

		// Slice the products array to get the current page
		const paginatedProducts = {
			edges: allProducts.slice(startIndex, endIndex),
			pageInfo: {
				hasNextPage: endIndex < productsCount,
				hasPreviousPage: page > 1,
			},
		};

		return {
			products: {
				edges: paginatedProducts.edges,
				pageInfo: paginatedProducts.pageInfo,
			},
			productsCount,
		};
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
