import React from "react";
import { getProduct } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import type { Metadata } from "next";
import { ProductContent } from "@/components/products/product-content";

interface ProductPageProps {
	params: {
		handle: string;
	};
}

export const runtime = "edge";
export const preferredRegion = "auto";
export const dynamic = "force-dynamic";
export const revalidate = 60; // Cache for 1 minute

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	const nextjs15 = await params;
	const product = await getProduct(nextjs15.handle);
	if (!product) return notFound();

	const title = `${product.title} | Premium Mushroom Growing Supplies`;
	const description = product.description || `Shop our premium ${product.title.toLowerCase()}. Find high-quality mushroom growing supplies and equipment.`;
	const url = `https://zugzology.com/products/${product.handle}`;

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
			images: product.images?.edges?.[0]?.node
				? [
						{
							url: product.images.edges[0].node.url,
							width: 1200,
							height: 630,
							alt: product.images.edges[0].node.altText || product.title,
						},
				  ]
				: [],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: product.images?.edges?.[0]?.node ? [product.images.edges[0].node.url] : [],
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

export default async function ProductPage({ params }: ProductPageProps) {
	const nextjs15 = await params;
	const product = await getProduct(nextjs15.handle);

	if (!product) {
		notFound();
	}

	// Safely get price data with fallbacks
	const minPrice = product.priceRange?.minVariantPrice?.amount || "0";
	const maxPrice = product.priceRange?.maxVariantPrice?.amount || minPrice;
	const currencyCode = product.priceRange?.minVariantPrice?.currencyCode || "USD";

	// Get the first variant's data safely
	const firstVariant = product.variants?.edges?.[0]?.node;
	const firstImage = product.images?.edges?.[0]?.node;

	const productJsonLd = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.title,
		description: product.description,
		image: firstImage?.url || [],
		url: `https://zugzology.com/products/${product.handle}`,
		identifier: firstVariant?.id || "",
		brand: {
			"@type": "Brand",
			name: product.vendor || "Zugzology",
		},
		offers: {
			"@type": "AggregateOffer",
			availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
			priceCurrency: currencyCode,
			lowPrice: minPrice,
			highPrice: maxPrice,
			offerCount: product.variants?.edges?.length || 1,
			offers:
				product.variants?.edges?.map(({ node }) => ({
					"@type": "Offer",
					price: node.price?.amount || minPrice,
					priceCurrency: node.price?.currencyCode || currencyCode,
					availability: node.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
					url: `https://zugzology.com/products/${product.handle}?variant=${node.id}`,
					itemCondition: "https://schema.org/NewCondition",
				})) || [],
		},
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
			<ProductContent product={product} />
		</>
	);
}
