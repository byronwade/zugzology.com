"use client";

import React, { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { ProductCard } from "@/components/features/products/product-card";
import { useSearch } from "@/components/providers";
import { useAIFiltering } from "@/hooks/use-realtime-ai-filtering";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, TrendingUp, Target, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ShopifyProduct, ShopifyBlogArticle } from "@/lib/types";
import type { ShopifyCollectionWithPagination } from "@/lib/api/shopify/types";
import { getAllBlogPosts } from "@/lib/api/shopify/actions";
import { PaginationControls } from "@/components/ui/pagination";

// Loading component
const ProductsLoading = () => (
	<div className="space-y-8">
		<div className="w-full border-b p-4 mb-8">
			<Skeleton className="h-8 w-64 mb-4" />
			<Skeleton className="h-4 w-96" />
			<div className="flex justify-end mt-6">
				<Skeleton className="h-10 w-40" />
			</div>
		</div>
		<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
			{Array.from({ length: 12 }).map((_, i) => (
				<div key={i} className="flex flex-col border border-foreground/10 rounded-lg">
					<Skeleton className="aspect-square w-full rounded-t-lg" />
					<div className="p-4 space-y-3">
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-5 w-3/4" />
						<Skeleton className="h-4 w-1/3" />
						<Skeleton className="h-10 w-full mt-4" />
					</div>
				</div>
			))}
		</div>
	</div>
);

