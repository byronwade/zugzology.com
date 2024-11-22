import { Suspense } from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { unstable_cache } from "@/lib/unstable-cache";
import { shopifyClient } from "@/lib/shopify";
import { ProductsList } from "@/components/products/products-list";
import { getCategoryQuery } from "@/lib/queries/categories";
import type { Product } from "@/lib/types/shopify";

export const revalidate = 3600;
export const runtime = "edge";
export const preferredRegion = "auto";

const getCategory = unstable_cache(
	async (handle: string) => {
		try {
			const response = await shopifyClient.request(getCategoryQuery, {
				variables: { handle, first: 250 },
			});

			if (!response.data?.collection) {
				return null;
			}

			return response.data.collection;
		} catch (error) {
			console.error("Error fetching category:", error);
			throw error;
		}
	},
	["category"],
	{ revalidate: 60 * 60 * 2 }
);

export async function generateMetadata({ params }: { params: { handle: string } }) {
	const category = await getCategory(params.handle);
	const headersList = await headers();
	const domain = headersList.get("host") || "";

	if (!category) {
		return {
			title: "Category Not Found | Zugzology",
			description: "The requested category could not be found.",
		};
	}

	return {
		title: `${category.title} | Zugzology`,
		description: category.description || `Shop our ${category.title} collection`,
		openGraph: {
			title: category.title,
			description: category.description || `Shop our ${category.title} collection`,
			url: `https://${domain}/categories/${category.handle}`,
			images: category.image ? [{ url: category.image.url, alt: category.image.altText || category.title }] : [],
		},
	};
}

export default async function CategoryPage({ params }: { params: { handle: string } }) {
	const category = await getCategory(params.handle);

	if (!category) {
		notFound();
	}

	const products = category.products.edges.map((edge: { node: Product }) => edge.node);

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">{category.title}</h1>
			{category.description && <p className="text-gray-600 mb-8">{category.description}</p>}
			<Suspense fallback={<div>Loading...</div>}>
				<ProductsList products={products} priority={true} />
			</Suspense>
		</div>
	);
}
