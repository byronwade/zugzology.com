"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addToCart, removeFromCart, updateCart } from "@/lib/actions/cart";
import { shopifyClient } from "@/lib/shopify/client";
import type { ShopifyCart } from "@/lib/types/shopify";

// Ensure cart data is serializable
type SerializableCart = Omit<ShopifyCart, "lines"> & {
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
};

interface CartStore {
	cart: SerializableCart | null;
	isLoading: boolean;
	isOpen: boolean;
	isHydrated: boolean;
	items: Array<{
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
	}>;
	cost?: {
		subtotalAmount: {
			amount: string;
			currencyCode: string;
		};
	};
	addToCart: (item: { merchandiseId: string; quantity: number }) => Promise<void>;
	removeItem: (lineId: string) => Promise<void>;
	updateCart: (lineId: string, quantity: number) => Promise<void>;
	setIsOpen: (open: boolean) => void;
	setCart: (cart: SerializableCart | null) => void;
	openCart: () => void;
	closeCart: () => void;
	setHydrated: (hydrated: boolean) => void;
	toggleCart: () => void;
	hydrate: () => void;
}

const createCartMutation = /* GraphQL */ `
	mutation CartCreate {
		cartCreate(input: { lines: [] }) {
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
									image {
										url
									}
									product {
										handle
										title
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
					subtotalAmount {
						amount
						currencyCode
					}
					totalAmount {
						amount
						currencyCode
					}
				}
			}
		}
	}
`;

export const useCart = create<CartStore>()(
	persist(
		(set, get) => ({
			cart: null,
			isLoading: false,
			isOpen: false,
			isHydrated: false,
			items: [],
			cost: undefined,

			setCart: (cart) => {
				if (typeof window === "undefined") return;

				const serializableCart = cart ? JSON.parse(JSON.stringify(cart)) : null;
				set({
					cart: serializableCart,
					items: serializableCart?.lines?.edges?.map((edge: any) => edge.node) || [],
					cost: serializableCart?.cost || undefined,
				});
			},
			setIsOpen: (open) => set({ isOpen: open }),
			openCart: () => set({ isOpen: true }),
			closeCart: () => set({ isOpen: false }),
			setHydrated: (hydrated) => set({ isHydrated: hydrated }),
			toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
			hydrate: () => {
				if (typeof window === "undefined") return;

				try {
					const storage = localStorage.getItem("cart-storage");
					if (storage) {
						const { state } = JSON.parse(storage);
						if (state?.cart) {
							set({
								cart: state.cart,
								items: state.cart?.lines?.edges?.map((edge: any) => edge.node) || [],
								cost: state.cart?.cost || undefined,
								isHydrated: true,
							});
						}
					}
				} catch (error) {
					console.error("Error hydrating cart:", error);
					set({ isHydrated: true });
				}
			},

			addToCart: async ({ merchandiseId, quantity }) => {
				try {
					set({ isLoading: true });
					let cartId = get().cart?.id;

					// If no cart exists, create one
					if (!cartId) {
						const response = await shopifyClient.mutation<{
							cartCreate: { cart: ShopifyCart };
						}>(createCartMutation);

						if (!response.data?.cartCreate?.cart) {
							throw new Error("Failed to create cart: No cart data returned");
						}

						cartId = response.data.cartCreate.cart.id;
						if (!cartId) {
							throw new Error("Failed to get cart ID");
						}

						get().setCart(response.data.cartCreate.cart as SerializableCart);
					}

					const updatedCart = await addToCart(cartId, merchandiseId, quantity);
					if (!updatedCart) {
						throw new Error("Failed to update cart");
					}

					get().setCart(updatedCart as SerializableCart);
					set({ isOpen: true });
				} catch (error) {
					console.error("Failed to add to cart:", error);
					if (error instanceof Error && error.message.includes("No cart found")) {
						get().setCart(null);
						return get().addToCart({ merchandiseId, quantity });
					}
					throw error;
				} finally {
					set({ isLoading: false });
				}
			},

			removeItem: async (lineId) => {
				try {
					set({ isLoading: true });
					const cartId = get().cart?.id;
					if (!cartId) {
						throw new Error("No cart found");
					}

					const updatedCart = await removeFromCart(cartId, [lineId]);
					if (!updatedCart) {
						throw new Error("Failed to remove from cart");
					}

					if (updatedCart.lines.edges.length === 0) {
						get().setCart(updatedCart as SerializableCart);
						set({ isOpen: false });
					} else {
						get().setCart(updatedCart as SerializableCart);
					}
				} catch (error) {
					console.error("Failed to remove from cart:", error);
					if (error instanceof Error && error.message.includes("No cart found")) {
						get().setCart(null);
					}
					throw error;
				} finally {
					set({ isLoading: false });
				}
			},

			updateCart: async (lineId, quantity) => {
				try {
					set({ isLoading: true });
					const cartId = get().cart?.id;
					if (!cartId) {
						throw new Error("No cart found");
					}

					if (quantity === 0) {
						return get().removeItem(lineId);
					}

					const updatedCart = await updateCart(cartId, lineId, quantity);
					if (!updatedCart) {
						throw new Error("Failed to update cart");
					}

					get().setCart(updatedCart as SerializableCart);
				} catch (error) {
					console.error("Failed to update cart:", error);
					if (error instanceof Error && error.message.includes("No cart found")) {
						get().setCart(null);
					}
					throw error;
				} finally {
					set({ isLoading: false });
				}
			},
		}),
		{
			name: "cart-storage",
			skipHydration: true,
			partialize: (state) => ({
				cart: state.cart,
				isOpen: state.isOpen,
			}),
		}
	)
);
