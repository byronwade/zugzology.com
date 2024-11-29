"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { shopifyFetch, PRODUCT_FRAGMENT, COLLECTION_FRAGMENT } from "../shopify";
import type { ShopifyProduct, ShopifyCollection } from "../types";

// Get all products
export async function getProducts(): Promise<ShopifyProduct[]> {
	const { data } = await shopifyFetch<{
		products: {
			edges: {
				node: ShopifyProduct;
			}[];
		};
	}>({
		query: `
      query GetProducts {
        products(first: 100) {
          edges {
            node {
              ...ProductFragment
            }
          }
        }
      }
      ${PRODUCT_FRAGMENT}
    `,
	});

	return data.products.edges.map((edge) => edge.node);
}

// Get a single product by handle
export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
	const { data } = await shopifyFetch<{
		product: ShopifyProduct | null;
	}>({
		query: `
      query GetProduct($handle: String!) {
        product(handle: $handle) {
          ...ProductFragment
        }
      }
      ${PRODUCT_FRAGMENT}
    `,
		variables: {
			handle,
		},
	});

	return data.product;
}

// Get all collections
export async function getCollections(): Promise<ShopifyCollection[]> {
	const { data } = await shopifyFetch<{
		collections: {
			edges: {
				node: ShopifyCollection;
			}[];
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
}

// Get a single collection by handle
export async function getCollection(handle: string): Promise<(ShopifyCollection & { products: ShopifyProduct[] }) | null> {
	const { data } = await shopifyFetch<{
		collection:
			| (ShopifyCollection & {
					products: {
						edges: {
							node: ShopifyProduct;
						}[];
					};
			  })
			| null;
	}>({
		query: `
      query GetCollection($handle: String!) {
        collection(handle: $handle) {
          ...CollectionFragment
          products(first: 100) {
            edges {
              node {
                ...ProductFragment
              }
            }
          }
        }
      }
      ${COLLECTION_FRAGMENT}
      ${PRODUCT_FRAGMENT}
    `,
		variables: {
			handle,
		},
	});

	if (!data.collection) return null;

	return {
		...data.collection,
		products: data.collection.products.edges.map((edge) => edge.node),
	};
}

// Create a cart
export async function createCart() {
	const { data } = await shopifyFetch<{
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

	const cartId = data.cartCreate.cart.id;

	// Store cart ID in cookies
	const cookieStore = await cookies();
	cookieStore.set("cartId", cartId, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30, // 30 days
	});

	return data.cartCreate.cart;
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
