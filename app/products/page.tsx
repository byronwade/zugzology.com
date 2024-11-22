import { Suspense } from "react";
import { ProductsList } from "@/components/products/products-list";
import { ProductsSkeleton } from "@/components/products/products-skeleton";
import { unstable_cache } from "@/lib/unstable-cache";
import { shopifyClient } from "@/lib/shopify";
import { getProductsQuery } from "@/actions/getProducts";
import type { Product } from "@/lib/types/shopify";

export const revalidate = 3600; // 1 hour
export const runtime = "edge";
export const preferredRegion = "auto";

const getProducts = unstable_cache(
	async () => {
		try {
			const response = await shopifyClient.request(getProductsQuery, {
				variables: { first: 250 },
			});

			console.log("Shopify response:", JSON.stringify(response, null, 2));

			if (!response.data?.products?.edges) {
				console.error("Invalid response structure:", response);
				throw new Error("No products found in response");
			}

			const products = response.data.products.edges.map((edge: { node: Product }) => edge.node);

			console.log(`Found ${products.length} products`);
			return products;
		} catch (error) {
			console.error("Error fetching products:", error);
			throw error;
		}
	},
	["products"],
	{ revalidate: 60 * 60 * 2 } // 2 hours
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
					<ProductsList products={products} />
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
