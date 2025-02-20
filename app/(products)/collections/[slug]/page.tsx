"use server";

import { getCollection, getCollectionDiscounts } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ProductList } from "@/components/products/product-list";
import { ProductsHeaderWrapper } from "@/components/products/products-header-wrapper";
import type { Metadata } from "next";
import type { ShopifyProduct, ShopifyCollection } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { unstable_noStore as noStore } from "next/cache";

// Add a custom error class for better error handling
class CollectionError extends Error {
	constructor(message: string, public code: string) {
		super(message);
		this.name = "CollectionError";
	}
}

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

// Fetch collection data with improved error handling
async function getCollectionData(slug: string): Promise<ShopifyCollection | null> {
	noStore();

	if (!slug || typeof slug !== "string") {
		throw new CollectionError("Invalid collection handle provided", "INVALID_HANDLE");
	}

	const handle = slug.toLowerCase().trim();
	const startTime = performance.now();

	try {
		const [collection, discountData] = await Promise.all([getCollection(handle), getCollectionDiscounts(handle)]);

		if (!collection) {
			throw new CollectionError(`Collection not found: ${handle}`, "NOT_FOUND");
		}

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
		if (error instanceof CollectionError) {
			if (error.code === "NOT_FOUND") {
				console.log(`Collection not found: ${handle}`);
				return null;
			}
			throw error;
		}

		console.error(
			`Error fetching collection ${handle}:`,
			error instanceof Error
				? {
						message: error.message,
						stack: error.stack?.split("\n").slice(0, 3),
						name: error.name,
				  }
				: "Unknown error"
		);

		throw new CollectionError(`Failed to fetch collection: ${error instanceof Error ? error.message : "Unknown error"}`, "FETCH_ERROR");
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
	try {
		const { slug } = await params;
		const search = await searchParams;

		if (!slug) {
			return <EmptyState title="Collection Not Found" description="The requested collection could not be found. Please check the URL and try again." showCollectionCards={true} />;
		}

		const collection = await getCollectionData(slug);

		if (!collection) {
			return <EmptyState title={`Collection Not Found: ${slug}`} description="We couldn't find the collection you're looking for. Browse our other collections or check out all products." showCollectionCards={true} />;
		}

		// Check if collection has no products
		if (!collection.products?.nodes?.length) {
			return <EmptyState title={`No Products in ${collection.title}`} description="This collection is currently empty. Check out our other collections or browse all products." showCollectionCards={true} />;
		}

		return (
			<div className="w-full">
				<ProductsHeaderWrapper title={collection.title} description={collection.description || `Browse our ${collection.title} collection`} count={collection.products.nodes.length} image={collection.image} />
				<ProductList products={collection.products.nodes} />
			</div>
		);
	} catch (error) {
		console.error("Collection page error:", error);

		return <EmptyState title="Something went wrong" description="We encountered an error while loading this collection. Please try again later or browse our other collections." showCollectionCards={true} />;
	}
}
