"use client";

import React, { useEffect, useState } from "react";
import { ProductGallery } from "./sections/product-gallery";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { ProductInfo } from "./sections/product-info";
import { ProductActions } from "./sections/product-actions";
import { ProductDetails } from "./sections/product-details";
import { Separator } from "@/components/ui/separator";

interface ProductContentClientProps {
	product: ShopifyProduct;
}

interface SelectedOptions {
	[key: string]: string;
}

export function ProductContentClient({ product }: ProductContentClientProps) {
	const [mounted, setMounted] = useState(false);
	const [selectedVariant, setSelectedVariant] = useState(product.variants.edges[0].node);
	const [quantity, setQuantity] = useState(1);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(() => {
		return (
			selectedVariant?.selectedOptions?.reduce(
				(acc, option) => ({
					...acc,
					[option.name]: option.value,
				}),
				{} as SelectedOptions
			) || {}
		);
	});

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;

		// Find variant that matches all selected options
		const matchingVariant = product.variants.edges.find(({ node }) => node.selectedOptions?.every((option) => selectedOptions[option.name] === option.value))?.node;

		if (matchingVariant) {
			setSelectedVariant(matchingVariant);

			// Find matching image by variant ID
			const variantId = matchingVariant.id;
			const variantImageIndex = product.images.edges.findIndex(({ node }) => node.variantIds?.includes(variantId));

			if (variantImageIndex >= 0) {
				setSelectedImageIndex(variantImageIndex);
			}
		}
	}, [selectedOptions, product.variants.edges, product.images.edges, mounted]);

	if (!mounted) {
		return (
			<div className="w-full h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	const images = product.images.edges.map(({ node }) => ({
		url: node.url,
		altText: node.altText,
		width: node.width || 800,
		height: node.height || 800,
	}));

	const handleOptionChange = (optionName: string, value: string) => {
		setSelectedOptions((prev) => ({
			...prev,
			[optionName]: value,
		}));
	};

	return (
		<main className="max-w-full mx-auto p-4" itemScope itemType="https://schema.org/Product">
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
						{product.title}
					</li>
				</ol>
			</nav>

			<div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
				{/* Product Gallery */}
				<section aria-label="Product gallery" className="col-span-1 md:col-span-5 lg:col-span-5">
					<div className="sticky top-[110px] pt-4">
						<ProductGallery images={images} title={product.title} selectedIndex={selectedImageIndex} onImageSelect={setSelectedImageIndex} />
					</div>
				</section>

				{/* Product Info */}
				<section aria-label="Product information" className="col-span-1 md:col-span-4 lg:col-span-4">
					<ProductInfo product={product} selectedVariant={selectedVariant} selectedOptions={selectedOptions} onOptionChange={handleOptionChange} />
				</section>

				{/* Purchase Options */}
				<section aria-label="Purchase options" className="col-span-1 md:col-span-3 lg:col-span-3">
					<div className="pt-4">
						<ProductActions selectedVariant={selectedVariant} quantity={quantity} onQuantityChange={setQuantity} />
					</div>
				</section>
			</div>
		</main>
	);
}

export default ProductContentClient;
