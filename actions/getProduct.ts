export const runtime = "edge";

import { shopifyClient } from "@/lib/shopify";
import { unstable_cache } from "next/cache";
import type { Product } from "@/lib/types/shopify";

const getProductQuery = `#graphql
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      options {
        id
        name
        values
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 250) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
      images(first: 20) {
        edges {
          node {
            url
            altText
            width
            height
            id
            originalSrc
            transformedSrc(
              maxWidth: 1920
              maxHeight: 1080
              crop: CENTER
              preferredContentType: WEBP
            )
          }
        }
      }
      availableForSale
      vendor
      productType
      tags
    }
  }
`;

export const getProduct = unstable_cache(
	async (handle: string): Promise<Product | null> => {
		try {
			const response = await shopifyClient.request(getProductQuery, {
				variables: { handle },
			});

			return response.data?.product || null;
		} catch (error) {
			console.error("Error fetching product:", error);
			return null;
		}
	},
	["product"],
	{ revalidate: 60 * 60 }
);
