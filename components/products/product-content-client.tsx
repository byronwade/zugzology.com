"use client";

import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { ProductGallery } from "./sections/product-gallery";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { ProductInfo } from "./sections/product-info";
import { ProductActions } from "./sections/product-actions";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/actions/shopify";

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

	// Fetch complementary products
	useEffect(() => {
		async function fetchRelatedProducts() {
			try {
				const allProducts = await getProducts();
				if (!allProducts?.length) return;

				// Filter products by same product type or shared tags
				const relatedProducts = allProducts.filter((p) => {
					if (!p || p.id === product.id) return false;

					const sameType = p.productType && product.productType && (p.productType.toLowerCase().includes(product.productType.toLowerCase()) || product.productType.toLowerCase().includes(p.productType.toLowerCase()));

					const sharedTags = product.tags?.some((tag) => p.tags?.some((pTag) => pTag.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(pTag.toLowerCase()))) || false;

					const sameCategory = p.productType?.toLowerCase().includes("mushroom") || p.productType?.toLowerCase().includes("grow") || p.tags?.some((tag) => tag.toLowerCase().includes("mushroom") || tag.toLowerCase().includes("grow"));

					return sameType || sharedTags || sameCategory;
				});

				// Take first 3 products, prioritizing those with same type
				const sortedProducts = relatedProducts.sort((a, b) => {
					const aType = a.productType?.toLowerCase() || "";
					const bType = b.productType?.toLowerCase() || "";
					const productType = product.productType?.toLowerCase() || "";

					if (aType === productType && bType !== productType) return -1;
					if (bType === productType && aType !== productType) return 1;
					return 0;
				});

				setComplementaryProducts(sortedProducts.slice(0, 3));
			} catch (error) {
				console.error("Error fetching related products:", error);
				setComplementaryProducts([]);
			}
		}

		fetchRelatedProducts();
	}, [product]);

	// Memoize images array
	const images = useMemo(
		() =>
			product.images.edges.map(({ node }) => ({
				url: node.url,
				altText: node.altText,
				width: node.width || 800,
				height: node.height || 800,
			})),
		[product.images.edges]
	);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Memoize variant selection effect
	useEffect(() => {
		if (!mounted) return;

		const matchingVariant = findMatchingVariant(product.variants.edges, selectedOptions);
		if (matchingVariant) {
			setSelectedVariant(matchingVariant);

			const variantId = matchingVariant.id;
			const variantImageIndex = product.images.edges.findIndex(({ node }) => node.variantIds?.includes(variantId));

			if (variantImageIndex >= 0) {
				setSelectedImageIndex(variantImageIndex);
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
							<ProductGallery images={images} title={product.title} selectedIndex={selectedImageIndex} onImageSelect={handleImageSelect} />
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

							<ProductInfo product={product} selectedVariant={selectedVariant} selectedOptions={selectedOptions} onOptionChange={handleOptionChange} complementaryProducts={complementaryProducts} />
						</div>
					</section>
				</div>

				{/* Right side purchase options */}
				<section aria-label="Purchase options" className="col-span-1 w-full lg:max-w-[400px] justify-self-end">
					<div className="sticky top-[126px]">
						<ProductActions selectedVariant={selectedVariant} quantity={quantity} onQuantityChange={handleQuantityChange} />
					</div>
				</section>
			</div>
		</section>
	);
};

export default ProductContentClient;
