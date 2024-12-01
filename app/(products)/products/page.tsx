import { getProducts } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ProductsContentClient } from "@/components/products/products-content-client";
import type { Metadata } from "next";
import { Suspense } from "react";
import React from "react";

// Add server runtime optimizations
export const runtime = "edge";
export const preferredRegion = "auto";
export const dynamic = "force-dynamic";
export const revalidate = 60; // Cache for 1 minute

// Add function to fetch SEO settings
async function getProductsSEO() {
	// Fetch from your CMS or Shopify
	return {
		title: "All Products | Premium Mushroom Growing Supplies",
		description: "Browse our complete catalog of premium mushroom growing supplies and equipment.",
		keywords: ["mushroom growing supplies", "mushroom cultivation equipment"],
		ogImage: "https://zugzology.com/products-og.jpg",
	};
}

export async function generateMetadata(): Promise<Metadata> {
	const seo = await getProductsSEO();

	return {
		title: seo.title,
		description: seo.description,
		keywords: seo.keywords,
		// ... rest of metadata
	};
}

// Loading component for better UX
function ProductsLoading() {
	return (
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
}

// Optimize product data structure
function optimizeProductData(products: any[]) {
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
}

interface ProductsPageProps {
	searchParams?: {
		sort?: string;
		availability?: string;
		price?: string;
		category?: string;
	};
}

export default async function ProductsPage({ searchParams: rawSearchParams = {} }: ProductsPageProps) {
	const searchParams = await rawSearchParams;

	// Fetch all products
	const products = await getProducts();

	// Handle null case
	if (!products) {
		return notFound();
	}

	// Optimize products data for initial render
	const optimizedProducts = optimizeProductData(products);

	// Create virtual collection with all products
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
		<>
			<header className="sr-only">
				<h1>All Products - Premium Mushroom Growing Supplies</h1>
			</header>

			<section aria-label="Products Catalog" className="products-section" itemScope itemType="https://schema.org/CollectionPage">
				{/* Products grid with client-side interactions */}
				<Suspense fallback={<ProductsLoading />}>
					<ProductsContentClient collection={virtualCollection} />
				</Suspense>
			</section>
		</>
	);
}
