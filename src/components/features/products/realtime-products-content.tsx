"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/features/products/product-card";
import { useSearch } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControlsSSR } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import type { ShopifyCollectionWithPagination } from "@/lib/api/shopify/types";
import { rankProducts, searchProducts } from "@/lib/ranking/product-ranker";
import type { ShopifyProduct } from "@/lib/types";

// Loading component
const ProductsLoading = () => (
	<div className="space-y-8">
		<div className="mb-8 w-full border-b p-4">
			<Skeleton className="mb-4 h-8 w-64" />
			<Skeleton className="h-4 w-96" />
		</div>
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{Array.from({ length: 12 }).map((_, i) => (
				<div className="flex flex-col rounded-lg border border-foreground/10" key={i}>
					<Skeleton className="aspect-square w-full rounded-t-lg" />
					<div className="space-y-3 p-4">
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-5 w-3/4" />
						<Skeleton className="h-4 w-1/3" />
						<Skeleton className="mt-4 h-10 w-full" />
					</div>
				</div>
			))}
		</div>
	</div>
);

// Simple header component
const ProductsHeader = React.memo(function ProductsHeader({
	title,
	description,
	totalProducts,
}: {
	title: string;
	description?: string;
	totalProducts: number;
}) {
	return (
		<div className="mb-8 w-full border-border/60 border-b p-4">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex min-w-0 flex-1 items-center gap-4">
					<div className="min-w-0 flex-1">
						<div className="mb-2 flex items-center gap-3">
							<h1 className="truncate font-bold text-2xl tracking-tight md:text-3xl">{title}</h1>
							<Badge className="text-xs" variant="secondary">
								{totalProducts} products
							</Badge>
						</div>
						{description && <p className="mt-1 line-clamp-3 max-w-[500px] text-muted-foreground">{description}</p>}
					</div>
				</div>
			</div>
		</div>
	);
});

const getTotalProductsCount = (
	collection?: ShopifyCollectionWithPagination | null,
	initialTotalProducts?: number,
	rawProducts?: ShopifyProduct[]
): number => {
	if (collection?.productsCount !== undefined) {
		return collection.productsCount;
	}

	if (initialTotalProducts !== undefined) {
		return initialTotalProducts;
	}

	return rawProducts?.length || 0;
};

type ProductsContentProps = {
	collection?: ShopifyCollectionWithPagination | null;
	products?: ShopifyProduct[];
	title: string;
	description?: string;
	currentPage?: number;
	totalProducts?: number;
	searchQuery?: string;
	collectionHandle?: string;
	context?: "collection" | "search" | "all-products" | "home";
};

// Simplified component without AI filtering
export const SimpleProductsContent = React.memo(function SimpleProductsContent({
	collection,
	products: initialProducts,
	title,
	description,
	currentPage = 1,
	totalProducts: initialTotalProducts,
	searchQuery,
}: ProductsContentProps) {
	const { setAllProducts } = useSearch();
	const [mounted, setMounted] = useState(false);

	// Get products from collection or direct props
	const rawProducts = useMemo(
		() => (collection ? collection.products.edges.map((edge) => edge.node) : initialProducts || []),
		[collection, initialProducts]
	);

	// Get total count
	const totalProductsCount = getTotalProductsCount(collection, initialTotalProducts, rawProducts);

	// Calculate total pages
	const totalPages = useMemo(() => {
		const PRODUCTS_PER_PAGE = 24;
		return Math.ceil(totalProductsCount / PRODUCTS_PER_PAGE);
	}, [totalProductsCount]);

	// Apply simple ranking and search filtering
	const displayProducts = useMemo(() => {
		let filtered = rawProducts;

		// Apply search filter if query exists
		if (searchQuery) {
			filtered = searchProducts(filtered, searchQuery);
		}

		// Rank the products
		const ranked = rankProducts(filtered, {
			considerFeatured: true,
			considerRecency: true,
			considerPriceTier: true,
			considerStock: true,
		});

		return ranked;
	}, [rawProducts, searchQuery]);

	// Initialize products for search
	useEffect(() => {
		if (!mounted) {
			setMounted(true);
		}

		if (rawProducts.length > 0) {
			setAllProducts([...rawProducts]);
		}
	}, [rawProducts, mounted, setAllProducts]);

	// Product list component
	const ProductList = useCallback(
		({ products }: { products: ShopifyProduct[] }) => {
			return (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{products.map((product) => {
						const firstVariant = product.variants?.nodes?.[0];

						if (!firstVariant) {
							return null;
						}

						return (
							<div className="group relative" key={product.id}>
								<div className="sm:hidden">
									<ProductCard
										product={product}
										quantity={firstVariant.quantityAvailable}
										variantId={firstVariant.id}
										view="list"
									/>
								</div>
								<div className="hidden sm:block">
									<ProductCard
										product={product}
										quantity={firstVariant.quantityAvailable}
										variantId={firstVariant.id}
										view="grid"
									/>
								</div>
							</div>
						);
					})}
				</div>
			);
		},
		[]
	);

	// Render content
	const renderContent = useCallback(() => {
		if (displayProducts.length === 0) {
			return (
				<>
					<ProductsHeader description={description} title={title} totalProducts={totalProductsCount} />
					<EmptyState
						description="Try adjusting your search or browse our collections."
						title="No Products Found"
					/>
				</>
			);
		}

		return (
			<>
				<ProductsHeader description={description} title={title} totalProducts={totalProductsCount} />

				<ProductList products={displayProducts} />

				{totalPages > 1 && (
					<div className="mt-8">
						<PaginationControlsSSR
							basePath={
								searchQuery ? "/search" : collection?.handle ? `/collections/${collection.handle}` : "/products"
							}
							currentPage={currentPage}
							totalPages={totalPages}
						/>
					</div>
				)}
			</>
		);
	}, [displayProducts, title, description, totalProductsCount, totalPages, currentPage, searchQuery, collection?.handle, ProductList]);

	return (
		<main className="container mx-auto px-4 py-12" itemScope itemType="https://schema.org/CollectionPage">
			<meta content={`${title} - Zugzology`} itemProp="name" />
			<meta content={description || "Browse our collection of products"} itemProp="description" />
			{renderContent()}
		</main>
	);
});

SimpleProductsContent.displayName = "SimpleProductsContent";

// Export as RealtimeProductsContent for compatibility
export { SimpleProductsContent as RealtimeProductsContent };
