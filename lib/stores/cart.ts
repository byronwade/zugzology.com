"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shopifyClient } from "@/lib/shopify";
import type { Cart } from "@/lib/types/shopify";

interface CartState {
	cart: Cart | null;
	isOpen: boolean;
	openCart: () => void;
	closeCart: () => void;
	addToCart: (item: { merchandiseId: string; quantity: number }) => Promise<void>;
	removeFromCart: (lineId: string) => Promise<void>;
	updateLineItem: (lineId: string, quantity: number) => Promise<void>;
	loadCustomerCart: (customerId: string) => Promise<void>;
	clearCart: () => void;
}

// Create cart mutation
const createCartMutation = `#graphql
	mutation cartCreate($input: CartInput!) {
		cartCreate(input: $input) {
			cart {
				id
				checkoutUrl
				totalQuantity
				lines(first: 100) {
					edges {
						node {
							id
								quantity
								merchandise {
									... on ProductVariant {
										id
										title
										product {
											title
											handle
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
								cost {
									totalAmount {
										amount
										currencyCode
									}
								}
						}
					}
				}
				cost {
					totalAmount {
						amount
						currencyCode
					}
					subtotalAmount {
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
`;

// Add to cart mutation
const cartLinesAddMutation = `#graphql
	mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
		cartLinesAdd(cartId: $cartId, lines: $lines) {
			cart {
				id
				checkoutUrl
				totalQuantity
				lines(first: 100) {
					edges {
						node {
							id
							quantity
							merchandise {
								... on ProductVariant {
									id
									title
									product {
										title
										handle
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
							cost {
								totalAmount {
									amount
									currencyCode
								}
							}
						}
					}
				}
				cost {
					totalAmount {
						amount
						currencyCode
					}
					subtotalAmount {
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
`;

// Add update quantity mutation
const cartLinesUpdateMutation = `#graphql
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    handle
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
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
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
`;

// Add remove line items mutation
const cartLinesRemoveMutation = `#graphql
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        totalQuantity
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    handle
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
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
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
`;

export const useCart = create<CartState>()(
	persist(
		(set, get) => ({
			cart: null,
			isOpen: false,
			openCart: () => set({ isOpen: true }),
			closeCart: () => set({ isOpen: false }),

			addToCart: async ({ merchandiseId, quantity }) => {
				const { cart } = get();
				try {
					if (!cart) {
						const response = await shopifyClient.request(createCartMutation, {
							variables: {
								input: {
									lines: [{ merchandiseId, quantity }],
								},
							},
						});

						if (response.data?.cartCreate?.cart) {
							set({
								cart: response.data.cartCreate.cart,
								isOpen: true,
							});
						}
					} else {
						const response = await shopifyClient.request(cartLinesAddMutation, {
							variables: {
								cartId: cart.id,
								lines: [{ merchandiseId, quantity }],
							},
						});

						if (response.data?.cartLinesAdd?.cart) {
							set({
								cart: response.data.cartLinesAdd.cart,
								isOpen: true,
							});
						}
					}
				} catch (error) {
					console.error("Error adding to cart:", error);
					throw error;
				}
			},

			updateLineItem: async (lineId: string, quantity: number) => {
				const { cart } = get();
				if (!cart) return;

				try {
					const response = await shopifyClient.request(cartLinesUpdateMutation, {
						variables: {
							cartId: cart.id,
							lines: [
								{
									id: lineId,
									quantity: quantity,
								},
							],
						},
					});

					if (response.data?.cartLinesUpdate?.cart) {
						set({ cart: response.data.cartLinesUpdate.cart });
					}
				} catch (error) {
					console.error("Error updating cart:", error);
					throw error;
				}
			},

			removeFromCart: async (lineId: string) => {
				const { cart } = get();
				if (!cart) return;

				try {
					const response = await shopifyClient.request(cartLinesRemoveMutation, {
						variables: {
							cartId: cart.id,
							lineIds: [lineId],
						},
					});

					if (response.data?.cartLinesRemove?.cart) {
						set({ cart: response.data.cartLinesRemove.cart });
					}
				} catch (error) {
					console.error("Error removing from cart:", error);
					throw error;
				}
			},

			loadCustomerCart: async (customerId: string) => {
				try {
					const response = await shopifyClient.request(cartLinesAddMutation, {
						variables: { customerId },
					});

					if (response?.data?.customer?.cart) {
						set({ cart: response.data.customer.cart });
					}
				} catch (error) {
					console.error("Error loading customer cart:", error);
				}
			},

			clearCart: () => {
				set({ cart: null });
			},
		}),
		{
			name: "shopping-cart",
			skipHydration: true,
			storage: {
				getItem: (name) => {
					try {
						if (typeof window === "undefined") return null;
						const str = localStorage.getItem(name);
						return str ? JSON.parse(str) : null;
					} catch {
						return null;
					}
				},
				setItem: (name, value) => {
					try {
						if (typeof window !== "undefined") {
							localStorage.setItem(name, JSON.stringify(value));
						}
					} catch (err) {
						console.error("Error saving cart to localStorage:", err);
					}
				},
				removeItem: (name) => {
					try {
						if (typeof window !== "undefined") {
							localStorage.removeItem(name);
						}
					} catch (err) {
						console.error("Error removing cart from localStorage:", err);
					}
				},
			},
			partialize: (state) => ({
				cart: state.cart,
				isOpen: state.isOpen,
				openCart: state.openCart,
				closeCart: state.closeCart,
				addToCart: state.addToCart,
				removeFromCart: state.removeFromCart,
				updateLineItem: state.updateLineItem,
				loadCustomerCart: state.loadCustomerCart,
				clearCart: state.clearCart,
			}),
			// prettier-ignore: This line will not be formatted
		}
	)
);
