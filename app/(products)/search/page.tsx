import { getAllBlogPosts } from "@/lib/actions/shopify";
import type { Metadata } from "next";
import { InitializeSearch } from "@/components/search/initialize-search";
import { Suspense } from "react";
import { HomeLoading } from "@/components/loading";
import { ProductsContent } from "@/components/products/products-content";
import { getSearchData } from "@/lib/actions/search";

// Remove runtime config as it's incompatible with useCache
export const preferredRegion = "auto";
export const revalidate = 0;

interface SearchPageProps {
	searchParams?: {
		q?: string;
		sort?: string;
		availability?: string;
		price?: string;
		category?: string;
		page?: string;
	};
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
	const nextjs15Search = await searchParams;
	const query = nextjs15Search?.q || "";
	const title = query ? `Search results for "${query}" | Zugzology` : "Search Products | Zugzology";

	return {
		title,
		description: `Browse our selection of premium mushroom growing supplies and equipment${query ? ` matching "${query}"` : ""}. Find everything you need for successful cultivation at Zugzology.`,
		keywords: ["mushroom supplies", "growing equipment", "cultivation tools", query].filter(Boolean),
		openGraph: {
			title,
			description: `Discover premium mushroom growing supplies${query ? ` matching "${query}"` : ""}. Shop at Zugzology for quality cultivation equipment.`,
			type: "website",
			url: `https://zugzology.com/search${query ? `?q=${encodeURIComponent(query)}` : ""}`,
			siteName: "Zugzology",
		},
		alternates: {
			canonical: `https://zugzology.com/search${query ? `?q=${encodeURIComponent(query)}` : ""}`,
		},
		robots: {
			index: true,
			follow: true,
			nocache: true,
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
	const nextjs15Search = await searchParams;
	const query = nextjs15Search?.q || "";
	const sort = nextjs15Search?.sort || "featured";
	const page = nextjs15Search?.page ? parseInt(nextjs15Search.page) : 1;

	let searchContent;
	if (query) {
		// Fetch search results outside of JSX
		const { products, totalProducts } = await getSearchData(query, sort, page);
		searchContent = <ProductsContent products={products} title={`Search Results for "${query}"`} currentPage={page} defaultSort="featured" totalProducts={totalProducts} searchQuery={query} />;
	} else {
		searchContent = (
			<div className="w-full min-h-[50vh] flex items-center justify-center px-4">
				<div className="text-center">
					<h2 className="text-xl font-semibold mb-2">Enter a search term</h2>
					<p className="text-muted-foreground">Use the search bar above to find products</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full space-y-8">
			<InitializeSearch products={[]} blogPosts={[]} />

			{/* Products Section */}
			<div className="w-full">
				<Suspense fallback={<HomeLoading />}>{searchContent}</Suspense>
			</div>
		</div>
	);
}
