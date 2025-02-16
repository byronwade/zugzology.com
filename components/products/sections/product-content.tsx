"use client";

import type { ShopifyProduct } from "@/lib/types";
import dynamic from "next/dynamic";
import { ProductInfo } from "./product-info";
import { ProductGallery } from "./product-gallery";
import { ProductActions } from "./product-actions";
import { Separator } from "@/components/ui/separator";
import { Star, Info, Shield, TruckIcon, Gift } from "lucide-react";
import { ProductContentClient } from "@/components/products/product-content-client";
import { VideoGallery } from "@/components/sections/video-gallery";
import { FrequentlyBoughtTogether } from "./frequently-bought-together";
import { getProducts } from "@/lib/actions/shopify";
import { useEffect, useState } from "react";

interface ProductContentProps {
	product: ShopifyProduct;
}

const DynamicProductContentClient = dynamic<ProductContentProps>(() => import("../product-content-client"), {
	ssr: false,
});

// Product structured data
function generateProductJsonLd(product: ShopifyProduct) {
	const firstVariant = product.variants?.edges?.[0]?.node;
	const firstImage = product.images?.edges?.[0]?.node;

	// Safely get price data with fallbacks
	const minPrice = product.priceRange?.minVariantPrice?.amount || "0";
	const maxPrice = product.priceRange?.maxVariantPrice?.amount || minPrice;
	const currencyCode = product.priceRange?.minVariantPrice?.currencyCode || "USD";

	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.title,
		description: product.description,
		image: product.images?.edges?.map((edge) => edge.node.url) || [],
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
			offerCount: product.variants?.edges?.length || 0,
			offers: (product.variants?.edges || []).map(({ node }) => ({
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
	if (!product) return null;

	const firstVariant = product.variants?.edges?.[0]?.node;
	const rating = product.rating || 0;
	const reviewsCount = product.reviewsCount || 0;

	return (
		<div className="max-w-full mx-auto">
			{/* Inject structured data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(generateProductJsonLd(product)),
				}}
			/>

			{/* Main Product Section */}
			<DynamicProductContentClient product={product} />
		</div>
	);
}
