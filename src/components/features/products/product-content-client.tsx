"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ProductActions } from "@/components/features/products/sections/product-actions";
import { ProductGallery } from "@/components/features/products/sections/product-gallery";
import { ProductInfo } from "@/components/features/products/sections/product-info";
import { Badge } from "@/components/ui/badge";
import type { ShopifyMediaImage, ShopifyMediaVideo, ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { FrequentlyBoughtTogether } from "./frequently-bought-together";

type ProductContentClientProps = {
	product: ShopifyProduct;
};

type SelectedOptions = {
	[key: string]: string;
};

// Memoized helper functions
const getInitialSelectedOptions = (variant: ShopifyProductVariant): SelectedOptions =>
	variant?.selectedOptions?.reduce(
		(acc, option) => ({
			...acc,
			[option.name]: option.value,
		}),
		{} as SelectedOptions
	) || {};

const _findMatchingVariant = (
	variants: { node: ShopifyProductVariant }[],
	selectedOptions: SelectedOptions
): ShopifyProductVariant | undefined =>
	variants.find(({ node }) => node.selectedOptions?.every((option) => selectedOptions[option.name] === option.value))
		?.node;

// Memoized Breadcrumb component
const Breadcrumb = memo(({ title }: { title: string }) => (
	<div className="hidden h-12 border-b bg-muted/40 md:block">
		<div className="container mx-auto h-full px-4">
			<nav aria-label="Breadcrumb" className="flex h-full items-center text-sm">
				<a className="text-muted-foreground transition-colors hover:text-foreground" href="/">
					Collections
				</a>
				<svg
					className="mx-2 h-3.5 w-3.5 text-muted-foreground/50"
					fill="none"
					height="24"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					viewBox="0 0 24 24"
					width="24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="m9 18 6-6-6-6" />
				</svg>
				<span className="text-foreground/80">{title}</span>
			</nav>
		</div>
	</div>
));

Breadcrumb.displayName = "Breadcrumb";

// Loading component
const LoadingSpinner = memo(() => (
	<div className="flex h-screen w-full items-center justify-center">
		<div className="h-32 w-32 animate-spin rounded-full border-primary border-t-2 border-b-2" />
	</div>
));

LoadingSpinner.displayName = "LoadingSpinner";

export const ProductContentClient = ({ product }: ProductContentClientProps) => {
	const [mounted, setMounted] = useState(false);
	const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant>(() => product.variants.nodes[0]);
	const [quantity, setQuantity] = useState(1);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(() =>
		getInitialSelectedOptions(product.variants.nodes[0])
	);
	const [complementaryProducts, setComplementaryProducts] = useState<ShopifyProduct[]>([]);

	// Ensure page starts at top - run first before any other effects
	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "instant" });
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;
	}, []);

	useEffect(() => {
		setMounted(true);
	}, []);

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
				}
			} catch (_e) {}
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

	// Memoize variant selection effect
	useEffect(() => {
		if (!mounted) {
			return;
		}

		const matchingVariant = product.variants.nodes.find((variant) =>
			variant.selectedOptions?.every((option) => selectedOptions[option.name] === option.value)
		);

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
		return null; // Return null instead of spinner to avoid layout shift
	}

	return (
		<>
			<Breadcrumb title={product.title} />
			<div className="container mx-auto px-4 py-12">
				<div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] xl:grid-cols-[1.35fr_1.5fr_0.8fr]">
					{/* Left Column - Gallery */}
					<div className="lg:sticky lg:top-[126px] lg:self-start">
						<ProductGallery
							media={mediaItems}
							onMediaSelect={handleImageSelect}
							product={product}
							selectedIndex={selectedImageIndex}
							title={product.title}
						/>
					</div>

					{/* Middle Column - Product details */}
					<div className="order-2 space-y-8 lg:order-2 lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:self-start xl:order-2 xl:col-span-1 xl:col-start-2 xl:row-start-1">
						<div>
							<h1 className="font-bold text-3xl tracking-tight">
								{product.title}
								{selectedVariant && selectedVariant.title !== "Default Title" && (
									<span className="block text-primary text-2xl mt-2">{selectedVariant.title}</span>
								)}
							</h1>
							<div className="mt-4 flex flex-wrap gap-2">
								{product.vendor && (
									<Badge className="font-semibold text-xs" variant="secondary">
										{product.vendor}
									</Badge>
								)}
								{product.productType && (
									<Badge className="font-semibold text-xs" variant="secondary">
										{product.productType}
									</Badge>
								)}
							</div>
						</div>

						<ProductInfo
							complementaryProducts={complementaryProducts}
							onOptionChange={handleOptionChange}
							product={product}
							selectedOptions={selectedOptions}
							selectedVariant={selectedVariant}
						/>
					</div>

					{/* Right Column - Purchase actions */}
					<div className="order-3 space-y-8 lg:order-3 lg:col-start-2 lg:row-start-1 lg:self-start xl:order-3 xl:col-span-1 xl:col-start-3 xl:row-start-1">
						<ProductActions
							onQuantityChange={handleQuantityChange}
							productHandle={product.handle}
							quantity={quantity}
							selectedVariant={selectedVariant}
						/>
					</div>
				</div>

				{/* Frequently Bought Together Section */}
				{complementaryProducts.length > 0 && (
					<section className="mt-16 mb-16">
						<FrequentlyBoughtTogether complementaryProducts={complementaryProducts} mainProduct={product} />
					</section>
				)}
			</div>
		</>
	);
};

export default ProductContentClient;
