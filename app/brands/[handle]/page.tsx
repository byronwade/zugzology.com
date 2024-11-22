import { Suspense } from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { unstable_cache } from "@/lib/unstable-cache";
import { shopifyClient } from "@/lib/shopify";
import { ProductsList } from "@/components/products/products-list";
import { getBrandQuery } from "@/lib/queries/brands";
import type { Product } from "@/lib/types/shopify";

export const revalidate = 3600;
export const runtime = "edge";
export const preferredRegion = "auto";

const getBrand = unstable_cache(
	async (handle: string) => {
		try {
			const response = await shopifyClient.request(getBrandQuery, {
				variables: { handle, first: 250 },
			});

			if (!response.data?.collection) {
				return null;
			}

			return response.data.collection;
		} catch (error) {
			console.error("Error fetching brand:", error);
			throw error;
		}
	},
	["brand"],
	{ revalidate: 60 * 60 * 2 }
);

export async function generateMetadata({ params }: { params: { handle: string } }) {
	const brand = await getBrand(params.handle);
	const headersList = await headers();
	const domain = headersList.get("host") || "";

	if (!brand) {
		return {
			title: "Brand Not Found | Zugzology",
			description: "The requested brand could not be found.",
		};
	}

	return {
		title: `${brand.title} | Zugzology`,
		description: brand.description || `Shop ${brand.title} products`,
		openGraph: {
			title: brand.title,
			description: brand.description || `Shop ${brand.title} products`,
			url: `https://${domain}/brands/${brand.handle}`,
			images: brand.image ? [{ url: brand.image.url, alt: brand.image.altText || brand.title }] : [],
		},
	};
}

export default async function BrandPage({ params }: { params: { handle: string } }) {
	const brand = await getBrand(params.handle);

	if (!brand) {
		notFound();
	}

	const products = brand.products.edges.map((edge: { node: Product }) => edge.node);

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">{brand.title}</h1>
			{brand.description && <p className="text-gray-600 mb-8">{brand.description}</p>}
			<Suspense fallback={<div>Loading...</div>}>
				<ProductsList products={products} priority={true} />
			</Suspense>
		</div>
	);
}
