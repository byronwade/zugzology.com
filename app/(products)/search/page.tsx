"use cache";

import React from "react";
import { getProducts } from "@/lib/actions/shopify";
import { ProductsContentClient } from "@/components/products/products-content-client";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { InitializeSearch } from "@/components/search";

export const metadata: Metadata = {
	title: "Search Products | Premium Mushroom Growing Supplies | Zugzology",
	description: "Search through our extensive catalog of premium mushroom growing supplies and equipment. Find spores, substrates, tools, and everything you need for successful cultivation.",
	keywords: "search mushroom supplies, mushroom growing equipment, mushroom cultivation tools, mushroom substrate search, mushroom spores catalog",
	openGraph: {
		title: "Search Products | Premium Mushroom Growing Supplies | Zugzology",
		description: "Search through our extensive catalog of premium mushroom growing supplies and equipment.",
		url: "https://zugzology.com/search",
		siteName: "Zugzology",
		type: "website",
		locale: "en_US",
	},
	alternates: {
		canonical: "https://zugzology.com/search",
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

interface SearchPageProps {
	searchParams?: {
		q?: string;
	};
}

// Loading component for better UX
const SearchLoading = () => (
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

// Error fallback component
const SearchError = () => (
	<div className="w-full min-h-[50vh] flex items-center justify-center">
		<div className="text-center">
			<h2 className="text-xl font-semibold mb-2">Search Error</h2>
			<p className="text-muted-foreground">Unable to perform search. Please try again.</p>
		</div>
	</div>
);

// Search content component
const SearchContent = async ({ searchParams }: SearchPageProps) => {
	const params = await searchParams;
	const query = params?.q || "";
	const products = await getProducts();

	if (!products?.length) {
		return (
			<div className="w-full min-h-[50vh] flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold mb-2">No Products Found</h2>
					<p className="text-muted-foreground">Please try again later.</p>
				</div>
			</div>
		);
	}

	const virtualCollection = {
		id: "search",
		handle: "search",
		title: query ? `Search Results for "${query}"` : "Search Products",
		description: "",
		products: {
			edges: products.map((product) => ({ node: product })),
		},
	};

	return (
		<>
			<InitializeSearch products={products} />
			<ProductsContentClient collection={virtualCollection} searchQuery={query} />
		</>
	);
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
	const params = await searchParams;
	const query = params?.q || "";

	return (
		<ErrorBoundary fallback={<SearchError />}>
			<header className="sr-only">
				<h1>{query ? `Search Results for "${query}"` : "Search Products"}</h1>
			</header>

			<section aria-label="Search Results" className="search-section">
				<Suspense fallback={<SearchLoading />}>
					<SearchContent searchParams={params} />
				</Suspense>
			</section>
		</ErrorBoundary>
	);
}
