import { getSiteSettings, getPaginatedProducts } from "@/lib/actions/shopify";
import type { Metadata } from "next";
import React, { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { unstable_cache } from "next/cache";
import { HomeLoading } from "@/components/loading";
import { ProductsContent } from "@/components/products/products-content";

// Prevent automatic scroll restoration
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface ProductsPageProps {
	searchParams?: {
		sort?: string;
		availability?: string;
		price?: string;
		category?: string;
		page?: string;
	};
}

// Cache the site settings for metadata
const getCachedSiteSettings = unstable_cache(
	async () => {
		return getSiteSettings();
	},
	["site-settings"],
	{
		revalidate: 60,
		tags: ["settings"],
	}
);

export async function generateMetadata(): Promise<Metadata> {
	const siteSettings = await getCachedSiteSettings();
	const storeName = siteSettings?.name || "Zugzology";
	const storeDescription = siteSettings?.description || "";

	const title = `${storeName} - Premium Mushroom Growing Supplies & Equipment`;
	const description = `Shop our extensive collection of premium mushroom growing supplies. Find sterile grow bags, substrates, and professional cultivation equipment.`;

	return {
		title,
		description,
		keywords: ["mushroom growing supplies", "mushroom cultivation equipment", "sterile grow bags", "mushroom substrates", "cultivation tools", "mycology supplies", "professional growing equipment"],
		alternates: {
			canonical: `${siteSettings?.primaryDomain?.url || "https://zugzology.com"}/products`,
		},
		openGraph: {
			title,
			description: storeDescription || description,
			type: "website",
			url: `${siteSettings?.primaryDomain?.url || "https://zugzology.com"}/products`,
		},
		twitter: {
			card: "summary_large_image",
			title,
			description: storeDescription || description,
		},
		robots: {
			index: true,
			follow: true,
			nocache: false,
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

// Products page content component
const ProductsPageContent = async ({ searchParams }: ProductsPageProps) => {
	const nextjs15Search = await searchParams;
	const sort = nextjs15Search?.sort || "featured";
	const page = nextjs15Search?.page ? parseInt(nextjs15Search.page) : 1;

	// Fetch products with pagination
	const { products, totalCount } = await getPaginatedProducts(page, sort);

	return <ProductsContent products={products} title="All Products" currentPage={page} defaultSort="featured" totalProducts={totalCount} />;
};

// Error fallback component
const ProductsError = () => (
	<div className="w-full min-h-[50vh] flex items-center justify-center">
		<div className="text-center">
			<h2 className="text-xl font-semibold mb-2">Unable to load products</h2>
			<p className="text-muted-foreground">Please try refreshing the page</p>
		</div>
	</div>
);

export default async function ProductsPage({ searchParams = {} }: ProductsPageProps) {
	return (
		<ErrorBoundary fallback={<ProductsError />}>
			<div className="product-catalog w-full">
				<section aria-label="Products Catalog" className="products-section w-full" itemScope itemType="https://schema.org/CollectionPage">
					<Suspense fallback={<HomeLoading />}>
						<ProductsPageContent searchParams={searchParams} />
					</Suspense>
				</section>
			</div>
		</ErrorBoundary>
	);
}
