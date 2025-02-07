"use client";

import { useViewMode } from "@/hooks/use-view-mode";
import { useSearch } from "@/lib/providers/search-provider";
import { ProductList } from "@/components/products/product-list";
import { ProductsHeader } from "@/components/products/products-header";
import { useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import type { ShopifyCollection } from "@/lib/types";

interface ProductsContentClientProps {
	collection: ShopifyCollection;
	searchQuery?: string;
	initialFilters?: {
		sort?: string;
		availability?: string;
		price?: string;
		category?: string;
	};
}

export function ProductsContentClient({ collection, searchQuery }: ProductsContentClientProps) {
	const { view, setView, mounted } = useViewMode();
	const { debouncedQuery, searchResults, isSearching, setAllProducts } = useSearch();
	const initRef = useRef(false);

	// Initialize products from collection once
	useEffect(() => {
		if (initRef.current || !collection?.products?.edges) return;

		const products = collection.products.edges.map(({ node }) => node);
		if (products.length > 0) {
			setAllProducts(products);
			initRef.current = true;
			console.log("[PRODUCTS] Initialized with:", products.length);
		}
	}, [collection?.products?.edges, setAllProducts]);

	// Get current products to display
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

	// Handle empty search results
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
