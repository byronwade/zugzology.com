import React from "react";
import { getProduct } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import type { Metadata } from "next";
import { ProductContentClient } from "@/components/products/product-content-client";
import { Suspense } from "react";

interface ProductPageProps {
	params: {
		handle: string;
	};
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	const nextjs15 = await params;
	const product = await getProduct(nextjs15.handle);
	if (!product) return notFound();

	return {
		title: product.title,
		description: product.description,
		openGraph: {
			title: product.title,
			description: product.description,
			images:
				product.images?.edges?.map(({ node }) => ({
					url: node.url,
					width: node.width,
					height: node.height,
					alt: node.altText || product.title,
				})) || [],
		},
	};
}

function LoadingFallback() {
	return (
		<div className="w-full h-screen flex items-center justify-center">
			<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
		</div>
	);
}

export default async function ProductPage({ params }: ProductPageProps) {
	const nextjs15 = await params;
	const product = await getProduct(nextjs15.handle);

	if (!product) {
		console.error("Product not found:", nextjs15.handle);
		return notFound();
	}

	// Validate required product data
	const hasRequiredData = product.variants?.edges?.length > 0;

	if (!hasRequiredData) {
		console.error("Product missing required data:", {
			handle: nextjs15.handle,
			hasVariants: Boolean(product.variants?.edges?.length),
			hasImages: Boolean(product.images?.edges?.length),
		});
		return notFound();
	}

	const productJsonLd = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.title,
		description: product.description,
		image: product.images?.edges?.map(({ node }) => node.url) || [],
		offers: {
			"@type": "Offer",
			price: product.priceRange.minVariantPrice.amount,
			priceCurrency: product.priceRange.minVariantPrice.currencyCode,
			availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
		},
	};

	return (
		<div className="w-full px-4 py-8 bg-neutral-50 dark:bg-neutral-900">
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
			<ErrorBoundary fallback={<div className="text-center text-red-600 dark:text-red-400">Error loading product</div>}>
				<Suspense fallback={<LoadingFallback />}>
					<ProductContentClient product={product} />
				</Suspense>
			</ErrorBoundary>
		</div>
	);
}
