import React from "react";
import { getProduct } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import type { Metadata } from "next";
import { ProductContent } from "@/components/products/sections/product-content";
import { Suspense } from "react";

interface ProductPageProps {
	params: {
		handle: string;
	};
}

// Loading component for better UX
const ProductLoading = () => (
	<div className="w-full h-screen animate-pulse">
		<div className="max-w-screen-xl mx-auto px-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="aspect-square bg-gray-200 rounded-lg" />
				<div className="space-y-4">
					<div className="h-8 w-3/4 bg-gray-200 rounded" />
					<div className="h-4 w-1/2 bg-gray-200 rounded" />
					<div className="h-24 w-full bg-gray-200 rounded" />
					<div className="h-12 w-full bg-gray-200 rounded" />
				</div>
			</div>
		</div>
	</div>
);

// Error fallback component
const ProductError = () => (
	<div className="w-full min-h-[50vh] flex items-center justify-center">
		<div className="text-center">
			<h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
			<p className="text-muted-foreground">Unable to load product information</p>
		</div>
	</div>
);

// Generate metadata for the product
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	const nextParams = await params;
	const product = await getProduct(nextParams.handle);
	if (!product) return notFound();

	const title = `${product.title} | Premium Mushroom Growing Supplies`;
	const description = product.description || `Shop our premium ${product.title.toLowerCase()}. Find high-quality mushroom growing supplies and equipment.`;
	const url = `https://zugzology.com/products/${product.handle}`;
	const firstImage = product.images?.edges?.[0]?.node;

	return {
		title,
		description,
		keywords: `mushroom growing, ${product.title.toLowerCase()}, mushroom supplies, cultivation equipment`,
		openGraph: {
			title,
			description,
			url,
			siteName: "Zugzology",
			type: "website",
			locale: "en_US",
			images: firstImage
				? [
						{
							url: firstImage.url,
							width: 1200,
							height: 630,
							alt: firstImage.altText || product.title,
						},
				  ]
				: [],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: firstImage ? [firstImage.url] : [],
		},
		alternates: {
			canonical: url,
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	};
}

// Product content component
const ProductDetails = async ({ handle }: { handle: string }) => {
	const nextHandle = await handle;
	const product = await getProduct(nextHandle);

	if (!product) {
		return notFound();
	}

	return <ProductContent product={product} />;
};

export default async function ProductPage({ params }: ProductPageProps) {
	const nextParams = await params;

	return (
		<ErrorBoundary fallback={<ProductError />}>
			<Suspense fallback={<ProductLoading />}>
				<ProductDetails handle={nextParams.handle} />
			</Suspense>
		</ErrorBoundary>
	);
}
