"use client";

import { useSearch } from "@/lib/providers/search-provider";
import { ProductList } from "@/components/products/product-list";
import { ProductsHeader } from "@/components/products/products-header";
import { useMemo, useEffect, useRef } from "react";
import { Link } from "@/components/ui/link";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/types";
import { useProductFilters } from "@/lib/hooks/use-product-filters";

interface ProductsContentClientProps {
	collection: ShopifyCollection;
	searchQuery?: string;
}

export function ProductsContentClient({ collection, searchQuery }: ProductsContentClientProps) {
	const { searchQuery: debouncedQuery, searchResults, isSearching, setAllProducts } = useSearch();
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
	const { filteredProducts, filters, updateFilter } = useProductFilters(initialProducts);

	// Get current products to display (search results or filtered products)
	const products = useMemo(() => {
		return isSearching ? searchResults.filter((result): result is { type: "product"; item: ShopifyProduct } => result.type === "product").map((result) => result.item) : filteredProducts;
	}, [isSearching, searchResults, filteredProducts]);

	// Handle empty search results
	if (isSearching && !products.length) {
		return (
			<main className="w-full" itemScope itemType="https://schema.org/SearchResultsPage">
				<meta itemProp="name" content={`Search Results for "${debouncedQuery}" - Zugzology`} />
				<meta itemProp="description" content={`No products found matching your search for "${debouncedQuery}"`} />
				<ProductsHeader title={`Search Results for "${debouncedQuery}"`} description="No products found matching your search." count={0} filters={filters} onUpdateFilter={updateFilter} />
				<section className="flex flex-col items-center justify-center py-12 px-4 text-center" aria-label="No results message">
					<p className="text-lg text-muted-foreground mb-4" role="alert">
						No products found
					</p>
					<p className="text-sm text-muted-foreground mb-6">Try adjusting your search or filters to find what you're looking for.</p>
					<Link prefetch={true} href="/products" className="text-primary hover:underline" aria-label="View all products">
						View all products
					</Link>
				</section>
			</main>
		);
	}

	// Handle empty collection or no filtered results
	if (!isSearching && !products.length) {
		return (
			<main className="w-full" itemScope itemType="https://schema.org/CollectionPage">
				<meta itemProp="name" content={`${collection?.title || "Products"} - Zugzology`} />
				<meta itemProp="description" content={collection?.description || "Browse our collection of products"} />
				<ProductsHeader title={collection?.title || "Products"} description={collection?.description} count={0} filters={filters} onUpdateFilter={updateFilter} />
				<section className="flex flex-col items-center justify-center py-12 px-4 text-center" aria-label="No products message">
					<p className="text-lg text-muted-foreground mb-4" role="alert">
						No products found
					</p>
					<p className="text-sm text-muted-foreground mb-6">{filters.sort !== "featured" ? "Try adjusting your filters to see more products." : "This collection is currently empty."}</p>
					{filters.sort !== "featured" && (
						<Link prefetch={true} href={`/collections/${collection.handle}`} className="text-primary hover:underline" aria-label="Clear all filters">
							Clear all filters
						</Link>
					)}
				</section>
			</main>
		);
	}

	return (
		<main className="w-full" itemScope itemType="https://schema.org/CollectionPage">
			<meta itemProp="name" content={`${isSearching ? `Search Results for "${debouncedQuery}"` : collection.title} - Zugzology`} />
			<meta itemProp="description" content={isSearching ? `Found ${products.length} products matching your search` : collection.description} />
			<meta itemProp="numberOfItems" content={String(products.length)} />

			<ProductsHeader title={isSearching ? `Search Results for "${debouncedQuery}"` : collection.title} description={isSearching ? `Found ${products.length} products matching your search` : filters.sort !== "featured" ? `Showing ${products.length} filtered products` : collection.description} count={products.length} filters={filters} onUpdateFilter={updateFilter} />

			<section className="px-4 py-6" aria-label={isSearching ? "Search Results" : "Product Catalog"} itemScope itemType="https://schema.org/ItemList">
				<meta itemProp="name" content={isSearching ? `Search Results for "${debouncedQuery}"` : collection.title} />
				<meta itemProp="numberOfItems" content={String(products.length)} />
				<ProductList products={products} />
			</section>
		</main>
	);
}
