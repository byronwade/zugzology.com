import { getAllBlogPosts } from "@/lib/actions/shopify";
import type { Metadata } from "next";
import { InitializeSearch } from "@/components/features/search/initialize-search";
import { Suspense } from "react";
import { HomeLoading } from "@/components/loading";
import { RealtimeProductsContent } from "@/components/features/products/realtime-products-content";
import { getSearchData } from "@/lib/actions/search";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import { getEnhancedBreadcrumbSchema, getSearchActionSchema, getEnhancedSearchResultsSchema } from "@/lib/seo/enhanced-jsonld";
import Script from "next/script";
import Link from "next/link";

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
	const page = nextjs15Search?.page ? parseInt(nextjs15Search.page, 10) : 1;
	
	const baseTitle = query ? `Search Results for "${query}"` : "Search Products";
	const title = page > 1 ? `${baseTitle} - Page ${page}` : baseTitle;
	
	const baseDescription = query 
		? `Find premium mushroom cultivation supplies matching "${query}". Browse our extensive collection of growing equipment, substrates, and tools for successful mushroom cultivation.`
		: "Search our comprehensive collection of premium mushroom growing supplies, equipment, and cultivation tools. Find exactly what you need for your mushroom cultivation journey.";

	return generateSEOMetadata({
		title,
		description: baseDescription,
		keywords: [
			"search products",
			"mushroom supplies search",
			"growing equipment",
			"cultivation tools",
			"product search",
			...(query ? [query, `${query} supplies`, `${query} equipment`] : []),
		],
		url: `/search${query ? `?q=${encodeURIComponent(query)}` : ""}${page > 1 ? `${query ? '&' : '?'}page=${page}` : ""}`,
		openGraph: {
			type: "website",
		},
		...(page > 1 && { noindex: true }), // Don't index pagination pages beyond page 1
	});
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
	const nextjs15Search = await searchParams;
	const query = nextjs15Search?.q?.trim() ?? "";
	const sort = nextjs15Search?.sort || "featured";
	const page = nextjs15Search?.page ? parseInt(nextjs15Search.page, 10) : 1;

	let searchContent;
	let initializeProducts = [] as Awaited<ReturnType<typeof getSearchData>>["products"];
	let initializeBlogPosts = [] as Awaited<ReturnType<typeof getAllBlogPosts>>;
	let searchData: { products: any[]; totalProducts: number } | null = null;

	if (query) {
		const [searchResults, blogPosts] = await Promise.all([
			getSearchData(query, sort, page),
			getAllBlogPosts(),
		]);

		searchData = searchResults;
		const { products, totalProducts } = searchResults;
		initializeProducts = products;
		initializeBlogPosts = Array.isArray(blogPosts) ? blogPosts : [];

		searchContent = (
			<RealtimeProductsContent
				products={products}
				title={`Search Results for "${query}"`}
				currentPage={page}
				totalProducts={totalProducts}
				searchQuery={query}
				context="search"
			/>
		);
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
			results: searchData.products.slice(0, 10).map(product => ({
				name: product.title,
				url: `/products/${product.handle}`,
				description: product.description || product.title,
				image: product.images?.edges?.[0]?.node?.url || '',
				price: product.priceRange?.minVariantPrice?.amount || '',
				currency: product.priceRange?.minVariantPrice?.currencyCode || 'USD',
			})),
		});
	}

	return (
		<>
			{/* JSON-LD Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteSchema),
				}}
			/>
			{searchResultsSchema && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(searchResultsSchema),
					}}
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
					
					${query ? `
					// Track search event
					window.dataLayer.push({
						'event': 'search',
						'search_term': '${query.replace(/'/g, "\\'")}',
						'search_results': ${searchData?.totalProducts || 0}
					});
					` : ''}
				`}
			</Script>
			
			<div className="w-full space-y-8">
				{/* Breadcrumb Navigation */}
				<nav className="px-4" aria-label="Breadcrumb">
					<ol className="flex items-center space-x-2 text-sm text-gray-600">
						<li>
							<Link href="/" className="hover:text-gray-900">Home</Link>
						</li>
						<li className="text-gray-400">/</li>
						<li>
							<Link href="/products" className="hover:text-gray-900">Products</Link>
						</li>
						<li className="text-gray-400">/</li>
						<li className="text-gray-900 font-medium">
							{query ? `Search: "${query}"` : "Search"}
						</li>
					</ol>
				</nav>
				
				<InitializeSearch products={initializeProducts} blogPosts={initializeBlogPosts} />

				{/* Products Section */}
				<div className="w-full">
					<Suspense fallback={<HomeLoading />}>{searchContent}</Suspense>
				</div>
			</div>
		</>
	);
}
