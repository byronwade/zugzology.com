"use client";

import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { ProductGallery } from "./sections/product-gallery";
import { ShopifyProduct, ShopifyProductVariant, ShopifyMediaImage, ShopifyMediaVideo } from "@/lib/types";
import { ProductInfo } from "./sections/product-info";
import { ProductActions } from "./sections/product-actions";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/actions/shopify";
import { RelatedProducts } from "./sections/related-products";

interface ProductContentClientProps {
	product: ShopifyProduct;
}

interface SelectedOptions {
	[key: string]: string;
}

// Memoized helper functions
const getInitialSelectedOptions = (variant: ShopifyProductVariant): SelectedOptions => {
	return (
		variant?.selectedOptions?.reduce(
			(acc, option) => ({
				...acc,
				[option.name]: option.value,
			}),
			{} as SelectedOptions
		) || {}
	);
};

const findMatchingVariant = (variants: { node: ShopifyProductVariant }[], selectedOptions: SelectedOptions): ShopifyProductVariant | undefined => {
	return variants.find(({ node }) => node.selectedOptions?.every((option) => selectedOptions[option.name] === option.value))?.node;
};

// Memoized Breadcrumb component
const Breadcrumb = memo(({ title }: { title: string }) => (
	<nav aria-label="Breadcrumb" className="mb-4 hidden md:block">
		<ol className="flex items-center space-x-2 text-sm">
			<li>
				<a href="/" className="text-neutral-500 hover:text-neutral-700">
					Home
				</a>
			</li>
			<li className="text-neutral-500">/</li>
			<li>
				<a href="/products" className="text-neutral-500 hover:text-neutral-700">
					Products
				</a>
			</li>
			<li className="text-neutral-500">/</li>
			<li className="text-neutral-900" aria-current="page">
				{title}
			</li>
		</ol>
	</nav>
));

Breadcrumb.displayName = "Breadcrumb";

// Loading component
const LoadingSpinner = memo(() => (
	<div className="w-full h-screen flex items-center justify-center">
		<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
	</div>
));

LoadingSpinner.displayName = "LoadingSpinner";

// Memoize media array
const getMediaArray = (product: ShopifyProduct) => {
	const mediaItems: (ShopifyMediaImage | ShopifyMediaVideo)[] = [];

	// Add media items if they exist
	if (product.media?.edges) {
		product.media.edges.forEach((edge) => {
			const node = edge.node;
			if (node.mediaContentType === "IMAGE" || node.mediaContentType === "VIDEO") {
				mediaItems.push(node as ShopifyMediaImage | ShopifyMediaVideo);
			}
		});
	}

	// Add any images that might not be in media
	if (product.images?.edges) {
		product.images.edges.forEach(({ node }) => {
			// Only add if there isn't already media for this image
			if (!mediaItems.some((media) => media.mediaContentType === "IMAGE" && (media as ShopifyMediaImage).image.url === node.url)) {
				mediaItems.push({
					id: `image-${node.url}`,
					mediaContentType: "IMAGE",
					image: node,
				} as ShopifyMediaImage);
			}
		});
	}

	return mediaItems;
};

