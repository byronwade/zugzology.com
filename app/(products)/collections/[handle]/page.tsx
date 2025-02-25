import { getCollection, getSiteSettings, getAllProducts } from "@/lib/api/shopify/actions";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import React, { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { cache } from "react";
import { HomeLoading } from "@/components/loading";
import { ProductsContent } from "@/components/products/products-content";
import type { ShopifyCollectionWithPagination } from "@/lib/api/shopify/types";

// Use the new Next.js 15 caching approach
export const dynamic = "force-dynamic";

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
		// Special case for "all" collection
		if (handle === "all") {
			const allProducts = await getAllProducts(sort, page, 35);
			if (!allProducts) return null;

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
						startCursor: "", // Add empty strings for required fields
						endCursor: "", // Add empty strings for required fields
					},
				},
				productsCount: allProducts.productsCount,
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
			limit: 35,
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
			images: [],
		},
	};
}

// Collection content component with optimizations
const CollectionContent = async ({ params, searchParams }: CollectionPageProps) => {
	const nextjs15Search = await searchParams;
	const nextjs15Params = await params;
	const sort = nextjs15Search?.sort || "featured";
	const page = nextjs15Search?.page ? parseInt(nextjs15Search.page) : 1;

	// Fetch collection data with pagination
	const collection = await getCachedCollection(nextjs15Params.handle, sort, page);

	if (!collection) {
		notFound();
	}

	return <ProductsContent collection={collection} title={collection.title} description={collection.description || undefined} currentPage={page} defaultSort={sort} totalProducts={collection.productsCount} />;
};

// Error fallback component
const CollectionError = () => (
	<div className="w-full min-h-[50vh] flex items-center justify-center">
		<div className="text-center">
			<h2 className="text-xl font-semibold mb-2">Unable to load collection</h2>
			<p className="text-muted-foreground">Please try refreshing the page</p>
		</div>
	</div>
);

export default async function CollectionPage(props: CollectionPageProps) {
	return (
		<ErrorBoundary fallback={<CollectionError />}>
			<div className="collection-page w-full">
				<section aria-label="Collection Products" className="collection-section w-full" itemScope itemType="https://schema.org/CollectionPage">
					<Suspense fallback={<HomeLoading />}>
						<CollectionContent {...props} />
					</Suspense>
				</section>
			</div>
		</ErrorBoundary>
	);
}
