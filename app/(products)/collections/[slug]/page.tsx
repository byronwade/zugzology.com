import { getCollection } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ProductsContentClient } from "@/components/products/products-content-client";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { ShopifyProduct, ShopifyCollection } from "@/lib/types";

// Preload critical data
export const runtime = "edge";
export const preferredRegion = "auto";
export const dynamic = "force-dynamic";
export const revalidate = 60; // Cache for 1 minute

// Loading component for better UX
function CollectionLoading() {
	return (
		<div className="w-full h-screen animate-pulse">
			<div className="max-w-screen-xl mx-auto px-4">
				<div className="h-8 w-1/4 bg-gray-200 rounded mb-4" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{[...Array(12)].map((_, i) => (
						<div key={i} className="bg-gray-200 rounded-lg h-64" />
					))}
				</div>
			</div>
		</div>
	);
}

// Optimize collection data structure
function optimizeCollectionData(collection: ShopifyCollection): ShopifyCollection {
	return {
		...collection,
		products: {
			edges: collection.products.edges.map(({ node }) => ({
				node: {
					...node,
					id: node.id,
					title: node.title,
					handle: node.handle,
					description: node.description,
					priceRange: node.priceRange,
					productType: node.productType,
					publishedAt: node.publishedAt,
					images: {
						edges: node.images.edges.slice(0, 1), // Only keep first image for initial render
					},
					variants: {
						edges: node.variants.edges, // Keep all variants for filtering
					},
					availableForSale: node.availableForSale,
				},
			})),
		},
	};
}

interface CollectionPageProps {
	params: {
		slug: string;
	};
	searchParams?: {
		sort?: string;
		availability?: string;
		price?: string;
		category?: string;
	};
}

// Generate metadata for the collection
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
	const nextjs15 = await params;
	const collection = await getCollection(nextjs15.slug);
	if (!collection) return notFound();

	const title = `${collection.title} | Premium Mushroom Growing Supplies`;
	const description = collection.description || `Shop our premium ${collection.title.toLowerCase()} collection. Find high-quality mushroom growing supplies and equipment.`;
	const url = `https://zugzology.com/collections/${collection.handle}`;

	return {
		title,
		description,
		keywords: `mushroom growing, ${collection.title.toLowerCase()}, mushroom supplies, cultivation equipment`,
		openGraph: {
			title,
			description,
			url,
			siteName: "Zugzology",
			type: "website",
			locale: "en_US",
			images: collection.image
				? [
						{
							url: collection.image.url,
							width: 1200,
							height: 630,
							alt: `${collection.title} Collection - Premium Mushroom Growing Supplies`,
						},
				  ]
				: [],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: collection.image ? [collection.image.url] : [],
		},
		alternates: {
			canonical: url,
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	};
}

export default async function CollectionPage({ params, searchParams: rawSearchParams = {} }: CollectionPageProps) {
	const nextjs15 = await params;
	const searchParams = await rawSearchParams;
	const collection = await getCollection(nextjs15.slug);

	if (!collection) {
		notFound();
	}

	// Optimize collection data for initial render
	const optimizedCollection = optimizeCollectionData(collection);

	return (
		<>
			<Suspense fallback={<CollectionLoading />}>
				<ProductsContentClient collection={optimizedCollection} searchQuery={searchParams?.sort} />
			</Suspense>
		</>
	);
}
