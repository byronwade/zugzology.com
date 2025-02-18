"use server";
"use cache";

import { shopifyFetch } from "./client";
import { CACHE_TIMES } from "./cache-config";
import type { ProductResponse, CollectionResponse } from "./types";
import type { ShopifyProduct, ShopifyCollection } from "../../types";
import { unstable_cache } from "next/cache";

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
	return unstable_cache(
		async () => {
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

				return data?.product ?? null;
			} catch (error) {
				console.error("Error fetching product:", error);
				return null;
			}
		},
		[`product-${handle}`],
		{
			revalidate: CACHE_TIMES.PRODUCTS,
			tags: [`product-${handle}`],
		}
	)();
}

export async function getCollection(handle: string): Promise<ShopifyCollection | null> {
	return unstable_cache(
		async () => {
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

				return data?.collection ?? null;
			} catch (error) {
				console.error("Error fetching collection:", error);
				return null;
			}
		},
		[`collection-${handle}`],
		{
			revalidate: CACHE_TIMES.COLLECTIONS,
			tags: [`collection-${handle}`],
		}
	)();
}

export { getAllCollections } from "./actions";

// Re-export everything from cache and types
export * from "./cache";
export * from "./types";

export * from "./actions";
export * from "./fragments";
