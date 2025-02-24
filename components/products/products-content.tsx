"use client";

import { Suspense } from "react";
import { ProductList } from "@/components/products/product-list";
import { HomeLoading } from "@/components/loading";
import { ProductsHeader } from "@/components/products/products-header";
import type { ShopifyProduct } from "@/lib/types";
import type { ShopifyCollectionWithPagination } from "@/lib/api/shopify/types";

interface ProductsContentProps {
	collection?: ShopifyCollectionWithPagination | null;
	products?: ShopifyProduct[];
	title: string;
	description?: string;
	currentPage: number;
	defaultSort?: string;
	onRemoveFromWishlist?: (handle: string) => void;
	totalProducts?: number; // Total count of all products (not just current page)
}

export function ProductsContent({ collection, products: initialProducts, title, description, currentPage, defaultSort = "featured", onRemoveFromWishlist, totalProducts: initialTotalProducts }: ProductsContentProps) {
	// Handle products from either collection or direct products prop
	const products = collection ? collection.products.edges.map((edge) => edge.node) : initialProducts || [];

	// Use the total count from collection or props
	const totalProducts = collection?.products?.totalCount || initialTotalProducts || products.length;

	if (!products?.length) {
		return (
			<div className="w-full min-h-[50vh] flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold mb-2">No products found</h2>
					<p className="text-muted-foreground">Please try adjusting your filters</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<ProductsHeader title={title} description={description || `${totalProducts} products available`} defaultSort={defaultSort} />
			<div id="products-top" className="scroll-mt-16" />
			<Suspense fallback={<HomeLoading />}>
				<ProductList products={products} totalProducts={totalProducts} currentPage={currentPage} productsPerPage={50} onRemoveFromWishlist={onRemoveFromWishlist} />
			</Suspense>
		</>
	);
}
