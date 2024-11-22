import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shopifyClient } from "@/lib/shopify";
import type { Cart } from "@/lib/types/shopify";
import { type StateCreator, type SetState, type GetState } from "zustand";

interface CartStore {
	cart: Cart | null;
	isOpen: boolean;
	openCart: () => void;
	closeCart: () => void;
	createCart: () => Promise<void>;
	addToCart: (variantId: string, quantity: number) => Promise<void>;
	removeFromCart: (lineId: string) => Promise<void>;
	updateLineItem: (lineId: string, quantity: number) => Promise<void>;
}

const createCartMutation = `#graphql
  mutation CartCreate {
    cartCreate {
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
          totalTaxAmount {
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
                subtotalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
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
      }
    }
  }
`;

const addToCartMutation = `#graphql
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
        checkoutUrl
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
      }
    }
  }
`;

const removeFromCartMutation = `#graphql
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        totalQuantity
        checkoutUrl
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
      }
    }
  }
`;

const updateCartMutation = `#graphql
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
        checkoutUrl
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
      }
    }
  }
`;

export const useCart = create<CartStore>()(
	persist(
		((set: SetState<CartStore>, get: GetState<CartStore>) => ({
			cart: null,
			isOpen: false,
			openCart: () => set({ isOpen: true }),
			closeCart: () => set({ isOpen: false }),
			createCart: async () => {
				try {
					const response = await shopifyClient.request(createCartMutation);
					console.log("Cart created:", response.data.cartCreate.cart);
					set({ cart: response.data.cartCreate.cart });
				} catch (error) {
					console.error("Error creating cart:", error);
				}
			},
			addToCart: async (variantId: string, quantity: number) => {
				const { cart, createCart } = get();

				try {
					set((state) => ({
						...state,
						isOpen: true,
						cart: state.cart
							? {
									...state.cart,
									totalQuantity: (state.cart.totalQuantity || 0) + quantity,
							  }
							: null,
					}));

					if (!cart) {
						await createCart();
					}

					const currentCart = get().cart;
					if (!currentCart) throw new Error("Failed to create cart");

					const response = await shopifyClient.request(addToCartMutation, {
						variables: {
							cartId: currentCart.id,
							lines: [{ merchandiseId: variantId, quantity }],
						},
					});

					set({ cart: response.data.cartLinesAdd.cart });
				} catch (error) {
					console.error("Error adding to cart:", error);
					set((state) => ({ ...state, cart: cart }));
				}
			},
			removeFromCart: async (lineId: string) => {
				const { cart } = get();
				if (!cart) return;

				try {
					const response = await shopifyClient.request(removeFromCartMutation, {
						variables: {
							cartId: cart.id,
							lineIds: [lineId],
						},
					});
					set({ cart: response.data.cartLinesRemove.cart });
				} catch (error) {
					console.error("Error removing from cart:", error);
				}
			},
			updateLineItem: async (lineId: string, quantity: number) => {
				const { cart } = get();
				if (!cart) return;

				try {
					const response = await shopifyClient.request(updateCartMutation, {
						variables: {
							cartId: cart.id,
							lines: [{ id: lineId, quantity }],
						},
					});
					set({ cart: response.data.cartLinesUpdate.cart });
				} catch (error) {
					console.error("Error updating cart:", error);
				}
			},
		})) as StateCreator<CartStore>,
		{
			name: "cart-storage",
			storage: {
				getItem: (name) => {
					const str = localStorage.getItem(name);
					return str ? JSON.parse(str) : null;
				},
				setItem: (name, value) => {
					if (typeof value === "string") {
						localStorage.setItem(name, value);
					} else {
						localStorage.setItem(name, JSON.stringify(value));
					}
				},
				removeItem: (name) => localStorage.removeItem(name),
			},
		}
	)
);
