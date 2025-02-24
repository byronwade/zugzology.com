"use server";

import { unstable_cache } from "next/cache";
import { shopifyFetch } from "./client";
import type { ProductResponse, CollectionResponse, ShopifyCollectionWithPagination } from "./types";
import type { ShopifyProduct, ShopifyCollection, ShopifyCart, CartItem, ShopifyBlog, ShopifyBlogArticle } from "@/lib/types";
import { PRODUCTS_FRAGMENT, COLLECTION_FRAGMENT, CART_FRAGMENT, BLOG_FRAGMENT, ARTICLE_FRAGMENT } from "./fragments";
import { CACHE_TIMES, CACHE_TAGS } from "./cache-config";
import { headerQuery, type HeaderQueryResponse, type HeaderData } from "./queries/header";
import { SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_STORE_DOMAIN } from "@/lib/constants";

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
const PRODUCTS_PER_PAGE = 50; // Increased batch size for better performance

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

export const getCollection = unstable_cache(
	async (handle: string, sort = "featured", page = 1) => {
		try {
			const PRODUCTS_PER_PAGE = 50;

			// Determine sort key and direction
			let sortKey = "MANUAL";
			let reverse = false;

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
				case "newest":
					sortKey = "CREATED_AT";
					reverse = true;
					break;
			}

			// First, get the total count
			const countResponse = await shopifyFetch<{
				collection: {
					productsCount: number;
				};
			}>({
				query: `
					query getCollectionCount($handle: String!) {
						collection(handle: $handle) {
							productsCount
						}
					}
				`,
				variables: { handle },
				cache: "no-store",
			});

			const totalCount = countResponse.data?.collection?.productsCount || 0;

			// Calculate cursor based on page number
			const cursor = page > 1 ? btoa(`cursor${(page - 1) * PRODUCTS_PER_PAGE - 1}`) : null;

			// Then fetch the paginated products
			const response = await shopifyFetch<CollectionResponse>({
				query: `
					query getCollection($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys!, $reverse: Boolean!) {
						collection(handle: $handle) {
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
							products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
								edges {
									cursor
									node {
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
								}
								pageInfo {
									hasNextPage
									hasPreviousPage
									startCursor
									endCursor
								}
							}
						}
					}
				`,
				variables: {
					handle,
					first: PRODUCTS_PER_PAGE,
					after: cursor,
					sortKey,
					reverse,
				},
				tags: [`${CACHE_TAGS.COLLECTION}-${handle}-page-${page}`],
				cache: "no-store",
			});

			const { data } = response;
			if (!data?.collection) return null;

			// Log performance metrics
			console.log("Server", `⚡ [Collection: ${handle}] Page ${page} | Products: ${data.collection.products.edges.length} | Total: ${totalCount}`);

			// Return collection with total count
			return {
				...data.collection,
				products: {
					...data.collection.products,
					totalCount,
				},
			};
		} catch (error) {
			console.error("Error fetching collection:", error);
			return null;
		}
	},
	["collection"],
	{
		revalidate: 60,
		tags: ["collection"],
	}
);

export const getAllCollections = unstable_cache(
	async () => {
		try {
			const { data } = await shopifyFetch({
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
			const { data } = await shopifyFetch<{ data: HeaderQueryResponse }>({
				query: headerQuery,
				cache: "force-cache",
				next: {
					revalidate: CACHE_TIMES.HEADER,
					tags: [CACHE_TAGS.MENU],
				},
			});

			if (!data) {
				throw new Error("No data returned from header query");
			}

			return {
				shop: data.shop,
				menuItems: data.menu?.items || [],
				blogs: data.blogs?.edges?.map((edge: { node: { title: string; handle: string } }) => edge.node) || [],
				products: data.products?.edges?.map((edge: { node: ShopifyProduct }) => edge.node) || [],
				collections: data.collections?.edges?.map((edge: { node: ShopifyCollection }) => edge.node) || [],
			};
		} catch (error) {
			console.error("Error fetching header data:", error);
			return {
				shop: null,
				menuItems: [],
				blogs: [],
				products: [],
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

				const response = await shopifyFetch<ProductsResponse>({
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
					tags: [CACHE_TAGS.PRODUCTS],
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

export const getPaginatedProducts = unstable_cache(
	async (page = 1, sort = "featured") => {
		try {
			const PRODUCTS_PER_PAGE = 50;

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
				case "newest":
					sortKey = "CREATED_AT";
					reverse = true;
					break;
				// featured is default
			}

			// First, get total count
			const countResponse = await shopifyFetch<{
				products: {
					totalCount: number;
				};
			}>({
				query: `
					query getProductsCount {
						products {
							totalCount
						}
					}
				`,
				cache: "no-store",
			});

			const totalCount = countResponse.data?.products?.totalCount || 0;

			// Calculate cursor based on page number
			const cursor = page > 1 ? btoa(`cursor${(page - 1) * PRODUCTS_PER_PAGE - 1}`) : null;

			// Fetch products with pagination info
			const response = await shopifyFetch<{
				products: {
					nodes: ShopifyProduct[];
					pageInfo: {
						hasNextPage: boolean;
						endCursor: string;
					};
				};
			}>({
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
				variables: {
					first: PRODUCTS_PER_PAGE,
					after: cursor,
					sortKey,
					reverse,
				},
				tags: [`products-page-${page}`],
				cache: "no-store",
			});

			const products = response.data?.products?.nodes || [];

			// Log performance metrics
			console.log("Server", `⚡ [Products] Page ${page} | Products: ${products.length} | Total: ${totalCount}`);

			return {
				products,
				totalCount,
			};
		} catch (error) {
			console.error("Error fetching paginated products:", error);
			return {
				products: [],
				totalCount: 0,
			};
		}
	},
	["products-paginated"],
	{
		revalidate: CACHE_TIMES.PRODUCTS,
		tags: ["products"],
	}
);
