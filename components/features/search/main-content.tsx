"use client";

import { useSearch } from "@/components/providers";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ProductsContentClient } from "@/components/features/products/products-content-client";
import { Suspense } from "react";

// Loading component for better UX
function ProductsLoading() {
	return (
		<div className="w-full animate-pulse">
			<div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
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

export function MainContent({ children }: { children: React.ReactNode }) {
	const { isSearching, setSearchQuery, searchResults, searchQuery, allProducts, totalProducts, setIsSearching } = useSearch();
	const pathname = usePathname();
	const lastPathname = useRef(pathname);

	// Reset search when navigating to a new page
	useEffect(() => {
		if (pathname !== lastPathname.current) {
			// Clear search state when navigating
			setSearchQuery("");
			setIsSearching(false);
			lastPathname.current = pathname;
		}
	}, [pathname, setSearchQuery, setIsSearching]);

	// If we're on a product or collection page and not searching, show the page content
	if (pathname.startsWith("/products/") || pathname.startsWith("/collections/")) {
		if (!isSearching || !searchQuery.trim()) {
			return <main className="flex-1 w-full">{children}</main>;
		}
	}

	if (isSearching) {
		// Always show all products if no search query, otherwise show search results
		const displayProducts = searchQuery.trim() ? searchResults : allProducts;

		// Create virtual collection with filtered products
		const virtualCollection = {
			id: "search-results",
			handle: "search-results",
			title: searchQuery.trim() ? `Search Results for "${searchQuery}" (${searchResults.length} of ${totalProducts} products)` : `All Products (${totalProducts} total)`,
			description: searchQuery.trim() ? `Found ${searchResults.length} products matching your search out of ${totalProducts} total products` : `Showing all ${totalProducts} products in our catalog`,
			products: {
				edges: displayProducts.map((product) => ({
					node: product,
				})),
			},
		};

		// Show loading state if no products are loaded yet
		if (totalProducts === 0) {
			return (
				<main className="flex-1 w-full">
					<div className="w-full py-12">
						<div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
							<div className="text-center">
								<h2 className="text-xl font-semibold mb-2">Loading Products</h2>
								<p className="text-muted-foreground">Please wait while we fetch the products...</p>
							</div>
						</div>
					</div>
				</main>
			);
		}

		// Show no results message if search returns nothing
		if (searchQuery.trim() && !displayProducts.length) {
			return (
				<main className="flex-1 w-full">
					<div className="w-full py-12">
						<div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
							<div className="text-center">
								<h2 className="text-xl font-semibold mb-2">No Products Found</h2>
								<p className="text-muted-foreground">Try adjusting your search terms or browse our catalog below</p>
							</div>
						</div>
					</div>
				</main>
			);
		}

		return (
			<main className="flex-1 w-full">
				<div className="w-full py-6">
					<div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
						<section aria-label="Products Catalog" className="products-section" itemScope itemType="https://schema.org/CollectionPage">
							<Suspense fallback={<ProductsLoading />}>
								<ProductsContentClient collection={virtualCollection} />
							</Suspense>
						</section>
					</div>
				</div>
			</main>
		);
	}

	return <main className="flex-1 w-full">{children}</main>;
}
