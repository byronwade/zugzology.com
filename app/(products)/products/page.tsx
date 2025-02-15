import { getProducts } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ProductsContentClient } from "@/components/products/products-content-client";
import type { Metadata } from "next";
import { Suspense } from "react";
import React from "react";
import { ErrorBoundary } from "@/components/error-boundary";

interface ProductsPageProps {
	searchParams?: {
		sort?: string;
		availability?: string;
		price?: string;
		category?: string;
	};
}

// Loading component for better UX
const ProductsLoading = () => (
	<div className="w-full h-screen animate-pulse">
		<div className="max-w-screen-xl mx-auto px-4">
			<div className="h-8 w-1/4 bg-gray-200 rounded mb-4" />
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{[...Array(12)].map((_, i) => (
					<div key={i} className="bg-gray-200 rounded-lg h-64" />
				))}
			</div>
		</div>
	</div>
);

// Error fallback component
const ProductsError = () => (
	<div className="w-full min-h-[50vh] flex items-center justify-center">
		<div className="text-center">
			<h2 className="text-xl font-semibold mb-2">Unable to load products</h2>
			<p className="text-muted-foreground">Please try refreshing the page</p>
		</div>
	</div>
);

// Optimize product data structure
const optimizeProductData = (products: any[]) => {
	return products.map((product) => ({
		id: product.id,
		title: product.title,
		handle: product.handle,
		description: product.description,
		availableForSale: product.availableForSale,
		productType: product.productType || "",
		vendor: product.vendor || "",
		tags: product.tags || [],
		options: product.options || [],
		publishedAt: product.publishedAt || new Date().toISOString(),
		priceRange: product.priceRange,
		images: {
			edges: product.images.edges.slice(0, 1), // Only keep first image for initial render
		},
		variants: {
			edges: [product.variants.edges[0]], // Only keep first variant for initial render
		},
	}));
};

// Products content component
const ProductsContent = async ({ searchParams }: ProductsPageProps) => {
	const nextSearchParams = await searchParams;
	const products = await getProducts();

	if (!products) {
		return notFound();
	}

	const optimizedProducts = optimizeProductData(products);

	const virtualCollection = {
		id: "all-products",
		handle: "all-products",
		title: "All Products",
		description: "",
		products: {
			edges: optimizedProducts.map((product) => ({
				node: product,
			})),
		},
	};

	return (
		<ProductsContentClient
			collection={virtualCollection}
			initialFilters={{
				sort: nextSearchParams?.sort,
				availability: nextSearchParams?.availability,
				price: nextSearchParams?.price,
				category: nextSearchParams?.category,
			}}
		/>
	);
};

export default async function ProductsPage({ searchParams = {} }: ProductsPageProps) {
	const nextSearchParams = await searchParams;

	return (
		<ErrorBoundary fallback={<ProductsError />}>
			<header className="sr-only">
				<h1>All Products - Premium Mushroom Growing Supplies</h1>
			</header>

			<section aria-label="Products Catalog" className="products-section" itemScope itemType="https://schema.org/CollectionPage">
				<Suspense fallback={<ProductsLoading />}>
					<ProductsContent searchParams={nextSearchParams} />
				</Suspense>
			</section>
		</ErrorBoundary>
	);
}
