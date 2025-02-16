"use server";

import { getCollection } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ProductsContentClient } from "@/components/products/products-content-client";
import type { Metadata } from "next";
import type { ShopifyProduct, ShopifyCollection } from "@/lib/types";

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

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
	const nextParams = await params;
	const collection = await getCollectionData(nextParams.slug);

	if (!collection) {
		return {
			title: "Collection Not Found",
			description: "The requested collection could not be found.",
		};
	}

	const title = `${collection.title} | Zugzology`;
	const description = collection.description || `Shop our ${collection.title} collection at Zugzology. Premium mushroom cultivation supplies and equipment.`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "website",
			images: collection.image
				? [
						{
							url: collection.image.url,
							width: collection.image.width,
							height: collection.image.height,
							alt: collection.image.altText || collection.title,
						},
				  ]
				: undefined,
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: collection.image ? [collection.image.url] : undefined,
		},
	};
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
	const nextjs15 = await params;
	const nextjs15Search = await searchParams;

	if (!nextjs15?.slug) {
		return notFound();
	}

	const collection = await getCollectionData(nextjs15.slug);

	if (!collection) {
		return notFound();
	}

	return <ProductsContentClient collection={collection} searchQuery={nextjs15Search?.sort} />;
}
