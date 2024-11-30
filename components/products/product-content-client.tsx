"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { ProductGallery } from "./product-gallery";
import { PurchaseOptions } from "./purchase-options";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface ProductContentClientProps {
	product: ShopifyProduct;
}

interface SelectedOptions {
	[key: string]: string;
}

export function ProductContentClient({ product }: ProductContentClientProps) {
	if (!product.options || !product.variants.edges || !product.images.edges) {
		return <div>Product data is incomplete</div>;
	}

	const hasMultipleVariants = product.variants.edges.length > 1;
	const hasOptions = product.options.some((option) => option.values.length > 1);

	const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant>(() => {
		const availableVariant = product.variants.edges.find(({ node }) => node.availableForSale)?.node;
		return availableVariant || product.variants.edges[0]?.node;
	});

	const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(
		() =>
			selectedVariant?.selectedOptions?.reduce(
				(acc, option) => ({
					...acc,
					[option.name]: option.value,
				}),
				{} as SelectedOptions
			) || {}
	);

	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	useEffect(() => {
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
	}, [selectedOptions, product.variants.edges, product.images.edges]);

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
		<div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full max-w-full mx-auto">
			<ProductGallery images={images} title={product.title} selectedIndex={selectedImageIndex} onImageSelect={setSelectedImageIndex} />

			{/* Product Details */}
			<div className="col-span-1 md:col-span-4 flex flex-col">
				<div className="mb-4">
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{product.title}</h1>
					<div className="mt-4">
						<div className="text-3xl font-bold text-gray-900 dark:text-gray-100">${formatPrice(selectedVariant?.price?.amount || product.priceRange.minVariantPrice.amount)}</div>
						{selectedVariant?.compareAtPrice && <div className="text-sm text-gray-500 line-through">${formatPrice(selectedVariant.compareAtPrice.amount)}</div>}
					</div>
				</div>

				{/* Variant Selection - Only show if there are multiple variants */}
				{hasMultipleVariants && hasOptions && (
					<div className="space-y-6">
						{product.options.map(
							(option) =>
								option.values.length > 1 && (
									<div key={option.id} className="space-y-3">
										<label className="text-sm font-medium text-gray-900 dark:text-gray-100">{option.name}</label>
										<div className="flex flex-wrap gap-2">
											{option.values.map((value) => {
												const isSelected = selectedOptions[option.name] === value;
												const isAvailable = product.variants.edges.some(({ node }) => node.selectedOptions.some((opt) => opt.name === option.name && opt.value === value) && node.availableForSale);

												return (
													<button
														key={`${option.name}-${value}`}
														onClick={() => handleOptionChange(option.name, value)}
														disabled={!isAvailable}
														className={`
														px-4 py-2 rounded-md
														${isSelected ? "bg-primary text-white ring-2 ring-primary" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"}
														${!isAvailable && "opacity-50 cursor-not-allowed"}
														hover:opacity-90 transition-all
														${option.name.toLowerCase() === "color" ? "flex items-center gap-2" : ""}
													`}
													>
														{option.name.toLowerCase() === "color" && <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: value.toLowerCase() }} />}
														{value}
													</button>
												);
											})}
										</div>
									</div>
								)
						)}
					</div>
				)}

				{/* Product description */}
				<div className="mt-8">
					<h2 className="text-lg font-medium mb-4">About this item</h2>
					<div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
				</div>
			</div>

			{/* Purchase Options */}
			<div className="col-span-1 md:col-span-2">
				<PurchaseOptions product={product} selectedVariant={selectedVariant} onVariantChange={setSelectedVariant} />
			</div>
		</div>
	);
}
