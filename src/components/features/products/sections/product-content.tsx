"use client";

import dynamic from "next/dynamic";
import type { ShopifyProduct } from "@/lib/types";

type ProductContentProps = {
	product: ShopifyProduct;
};

const DynamicProductContentClient = dynamic<ProductContentProps>(() => import("../product-content-client"), {
	ssr: false,
});

// Product structured data
function generateProductJsonLd(product: ShopifyProduct) {
	const firstVariant = product.variants?.nodes?.[0];
	const _firstImage = product.images?.nodes?.[0];

	// Safely get price data with fallbacks
	const minPrice = product.priceRange?.minVariantPrice?.amount || "0";
	const maxPrice = product.priceRange?.maxVariantPrice?.amount || minPrice;
	const currencyCode = product.priceRange?.minVariantPrice?.currencyCode || "USD";

	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.title,
		description: product.description,
		image: product.images?.nodes?.map((node) => node.url) || [],
		sku: firstVariant?.id,
		mpn: firstVariant?.id,
		brand: {
			"@type": "Brand",
			name: product.vendor || "Zugzology",
		},
		offers: {
			"@type": "AggregateOffer",
			priceCurrency: currencyCode,
			lowPrice: minPrice,
			highPrice: maxPrice,
			offerCount: product.variants?.nodes?.length || 0,
			offers: (product.variants?.nodes || []).map((node) => ({
				"@type": "Offer",
				price: node.price?.amount || "0",
				priceCurrency: node.price?.currencyCode || currencyCode,
				availability: node.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
				url: `https://zugzology.com/products/${product.handle}?variant=${node.id}`,
				itemCondition: "https://schema.org/NewCondition",
			})),
		},
		productID: product.id,
		url: `https://zugzology.com/products/${product.handle}`,
		category: product.productType,
		// Add review data if available
		...(product.rating && {
			aggregateRating: {
				"@type": "AggregateRating",
				ratingValue: product.rating,
				reviewCount: product.reviewsCount || 0,
			},
		}),
	};
}

export function ProductContent({ product }: ProductContentProps) {
	if (!product) {
		return null;
	}

	const _firstVariant = product.variants?.nodes?.[0];
	const _rating = product.rating || 0;
	const _reviewsCount = product.reviewsCount || 0;

	return (
		<div className="mx-auto max-w-full">
			{/* Inject structured data */}
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(generateProductJsonLd(product)),
				}}
				type="application/ld+json"
			/>

			{/* Main Product Section */}
			<DynamicProductContentClient product={product} />
		</div>
	);
}
