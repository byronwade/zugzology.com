import React, { Suspense } from "react";
import { getProduct } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import type { Metadata } from "next";
import { ProductContentClient } from "@/components/products/product-content-client";

export async function generateMetadata({ params: { handle } }: { params: { handle: string } }): Promise<Metadata> {
	const product = await getProduct(handle);
	if (!product) return notFound();

	return {
		title: product.title,
		description: product.description,
		openGraph: {
			images: [{ url: product.images.edges[0]?.node.url || "" }],
		},
	};
}

function ProductLoading() {
	return (
		<div className="w-full h-screen flex items-center justify-center">
			<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
		</div>
	);
}

async function ProductContent({ handle }: { handle: string }) {
	const product = await getProduct(handle);

	if (!product) {
		console.error("Product not found:", handle);
		return notFound();
	}

	// Validate required product data
	const hasRequiredData = product.variants?.edges?.length > 0 && product.images?.edges?.length > 0;

	if (!hasRequiredData) {
		console.error("Product missing required data:", {
			handle,
			hasVariants: Boolean(product.variants?.edges?.length),
			hasImages: Boolean(product.images?.edges?.length),
		});
		return notFound();
	}

	return <ProductContentClient product={product} />;
}

export default async function ProductPage({ params: { handle } }: { params: { handle: string } }) {
	return (
		<div className="w-full px-4 py-8 bg-gray-50 dark:bg-gray-900">
			<ErrorBoundary fallback={<div className="text-center text-red-600 dark:text-red-400">Error loading product</div>}>
				<Suspense fallback={<ProductLoading />}>
					<ProductContent handle={handle} />
				</Suspense>
			</ErrorBoundary>
		</div>
	);
}
