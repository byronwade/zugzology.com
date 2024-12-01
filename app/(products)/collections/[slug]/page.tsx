import { getCollection } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ProductsContentClient } from "@/components/products/products-content-client";
import type { Metadata } from "next";
import { Suspense } from "react";

// Preload critical data
export const runtime = "edge";
export const preferredRegion = "auto";
export const dynamic = "force-dynamic";
export const revalidate = 60; // Cache for 1 minute

// Optimize metadata generation
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

interface CollectionPageProps {
	params: { slug: string };
	searchParams?: {
		sort?: string;
		availability?: string;
		price?: string;
		category?: string;
	};
}

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
function optimizeCollectionData(collection: any) {
	return {
		...collection,
		products: {
			edges: collection.products.edges.map(({ node }: any) => ({
				node: {
					id: node.id,
					title: node.title,
					handle: node.handle,
					description: node.description,
					priceRange: node.priceRange,
					images: {
						edges: node.images.edges.slice(0, 1), // Only keep first image for initial render
					},
					variants: {
						edges: [node.variants.edges[0]], // Only keep first variant for initial render
					},
					availableForSale: node.availableForSale,
				},
			})),
		},
	};
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
	const nextjs15 = await params;
	const collection = await getCollection(nextjs15.slug);

	if (!collection) {
		notFound();
	}

	// Optimize collection data for initial render
	const optimizedCollection = optimizeCollectionData(collection);

	const collectionJsonLd = {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: collection.title,
		description: collection.description,
		url: `https://zugzology.com/collections/${collection.handle}`,
		image: collection.image?.url,
		numberOfItems: collection.products.edges.length,
		itemListElement: collection.products.edges.map(({ node: product }, index) => ({
			"@type": "Product",
			"@id": `https://zugzology.com/products/${product.handle}`,
			name: product.title,
			description: product.description,
			image: product.images?.edges?.[0]?.node.url,
			url: `https://zugzology.com/products/${product.handle}`,
			position: index + 1,
			offers: {
				"@type": "Offer",
				price: product.priceRange.minVariantPrice.amount,
				priceCurrency: product.priceRange.minVariantPrice.currencyCode,
				availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
			},
		})),
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
			<Suspense fallback={<CollectionLoading />}>
				<ProductsContentClient collection={optimizedCollection} searchQuery={searchParams?.sort} />
			</Suspense>
		</>
	);
}