// AI-powered header component
const AIProductsHeader = React.memo(function AIProductsHeader({
	title,
	description,
	metadata,
	totalProducts
}: {
	title: string;
	description?: string;
	metadata: any;
	totalProducts: number;
}) {
	return (
		<TooltipProvider>
			<div className="w-full border-b border-border/60 p-4 mb-8">
				{/* Title and AI indicators */}
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div className="flex items-center gap-4 flex-1 min-w-0">
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-3 mb-2">
								<h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">{title}</h1>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full">
											<Brain className="h-3 w-3 text-blue-600" />
											<span className="text-xs font-medium text-blue-700">AI</span>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p className="text-xs">AI recommendations based on your browsing history</p>
									</TooltipContent>
								</Tooltip>
							</div>
							{description && <p className="text-muted-foreground mt-1 line-clamp-3 max-w-[500px]">{description}</p>}
						</div>
					</div>

					{/* AI Sort Badge - No dropdown, just showing AI is active */}
					<div className="flex-shrink-0">
						<div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
							<Zap className="h-4 w-4 text-purple-600" />
							<span className="text-sm font-medium text-purple-900">AI Recommended</span>
							<Badge variant="secondary" className="text-xs">
								{metadata.aiActiveProducts || 0} ranked
							</Badge>
						</div>
					</div>
				</div>

				{/* AI insights bar */}
				{metadata.aiActiveProducts > 0 && (
					<div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<TrendingUp className="h-4 w-4 text-blue-600" />
								<div className="flex items-center gap-2 text-sm">
									<span className="font-medium text-blue-900">AI Ranking Active</span>
									<span className="text-blue-700">•</span>
									<span className="text-blue-700">
										Products ordered by your past behavior and interests
									</span>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{metadata.highConfidenceProducts > 0 && (
									<Tooltip>
										<TooltipTrigger asChild>
											<Badge variant="outline" className="text-xs">
												<Target className="h-3 w-3 mr-1" />
												{metadata.highConfidenceProducts} high confidence
											</Badge>
										</TooltipTrigger>
										<TooltipContent>
											<p className="text-xs">Products we&apos;re highly confident you&apos;ll be interested in</p>
										</TooltipContent>
									</Tooltip>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Product count */}
				<div className="mt-2 text-sm text-muted-foreground">
					Showing {metadata.filteredCount} of {totalProducts} products
					{metadata.hasUserFilters && " (filtered)"}
				</div>
			</div>
		</TooltipProvider>
	);
});

// Add a helper function to safely access the total products count
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

interface RealtimeProductsContentProps {
	collection?: ShopifyCollectionWithPagination | null;
	products?: ShopifyProduct[];
	title: string;
	description?: string;
	currentPage?: number;
	onRemoveFromWishlist?: (handle: string) => void;
	totalProducts?: number;
	searchQuery?: string;
	collectionHandle?: string;
	context?: 'collection' | 'search' | 'all-products' | 'home';
}

// Memoize the entire component for performance
export const RealtimeProductsContent = React.memo(function RealtimeProductsContent({
	collection,
	products: initialProducts,
	title,
	description,
	currentPage = 1,
	onRemoveFromWishlist,
	totalProducts: initialTotalProducts,
	searchQuery,
	collectionHandle,
	context = 'collection'
}: RealtimeProductsContentProps) {
	// Get search context but don't let it affect main content rendering
	const { setAllProducts } = useSearch();

	// Track component mounting
	const [mounted, setMounted] = useState(false);

	// Get products from collection or direct props
	const rawProducts = useMemo(() => {
		return collection ? collection.products.edges.map((edge) => edge.node) : initialProducts || [];
	}, [collection, initialProducts]);

	// Get total count
	const totalProductsCount = getTotalProductsCount(collection, initialTotalProducts, rawProducts);

	// Calculate total pages
	const totalPages = useMemo(() => {
		const PRODUCTS_PER_PAGE = 24;
		return Math.ceil(totalProductsCount / PRODUCTS_PER_PAGE);
	}, [totalProductsCount]);

	// Use AI filtering (load-time only, not real-time)
	const {
		products: aiFilteredProducts,
		isLoading,
		metadata,
		trackView,
		trackHoverStart,
		trackHoverEnd,
		trackCartAction,
		trackWishlistAction
	} = useAIFiltering(rawProducts, {
		context,
		searchQuery,
		collectionHandle: collectionHandle || collection?.handle,
		limit: 24
	});

	// Initialize products
	useEffect(() => {
		if (!mounted) {
			setMounted(true);
		}

		if (rawProducts.length > 0) {
			setAllProducts([...rawProducts]);
		}
	}, [rawProducts, mounted, setAllProducts]);

	// Enhanced product list that tracks interactions with sophisticated timing and uses original ProductCard
	const EnhancedProductList = useCallback(({ products }: { products: any[] }) => {
		return (
			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
				{products.map((aiProduct, index) => {
					const { product } = aiProduct;
					const firstVariant = product.variants?.nodes?.[0];
					
					if (!firstVariant) return null;
					
					return (
						<div 
							key={product.id}
							className="group relative"
							onMouseEnter={(event) => {
								trackHoverStart(product.id);
								// Store start time for this specific element
								const startTime = Date.now();
								(event.currentTarget as any)._hoverStart = startTime;
							}}
							onMouseLeave={(event) => {
								const startTime = (event.currentTarget as any)._hoverStart;
								if (startTime) {
									const duration = Date.now() - startTime;
									trackHoverEnd(product.id, duration);
								}
							}}
							onClick={() => trackView(product.id)}
						>
							<div className="sm:hidden">
								<ProductCard
									product={product}
									variantId={firstVariant.id}
									quantity={firstVariant.quantityAvailable}
									view="list"
									aiData={{
										aiScore: aiProduct.aiScore,
										aiConfidence: aiProduct.aiConfidence,
										aiReasons: aiProduct.aiReasons,
										trend: aiProduct.trend,
										rank: aiProduct.rank,
									}}
									onAddToCart={() => trackCartAction(product.id, 'add')}
									onAddToWishlist={() => trackWishlistAction(product.id, 'add')}
								/>
							</div>
							<div className="hidden sm:block">
								<ProductCard
									product={product}
									variantId={firstVariant.id}
									quantity={firstVariant.quantityAvailable}
									view="grid"
									aiData={{
										aiScore: aiProduct.aiScore,
										aiConfidence: aiProduct.aiConfidence,
										aiReasons: aiProduct.aiReasons,
										trend: aiProduct.trend,
										rank: aiProduct.rank,
									}}
									onAddToCart={() => trackCartAction(product.id, 'add')}
									onAddToWishlist={() => trackWishlistAction(product.id, 'add')}
								/>
							</div>
						</div>
					);
				})}
			</div>
		);
	}, [trackHoverStart, trackHoverEnd, trackView, trackCartAction, trackWishlistAction]);

	// Render content
	const renderContent = useCallback(() => {
		// Handle empty collection or no filtered results
		if (aiFilteredProducts.length === 0) {
			return (
				<>
					<AIProductsHeader 
						title={title} 
						description={description} 
						metadata={metadata} 
						totalProducts={totalProductsCount}
					/>
					<EmptyState
						title="No Products Found"
						description="No products match your current context. Our AI is learning your preferences."
						showCollectionCards={true}
					/>
				</>
			);
		}

		return (
			<>
				<AIProductsHeader 
					title={title} 
					description={description} 
					metadata={metadata} 
					totalProducts={totalProductsCount}
				/>
				
				<EnhancedProductList products={aiFilteredProducts} />

				{totalPages > 1 && (
					<div className="mt-8">
						<PaginationControls
							currentPage={currentPage}
							totalPages={totalPages}
							baseUrl={searchQuery ? "/search" : collection?.handle ? `/collections/${collection.handle}` : undefined}
						/>
					</div>
				)}
			</>
		);
	}, [
		aiFilteredProducts,
		isLoading,
		title,
		description,
		metadata,
		totalProductsCount,
		totalPages,
		currentPage,
		searchQuery,
		collection?.handle,
		EnhancedProductList
	]);

	// Always return a consistent structure to avoid hook issues
	return (
		<main className="w-full px-4" itemScope itemType="https://schema.org/CollectionPage">
			<meta itemProp="name" content={`${title} - Zugzology`} />
			<meta itemProp="description" content={description || "Browse our collection of products"} />
			{renderContent()}
		</main>
	);
});

RealtimeProductsContent.displayName = "RealtimeProductsContent";