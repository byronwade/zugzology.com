import { shopifyClient } from "@/lib/shopify/client";
import { cartFragment } from "@/lib/shopify/fragments";

interface CartResponse {
	cartLinesAdd?: {
		cart: CartType;
	};
	cartLinesRemove?: {
		cart: CartType;
	};
	cartLinesUpdate?: {
		cart: CartType;
	};
}

interface CartType {
	id: string;
	lines: {
		edges: Array<{
			node: {
				id: string;
				quantity: number;
				merchandise: {
					id: string;
					title: string;
					image?: {
						url: string;
						altText?: string;
					};
					product: {
						handle: string;
						title: string;
					};
				};
				cost: {
					totalAmount: {
						amount: string;
						currencyCode: string;
					};
				};
			};
		}>;
	};
	cost: {
		subtotalAmount: {
			amount: string;
			currencyCode: string;
		};
	};
}

export async function addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]) {
	const mutation = `#graphql
    mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${cartFragment}
        }
      }
    }
  `;

	const response = await shopifyClient.request<CartResponse>(mutation, {
		variables: {
			cartId,
			lines: lines.map((line) => ({
				merchandiseId: line.merchandiseId,
				quantity: line.quantity,
			})),
		},
	});

	return response.cartLinesAdd?.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]) {
	const mutation = `#graphql
    mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ${cartFragment}
        }
      }
    }
  `;

	const response = await shopifyClient.request<CartResponse>(mutation, {
		variables: {
			cartId,
			lineIds,
		},
	});

	return response.cartLinesRemove?.cart;
}

export async function updateCart(cartId: string, lines: { id: string; quantity: number }[]) {
	const mutation = `#graphql
    mutation UpdateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ${cartFragment}
        }
      }
    }
  `;

	const response = await shopifyClient.request<CartResponse>(mutation, {
		variables: {
			cartId,
			lines: lines.map((line) => ({
				id: line.id,
				quantity: line.quantity,
			})),
		},
	});

	return response.cartLinesUpdate?.cart;
}
