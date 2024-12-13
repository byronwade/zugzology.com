"use client";

import { useMemo } from "react";
import { ProductList } from "@/components/products/product-list";
import { ProductsHeader } from "@/components/products/products-header";
import { useViewMode } from "@/hooks/use-view-mode";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/types";
import Link from "next/link";
import { useSearch } from "@/lib/providers/search-provider";

interface ProductsContentClientProps {
	collection: ShopifyCollection;
	searchQuery?: string;
}

export function ProductsContentClient({ collection, searchQuery }: ProductsContentClientProps) {
	const { view, setView, mounted } = useViewMode();
	const { debouncedQuery, searchResults, isSearching, allProducts } = useSearch();

	// Memoize products array to prevent unnecessary recalculations
	const products = useMemo(() => {
		return isSearching ? searchResults : collection?.products?.edges?.map(({ node }) => node) || [];
	}, [isSearching, searchResults, collection?.products?.edges]);

	// Show loading state during hydration
	if (!mounted) {
		return (
			<div className="w-full h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	// Handle empty results
	if (isSearching && !products.length) {
		return (
			<main className="w-full">
				<ProductsHeader title={`Search Results for "${debouncedQuery}"`} description="No products found matching your search." count={0} view={view} onViewChange={setView} />
				<section className="flex flex-col items-center justify-center py-12 px-4 text-center">
					<p className="text-lg text-muted-foreground mb-4">No products found</p>
					<p className="text-sm text-muted-foreground mb-6">Try adjusting your search to find what you're looking for.</p>
					<Link prefetch={true} href="/products" className="text-primary hover:underline">
						View all products
					</Link>
				</section>
			</main>
		);
	}

	// Handle empty collection
	if (!isSearching && !products.length) {
		return (
			<main className="w-full">
				<ProductsHeader title={collection?.title || "Products"} description={collection?.description} count={0} view={view} onViewChange={setView} />
				<section className="flex flex-col items-center justify-center py-12 px-4 text-center">
					<p className="text-lg text-muted-foreground mb-4">No products found</p>
					<p className="text-sm text-muted-foreground mb-6">This collection is currently empty.</p>
					<Link prefetch={true} href="/products" className="text-primary hover:underline">
						View all products
					</Link>
				</section>
			</main>
		);
	}

	return (
		<main className="w-full">
			<ProductsHeader title={isSearching ? `Search Results for "${debouncedQuery}"` : collection.title} description={isSearching ? `Found ${products.length} products matching your search` : collection.description} count={products.length} view={view} onViewChange={setView} />
			<section className="px-4 py-6">
				<ProductList products={products} view={view} />
			</section>
		</main>
	);
}
