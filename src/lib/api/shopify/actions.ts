"use server";

import { unstable_cache } from "next/cache";
import type {
	CartItem,
	ShopifyBlog,
	ShopifyBlogArticle,
	ShopifyCart,
	ShopifyCollection,
	ShopifyMenuItem,
	ShopifyPage,
	ShopifyProduct,
} from "@/lib/types";
import { CACHE_TAGS, CACHE_TIMES } from "./cache-config";
import { shopifyFetch } from "./client";
import { ARTICLE_FRAGMENT, BLOG_FRAGMENT, CART_FRAGMENT, MENU_ITEM_FRAGMENT, PRODUCTS_FRAGMENT } from "./fragments";
import { collectionQuery } from "./queries/collection";
import { type HeaderData, type HeaderQueryResponse, headerQuery } from "./queries/header";
import type { CollectionResponse, ShopifyCollectionWithPagination } from "./types";
import "server-only";
import { cache } from "react";

// Server Actions
type SiteSettings = {
	shop: {
		name: string;
		description: string;
		primaryDomain: {
			url: string;
		};
	};
};

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
		} catch (_error) {
			return null;
		}
	},
	["site-settings"],
	{
		revalidate: CACHE_TIMES.SETTINGS,
		tags: [CACHE_TAGS.SETTINGS],
	}
);

const PRODUCTS_PER_PAGE = 35; // Update to 35 products per page

export const getProducts = cache(async () => {
	try {
		let allProducts: ShopifyProduct[] = [];
		let hasNextPage = true;
		let cursor = null;
		let _batchCount = 0;

		while (hasNextPage) {
			_batchCount++;

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
					cache: "force-cache", // Cache products for better performance
				});

			if (!data?.products?.nodes) {
				break;
			}

			const products = data.products.nodes;

			allProducts = [...allProducts, ...products];

			hasNextPage = data.products.pageInfo.hasNextPage;
			cursor = data.products.pageInfo.endCursor;

			// Add a delay between batches to prevent rate limiting
			if (hasNextPage) {
				await new Promise((resolve) => setTimeout(resolve, 250));
			}
		}

		return allProducts;
	} catch (_error) {
		return [];
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
			const reverse = options?.reverse;

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

							currentCursor = edges.at(-1).cursor;
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
		} catch (_error) {
			return null;
		}
	}
);

