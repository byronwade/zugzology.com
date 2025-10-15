"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { ProductsContent } from "@/components/features/products/products-content";
import { useSearch } from "@/components/providers";

// Loading component for better UX
function ProductsLoading() {
	return (
		<div className="w-full animate-pulse">
			<div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
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

export function MainContent({ children }: { children: React.ReactNode }) {
	const { isSearching, setSearchQuery, searchResults, searchQuery, allProducts, totalProducts, setIsSearching } =
		useSearch();
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
	if (
		(pathname.startsWith("/products/") || pathname.startsWith("/collections/")) &&
		!(isSearching && searchQuery.trim())
	) {
		return <main className="w-full flex-1">{children}</main>;
	}

	if (isSearching) {
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
				<main className="w-full flex-1">
					<div className="w-full py-12">
						<div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
							<div className="text-center">
								<h2 className="mb-2 font-semibold text-xl">Loading Products</h2>
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
				<main className="w-full flex-1">
					<div className="w-full py-12">
						<div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
							<div className="text-center">
								<h2 className="mb-2 font-semibold text-xl">No Products Found</h2>
								<p className="text-muted-foreground">Try adjusting your search terms or browse our catalog below</p>
							</div>
						</div>
					</div>
				</main>
			);
		}

		return (
			<main className="w-full flex-1">
				<div className="w-full py-6">
					<div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
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
									title={virtualCollection.title}
									description={virtualCollection.description}
								/>
							</Suspense>
						</section>
					</div>
				</div>
			</main>
		);
	}

	return <main className="w-full flex-1">{children}</main>;
}
