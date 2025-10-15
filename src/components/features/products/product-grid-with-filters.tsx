"use client";

import { memo, Suspense, useMemo } from "react";
import { ProductCard } from "@/components/features/products/product-card";
import { ProductFilters } from "@/components/features/filters";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControlsSSR } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductFiltering } from "@/hooks/use-product-filtering";
import type { ShopifyProduct } from "@/lib/types";

type ProductGridWithFiltersProps = {
	products: ShopifyProduct[];
	title: string;
	description?: string;
	currentPage?: number;
	totalProducts?: number;
	searchQuery?: string;
	collectionHandle?: string;
	context?: "collection" | "search" | "all-products" | "home" | "wishlist";
	showCollectionFilter?: boolean;
};

// Loading component for product grid
function ProductGridLoading() {
	return (
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
	);
}

// Header component
function ProductsHeader({ title, description, totalProducts }: { title: string; description?: string; totalProducts: number }) {
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
}

// Memoized product item component for stable props
const ProductItem = memo(function ProductItem({
	product,
	isPriority
}: {
	product: ShopifyProduct;
	isPriority: boolean;
}) {
	// Memoize variant extraction to prevent recalculation
	const variantData = useMemo(() => {
		const firstVariant = product.variants?.nodes?.[0];
		if (!firstVariant) return null;

		return {
			id: firstVariant.id,
			quantity: firstVariant.quantityAvailable,
		};
	}, [product.variants]);

	if (!variantData) return null;

	return (
		<div className="group relative">
			<div className="sm:hidden">
				<ProductCard
					priority={isPriority}
					product={product}
					quantity={variantData.quantity}
					variantId={variantData.id}
					view="list"
				/>
			</div>
			<div className="hidden sm:block">
				<ProductCard
					priority={isPriority}
					product={product}
					quantity={variantData.quantity}
					variantId={variantData.id}
					view="grid"
				/>
			</div>
		</div>
	);
});

// Product grid component - memoized for performance
const ProductGrid = memo(function ProductGrid({
	products,
	priority = false
}: {
	products: ShopifyProduct[];
	priority?: boolean;
}) {
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{products.map((product, index) => (
				<ProductItem
					key={product.id}
					isPriority={priority && index < 4}
					product={product}
				/>
			))}
		</div>
	);
});

// Main client component with filtering
export function ProductGridWithFilters({
	products: initialProducts,
	title,
	description,
	currentPage = 1,
	totalProducts: initialTotalProducts,
	searchQuery,
	collectionHandle,
	showCollectionFilter = false,
}: ProductGridWithFiltersProps) {
	// Use filtering hook
	const { filteredProducts } = useProductFiltering(initialProducts);

	// Use filtered products
	const displayProducts = useMemo(() => filteredProducts, [filteredProducts]);

	// Calculate total pages based on total products count, not filtered results
	// The filtering happens on the client side, but pagination is server-side
	const PRODUCTS_PER_PAGE = 24;
	const totalProductsCount = initialTotalProducts ?? initialProducts.length;
	const totalPages = Math.ceil(totalProductsCount / PRODUCTS_PER_PAGE);

	// If no products after filtering, show empty state
	if (displayProducts.length === 0) {
		return (
			<main className="container mx-auto px-4 py-12" itemScope itemType="https://schema.org/CollectionPage">
				<meta content={`${title} - Zugzology`} itemProp="name" />
				<meta content={description || "Browse our collection of products"} itemProp="description" />
				<ProductsHeader description={description} title={title} totalProducts={totalProductsCount} />

				{/* Product Filters */}
				<ProductFilters products={initialProducts} showCollections={showCollectionFilter} />

				<EmptyState
					description="Try adjusting your filters or browse our collections."
					title="No Products Found"
				/>
			</main>
		);
	}

	return (
		<main className="container mx-auto px-4 py-12" itemScope itemType="https://schema.org/CollectionPage">
			<meta content={`${title} - Zugzology`} itemProp="name" />
			<meta content={description || "Browse our collection of products"} itemProp="description" />

			<ProductsHeader description={description} title={title} totalProducts={totalProductsCount} />

			{/* Product Filters */}
			<ProductFilters products={initialProducts} showCollections={showCollectionFilter} />

			{/* Product Grid with Streaming */}
			<Suspense fallback={<ProductGridLoading />}>
				<div className="py-8">
					<ProductGrid priority={currentPage === 1} products={displayProducts} />
				</div>
			</Suspense>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="mt-8">
					<PaginationControlsSSR
						basePath={searchQuery ? "/search" : collectionHandle ? `/collections/${collectionHandle}` : "/products"}
						currentPage={currentPage}
						totalPages={totalPages}
					/>
				</div>
			)}
		</main>
	);
}