export const getAllCollections = unstable_cache(
	async () => {
		try {
			type CollectionsResponse = {
				collections: {
					nodes: ShopifyCollection[];
				};
			};

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
		} catch (_error) {
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
type CollectionDiscount = {
	code: string;
	amount: string;
	type: "percentage" | "fixed";
};

type CollectionDiscountResponse = {
	collection: {
		metafield: {
			value: string;
		};
	};
};

export const getCollectionDiscounts = unstable_cache(
	async (handle: string) => {
		if (!handle) {
			return null;
		}

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
				if (!(discountInfo.code && discountInfo.amount && discountInfo.type)) {
					return null;
				}

				return {
					code: discountInfo.code,
					amount: discountInfo.amount,
					type: discountInfo.type as "percentage" | "fixed",
				};
			} catch (_parseError) {
				return null;
			}
		} catch (_error) {
			return null;
		}
	},
	["collection-discounts"],
	{
		revalidate: CACHE_TIMES.COLLECTIONS,
		tags: [CACHE_TAGS.COLLECTION],
	}
);

export async function getMenu(handle: string): Promise<ShopifyMenuItem[]> {
	try {
		const { data } = await shopifyFetch<{ menu: { items: ShopifyMenuItem[] } | null }>({
			query: `
				query getMenu($handle: String!) {
					menu(handle: $handle) {
						items {
							...MenuItemFragment
						}
					}
				}
				${MENU_ITEM_FRAGMENT}
			`,
			variables: { handle },
			tags: [`menu-${handle}`],
		});

		return data?.menu?.items ?? [];
	} catch (_error) {
		return [];
	}
}

export async function getPages(): Promise<ShopifyPage[]> {
	try {
		const { data } = await shopifyFetch<{ pages: { edges: { node: ShopifyPage }[] } | null }>({
			query: `
				query getPages {
					pages(first: 100) {
						edges {
							node {
								id
								title
								handle
								bodySummary
								onlineStoreUrl
							}
						}
					}
				}
			`,
			tags: ["pages"],
		});

		return data?.pages?.edges?.map((edge) => edge.node) ?? [];
	} catch (_error) {
		return [];
	}
}

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
	} catch (_error) {
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
	} catch (_error) {
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
	} catch (_error) {
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
	} catch (_error) {
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
	} catch (_error) {
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
		} catch (_error) {
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
		} catch (_error) {
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
		} catch (_error) {
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
		} catch (_error) {
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

/**
 * Get a specific article directly by blog and article handle
 * This is more efficient than fetching all articles
 */
export async function getArticleByHandles(blogHandle: string, articleHandle: string) {
	if (!(blogHandle && articleHandle)) {
		return null;
	}

	try {
		const { data } = await shopifyFetch<{
			blog: {
				articleByHandle: ShopifyBlogArticle | null;
			} | null;
		}>({
			query: `
				${ARTICLE_FRAGMENT}
				query getArticle($blogHandle: String!, $articleHandle: String!) {
					blog(handle: $blogHandle) {
						articleByHandle(handle: $articleHandle) {
							...ArticleFragment
						}
					}
				}
			`,
			variables: { blogHandle, articleHandle },
			tags: [`${CACHE_TAGS.BLOG}-${blogHandle}-${articleHandle}`],
		});

		return data?.blog?.articleByHandle || null;
	} catch (_error) {
		return null;
	}
}

export async function getBlogByHandle(handle: string) {
	if (!handle) {
		return null;
	}

	// Check if handle is the string "undefined"
	if (handle === "undefined") {
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
				${ARTICLE_FRAGMENT}
				query getBlog($handle: String!) {
					blog(handle: $handle) {
						id
						handle
						title
						articles(first: 100, sortKey: PUBLISHED_AT, reverse: true) {
							edges {
								node {
									...ArticleFragment
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
			// Silently return null - this is expected when looking up article handles as blog categories
			return null;
		}

		return {
			...data.blog,
			articles: data.blog.articles.edges.map((edge) => edge.node),
		};
	} catch (_error) {
		return null;
	}
}

// Product Page Data
export async function getProductPageData(handle: string) {
	if (!handle) {
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
				cache: "no-store", // Disable caching temporarily for debugging
			}),
			shopifyFetch<{
				products: { nodes: ShopifyProduct[] };
				blogs: {
					nodes: Array<{
						articles: {
							nodes: ShopifyBlogArticle[];
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
				cache: "no-store", // Disable caching temporarily for debugging
			}),
		]);

		const product = productData.data?.product;
		const { products, blogs } = relatedData.data;

		if (!product) {
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
	} catch (_error) {
		return {
			product: null,
			relatedProducts: [],
			recentPosts: [],
		};
	}
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
		} catch (_error) {
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
type ProductsResponse = {
	products: {
		nodes: ShopifyProduct[];
		pageInfo: {
			hasNextPage: boolean;
			endCursor: string;
		};
	};
};

// Cache products data
const _getCachedProducts = unstable_cache(
	async (_sort = "featured", _availability?: string, _price?: string, _category?: string) => {
		try {
			let allProducts: ShopifyProduct[] = [];
			let hasNextPage = true;
			let cursor = null;
			let _batchCount = 0;

			while (hasNextPage) {
				_batchCount++;

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
					break;
				}

				const products = data.products.nodes;
				const pageInfo = data.products.pageInfo;

				allProducts = [...allProducts, ...products];
				hasNextPage = pageInfo.hasNextPage;
				cursor = pageInfo.endCursor;

				// Add a small delay between batches
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			return {
				products: allProducts,
				totalCount: allProducts.length,
			};
		} catch (_error) {
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

		let sortKey = "RELEVANCE";
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
				// We'll use pagination to navigate through pages without exceeding Shopify's 250 limit
				const targetItems = (page - 1) * perPage;

				// If we need more than 250 items to reach our target, we'll need to paginate
				if (targetItems > 250) {
					// Fetch in chunks of 250 until we reach our target
					let currentItems = 0;
					let cursor = null;

					while (currentItems < targetItems) {
						const remainingItems = targetItems - currentItems;
						const fetchSize = Math.min(250, remainingItems);

						const cursorResponse = await shopifyFetch<{
							products: {
								edges: Array<{
									cursor: string;
								}>;
								pageInfo: {
									hasNextPage: boolean;
								};
							};
						}>({
							query: `
								query getProductCursor($first: Int!, $after: String, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
									products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
										edges {
											cursor
										}
										pageInfo {
											hasNextPage
										}
									}
								}
							`,
							variables: {
								first: fetchSize,
								after: cursor,
								sortKey,
								reverse,
							},
							cache: "force-cache",
						});

						const edges = cursorResponse.data?.products?.edges || [];
						if (edges.length === 0) {
							break;
						}

						cursor = edges.at(-1).cursor;
						currentItems += edges.length;

						if (!cursorResponse.data?.products?.pageInfo?.hasNextPage) {
							break;
						}
					}

					after = cursor;
				} else {
					// For smaller requests (≤250 items), we can fetch directly
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
							first: targetItems,
							sortKey,
							reverse,
						},
						cache: "force-cache",
					});

					const edges = cursorResponse.data?.products?.edges || [];
					if (edges.length > 0) {
						after = edges.at(-1).cursor;
					}
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
		} catch (_fetchError) {
			// Continue with empty products array
		}

		// For now, we'll use a fixed count for pagination
		// In a production app, you would want to implement a more accurate count
		// or use a separate query to get the total count
		// Fetch dynamic product count
		const countQuery = await shopifyFetch<{
			products: { pageInfo: { hasNextPage: boolean }; edges: Array<{ cursor: string }> };
		}>({ query: "query { products(first: 250) { pageInfo { hasNextPage } edges { cursor } } }", cache: "force-cache" });
		let productsCount = countQuery.data?.products?.edges?.length || 0;
		// If there are more products, we need to count them all
		if (countQuery.data?.products?.pageInfo?.hasNextPage) {
			let cursor = countQuery.data.products.edges.at(-1)?.cursor;
			let hasMore = true;
			while (hasMore && productsCount < 10_000) {
				const nextBatch = await shopifyFetch<{
					products: { pageInfo: { hasNextPage: boolean }; edges: Array<{ cursor: string }> };
				}>({
					query:
						"query($cursor: String) { products(first: 250, after: $cursor) { pageInfo { hasNextPage } edges { cursor } } }",
					variables: { cursor },
					cache: "force-cache",
				});
				productsCount += nextBatch.data?.products?.edges?.length || 0;
				hasMore = nextBatch.data?.products?.pageInfo?.hasNextPage;
				cursor = nextBatch.data?.products?.edges?.[nextBatch.data.products.edges.length - 1]?.cursor;
			}
		}

		// Create the result object
		const result = {
			products: {
				edges: products,
				pageInfo,
			},
			productsCount,
		};

		// Cache the result
		await unstable_cache(async () => result, [cacheKey], {
			revalidate: CACHE_TIMES.PRODUCTS,
			tags: [CACHE_TAGS.PRODUCT],
		})();

		return result;
	} catch (_error) {
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
	} catch (_error) {
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
		if (!ids || ids.length === 0) {
			return [];
		}

		try {
			// Clean up IDs to ensure they have the proper format
			const formattedIds = ids.map((id) => {
				if (id.startsWith("gid://shopify/Product/")) {
					return id;
				}
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
		} catch (_error) {
			return [];
		}
	},
	["products-by-ids"],
	{
		revalidate: CACHE_TIMES.PRODUCTS,
		tags: [CACHE_TAGS.PRODUCT],
	}
);

// Cache product batch function removed - not needed as React.cache handles request-level memoization

/**
 * Batch fetch products by handles
 * Optimized for wishlist - fetches multiple products in a single GraphQL query
 */
export const getProductsByHandles = async (handles: string[]): Promise<ShopifyProduct[]> => {
	if (!handles || handles.length === 0) {
		return [];
	}

	try {
		// Shopify doesn't have a direct way to fetch multiple products by handle
		// We'll need to use the search API or fetch them individually but in parallel

		// Strategy: Build a GraphQL query that fetches all products in parallel using aliases
		// This is much more efficient than sequential fetches

		// Limit to reasonable batch size to avoid query size issues
		const batchSize = 20;
		const batches: string[][] = [];

		for (let i = 0; i < handles.length; i += batchSize) {
			batches.push(handles.slice(i, i + batchSize));
		}

		const allProducts: ShopifyProduct[] = [];

		for (const batch of batches) {
			// Build the query with aliases for parallel fetching
			const queries = batch
				.map(
					(handle, index) => `
				product${index}: product(handle: "${handle}") {
					...ProductFragment
				}
			`
				)
				.join("\n");

			const query = `
				query getBatchProducts {
					${queries}
				}
				${PRODUCTS_FRAGMENT}
			`;

			const { data } = await shopifyFetch<Record<string, ShopifyProduct>>({
				query,
				tags: [CACHE_TAGS.PRODUCT],
				cache: "force-cache",
			});

			if (data) {
				// Extract products from the aliased response
				const products = Object.values(data).filter(Boolean);
				allProducts.push(...products);
			}
		}

		return allProducts;
	} catch (_error) {
		return [];
	}
};

/**
 * Get a single product by handle with caching
 * Used by various components that need individual product data
 */
export const getProductByHandle = cache(async (handle: string): Promise<ShopifyProduct | null> => {
	if (!handle) {
		return null;
	}

	try {
		const { data } = await shopifyFetch<{ product: ShopifyProduct }>({
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
			cache: "force-cache",
		});

		return data?.product || null;
	} catch (_error) {
		return null;
	}
});
