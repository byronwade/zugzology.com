"use server";

import { unstable_cache } from "next/cache";
import { shopifyFetch } from "./client";
import type { ProductResponse, CollectionResponse } from "./types";
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

export const getProducts = unstable_cache(
	async () => {
		try {
			console.log("Fetching products from Shopify...");
			const { data } = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>({
				query: `
					query getProducts {
						products(first: 100, sortKey: CREATED_AT, reverse: true) {
							nodes {
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
								images(first: 1) {
									nodes {
										url
										altText
										width
										height
									}
								}
								metafields(identifiers: [
									{namespace: "custom", key: "rating"},
									{namespace: "custom", key: "rating_count"}
								]) {
									id
									namespace
									key
									value
									type
								}
								publishedAt
							}
						}
					}
				`,
				tags: [CACHE_TAGS.PRODUCT],
			});

			const products = data?.products?.nodes || [];
			console.log(`Successfully fetched ${products.length} products`);
			return products;
		} catch (error) {
			console.error("Error fetching products:", error);
			return [];
		}
	},
	["products"],
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
	async (handle: string) => {
		try {
			const { data } = await shopifyFetch<CollectionResponse>({
				query: `
					query getCollection($handle: String!) {
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
							products(first: 100) {
								nodes {
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
									images(first: 1) {
										nodes {
											url
											altText
											width
											height
										}
									}
									metafields(identifiers: [
										{namespace: "custom", key: "rating"},
										{namespace: "custom", key: "rating_count"}
									]) {
										id
										namespace
										key
										value
										type
									}
									publishedAt
								}
							}
						}
					}
				`,
				variables: { handle },
				tags: [`${CACHE_TAGS.COLLECTION}-${handle}`],
			});

			return data?.collection ?? null;
		} catch (error) {
			console.error("Error fetching collection:", error);
			return null;
		}
	},
	["collection"],
	{
		revalidate: CACHE_TIMES.COLLECTIONS,
		tags: [CACHE_TAGS.COLLECTION],
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

export async function getHeaderData() {
	"use cache";

	const cacheKey = "header-data";

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
			blogs: response.data.blogs?.edges?.map((edge: any) => edge.node) || [],
			products: response.data.products?.edges?.map((edge: any) => edge.node) || [],
		};
	} catch (error) {
		console.error("Error fetching header data:", error);
		return {
			shop: null,
			menuItems: [],
			blogs: [],
			products: [],
		};
	}
}
