import { unstable_cache } from "next/cache";
import type { Product } from "@/lib/types/shopify";

interface ShopifyProductResponse {
	data: {
		products: {
			edges: Array<{
				node: Product;
			}>;
		};
	};
}

export const getProducts = unstable_cache(
	async () => {
		try {
			const response = await fetch(`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
				},
				body: JSON.stringify({
					query: `
            query Products {
              products(first: 24) {
                edges {
                  node {
                    id
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
                    priceRange {
                      minVariantPrice {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          `,
				}),
				cache: "no-store",
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const { data }: ShopifyProductResponse = await response.json();
			return data.products.edges.map((edge) => edge.node);
		} catch (error) {
			console.error("Error fetching products:", error);
			return [];
		}
	},
	["products-list"],
	{
		revalidate: 60,
		tags: ["products"],
	}
);
