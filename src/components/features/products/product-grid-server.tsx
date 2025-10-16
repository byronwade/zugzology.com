import { Suspense } from "react";
import { ProductCard } from "@/components/features/products/product-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControlsSSR } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import type { ShopifyCollectionWithPagination } from "@/lib/api/shopify/types";
import type { ShopifyProduct } from "@/lib/types";

type ProductGridServerProps = {
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

// Product grid component
function ProductGrid({ products, priority = false }: { products: ShopifyProduct[]; priority?: boolean }) {
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{products.map((product, index) => {
				const firstVariant = product.variants?.nodes?.[0];

				if (!firstVariant) {
					return null;
				}

				// Mark first 4 products as priority for LCP optimization
				const isPriority = priority && index < 4;

				return (
					<div className="group relative" key={product.id}>
						<div className="sm:hidden">
							<ProductCard
								priority={isPriority}
								product={product}
								quantity={firstVariant.quantityAvailable}
								variantId={firstVariant.id}
								view="list"
							/>
						</div>
						<div className="hidden sm:block">
							<ProductCard
								priority={isPriority}
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
}

// Main server component
export async function ProductGridServer({
	collection,
	products: initialProducts,
	title,
	description,
	currentPage = 1,
	totalProducts: initialTotalProducts,
	searchQuery,
	collectionHandle,
}: ProductGridServerProps) {
	// Get products from collection or direct props
	const rawProducts = collection ? collection.products.edges.map((edge) => edge.node) : initialProducts || [];

	// Get total count
	const totalProductsCount =
		collection?.productsCount !== undefined
			? collection.productsCount
			: initialTotalProducts !== undefined
				? initialTotalProducts
				: rawProducts.length;

	// Calculate total pages
	const PRODUCTS_PER_PAGE = 24;
	const totalPages = Math.ceil(totalProductsCount / PRODUCTS_PER_PAGE);

	// If no products, show empty state
	if (rawProducts.length === 0) {
		return (
			<main className="container mx-auto px-4 py-12" itemScope itemType="https://schema.org/CollectionPage">
				<meta content={`${title} - Zugzology`} itemProp="name" />
				<meta content={description || "Browse our collection of products"} itemProp="description" />
				<ProductsHeader description={description} title={title} totalProducts={totalProductsCount} />
				<EmptyState description="Try adjusting your search or browse our collections." title="No Products Found" />
			</main>
		);
	}

	return (
		<main className="container mx-auto px-4 py-12" itemScope itemType="https://schema.org/CollectionPage">
			<meta content={`${title} - Zugzology`} itemProp="name" />
			<meta content={description || "Browse our collection of products"} itemProp="description" />

			<ProductsHeader description={description} title={title} totalProducts={rawProducts.length} />

			{/* Product Grid with Streaming */}
			<Suspense fallback={<ProductGridLoading />}>
				<ProductGrid priority={currentPage === 1} products={rawProducts} />
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
