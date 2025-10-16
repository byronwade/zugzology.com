"use client";

import { Suspense } from "react";
import { ProductsContent } from "@/components/features/products/products-content";
import { useSearch } from "@/components/providers";

// Loading component for better UX
function ProductsLoading() {
	return (
		<div className="w-full animate-pulse">
			<div className="mx-auto max-w-screen-xl px-4">
				<div className="mb-4 h-8 w-1/4 rounded bg-muted" />
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{[...new Array(12)].map((_, i) => (
						<div className="h-64 rounded-lg bg-muted" key={i} />
					))}
				</div>
			</div>
		</div>
	);
}

export function SearchResults() {
	const { searchResults, searchQuery, allProducts, totalProducts, isSearching } = useSearch();

	// Don't render anything if not searching
	if (!isSearching) {
		return null;
	}

	// Always show all products if no search query, otherwise show search results
	const displayProducts = searchQuery.trim() ? searchResults.products : allProducts;

	// Create virtual collection with filtered products
	const virtualCollection = {
		id: "search-results",
		handle: "search-results",
		title: searchQuery.trim()
			? `Search Results for "${searchQuery}" (${searchResults.products.length} of ${totalProducts} products)`
			: `All Products (${totalProducts} total)`,
		description: searchQuery.trim()
			? `Found ${searchResults.products.length} products matching your search out of ${totalProducts} total products`
			: `Showing all ${totalProducts} products in our catalog`,
		products: {
			edges: displayProducts.map((product) => ({
				node: product,
			})),
		},
	};

	// Show loading state if no products are loaded yet
	if (totalProducts === 0) {
		return (
			<div className="w-full py-6">
				<ProductsLoading />
			</div>
		);
	}

	// Show no results message if search returns nothing
	if (searchQuery.trim() && !displayProducts.length) {
		return (
			<div className="w-full py-12">
				<div className="mx-auto max-w-screen-xl px-4">
					<div className="text-center">
						<h2 className="mb-2 font-semibold text-xl">No Products Found</h2>
						<p className="text-muted-foreground">Try adjusting your search terms or browse our catalog below</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full py-6">
			<div className="mx-auto max-w-screen-xl px-4">
				<section
					aria-label="Products Catalog"
					className="products-section"
					itemScope
					itemType="https://schema.org/CollectionPage"
				>
					<Suspense fallback={<ProductsLoading />}>
						<ProductsContent
							collection={virtualCollection as any}
							currentPage={1}
							description={virtualCollection.description}
							title={virtualCollection.title}
						/>
					</Suspense>
				</section>
			</div>
		</div>
	);
}
