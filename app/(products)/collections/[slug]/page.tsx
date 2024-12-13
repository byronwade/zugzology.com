"use server";

import { getCollection } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ProductsContentClient } from "@/components/products/products-content-client";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { ShopifyProduct, ShopifyCollection } from "@/lib/types";

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
function optimizeCollectionData(collection: ShopifyCollection | null): ShopifyCollection | null {
	if (!collection) return null;

	return {
		...collection,
		products: {
			edges: collection.products.edges.map(({ node }) => ({
				node: {
					id: node.id,
					title: node.title,
					handle: node.handle,
					description: node.description,
					priceRange: node.priceRange,
					productType: node.productType,
					publishedAt: node.publishedAt,
					availableForSale: node.availableForSale,
					options: node.options,
					vendor: node.vendor,
					tags: node.tags,
					variants: {
						edges: node.variants.edges,
					},
					images: {
						edges: node.images.edges.slice(0, 1), // Only keep first image for initial render
					},
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

// Fetch collection data with caching
async function getCollectionData(slug: string): Promise<ShopifyCollection | null> {
	"use cache";

	if (!slug || typeof slug !== "string") {
		console.error("Invalid collection handle:", slug);
		return null;
	}

	const handle = slug.toLowerCase().trim();
	const startTime = performance.now();

	try {
		const collection = await getCollection(handle);

		if (!collection) {
			console.error(`Collection not found: ${handle}`);
			return null;
		}

		const optimizedCollection = optimizeCollectionData(collection);
		const duration = performance.now() - startTime;

		if (duration > 100) {
			console.log(`⚡ [Collection Data] ${duration.toFixed(2)}ms | Size: ${(JSON.stringify(optimizedCollection).length / 1024).toFixed(2)}KB`);
		}

		return optimizedCollection;
	} catch (error) {
		console.error(
			`Error fetching collection ${handle}:`,
			error instanceof Error
				? {
						message: error.message,
						stack: error.stack?.split("\n").slice(0, 3),
				  }
				: "Unknown error"
		);
		return null;
	}
}

// Generate metadata for the collection
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
	const nextjs15 = await params;
	if (!nextjs15?.slug) {
		return {
			title: "Collection Not Found",
			description: "The requested collection could not be found.",
		};
	}

	const collection = await getCollectionData(nextjs15.slug);
	if (!collection) {
		return {
			title: "Collection Not Found",
			description: "The requested collection could not be found.",
		};
	}

	return {
		title: collection.title,
		description: collection.description || `Shop ${collection.title} at Zugzology`,
	};
}

// Collection page component with proper Suspense boundaries
async function CollectionContent({ params, searchParams }: CollectionPageProps) {
	const nextjs15 = await params;
	const nextjs15Search = await searchParams;

	if (!nextjs15?.slug) {
		return notFound();
	}

	const collection = await getCollectionData(nextjs15.slug);

	if (!collection) {
		return notFound();
	}

	return (
		<Suspense fallback={<CollectionLoading />}>
			<ProductsContentClient collection={collection} searchQuery={nextjs15Search?.sort} />
		</Suspense>
	);
}

export default async function CollectionPage(props: CollectionPageProps) {
	return (
		<Suspense fallback={<CollectionLoading />}>
			<CollectionContent {...props} />
		</Suspense>
	);
}
