import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProductList from "@/components/ui/product-list";
import { getCollection } from "@/lib/actions/shopify";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
	let collection;
	try {
		collection = await getCollection(params.handle);
	} catch (error) {
		console.error("Error fetching collection metadata:", error);
		return {
			title: "Collection | Mushroom Growing Supplies",
			description: "Explore our curated collection of mushroom growing supplies and equipment.",
			robots: {
				index: false,
			},
		};
	}

	if (!collection) {
		return {
			title: "Collection Not Found | Mushroom Growing Supplies",
			description: "The requested collection could not be found",
			robots: {
				index: false,
			},
		};
	}

	return {
		title: `${collection.title} | Mushroom Growing Supplies`,
		description: collection.description || "Explore our curated collection of mushroom growing supplies and equipment.",
		openGraph: {
			title: collection.title,
			description: collection.description || "Explore our curated collection of mushroom growing supplies and equipment.",
			images: collection.image ? [{ url: collection.image.url }] : [],
			type: "website",
			siteName: "Zugzology",
			url: `https://zugzology.com/collections/${params.handle}`,
		},
		alternates: {
			canonical: `https://zugzology.com/collections/${params.handle}`,
		},
	};
}

// Add JSON-LD for collection
function generateCollectionJsonLd(collection: any) {
	return {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: collection.title,
		description: collection.description,
		image: collection.image?.url,
		url: `https://zugzology.com/collections/${collection.handle}`,
		mainEntity: {
			"@type": "ItemList",
			itemListElement: collection.products?.map((product: any, index: number) => ({
				"@type": "ListItem",
				position: index + 1,
				item: {
					"@type": "Product",
					name: product.title,
					description: product.description,
					image: product.images?.[0]?.url,
					url: `https://zugzology.com/products/${product.handle}`,
				},
			})),
		},
	};
}

export default async function CollectionPage({ params }: { params: { handle: string } }) {
	let collection;
	try {
		collection = await getCollection(params.handle);
	} catch (error) {
		console.error("Error fetching collection:", error);
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Unable to Load Collection</h1>
					<p className="text-gray-600">Please try again later.</p>
				</div>
			</div>
		);
	}

	if (!collection) notFound();

	return (
		<div className="container mx-auto px-4">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(generateCollectionJsonLd(collection)),
				}}
			/>
			<div className="py-8">
				<h1 className="text-3xl font-bold mb-4">{collection.title}</h1>
				{collection.description && <p className="text-muted-foreground mb-6">{collection.description}</p>}
				<div className="flex gap-8">
					<Suspense fallback={<div>Loading products...</div>}>
						<ProductList products={collection.products || []} />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
