import { getCollection, getSiteSettings, getAllProducts } from "@/lib/api/shopify/actions";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import React, { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { cache } from "react";
import { HomeLoading } from "@/components/loading";
import { ProductsContent } from "@/components/products/products-content";
import type { ShopifyCollectionWithPagination } from "@/lib/api/shopify/types";

// Use the new Next.js 15 caching approach with stale-while-revalidate
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour
export const fetchCache = "force-cache"; // Use force-cache for better performance

interface CollectionPageProps {
	params: {
		handle: string;
	};
	searchParams?: {
		sort?: string;
		availability?: string;
		price?: string;
		page?: string;
	};
}

// Cache collection data with the new React cache API
const getCachedCollection = cache(async (handle: string, sort = "featured", page = 1) => {
	try {
		// Special case for "all" collection - optimize to fetch fewer products initially
		if (handle === "all") {
			// Use a more efficient approach for the "all" collection
			console.log("Server", `⚡ [Collection] Fetching optimized "all" collection, page ${page}, sort ${sort}`);

			const allProducts = await getAllProducts(sort, page, 20); // Reduced from 24 to 20 products per page
			if (!allProducts) {
				console.log("Server", "⚡ [Collection] Failed to fetch all products, falling back to empty collection");
				// Return a fallback collection with empty products
				return {
					id: "all",
					handle: "all",
					title: "All Products",
					description: "Browse our complete collection of premium mushroom growing supplies and equipment.",
					products: {
						edges: [],
						pageInfo: {
							hasNextPage: false,
							hasPreviousPage: false,
							startCursor: "",
							endCursor: "",
						},
					},
					productsCount: 0,
					image: null,
				} as ShopifyCollectionWithPagination;
			}

			// Ensure the returned object matches ShopifyCollectionWithPagination
			return {
				id: "all",
				handle: "all",
				title: "All Products",
				description: "Browse our complete collection of premium mushroom growing supplies and equipment.",
				products: {
					edges: allProducts.products.edges,
					pageInfo: {
						hasNextPage: allProducts.products.pageInfo.hasNextPage,
						hasPreviousPage: allProducts.products.pageInfo.hasPreviousPage,
						startCursor: "",
						endCursor: "",
					},
				},
				productsCount: allProducts.productsCount,
				image: null, // Add image field to match collection type
			} as ShopifyCollectionWithPagination;
		}

		// Determine sort direction based on sort value
		const sortDirection = sort.includes("-desc") ? "desc" : "asc";

		// Map sort value to Shopify's sortKey format
		let sortKey = "MANUAL";
		if (sort === "price-asc" || sort === "price-desc") sortKey = "PRICE";
		if (sort === "title-asc" || sort === "title-desc") sortKey = "TITLE";
		if (sort === "newest") sortKey = "CREATED_AT";
		if (sort === "best-selling") sortKey = "BEST_SELLING";

		const collection = await getCollection(handle, {
			page,
			limit: 20, // Reduced from 24 to 20 products per page for better performance
			sort: sortKey,
			reverse: sortDirection === "desc",
		});

		if (!collection) return null;

		// Ensure the collection object has all required fields
		if (!collection.products.pageInfo.startCursor) {
			collection.products.pageInfo.startCursor = "";
		}
		if (!collection.products.pageInfo.endCursor) {
			collection.products.pageInfo.endCursor = "";
		}

		return collection;
	} catch (error) {
		console.error("Error fetching collection:", error);
		return null;
	}
});

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
	// Always await params before using its properties in Next.js 15
	const nextjs15Params = await params;
	const collection = await getCachedCollection(nextjs15Params.handle);
	if (!collection) return {};

	const title = `${collection.title} | Zugzology`;
	const description = collection.description || `Shop our ${collection.title.toLowerCase()} collection. Premium mushroom growing supplies and equipment.`;

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
							width: collection.image.width || 1200,
							height: collection.image.height || 630,
							alt: collection.image.altText || collection.title,
						},
				  ]
				: [],
		},
	};
}

// Main collection page component
export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
	try {
		// Always await params and searchParams before using their properties in Next.js 15
		const nextjs15Params = await params;
		const nextjs15SearchParams = await searchParams;

		const handle = nextjs15Params.handle;
		const sort = nextjs15SearchParams?.sort || "featured";
		const page = nextjs15SearchParams?.page ? parseInt(nextjs15SearchParams.page) : 1;

		// Get collection data with pagination
		const collection = await getCachedCollection(handle, sort, page);

		// If collection not found, return 404
		if (!collection) {
			console.log("Server", `⚡ [Collection] Collection not found: ${handle}`);
			return notFound();
		}

		// Get site settings for SEO
		const siteSettings = await getSiteSettings();

		return (
			<ErrorBoundary fallback={<div className="container py-10">Sorry, there was an error loading this collection. Please try again later.</div>}>
				<Suspense fallback={<HomeLoading />}>
					<ProductsContent collection={collection} title={collection.title} description={collection.description || undefined} currentPage={page} defaultSort={sort} totalProducts={collection.productsCount} />
				</Suspense>
			</ErrorBoundary>
		);
	} catch (error) {
		console.error("Server", `⚡ [Collection] Error in CollectionPage:`, error);
		return (
			<div className="container py-10">
				<h1 className="text-2xl font-bold mb-4">Collection Unavailable</h1>
				<p>We're sorry, but this collection is currently unavailable. Please try again later or browse our other collections.</p>
			</div>
		);
	}
}
