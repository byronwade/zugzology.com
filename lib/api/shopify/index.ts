"use server";
"use cache";

import { shopifyFetch } from "./client";
import { MEMORY_CACHE, CACHE_TIMES, getObjectSize } from "./cache";
import type { ProductResponse, CollectionResponse } from "./types";
import type { ShopifyProduct, ShopifyCollection } from "../../types";

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
	const cacheKey = `product_${handle}`;
	const now = Date.now();
	const cached = MEMORY_CACHE.get(cacheKey);

	if (cached && now - cached.timestamp < CACHE_TIMES.PRODUCTS * 1000) {
		return cached.data;
	}

	try {
		const { data } = await shopifyFetch<ProductResponse>({
			query: `
        query getProduct($handle: String!) {
          product(handle: $handle) {
            id
            title
            handle
            description
            descriptionHtml
            availableForSale
            variants(first: 1) {
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
                }
              }
            }
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
      `,
			variables: { handle },
			tags: [`product-${handle}`],
		});

		if (data?.product) {
			const size = getObjectSize(data.product);
			MEMORY_CACHE.set(cacheKey, {
				data: data.product,
				timestamp: now,
				size,
			});
		}

		return data?.product ?? null;
	} catch (error) {
		console.error("Error fetching product:", error);
		return cached?.data || null;
	}
}

export async function getCollection(handle: string): Promise<ShopifyCollection | null> {
	const cacheKey = `collection_${handle}`;
	const now = Date.now();
	const cached = MEMORY_CACHE.get(cacheKey);

	if (cached && now - cached.timestamp < CACHE_TIMES.COLLECTIONS * 1000) {
		return cached.data;
	}

	try {
		const { data } = await shopifyFetch<CollectionResponse>({
			query: `
        query getCollection($handle: String!) {
          collection(handle: $handle) {
            id
            title
            handle
            description
            products(first: 100) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }
          }
        }
      `,
			variables: { handle },
			tags: [`collection-${handle}`],
		});

		if (data?.collection) {
			const size = getObjectSize(data.collection);
			MEMORY_CACHE.set(cacheKey, {
				data: data.collection,
				timestamp: now,
				size,
			});
		}

		return data?.collection ?? null;
	} catch (error) {
		console.error("Error fetching collection:", error);
		return cached?.data || null;
	}
}

// Re-export everything from cache and types
export * from "./cache";
export * from "./types";

export * from "./actions";
export * from "./fragments";
