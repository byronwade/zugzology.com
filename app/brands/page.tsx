import { Suspense } from "react";
import { BrandsList } from "@/components/brands/brands-list";
import { unstable_cache } from "@/lib/unstable-cache";
import { shopifyClient } from "@/lib/shopify";
import { getBrandsQuery } from "@/lib/queries/brands";
import type { Brand } from "@/lib/types/shopify";

export const revalidate = 3600;
export const runtime = "edge";
export const preferredRegion = "auto";

const getBrands = unstable_cache(
	async () => {
		try {
			const response = await shopifyClient.request(getBrandsQuery);

			if (!response.data?.collections?.edges) {
				throw new Error("No brands found in response");
			}

			const brands = response.data.collections.edges.map((edge: { node: Brand }) => edge.node).filter((brand: Brand) => brand.products.edges.length > 0);

			return brands;
		} catch (error) {
			console.error("Error fetching brands:", error);
			throw error;
		}
	},
	["brands"],
	{ revalidate: 60 * 60 * 2 }
);

export default async function BrandsPage() {
	const brands = await getBrands();

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Brands</h1>
			<Suspense fallback={<div>Loading...</div>}>
				<BrandsList brands={brands} priority={true} />
			</Suspense>
		</div>
	);
}
