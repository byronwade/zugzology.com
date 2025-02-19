"use server";

import { getCollection, getCollectionDiscounts } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ProductsContentClient } from "@/components/products/products-content-client";
import type { Metadata } from "next";
import type { ShopifyProduct, ShopifyCollection } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { unstable_noStore as noStore } from "next/cache";

// Tell Next.js this is a dynamic route that shouldn't be prerendered
export async function generateStaticParams() {
	noStore();
	return [];
}

// Optimize collection data structure
async function optimizeCollectionData(collection: ShopifyCollection | null, discountInfo: { discountAmount: number; discountType: "percentage" | "fixed_amount" } | null): Promise<ShopifyCollection | null> {
	if (!collection) return null;

	return {
		...collection,
		products: {
			nodes: collection.products.nodes.map((node) => {
				// Apply discount to product prices if available
				let priceRange = node.priceRange;
				let variants = node.variants;

				if (discountInfo) {
					// Calculate discounted prices
					const applyDiscount = (price: string) => {
						const originalPrice = parseFloat(price);
						if (discountInfo.discountType === "percentage") {
							return (originalPrice * (1 - discountInfo.discountAmount / 100)).toString();
						} else {
							return (originalPrice - discountInfo.discountAmount).toString();
						}
					};

					// Update price range
					priceRange = {
						minVariantPrice: {
							...node.priceRange.minVariantPrice,
							amount: applyDiscount(node.priceRange.minVariantPrice.amount),
						},
						maxVariantPrice: {
							...node.priceRange.maxVariantPrice,
							amount: applyDiscount(node.priceRange.maxVariantPrice.amount),
						},
					};

					// Update variant prices
					variants = {
						nodes: node.variants.nodes.map((variant) => ({
							...variant,
							compareAtPrice: variant.price, // Store original price as compareAtPrice
							price: {
								...variant.price,
								amount: applyDiscount(variant.price.amount),
							},
						})),
					};
				}

				return {
					...node,
					priceRange,
					variants,
				};
			}),
		},
	};
}

interface CollectionPageProps {
	params: Promise<{
		slug: string;
	}>;
	searchParams?: Promise<{
		sort?: string;
		availability?: string;
		price?: string;
		category?: string;
	}>;
}

// Fetch collection data
async function getCollectionData(slug: string): Promise<ShopifyCollection | null> {
	// Explicitly opt out of caching
	noStore();

	if (!slug || typeof slug !== "string") {
		console.error("Invalid collection handle:", slug);
		return null;
	}

	const handle = slug.toLowerCase().trim();
	const startTime = performance.now();

	try {
		const [collection, discountData] = await Promise.all([getCollection(handle), getCollectionDiscounts(handle)]);

		if (!collection) {
			console.error(`Collection not found: ${handle}`);
			return null;
		}

		// Map discount data to the expected format
		const discountInfo = discountData
			? {
					discountAmount: Number(discountData.amount),
					discountType: discountData.type === "percentage" ? ("percentage" as const) : ("fixed_amount" as const),
			  }
			: null;

		const optimizedCollection = await optimizeCollectionData(collection, discountInfo);
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
	const { slug } = await params;
	const collection = await getCollectionData(slug);

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
	const { slug } = await params;
	const search = await searchParams;

	if (!slug) {
		return notFound();
	}

	const collection = await getCollectionData(slug);

	if (!collection) {
		return notFound();
	}

	// Check if collection has no products
	if (!collection.products?.nodes?.length) {
		return <EmptyState title={`No Products in ${collection.title}`} description={`This collection is currently empty. Check out our other collections or browse all products.`} showCollectionCards={true} />;
	}

	return <ProductsContentClient collection={collection} searchQuery={search?.sort} />;
}
