"use server";

import { shopifyFetch } from "@/lib/api/shopify/client";
import { PRODUCTS_FRAGMENT, COLLECTION_FRAGMENT } from "@/lib/api/shopify/fragments";
import type { ShopifyProduct, ShopifyCollection } from "@/lib/types";
import type { ProductResponse, CollectionResponse } from "@/lib/api/shopify/types";

// Re-export all Shopify server actions from the main implementation
export * from "@/lib/api/shopify/actions";

/**
 * Get a product by handle using the new use cache directive
 */
export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
	"use cache";

	if (!handle) return null;

	try {
		const { data } = await shopifyFetch<ProductResponse>({
			query: `
        query getProduct($handle: String!) {
          product(handle: $handle) {
            ${PRODUCTS_FRAGMENT}
          }
        }
      `,
			variables: {
				handle,
			},
		});

		return data?.product ?? null;
	} catch (error) {
		console.error(`Error fetching product with handle ${handle}:`, error);
		return null;
	}
}

/**
 * Get a collection by handle using the new use cache directive
 */
export async function getCollectionByHandle(handle: string): Promise<any> {
	"use cache";

	if (!handle) return null;

	try {
		const { data } = await shopifyFetch<CollectionResponse>({
			query: `
        query getCollection($handle: String!) {
          collection(handle: $handle) {
            ${COLLECTION_FRAGMENT}
          }
        }
      `,
			variables: {
				handle,
			},
		});

		return data?.collection ?? null;
	} catch (error) {
		console.error(`Error fetching collection with handle ${handle}:`, error);
		return null;
	}
}

/**
 * Get all collections using the new use cache directive
 */
export async function getAllCollections(): Promise<ShopifyCollection[]> {
	"use cache";

	try {
		const { data } = await shopifyFetch<{ collections: { nodes: ShopifyCollection[] } }>({
			query: `
        query getAllCollections {
          collections(first: 250) {
            nodes {
              ${COLLECTION_FRAGMENT}
            }
          }
        }
      `,
		});

		return data?.collections?.nodes ?? [];
	} catch (error) {
		console.error("Error fetching all collections:", error);
		return [];
	}
}
