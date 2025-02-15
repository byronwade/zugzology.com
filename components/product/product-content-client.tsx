"use client";

import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { ProductGallery } from "@/components/products/sections/product-gallery";
import { ShopifyProduct, ShopifyProductVariant, ShopifyMediaImage, ShopifyMediaVideo } from "@/lib/types";
import { ProductInfo } from "@/components/products/sections/product-info";
import { ProductActions } from "@/components/products/sections/product-actions";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/actions/shopify";
import { FrequentlyBoughtTogether } from "./frequently-bought-together";

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

export const ProductContentClient = ({ product }: ProductContentClientProps) => {
	const [mounted, setMounted] = useState(false);
	const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant>(product.variants.edges[0].node);
	const [quantity, setQuantity] = useState(1);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(() => getInitialSelectedOptions(product.variants.edges[0].node));
	const [complementaryProducts, setComplementaryProducts] = useState<ShopifyProduct[]>([]);

	// Get complementary products from metafield
	useEffect(() => {
		if (product.complementaryProducts?.references?.edges) {
			const complementary = product.complementaryProducts.references.edges.map((edge) => edge.node);
			console.log("Shopify complementary products:", complementary);
			setComplementaryProducts(complementary);
		}
	}, [product.complementaryProducts?.references?.edges]);

	// Memoize media array
	const mediaItems = useMemo(() => {
		const items: (ShopifyMediaImage | ShopifyMediaVideo)[] = [];
		if (product.media?.edges) {
			product.media.edges.forEach((edge) => {
				const node = edge.node;
				if (node.mediaContentType === "IMAGE" || node.mediaContentType === "VIDEO") {
					items.push(node as ShopifyMediaImage | ShopifyMediaVideo);
				}
			});
		}
		return items;
	}, [product.media?.edges]);

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
		<div className="max-w-[1800px] mx-auto px-4 py-8">
			<Breadcrumb title={product.title} />

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
				{/* Left Column - Gallery */}
				<div className="sticky top-[126px]">
					<ProductGallery media={mediaItems} title={product.title} selectedIndex={selectedImageIndex} onMediaSelect={handleImageSelect} product={product} />
				</div>

				{/* Right Column - Product Info & Actions */}
				<div className="space-y-8">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
						<div className="flex flex-wrap gap-2 mt-4">
							{product.vendor && (
								<Badge variant="secondary" className="text-xs font-semibold">
									{product.vendor}
								</Badge>
							)}
							{product.productType && (
								<Badge variant="secondary" className="text-xs font-semibold">
									{product.productType}
								</Badge>
							)}
						</div>
					</div>

					<ProductActions selectedVariant={selectedVariant} quantity={quantity} onQuantityChange={handleQuantityChange} productHandle={product.handle} />

					<Separator />

					<ProductInfo product={product} selectedVariant={selectedVariant} selectedOptions={selectedOptions} onOptionChange={handleOptionChange} complementaryProducts={complementaryProducts} />
				</div>
			</div>

			{/* Frequently Bought Together Section */}
			{complementaryProducts.length > 0 && (
				<section className="mt-16 mb-16">
					<FrequentlyBoughtTogether mainProduct={product} complementaryProducts={complementaryProducts} />
				</section>
			)}
		</div>
	);
};

export default ProductContentClient;
