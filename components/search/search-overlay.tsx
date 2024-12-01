"use client";

import { useSearch } from "@/lib/providers/search-provider";
import { ProductsContentClient } from "@/components/products/products-content-client";
import { useCallback } from "react";
import { Suspense } from "react";

// Loading component for better UX
function ProductsLoading() {
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

export function SearchOverlay() {
	const { isSearching, searchResults, searchQuery, allProducts } = useSearch();

	if (!isSearching) return null;

	const displayProducts = searchQuery.trim() ? searchResults : allProducts;

	// Create virtual collection with filtered products
	const virtualCollection = {
		id: "search-results",
		handle: "search-results",
		title: searchQuery.trim() ? `Search Results for "${searchQuery}"` : "All Products",
		description: searchQuery.trim() ? `Found ${searchResults.length} products matching your search` : "",
		products: {
			edges: displayProducts.map((product) => ({
				node: product,
			})),
		},
	};

	return (
		<div className="min-h-[calc(100vh-8.5rem)]">
			<section aria-label="Products Catalog" className="products-section" itemScope itemType="https://schema.org/CollectionPage">
				<Suspense fallback={<ProductsLoading />}>
					<ProductsContentClient collection={virtualCollection} />
				</Suspense>
			</section>
		</div>
	);
}
