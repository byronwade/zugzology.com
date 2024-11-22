import { Suspense } from "react";
import { headers } from "next/headers";
import { unstable_cache } from "@/lib/unstable-cache";
import { shopifyClient } from "@/lib/shopify";
import { ProductsList } from "@/components/products/products-list";
import { getProductsByTagQuery } from "@/lib/queries/tags";
import type { Product } from "@/lib/types/shopify";

export const revalidate = 3600;
export const runtime = "edge";
export const preferredRegion = "auto";

const getProductsByTag = unstable_cache(
	async (tag: string) => {
		try {
			const response = await shopifyClient.request(getProductsByTagQuery, {
				variables: {
					query: `tag:'${tag}'`,
					first: 250,
				},
			});

			if (!response.data?.products?.edges) {
				return [];
			}

			return response.data.products.edges.map((edge: { node: Product }) => edge.node);
		} catch (error) {
			console.error("Error fetching products by tag:", error);
			return [];
		}
	},
	["products-by-tag"],
	{ revalidate: 60 * 60 * 2 }
);

export async function generateMetadata({ params }: { params: { tag: string } }) {
	const headersList = await headers();
	const domain = headersList.get("host") || "";
	const decodedTag = decodeURIComponent(params.tag);

	return {
		title: `${decodedTag} Products | Zugzology`,
		description: `Shop our ${decodedTag} products`,
		openGraph: {
			title: `${decodedTag} Products`,
			description: `Shop our ${decodedTag} products`,
			url: `https://${domain}/tags/${params.tag}`,
		},
	};
}

export default async function TagPage({ params }: { params: { tag: string } }) {
	const decodedTag = decodeURIComponent(params.tag);
	const products = await getProductsByTag(decodedTag);

	if (!products?.length) {
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-8">Products tagged with &ldquo;{decodedTag}&rdquo;</h1>
				<p className="text-center text-gray-600">No products found with this tag.</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Products tagged with &ldquo;{decodedTag}&rdquo;</h1>
			<Suspense fallback={<div>Loading...</div>}>
				<ProductsList products={products} priority={true} />
			</Suspense>
		</div>
	);
}
