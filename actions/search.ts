"use server";

import { shopifyClient } from "@/lib/shopify";
import { unstable_cache } from "next/cache";
import type { Product } from "@/lib/types/shopify";

const searchQuery = `#graphql
  query SearchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
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
          availableForSale
          vendor
          productType
        }
      }
    }
  }
`;

export async function searchProducts(query: string): Promise<Product[]> {
	return unstable_cache(
		async () => {
			try {
				const response = await shopifyClient.request(searchQuery, {
					variables: {
						query,
						first: 10,
					},
				});

				return response.data?.products?.edges?.map((edge: { node: Product }) => edge.node) || [];
			} catch (error) {
				console.error("Error searching products:", error);
				return [];
			}
		},
		["search-products-${query}"],
		{ revalidate: 60 }
	)();
}
