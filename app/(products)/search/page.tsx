"use server";

import { getProducts } from "@/lib/actions/shopify";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsContentClient } from "@/components/products/products-content-client";
import type { ShopifyCollection } from "@/lib/types";
import { InitializeSearch } from "@/components/search/initialize-search";

// Loading component for better UX
function SearchLoading() {
	return (
		<div className="w-full h-screen animate-pulse">
			<div className="max-w-screen-xl mx-auto px-4">
				<div className="h-8 w-1/4 bg-gray-200 rounded mb-4" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{[...Array(12)].map((_, i) => (
						<div key={i} className="bg-gray-200 rounded-lg h-64" />
					))}
				</div>
			</div>
		</div>
	);
}

interface SearchPageProps {
	searchParams?: {
		q?: string;
		sort?: string;
		availability?: string;
		price?: string;
		category?: string;
	};
}

// Fetch products data with caching
async function getSearchData(query: string) {
	"use cache";

	if (!query || typeof query !== "string") {
		console.error("Invalid search query:", query);
		return [];
	}

	const startTime = performance.now();

	try {
		const products = await getProducts();

		// Filter products based on search query
		const searchTerms = query.toLowerCase().split(/\s+/);
		const filteredProducts = products.filter((product) => {
			const searchableText = [product.title, product.description, product.productType, product.vendor, ...(product.tags || [])].filter(Boolean).join(" ").toLowerCase();

			return searchTerms.every((term) => searchableText.includes(term));
		});

		const duration = performance.now() - startTime;
		if (duration > 100) {
			console.log(`⚡ [Search Data] ${duration.toFixed(2)}ms | Results: ${filteredProducts.length}`);
		}

		return filteredProducts;
	} catch (error) {
		console.error(
			`Error searching products:`,
			error instanceof Error
				? {
						message: error.message,
						stack: error.stack?.split("\n").slice(0, 3),
				  }
				: "Unknown error"
		);
		return [];
	}
}

// Generate metadata for the search results
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

// Search page component with proper Suspense boundaries
async function SearchContent({ searchParams }: SearchPageProps) {
	const nextjs15Search = await searchParams;
	const query = nextjs15Search?.q || "";
	const products = await getProducts();
	const filteredProducts = await getSearchData(query);

	// Create a collection-like structure for the ProductsContentClient
	const searchResults: ShopifyCollection = {
		id: "search-results",
		handle: "search",
		title: query ? `Search results for "${query}"` : "All Products",
		description: `${filteredProducts.length} ${filteredProducts.length === 1 ? "result" : "results"}${query ? ` for "${query}"` : ""}`,
		products: {
			edges: filteredProducts.map((product) => ({ node: product })),
		},
	};

	return (
		<>
			<InitializeSearch products={products} />
			<Suspense fallback={<SearchLoading />}>
				<ProductsContentClient collection={searchResults} searchQuery={nextjs15Search?.sort} />
			</Suspense>
		</>
	);
}

export default async function SearchPage(props: SearchPageProps) {
	return (
		<Suspense fallback={<SearchLoading />}>
			<SearchContent {...props} />
		</Suspense>
	);
}
