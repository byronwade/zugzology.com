export const runtime = "edge";

import { shopifyClient } from "@/lib/shopify";
import type { Cart } from "@/lib/types/shopify";

export const getCartQuery = `#graphql
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
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
              subtotalAmount {
                amount
                currencyCode
              }
            }
            merchandise {
              ... on ProductVariant {
                id
                title
                selectedOptions {
                  name
                  value
                }
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
`;

export async function getCart(cartId: string) {
	const response: { data?: { cart: Cart } } = await shopifyClient.request(getCartQuery, {
		variables: { cartId },
	});

	if (!response.data) {
		throw new Error("No data returned from Shopify");
	}

	return response.data.cart;
}
