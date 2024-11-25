"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Product, ProductVariant } from "@/lib/types/shopify";
import { useCart } from "@/lib/stores/cart";
import { formatPrice } from "@/lib/utils";
import { Leaf, ShieldCheck, Truck } from "lucide-react";

interface ProductDetailsProps {
	product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
	const { addToCart } = useCart();
	const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants.edges[0]?.node || null);
	const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
	const [quantity, setQuantity] = useState(1);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [currentPrice, setCurrentPrice] = useState({
		amount: product.variants.edges[0]?.node?.price?.amount || product.priceRange.minVariantPrice.amount,
		currencyCode: product.variants.edges[0]?.node?.price?.currencyCode || product.priceRange.minVariantPrice.currencyCode,
	});

	// Extract strain from product tags
	const strainInfo =
		product.tags
			?.find((tag) => tag.toLowerCase().includes("strain:"))
			?.replace("strain:", "")
			.trim() || null;

	useEffect(() => {
		const defaultOptions: Record<string, string> = {};
		const defaultVariant = product.variants.edges[0]?.node;
		if (defaultVariant) {
			defaultVariant.selectedOptions.forEach((option) => {
				defaultOptions[option.name] = option.value;
			});
			setSelectedOptions(defaultOptions);
			setSelectedVariant(defaultVariant);
			if (defaultVariant.price) {
				setCurrentPrice({
					amount: defaultVariant.price.amount,
					currencyCode: defaultVariant.price.currencyCode,
				});
			}
		}
	}, [product.variants.edges]);

	const handleVariantSelect = (optionName: string, value: string) => {
		const newOptions = { ...selectedOptions, [optionName]: value };
		setSelectedOptions(newOptions);

		const matchingVariant =
			product.variants.edges.find(({ node }) => {
				return node.selectedOptions.every((option) => newOptions[option.name] === option.value);
			})?.node || null;

		if (matchingVariant) {
			setSelectedVariant(matchingVariant);
			if (matchingVariant.price) {
				setCurrentPrice({
					amount: matchingVariant.price.amount,
					currencyCode: matchingVariant.price.currencyCode,
				});
			}
		}
	};

	const handleAddToCart = async () => {
		if (!selectedVariant) return;
		setIsAddingToCart(true);
		try {
			await addToCart({
				merchandiseId: selectedVariant.id,
				quantity,
			});
		} catch (error) {
			console.error("Error adding to cart:", error);
		} finally {
			setIsAddingToCart(false);
		}
	};

	const multiValueOptions = product.options.filter((option) => option.values.length > 1);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
				{/* Left Column - Image */}
				<div className="md:col-span-4">
					<div className="sticky top-24">
						{product.images?.edges[0]?.node && (
							<div className="relative aspect-square w-full max-w-[400px] mx-auto">
								<Image src={product.images.edges[0].node.url} alt={product.images.edges[0].node.altText || product.title} fill className="object-cover rounded-lg" priority />
							</div>
						)}
					</div>
				</div>

				{/* Middle Column - Product Info */}
				<div className="md:col-span-5">
					<div className="space-y-6">
						<div>
							<h1 className="text-2xl font-bold mb-2">{product.title}</h1>
							{strainInfo && <p className="text-lg font-semibold text-blue-600">Strain: {strainInfo}</p>}
						</div>

						<div className="flex items-center gap-2">
							<span className="text-3xl font-bold">{formatPrice(currentPrice.amount, currentPrice.currencyCode)}</span>
							{selectedVariant?.availableForSale && <span className="text-green-600 text-sm">In Stock</span>}
						</div>

						{/* Only show options with multiple values */}
						{multiValueOptions.map((option) => (
							<div key={option.id} className="space-y-2">
								<h3 className="font-medium">{option.name}</h3>
								<div className="flex flex-wrap gap-2">
									{option.values.map((value) => (
										<Button key={value} variant={selectedOptions[option.name] === value ? "default" : "outline"} size="sm" onClick={() => handleVariantSelect(option.name, value)}>
											{value}
										</Button>
									))}
								</div>
							</div>
						))}

						{/* Product Description */}
						<div className="prose prose-sm">
							<h3 className="text-lg font-semibold mb-2">About this item</h3>
							<div dangerouslySetInnerHTML={{ __html: product.description }} />
						</div>
					</div>
				</div>

				{/* Right Column - Buy Box */}
				<div className="md:col-span-3">
					<Card>
						<CardContent className="p-4 space-y-4">
							<div className="space-y-1">
								<span className="text-2xl font-bold">{formatPrice(currentPrice.amount, currentPrice.currencyCode)}</span>
								{selectedVariant?.availableForSale && (
									<p className="text-green-600 text-sm flex items-center gap-1">
										<Truck className="h-4 w-4" />
										Free Shipping
									</p>
								)}
							</div>

							<div className="space-y-3">
								{/* Quantity Selector */}
								<div className="flex items-center gap-2">
									<Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
										-
									</Button>
									<span className="w-12 text-center">{quantity}</span>
									<Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
										+
									</Button>
								</div>

								{/* Add to Cart Button */}
								<Button className="w-full" size="lg" onClick={handleAddToCart} disabled={!selectedVariant?.availableForSale || isAddingToCart}>
									{isAddingToCart ? "Adding..." : selectedVariant?.availableForSale ? "Add to Cart" : "Out of Stock"}
								</Button>
							</div>

							{/* Product Features */}
							<div className="space-y-2 pt-3 border-t text-sm">
								<div className="flex items-center gap-2">
									<ShieldCheck className="h-4 w-4 text-green-600" />
									<span>Secure transaction</span>
								</div>
								<div className="flex items-center gap-2">
									<Leaf className="h-4 w-4 text-green-600" />
									<span>Premium Quality</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
