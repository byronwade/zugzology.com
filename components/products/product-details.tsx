"use client";

import { useState } from "react";
import Image from "next/image";
import { type Product } from "@/lib/types/shopify";
import { formatPrice, shimmer, toBase64 } from "@/lib/utils";
import { useCart } from "@/lib/stores/cart";

interface ProductDetailsProps {
	product: Product;
	priority?: boolean;
}

export function ProductDetails({ product, priority }: ProductDetailsProps) {
	const [selectedVariant, setSelectedVariant] = useState(product.variants.edges[0]?.node);
	const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
		const options: Record<string, string> = {};
		product.options.forEach((option) => {
			options[option.name] = option.values[0];
		});
		return options;
	});

	const images = product.images.edges;
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	const { addToCart } = useCart();

	const updateSelectedVariant = (optionName: string, value: string) => {
		const newOptions = { ...selectedOptions, [optionName]: value };
		setSelectedOptions(newOptions);

		const matchingVariant = product.variants.edges.find(({ node }) => node.selectedOptions.every((option) => newOptions[option.name] === option.value))?.node;

		if (matchingVariant) {
			setSelectedVariant(matchingVariant);
		}
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
			{/* Image Gallery */}
			<div className="space-y-4">
				<div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
					<Image src={images[selectedImageIndex].node.transformedSrc || images[selectedImageIndex].node.url} alt={images[selectedImageIndex].node.altText || product.title} fill className="object-cover" priority={priority} sizes="(min-width: 768px) 50vw, 100vw" quality={85} placeholder="blur" blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(800, 800))}`} />
				</div>
				{images.length > 1 && (
					<div className="grid grid-cols-4 gap-2">
						{images.map((image, index) => (
							<button key={image.node.id} onClick={() => setSelectedImageIndex(index)} className={`relative aspect-square rounded-md overflow-hidden bg-gray-100 border-2 transition-colors ${selectedImageIndex === index ? "border-blue-500" : "border-transparent hover:border-gray-200"}`}>
								<Image src={image.node.transformedSrc || image.node.url} alt={image.node.altText || `Product image ${index + 1}`} fill className="object-cover" sizes="(min-width: 1024px) 15vw, (min-width: 768px) 20vw, 25vw" quality={85} loading={index === 0 ? "eager" : "lazy"} placeholder="blur" blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(200, 200))}`} />
							</button>
						))}
					</div>
				)}
			</div>

			{/* Product Info */}
			<div className="space-y-6">
				<h1 className="text-3xl font-bold">{product.title}</h1>
				<p className="text-xl font-semibold">{formatPrice(selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount, selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode)}</p>

				{/* Options Selection */}
				{product.options.map((option) => (
					<div key={option.id} className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">{option.name}</label>
						<div className="grid grid-cols-3 gap-2">
							{option.values.map((value) => (
								<button key={value} onClick={() => updateSelectedVariant(option.name, value)} className={`px-4 py-2 border rounded-md ${selectedOptions[option.name] === value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
									{value}
								</button>
							))}
						</div>
					</div>
				))}

				{/* Add to Cart Button */}
				<button
					disabled={!selectedVariant?.availableForSale}
					onClick={() => {
						if (selectedVariant) {
							addToCart(selectedVariant.id, 1);
						}
					}}
					className={`w-full py-3 px-4 rounded-md text-white ${selectedVariant?.availableForSale ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
				>
					{selectedVariant?.availableForSale ? "Add to Cart" : "Out of Stock"}
				</button>

				{/* Product Description */}
				{product.descriptionHtml && <div className="prose prose-sm max-w-none mt-6" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />}
			</div>
		</div>
	);
}
