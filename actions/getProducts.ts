export const runtime = "edge";

import { shopifyClient, type ShopifyResponse } from "@/lib/shopify";
import type { Product } from "@/lib/types/shopify";

export const getProductsQuery = `#graphql
  query GetProducts($first: Int!) {
    products(first: $first) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
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
              }
            }
          }
          availableForSale
          createdAt
          updatedAt
          publishedAt
          vendor
          productType
          tags
        }
      }
    }
  }
`;

type ProductsResponse = {
	data: {
		products: {
			pageInfo: {
				hasNextPage: boolean;
				endCursor: string | null;
			};
			edges: Array<{
				cursor: string;
				node: Product;
			}>;
		};
	};
};

export async function getProducts(first: number = 50) {
	try {
		const allProducts: Product[] = [];
		let hasNextPage = true;
		let afterCursor: string | null = null;

		while (hasNextPage) {
			console.log(`Fetching products after cursor: ${afterCursor}`);

			const response: ShopifyResponse<ProductsResponse> = await shopifyClient.request(getProductsQuery, {
				variables: {
					first: Math.min(first, 50),
					after: afterCursor,
				},
			});

			if (!response.data?.data.products) {
				throw new Error("No data returned from Shopify");
			}

			const { edges, pageInfo } = response.data.data.products;

			allProducts.push(...edges.map((edge) => edge.node));

			hasNextPage = pageInfo.hasNextPage;
			afterCursor = pageInfo.endCursor;

			console.log(`Fetched ${edges.length} products. Total: ${allProducts.length}`);

			if (allProducts.length >= first) {
				break;
			}
		}

		return allProducts;
	} catch (error) {
		console.error("Error fetching products:", error);
		throw error;
	}
}
