import { getCollection, getSiteSettings } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import React, { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { unstable_cache } from "next/cache";
import { HomeLoading } from "@/components/loading";
import { ProductsContent } from "@/components/products/products-content";

export const runtime = "edge";
export const preferredRegion = "auto";
export const revalidate = 0;

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

// Cache collection data
const getCachedCollection = unstable_cache(
	async (handle: string, sort = "featured", page = 1) => {
		try {
			const collection = await getCollection(handle, sort, page);
			if (!collection) return null;
			return collection;
		} catch (error) {
			console.error("Error fetching collection:", error);
			return null;
		}
	},
	["collection"],
	{
		revalidate: 60,
		tags: ["collection"],
	}
);

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
			images: collection.image ? [{ url: collection.image.url, alt: collection.image.altText || collection.title }] : [],
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

	return <ProductsContent collection={collection} title={collection.title} description={collection.description || undefined} currentPage={page} defaultSort={sort} totalProducts={collection.products.totalCount} />;
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
				<section aria-label="Collection Products" className="collection-section w-full">
					<Suspense fallback={<HomeLoading />}>
						<CollectionContent {...props} />
					</Suspense>
				</section>
			</div>
		</ErrorBoundary>
	);
}
