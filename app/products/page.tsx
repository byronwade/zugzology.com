import { Suspense } from "react";
import { ProductsList } from "@/components/products/products-list";
import { ProductsSkeleton } from "@/components/products/products-skeleton";
import { unstable_cache } from "@/lib/unstable-cache";
import { shopifyClient } from "@/lib/shopify";
import type { Product } from "@/lib/types/shopify";

const productsQuery = `#graphql
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
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
                id
                originalSrc
                transformedSrc(
                  maxWidth: 800
                  maxHeight: 800
                  crop: CENTER
                  preferredContentType: WEBP
                )
              }
            }
          }
          availableForSale
        }
      }
    }
  }
`;

const getProducts = unstable_cache(
	async () => {
		try {
			const response = await shopifyClient.request(productsQuery, {
				variables: { first: 250 },
			});

			if (!response.data?.products?.edges) {
				throw new Error("No products found in response");
			}

			const products = response.data.products.edges.map((edge: { node: Product }) => edge.node);
			return products;
		} catch (error) {
			console.error("Error fetching products:", error);
			throw error;
		}
	},
	["products"],
	{ revalidate: 60 * 60 * 2 }
);

export default async function ProductsPage() {
	try {
		const products = await getProducts();

		if (!products?.length) {
			return (
				<div className="container mx-auto px-4 py-8 text-center">
					<p>No products available. Please check back later.</p>
				</div>
			);
		}

		return (
			<div className="container mx-auto px-4">
				<Suspense fallback={<ProductsSkeleton />}>
					<ProductsList products={products} priority={true} />
				</Suspense>
			</div>
		);
	} catch (error) {
		console.error("Error loading products:", error);
		return (
			<div className="container mx-auto px-4 py-8 text-center">
				<p className="text-red-500">Error loading products. Please try again later.</p>
			</div>
		);
	}
}
