"use client";

import { memo, Suspense, useMemo } from "react";
import { ProductFilters } from "@/components/features/filters";
import { ProductCard } from "@/components/features/products/product-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControlsSSR } from "@/components/ui/pagination";
import { ProductCardSkeleton } from "@/components/ui/skeletons/product-card-skeleton";
import { useProductFiltering } from "@/hooks/use-product-filtering";
import type { ShopifyProduct } from "@/lib/types";

/** Server-side page size; the loading grid renders one skeleton per slot. */
const PRODUCTS_PER_PAGE = 24;

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

/**
 * Stands in for the real grid below, so it carries the same `py-8` wrapper, the
 * same grid classes and the same card skeleton. It used to be a freehand card
 * shape with no wrapper padding, which meant the grid moved 32px the moment it
 * resolved.
 */
function ProductGridLoading() {
	return (
		<div className="py-8">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
					<ProductCardSkeleton key={i} view="responsive" />
				))}
			</div>
		</div>
	);
}

// Header component
function ProductsHeader({
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
}

// Memoized product item component for stable props
const ProductItem = memo(function ProductItem({
	product,
	isPriority,
}: {
	product: ShopifyProduct;
	isPriority: boolean;
}) {
	// Memoize variant extraction to prevent recalculation
	const variantData = useMemo(() => {
		const firstVariant = product.variants?.nodes?.[0];
		if (!firstVariant) {
			return null;
		}

		return {
			id: firstVariant.id,
			quantity: firstVariant.quantityAvailable,
		};
	}, [product.variants]);

	if (!variantData) {
		return null;
	}

	// One card, styled per breakpoint. This used to render the card twice and
	// hide one with display:none, so every product on the page was parsed and
	// hydrated a second time for nothing. The grid container is unchanged, so
	// both layouts land exactly where they did.
	return (
		<ProductCard
			priority={isPriority}
			product={product}
			quantity={variantData.quantity}
			variantId={variantData.id}
			view="responsive"
		/>
	);
});

// Product grid component - memoized for performance
const ProductGrid = memo(function ProductGrid({
	products,
	priority = false,
}: {
	products: ShopifyProduct[];
	priority?: boolean;
}) {
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{products.map((product, index) => (
				<ProductItem isPriority={priority && index < 4} key={product.id} product={product} />
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

				<EmptyState description="Try adjusting your filters or browse our collections." title="No Products Found" />
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
