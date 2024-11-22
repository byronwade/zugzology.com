import { Suspense } from "react";
import { CategoriesList } from "@/components/categories/categories-list";
import { unstable_cache } from "@/lib/unstable-cache";
import { shopifyClient } from "@/lib/shopify";
import { getCategoriesQuery } from "@/lib/queries/categories";
import type { Collection } from "@/lib/types/shopify";

export const revalidate = 3600;
export const runtime = "edge";
export const preferredRegion = "auto";

const getCategories = unstable_cache(
	async () => {
		try {
			const response = await shopifyClient.request(getCategoriesQuery);

			if (!response.data?.collections?.edges) {
				throw new Error("No collections found in response");
			}

			const categories = response.data.collections.edges.map((edge: { node: Collection }) => edge.node);
			return categories;
		} catch (error) {
			console.error("Error fetching categories:", error);
			throw error;
		}
	},
	["categories"],
	{ revalidate: 60 * 60 * 2 }
);

export default async function CategoriesPage() {
	const categories = await getCategories();

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Categories</h1>
			<Suspense fallback={<div>Loading...</div>}>
				<CategoriesList categories={categories} priority={true} />
			</Suspense>
		</div>
	);
}
