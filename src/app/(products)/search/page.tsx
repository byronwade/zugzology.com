import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { RealtimeProductsContent } from "@/components/features/products/realtime-products-content";
import { InitializeSearch } from "@/components/features/search/initialize-search";
import { UniversalBreadcrumb } from "@/components/layout/universal-breadcrumb";
import { HomeLoading } from "@/components/loading";
import { getSearchData } from "@/lib/actions/search";
import { getAllBlogPosts } from "@/lib/actions/shopify";
import {
	getEnhancedBreadcrumbSchema,
	getEnhancedSearchResultsSchema,
	getSearchActionSchema,
} from "@/lib/seo/enhanced-jsonld";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";

// Remove runtime config as it's incompatible with useCache
export const preferredRegion = "auto";

type SearchPageProps = {
	searchParams?: {
		q?: string;
		sort?: string;
		availability?: string;
		price?: string;
		category?: string;
		page?: string;
	};
};

export function generateMetadata(): Metadata {
	const baseTitle = "Search Products";
	const baseDescription =
		"Search our comprehensive collection of premium mushroom growing supplies, equipment, and cultivation tools. Find exactly what you need for your mushroom cultivation journey.";

	return generateSEOMetadata({
		title: baseTitle,
		description: baseDescription,
		keywords: [
			"search products",
			"mushroom supplies search",
			"growing equipment",
			"cultivation tools",
			"product search",
		],
		url: "/search",
		openGraph: {
			type: "website",
		},
	});
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
	const nextjs15Search = await searchParams;
	const query = nextjs15Search?.q?.trim() ?? "";
	const sort = nextjs15Search?.sort || "featured";
	const page = nextjs15Search?.page ? Number.parseInt(nextjs15Search.page, 10) : 1;

	let searchContent;
	let initializeProducts = [] as Awaited<ReturnType<typeof getSearchData>>["products"];
	let initializeBlogPosts = [] as Awaited<ReturnType<typeof getAllBlogPosts>>;
	let searchData: { products: any[]; totalProducts: number } | null = null;

	if (query) {
		const [searchResults, blogPosts] = await Promise.all([getSearchData(query, sort, page), getAllBlogPosts()]);

		searchData = searchResults;
		const { products, totalProducts } = searchResults;
		initializeProducts = products;
		initializeBlogPosts = Array.isArray(blogPosts) ? blogPosts : [];

		searchContent = (
			<RealtimeProductsContent
				context="search"
				currentPage={page}
				products={products}
				searchQuery={query}
				title={`Search Results for "${query}"`}
				totalProducts={totalProducts}
			/>
		);
	} else {
		searchContent = (
			<div className="flex min-h-[50vh] w-full items-center justify-center px-4">
				<div className="text-center">
					<h2 className="mb-2 font-semibold text-xl">Enter a search term</h2>
					<p className="text-muted-foreground">Use the search bar above to find products</p>
				</div>
			</div>
		);
	}

	// Generate structured data
	const breadcrumbs = [
		{ name: "Home", url: "/" },
		{ name: "Products", url: "/products" },
		{ name: query ? `Search: "${query}"` : "Search", url: `/search${query ? `?q=${encodeURIComponent(query)}` : ""}` },
	];

	const breadcrumbSchema = getEnhancedBreadcrumbSchema(breadcrumbs);
	const websiteSchema = getSearchActionSchema();

	// Generate search results schema if we have results
	let searchResultsSchema = null;
	if (query && searchData && searchData.products.length > 0) {
		searchResultsSchema = getEnhancedSearchResultsSchema({
			query,
			totalResults: searchData.totalProducts,
			results: searchData.products.slice(0, 10).map((product) => ({
				name: product.title,
				url: `/products/${product.handle}`,
				description: product.description || product.title,
				image: product.images?.edges?.[0]?.node?.url || "",
				price: product.priceRange?.minVariantPrice?.amount || "",
				currency: product.priceRange?.minVariantPrice?.currencyCode || "USD",
			})),
		});
	}

	return (
		<>
			{/* JSON-LD Structured Data */}
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
				type="application/ld+json"
			/>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteSchema),
				}}
				type="application/ld+json"
			/>
			{searchResultsSchema && (
				<script
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(searchResultsSchema),
					}}
					type="application/ld+json"
				/>
			)}

			{/* Google Analytics for Search */}
			<Script id="search-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'search_results',
						'page_location': window.location.href,
						'search_term': '${query.replace(/'/g, "\\'")}',
						'search_results_count': ${searchData?.totalProducts || 0},
						'search_page': ${page}
					});
					
					${
						query
							? `
					// Track search event
					window.dataLayer.push({
						'event': 'search',
						'search_term': '${query.replace(/'/g, "\\'")}',
						'search_results': ${searchData?.totalProducts || 0}
					});
					`
							: ""
					}
				`}
			</Script>

			<div className="w-full">
				{/* Breadcrumb Navigation */}
				<UniversalBreadcrumb items={breadcrumbs} />

				<div className="space-y-8">
					<InitializeSearch blogPosts={initializeBlogPosts} products={initializeProducts} />

					{/* Products Section */}
					<div className="w-full">
						<Suspense fallback={<HomeLoading />}>{searchContent}</Suspense>
					</div>
				</div>
			</div>
		</>
	);
}
