"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { PRODUCT_FRAGMENT, COLLECTION_FRAGMENT } from "../shopify";
import type { ShopifyProduct, ShopifyCollection } from "../types";
import { handleEmptyResponse } from "../utils/shopify-helpers";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2024-01";

type ShopifyFetchOptions = {
	query: string;
	variables?: any;
	cache?: RequestCache;
};

async function shopifyFetch<T>({ query, variables, cache }: ShopifyFetchOptions): Promise<{ data: T }> {
	try {
		const response = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": storefrontAccessToken!,
			},
			body: JSON.stringify({ query, variables }),
			cache,
		});

		const result = await response.json();

		if (result.errors) {
			console.error("Shopify API Errors:", result.errors);
			throw new Error("Shopify API Error");
		}

		return result;
	} catch (error) {
		console.error("Shopify Fetch Error:", error);
		throw error;
	}
}

// Get all products
export async function getProducts(): Promise<ShopifyProduct[]> {
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

	// Transform the data to include rating
	return (
		data?.products?.edges?.map(({ node }) => ({
			...node,
			rating: parseFloat(node.metafields?.[0]?.value || "0"),
		})) || []
	);
}

// Get a single product by handle
export async function getProduct(handle: string): Promise<ShopifyProduct | undefined> {
	const { data } = await shopifyFetch<{
		product: ShopifyProduct;
	}>({
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

	return data?.product;
}

// Get all collections
export async function getCollections(): Promise<ShopifyCollection[]> {
	const result = await shopifyFetch<{
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

	return result.data?.collections?.edges?.map((edge) => edge.node) ?? [];
}

// Get a single collection by handle
export async function getCollection(handle: string): Promise<ShopifyCollection | null> {
	try {
		const { data } = await shopifyFetch<{
			collection: ShopifyCollection;
		}>({
			query: `
        query GetCollection($handle: String!) {
          collection(handle: $handle) {
            id
            title
            description
            handle
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
                  publishedAt
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
                  metafields(
                    identifiers: [
                      {namespace: "custom", key: "rating"}
                    ]
                  ) {
                    key
                    value
                  }
                }
              }
            }
            image {
              url
              altText
              width
              height
            }
          }
        }
      `,
			variables: { handle },
		});

		if (!data?.collection) {
			console.log("No collection found for handle:", handle);
			return null;
		}

		return data.collection;
	} catch (error) {
		console.error(`Error fetching collection ${handle}:`, error);
		throw error;
	}
}

// Create a cart
export async function createCart() {
	const result = await shopifyFetch<{
		cartCreate: {
			cart: {
				id: string;
				checkoutUrl: string;
			};
		};
	}>({
		query: `
      mutation CreateCart {
        cartCreate {
          cart {
            id
            checkoutUrl
          }
        }
      }
    `,
		cache: "no-store",
	});

	if (!result.data?.cartCreate?.cart) {
		throw new Error("Failed to create cart");
	}

	const cartId = result.data.cartCreate.cart.id;

	// Use the Next.js cookies API with await
	const cookieStore = await cookies();
	cookieStore.set({
		name: "cartId",
		value: cartId,
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30, // 30 days
	});

	return result.data.cartCreate.cart;
}

// Add items to cart
export async function addToCart(cartId: string, variantId: string, quantity: number) {
	const { data } = await shopifyFetch<{
		cartLinesAdd: {
			cart: {
				id: string;
				lines: {
					edges: {
						node: {
							id: string;
							quantity: number;
							merchandise: {
								id: string;
								title: string;
								price: {
									amount: string;
									currencyCode: string;
								};
								product: {
									title: string;
									images: {
										edges: {
											node: {
												url: string;
												altText: string | null;
											};
										}[];
									};
								};
							};
						};
					}[];
				};
				cost: {
					subtotalAmount: {
						amount: string;
						currencyCode: string;
					};
					totalAmount: {
						amount: string;
						currencyCode: string;
					};
					totalTaxAmount: {
						amount: string;
						currencyCode: string;
					};
				};
			};
		};
	}>({
		query: `
      mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      product {
                        title
                        images(first: 1) {
                          edges {
                            node {
                              url
                              altText
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
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
          }
        }
      }
    `,
		variables: {
			cartId,
			lines: [
				{
					merchandiseId: variantId,
					quantity,
				},
			],
		},
		cache: "no-store",
	});

	revalidateTag("cart");
	return data.cartLinesAdd.cart;
}

// Get cart
export async function getCart(cartId: string) {
	const { data } = await shopifyFetch<{
		cart: {
			id: string;
			lines: {
				edges: {
					node: {
						id: string;
						quantity: number;
						merchandise: {
							id: string;
							title: string;
							price: {
								amount: string;
								currencyCode: string;
							};
							product: {
								title: string;
								images: {
									edges: {
										node: {
											url: string;
											altText: string | null;
										};
									}[];
								};
							};
						};
					};
				}[];
			};
			cost: {
				subtotalAmount: {
					amount: string;
					currencyCode: string;
				};
				totalAmount: {
					amount: string;
					currencyCode: string;
				};
				totalTaxAmount: {
					amount: string;
					currencyCode: string;
				};
			};
		};
	}>({
		query: `
      query GetCart($cartId: ID!) {
        cart(id: $cartId) {
          id
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      title
                      images(first: 1) {
                        edges {
                          node {
                            url
                            altText
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
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
        }
      }
    `,
		variables: {
			cartId,
		},
		cache: "no-store",
	});

	return data.cart;
}

// Remove items from cart
export async function removeFromCart(cartId: string, lineIds: string[]) {
	const { data } = await shopifyFetch<{
		cartLinesRemove: {
			cart: {
				id: string;
				lines: {
					edges: {
						node: {
							id: string;
							quantity: number;
							merchandise: {
								id: string;
								title: string;
								price: {
									amount: string;
									currencyCode: string;
								};
								product: {
									title: string;
									images: {
										edges: {
											node: {
												url: string;
												altText: string | null;
											};
										}[];
									};
								};
							};
						};
					}[];
				};
				cost: {
					subtotalAmount: {
						amount: string;
						currencyCode: string;
					};
					totalAmount: {
						amount: string;
						currencyCode: string;
					};
					totalTaxAmount: {
						amount: string;
						currencyCode: string;
					};
				};
			};
		};
	}>({
		query: `
      mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      product {
                        title
                        images(first: 1) {
                          edges {
                            node {
                              url
                              altText
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
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
          }
        }
      }
    `,
		variables: {
			cartId,
			lineIds,
		},
		cache: "no-store",
	});

	revalidateTag("cart");
	return data.cartLinesRemove.cart;
}

// Update cart items
export async function updateCart(cartId: string, lines: { id: string; quantity: number }[]) {
	const { data } = await shopifyFetch<{
		cartLinesUpdate: {
			cart: {
				id: string;
				lines: {
					edges: {
						node: {
							id: string;
							quantity: number;
							merchandise: {
								id: string;
								title: string;
								price: {
									amount: string;
									currencyCode: string;
								};
								product: {
									title: string;
									images: {
										edges: {
											node: {
												url: string;
												altText: string | null;
											};
										}[];
									};
								};
							};
						};
					}[];
				};
				cost: {
					subtotalAmount: {
						amount: string;
						currencyCode: string;
					};
					totalAmount: {
						amount: string;
						currencyCode: string;
					};
					totalTaxAmount: {
						amount: string;
						currencyCode: string;
					};
				};
			};
		};
	}>({
		query: `
      mutation UpdateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      product {
                        title
                        images(first: 1) {
                          edges {
                            node {
                              url
                              altText
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
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
          }
        }
      }
    `,
		variables: {
			cartId,
			lines: lines.map((line) => ({
				id: line.id,
				quantity: line.quantity,
			})),
		},
		cache: "no-store",
	});

	revalidateTag("cart");
	return data.cartLinesUpdate.cart;
}

// Add this function to fetch menu items
export async function getMainMenu() {
	const { data } = await shopifyFetch<{
		menu: {
			items: Array<{
				id: string;
				title: string;
				url: string;
				items: Array<{
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

	return data?.menu?.items || [];
}

// Add this function to fetch blog data
export async function getBlog(handle: string) {
	const { data } = await shopifyFetch<{
		blog: {
			id: string;
			handle: string;
			title: string;
			articles: {
				edges: Array<{
					node: {
						id: string;
						title: string;
						handle: string;
						excerpt: string;
						publishedAt: string;
						content: string;
						author: {
							name: string;
						};
						image?: {
							url: string;
							altText: string;
							width: number;
							height: number;
						};
					};
				}>;
			};
		};
	}>({
		query: `
			query GetBlog($handle: String!) {
				blog(handle: $handle) {
					id
					handle
					title
					articles(first: 10) {
						edges {
							node {
								id
								title
								handle
								excerpt
								publishedAt
								content
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
			}
		`,
		variables: { handle },
	});

	return data?.blog;
}

// Add this function to fetch a specific blog article
export async function getBlogArticle(blogHandle: string, articleHandle: string) {
	const { data } = await shopifyFetch<{
		blog: {
			articleByHandle: {
				id: string;
				title: string;
				content: string;
				publishedAt: string;
				author: {
					name: string;
					bio?: string;
					email?: string;
				};
				image?: {
					url: string;
					altText: string;
					width: number;
					height: number;
				};
			};
		};
	}>({
		query: `
			query GetBlogArticle($blogHandle: String!, $articleHandle: String!) {
				blog(handle: $blogHandle) {
					articleByHandle(handle: $articleHandle) {
						id
						title
						content
						publishedAt
						author {
							name
							bio
							email
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
		variables: { blogHandle, articleHandle },
	});

	return data?.blog?.articleByHandle;
}

// Add this function to fetch all blogs
export async function getBlogs() {
	const { data } = await shopifyFetch<{
		blogs: {
			edges: Array<{
				node: {
					id: string;
					handle: string;
					title: string;
				};
			}>;
		};
	}>({
		query: `
			query GetBlogs {
				blogs(first: 10) {
					edges {
						node {
							id
							handle
							title
						}
					}
				}
			}
		`,
	});

	return data?.blogs?.edges.map((edge) => edge.node) || [];
}
