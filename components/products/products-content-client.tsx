"use client";

import { useViewMode } from "@/hooks/use-view-mode";
import { useSearch } from "@/lib/providers/search-provider";
import { ProductList } from "@/components/products/product-list";
import { ProductsHeader } from "@/components/products/products-header";
import { useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import type { ShopifyCollection } from "@/lib/types";
import { useProductFilters } from "@/lib/hooks/use-product-filters";
import { Badge } from "@/components/ui/badge";

interface ProductsContentClientProps {
	collection: ShopifyCollection;
	searchQuery?: string;
}

export function ProductsContentClient({ collection, searchQuery }: ProductsContentClientProps) {
	const { view, setView, mounted } = useViewMode();
	const { debouncedQuery, searchResults, isSearching, setAllProducts } = useSearch();
	const initRef = useRef(false);

	// Get initial products from collection
	const initialProducts = useMemo(() => {
		return collection?.products?.edges?.map(({ node }) => node) || [];
	}, [collection?.products?.edges]);

	// Initialize products from collection once
	useEffect(() => {
		if (initRef.current || !initialProducts.length) return;
		setAllProducts(initialProducts);
		initRef.current = true;
		console.log("[PRODUCTS] Initialized with:", initialProducts.length);
	}, [initialProducts, setAllProducts]);

	// Apply filters to products
	const { filteredProducts, filters, hasActiveFilters, updateFilter, handleClearFilters } = useProductFilters(initialProducts);

	// Get current products to display (search results or filtered products)
	const products = useMemo(() => {
		return isSearching ? searchResults : filteredProducts;
	}, [isSearching, searchResults, filteredProducts]);

	// Show loading state during hydration
	if (!mounted) {
		return (
			<div className="w-full h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	// Handle empty search results
	if (isSearching && !products.length) {
		return (
			<main className="w-full">
				<ProductsHeader title={`Search Results for "${debouncedQuery}"`} description="No products found matching your search." count={0} view={view} onViewChange={setView} filters={filters} hasActiveFilters={hasActiveFilters} onUpdateFilter={updateFilter} onClearFilters={handleClearFilters} />
				<section className="flex flex-col items-center justify-center py-12 px-4 text-center">
					<p className="text-lg text-muted-foreground mb-4">No products found</p>
					<p className="text-sm text-muted-foreground mb-6">Try adjusting your search or filters to find what you're looking for.</p>
					<Link prefetch={true} href="/products" className="text-primary hover:underline">
						View all products
					</Link>
				</section>
			</main>
		);
	}

	// Handle empty collection or no filtered results
	if (!isSearching && !products.length) {
		return (
			<main className="w-full">
				<ProductsHeader title={collection?.title || "Products"} description={collection?.description} count={0} view={view} onViewChange={setView} filters={filters} hasActiveFilters={hasActiveFilters} onUpdateFilter={updateFilter} onClearFilters={handleClearFilters} />
				<section className="flex flex-col items-center justify-center py-12 px-4 text-center">
					<p className="text-lg text-muted-foreground mb-4">No products found</p>
					<p className="text-sm text-muted-foreground mb-6">{hasActiveFilters ? "Try adjusting your filters to see more products." : "This collection is currently empty."}</p>
					{hasActiveFilters && (
						<Link prefetch={true} href={`/collections/${collection.handle}`} className="text-primary hover:underline">
							Clear all filters
						</Link>
					)}
				</section>
			</main>
		);
	}

	return (
		<main className="w-full">
			<ProductsHeader title={isSearching ? `Search Results for "${debouncedQuery}"` : collection.title} description={isSearching ? `Found ${products.length} products matching your search` : hasActiveFilters ? `Showing ${products.length} filtered products` : collection.description} count={products.length} view={view} onViewChange={setView} filters={filters} hasActiveFilters={hasActiveFilters} onUpdateFilter={updateFilter} onClearFilters={handleClearFilters} />
			<section className="px-4 py-6">
				<ProductList products={products} view={view} />
			</section>
		</main>
	);
}
