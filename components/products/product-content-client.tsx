"use client";

import React, { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { ProductGallery } from "./product-gallery";
import { PurchaseOptions } from "./purchase-options";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { useCart } from "@/lib/providers/cart-provider";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ProductContentClientProps {
	product: ShopifyProduct;
}

interface SelectedOptions {
	[key: string]: string;
}

function ProductContentClient({ product }: ProductContentClientProps) {
	const [mounted, setMounted] = useState(false);
	const [selectedVariant, setSelectedVariant] = useState(product.variants.edges[0].node);
	const [quantity, setQuantity] = useState(1);
	const { addItem, isLoading } = useCart();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!product.options || !product.variants.edges || !product.images.edges) {
		return <div>Product data is incomplete</div>;
	}

	const hasMultipleVariants = product.variants.edges.length > 1;
	const hasOptions = product.options.some((option) => option.values.length > 1);

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

	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

	const handleAddToCart = async () => {
		if (!selectedVariant?.id) {
			console.error("Cannot add to cart: No variant selected", {
				productTitle: product.title,
				productId: product.id,
			});
			toast.error("Please select a product variant");
			return;
		}

		// Ensure the variant ID is in the correct format
		const variantId = selectedVariant.id;

		console.log("Attempting to add to cart:", {
			productTitle: product.title,
			productId: product.id,
			variantId,
			variantTitle: selectedVariant.title,
			quantity,
			availableForSale: selectedVariant.availableForSale,
			variant: selectedVariant,
		});

		try {
			await addItem({
				merchandiseId: variantId,
				quantity,
				isPreOrder: !selectedVariant.availableForSale,
			});
		} catch (error) {
			console.error("Error in handleAddToCart:", {
				error,
				productTitle: product.title,
				productId: product.id,
				variantId,
				variant: selectedVariant,
			});
			toast.error("Failed to add to cart");
		}
	};

	return (
		<main className="max-w-full mx-auto p-4" itemScope itemType="https://schema.org/Product">
			<nav aria-label="Breadcrumb" className="mb-4">
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
					<div className="sticky top-8">
						<ProductGallery images={images} title={product.title} selectedIndex={selectedImageIndex} onImageSelect={setSelectedImageIndex} />
					</div>
				</section>

				{/* Product Info */}
				<section aria-label="Product information" className="col-span-1 md:col-span-4 lg:col-span-4">
					<div className="space-y-4">
						{product.vendor && (
							<a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
								Visit the {product.vendor} Store
							</a>
						)}
						<h1 className="text-2xl font-medium" itemProp="name">
							{product.title}
						</h1>

						<div className="flex items-baseline gap-2">
							<meta itemProp="priceCurrency" content="USD" />
							<span className="text-2xl font-medium" itemProp="price">
								{formatPrice(parseFloat(selectedVariant?.price?.amount || product.priceRange.minVariantPrice.amount))}
							</span>
							{selectedVariant?.compareAtPrice && <span className="text-sm text-neutral-500 line-through">{formatPrice(parseFloat(selectedVariant.compareAtPrice.amount))}</span>}
						</div>

						<Separator className="my-4" />

						<div className="prose prose-sm dark:prose-invert" itemProp="description">
							<div dangerouslySetInnerHTML={{ __html: product.description }} />
						</div>

						{/* Variant Selection */}
						{hasMultipleVariants && hasOptions && (
							<form className="space-y-4">
								{product.options.map((option) => (
									<div key={option.name} className="space-y-2">
										<label htmlFor={option.name} className="block text-sm font-medium">
											{option.name}
										</label>
										<select id={option.name} name={option.name} value={selectedOptions[option.name] || ""} onChange={(e) => handleOptionChange(option.name, e.target.value)} className="w-full p-2 border rounded-lg bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700">
											{option.values.map((value) => (
												<option key={value} value={value}>
													{value}
												</option>
											))}
										</select>
									</div>
								))}
							</form>
						)}
					</div>
				</section>

				{/* Purchase Options */}
				<section aria-label="Purchase options" className="col-span-1 md:col-span-3 lg:col-span-3">
					<div className="sticky top-8">
						<div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
							<PurchaseOptions product={product} selectedVariant={selectedVariant} onVariantChange={setSelectedVariant} />
						</div>
					</div>
				</section>
			</div>

			<Separator className="my-8" />

			{/* Product Details */}
			<section aria-label="Product details" className="max-w-4xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div>
						<h2 className="text-xl font-bold mb-4">Technical Details</h2>
						<div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-6">
							<dl className="grid grid-cols-3 gap-4">
								{product.vendor && (
									<>
										<dt className="text-sm text-neutral-500 dark:text-neutral-400">Brand</dt>
										<dd className="text-sm col-span-2" itemProp="brand">
											{product.vendor}
										</dd>
									</>
								)}
								{product.productType && (
									<>
										<dt className="text-sm text-neutral-500 dark:text-neutral-400">Category</dt>
										<dd className="text-sm col-span-2" itemProp="category">
											{product.productType}
										</dd>
									</>
								)}
								<dt className="text-sm text-neutral-500 dark:text-neutral-400">Availability</dt>
								<dd className="text-sm col-span-2">
									<link itemProp="availability" href={product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
									{product.availableForSale ? "In Stock" : "Out of Stock"}
								</dd>
							</dl>
						</div>
					</div>

					<div>
						<h2 className="text-xl font-bold mb-4">About This Item</h2>
						<div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-6">
							<div className="prose prose-sm dark:prose-invert">
								<div dangerouslySetInnerHTML={{ __html: product.description }} />
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}

export { ProductContentClient };
export default ProductContentClient;