export const ProductContentClient = ({ product }: ProductContentClientProps) => {
	const [mounted, setMounted] = useState(false);
	const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant>(product.variants.edges[0].node);
	const [quantity, setQuantity] = useState(1);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(() => getInitialSelectedOptions(product.variants.edges[0].node));
	const [recommendedProducts, setRecommendedProducts] = useState<ShopifyProduct[]>([]);

	// Get recommended products from metafield
	useEffect(() => {
		const recommendations = product.recommendations?.references?.edges?.map((edge) => edge.node) || [];
		console.log("Product recommendations:", recommendations);
		setRecommendedProducts(recommendations);
	}, [product.recommendations?.references?.edges]);

	// Memoize media array
	const mediaItems = useMemo(() => getMediaArray(product), [product]);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Memoize variant selection effect
	useEffect(() => {
		if (!mounted) return;

		const matchingVariant = findMatchingVariant(product.variants.edges, selectedOptions);
		if (matchingVariant) {
			setSelectedVariant(matchingVariant);

			// Find the matching image for this variant if it has one
			if (matchingVariant.image) {
				const variantImageIndex = product.images.edges.findIndex(({ node }) => node.url === matchingVariant.image?.url);
				if (variantImageIndex >= 0) {
					setSelectedImageIndex(variantImageIndex);
				}
			}
		}
	}, [selectedOptions, product.variants.edges, product.images.edges, mounted]);

	// Memoize handlers
	const handleOptionChange = useCallback((optionName: string, value: string) => {
		setSelectedOptions((prev) => ({
			...prev,
			[optionName]: value,
		}));
	}, []);

	const handleQuantityChange = useCallback((newQuantity: number) => {
		setQuantity(newQuantity);
	}, []);

	const handleImageSelect = useCallback((index: number) => {
		setSelectedImageIndex(index);
	}, []);

	if (!mounted) {
		return <LoadingSpinner />;
	}

	return (
		<section className="max-w-full mx-auto p-4" itemScope itemType="https://schema.org/Product">
			<Breadcrumb title={product.title} />

			<div className="grid grid-cols-1 md:grid-cols-[1fr_400px] xl:grid-cols-[minmax(0,1fr)_400px] gap-6 mb-8">
				{/* Left side container for gallery and info */}
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
					<section aria-label="Product gallery" className="col-span-1">
						<div className="sticky top-[126px]">
							<ProductGallery media={mediaItems} title={product.title} selectedIndex={selectedImageIndex} onMediaSelect={handleImageSelect} product={product} />
						</div>
					</section>

					<section aria-label="Product information" className="col-span-1">
						<div className="space-y-4">
							{/* Product Title */}
							<h1 className="text-3xl font-bold tracking-tight" itemProp="name">
								{product.title}
							</h1>

							{/* Badges */}
							<div className="flex flex-wrap gap-2">
								{/* Brand Badge - Always show with fallback to vendor */}
								<Badge variant="secondary" className="text-xs font-semibold bg-purple-100 text-purple-800 hover:bg-purple-200">
									{product.vendor || "Zugzology"}
								</Badge>

								{/* Category Badge */}
								{product.productType && (
									<Badge variant="secondary" className="text-xs font-semibold bg-neutral-100 text-neutral-800 hover:bg-neutral-200">
										{product.productType}
									</Badge>
								)}

								{/* Status Badges */}
								{!selectedVariant.availableForSale && (
									<Badge variant="secondary" className="text-xs font-semibold bg-red-100 text-red-800">
										Out of Stock
									</Badge>
								)}
								{product.tags?.includes("new") && (
									<Badge variant="secondary" className="text-xs font-semibold bg-green-100 text-green-800">
										New Arrival
									</Badge>
								)}
								{product.tags?.includes("bestseller") && (
									<Badge variant="secondary" className="text-xs font-semibold bg-amber-100 text-amber-800">
										Best Seller
									</Badge>
								)}
							</div>

							<ProductInfo product={product} selectedVariant={selectedVariant} selectedOptions={selectedOptions} onOptionChange={handleOptionChange} complementaryProducts={recommendedProducts} />
						</div>
					</section>
				</div>

				{/* Right side purchase options */}
				<section aria-label="Purchase options" className="col-span-1 w-full lg:max-w-[400px] justify-self-end">
					<div className="sticky top-[126px]">
						<ProductActions selectedVariant={selectedVariant} quantity={quantity} onQuantityChange={handleQuantityChange} productHandle={product.handle} />
					</div>
				</section>
			</div>

			{/* Related Products Section */}
			{recommendedProducts.length > 0 && (
				<section className="mt-16">
					<RelatedProducts products={recommendedProducts} currentProductId={product.id} />
				</section>
			)}
		</section>
	);
};

export default ProductContentClient;
