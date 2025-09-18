"use client";

import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { ProductGallery } from "@/components/features/products/sections/product-gallery";
import { ShopifyProduct, ShopifyProductVariant, ShopifyMediaImage, ShopifyMediaVideo } from "@/lib/types";
import { ProductInfo } from "@/components/features/products/sections/product-info";
import { ProductActions } from "@/components/features/products/sections/product-actions";
import { Badge } from "@/components/ui/badge";
import { FrequentlyBoughtTogether } from "./frequently-bought-together";
import AIProductEnhancement from "@/components/ai/ai-product-enhancement";
import { AIRelatedProducts } from "./sections/ai-related-products";
import { useAIPredictionStore } from "@/stores/ai-prediction-store";

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
	<div className="h-12 border-b bg-muted/40 hidden md:block">
		<div className="container h-full px-4">
			<nav className="flex items-center h-full text-sm" aria-label="Breadcrumb">
				<a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
					Collections
				</a>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="w-3.5 h-3.5 mx-2 text-muted-foreground/50"
				>
					<path d="m9 18 6-6-6-6"></path>
				</svg>
				<span className="text-foreground/80">{title}</span>
			</nav>
		</div>
	</div>
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
	const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant>(() => product.variants.nodes[0]);
	const [quantity, setQuantity] = useState(1);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(() => getInitialSelectedOptions(product.variants.nodes[0]));
	const [complementaryProducts, setComplementaryProducts] = useState<ShopifyProduct[]>([]);

	// AI tracking
	const { trackInteraction } = useAIPredictionStore();

	// Track product page visit
	useEffect(() => {
		if (mounted && product.id) {
			trackInteraction({
				productId: product.id,
				type: 'page_visit',
				context: 'product-page'
			});
		}
	}, [mounted, product.id, trackInteraction]);

	// Get complementary products from metafield
	useEffect(() => {
	const complementaryRefs = product.metafields?.find(
		(metafield) => metafield?.namespace === "custom" && metafield?.key === "complementary_products"
	);
	if (complementaryRefs?.value) {
		try {
			const complementary = JSON.parse(complementaryRefs.value);
			if (Array.isArray(complementary)) {
				setComplementaryProducts(complementary);
			} else {
				console.warn("Expected complementary products to be an array but received:", complementary);
			}
		} catch (e) {
			console.error("Error parsing complementary products:", e);
		}
	}
}, [product.metafields]);

	// Memoize media array
	const mediaItems = useMemo(() => {
		const items: (ShopifyMediaImage | ShopifyMediaVideo)[] = [];
		if (product.media?.nodes) {
			product.media.nodes.forEach((node) => {
				if (node.mediaContentType === "IMAGE" || node.mediaContentType === "VIDEO") {
					items.push(node as ShopifyMediaImage | ShopifyMediaVideo);
				}
			});
		}
		return items;
	}, [product.media?.nodes]);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Memoize variant selection effect
	useEffect(() => {
		if (!mounted) return;

		const matchingVariant = product.variants.nodes.find((variant) => variant.selectedOptions?.every((option) => selectedOptions[option.name] === option.value));

		if (matchingVariant) {
			setSelectedVariant(matchingVariant);

			// Find the matching image for this variant if it has one
			if (matchingVariant.image) {
				const variantImageIndex = product.images.nodes.findIndex((node) => node.url === matchingVariant.image?.url);
				if (variantImageIndex >= 0) {
					setSelectedImageIndex(variantImageIndex);
				}
			}
		}
	}, [selectedOptions, product.variants.nodes, product.images.nodes, mounted]);

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
		<>
			<Breadcrumb title={product.title} />
			<div className="max-w-[1800px] mx-auto px-4 py-8">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] xl:grid-cols-[1.35fr_1fr_1.05fr] mb-16">
					{/* Left Column - Gallery */}
					<div className="sticky top-[126px]">
						<ProductGallery media={mediaItems} title={product.title} selectedIndex={selectedImageIndex} onMediaSelect={handleImageSelect} product={product} />
					</div>

					{/* Middle Column - Product details */}
					<div className="space-y-8 order-2 lg:order-2 lg:self-start lg:col-start-1 lg:col-span-2 lg:row-start-2 xl:order-2 xl:col-span-1 xl:col-start-2 xl:row-start-1">
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

						<ProductInfo
							product={product}
							selectedVariant={selectedVariant}
							selectedOptions={selectedOptions}
							onOptionChange={handleOptionChange}
							complementaryProducts={complementaryProducts}
						/>
					</div>

					{/* Right Column - Purchase actions */}
					<div className="space-y-8 order-3 lg:order-3 lg:self-start lg:col-start-2 lg:row-start-1 xl:order-3 xl:col-span-1 xl:col-start-3 xl:row-start-1">
						<ProductActions selectedVariant={selectedVariant} quantity={quantity} onQuantityChange={handleQuantityChange} productHandle={product.handle} />
					</div>
				</div>

				{/* AI Product Enhancement Section */}
				<AIProductEnhancement product={product} />

				{/* Frequently Bought Together Section */}
				{complementaryProducts.length > 0 && (
					<section className="mt-16 mb-16">
						<FrequentlyBoughtTogether mainProduct={product} complementaryProducts={complementaryProducts} />
					</section>
				)}

				{/* AI-Enhanced Related Products Section */}
				{product.recommendations?.nodes && product.recommendations.nodes.length > 0 && (
					<section className="mt-16 mb-16">
						<AIRelatedProducts 
							products={product.recommendations.nodes}
							currentProductId={product.id}
							currentProduct={product}
							maxItems={8}
							showAIInsights={true}
						/>
					</section>
				)}
			</div>
		</>
	);
};

export default ProductContentClient;
