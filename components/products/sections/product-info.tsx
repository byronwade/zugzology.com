"use client";

import { useState, useEffect } from "react";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { Award, Microscope, Leaf, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FrequentlyBoughtTogether } from "./frequently-bought-together";
import Image from "next/image";

interface ProductInfoProps {
	product: ShopifyProduct;
	selectedVariant: ShopifyProductVariant | null;
	selectedOptions: Record<string, string>;
	onOptionChange: (name: string, value: string) => void;
	complementaryProducts?: ShopifyProduct[];
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="group relative flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors duration-200 cursor-help">
						<div className="p-2 rounded-full bg-primary/10 text-primary">
							<Icon className="h-4 w-4" />
						</div>
						<div className="space-y-1">
							<h3 className="font-medium text-sm leading-none">{title}</h3>
							<p className="text-xs text-muted-foreground leading-none">{description}</p>
						</div>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<p className="text-sm">{description}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export function ProductInfo({ product, selectedVariant, selectedOptions, onOptionChange, complementaryProducts = [] }: ProductInfoProps) {
	const [showMore, setShowMore] = useState(false);

	// Get all available variants
	const variants = product.variants?.nodes || [];

	// Get all options for the product
	const options =
		product.options?.map((option) => ({
			name: option.name,
			values: Array.from(new Set(variants.map((variant) => variant.selectedOptions?.find((opt) => opt.name === option.name)?.value).filter(Boolean))),
		})) || [];

	// Early return if required data is missing
	if (!product || !selectedVariant) return null;

	const isAvailable = selectedVariant.availableForSale;
	const hasMultipleVariants = (product.variants?.nodes?.length || 0) > 1;

	// Get variant availability
	const variantAvailability = variants.map((variant) => ({
		...variant.selectedOptions?.reduce((acc, opt) => ({ ...acc, [opt.name]: opt.value }), {}),
		available: variant.availableForSale,
	}));

	// Function to check if a variant with given options is available
	const isOptionAvailable = (optionName: string, optionValue: string) => {
		const currentOptions = {
			...selectedOptions,
			[optionName]: optionValue,
		};

		return variants.some((variant) => variant.selectedOptions?.every((option) => currentOptions[option.name] === option.value));
	};

	// Get complementary products data
	const complementaryProductsData = complementaryProducts.map((product) => ({
		...product,
		firstVariant: product.variants?.nodes?.[0],
	}));

	return (
		<>
			<div className="flex flex-col gap-4 h-full">
				{/* Product Options */}
				{hasMultipleVariants && product.options && (
					<div className="product-options space-y-4">
						{product.options.map(
							(option) =>
								option && (
									<div key={option.id} className="space-y-2">
										<label className="block text-sm font-medium text-gray-700">{option.name}</label>
										<div className="flex flex-wrap gap-2">
											{(option.values || []).map((value) => (
												<button key={value} onClick={() => onOptionChange(option.name, value)} className={`px-4 py-2 border rounded-md ${selectedOptions[option.name] === value ? "border-purple-600 bg-purple-50 text-purple-700 font-medium" : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"}`}>
													{value}
												</button>
											))}
										</div>
									</div>
								)
						)}
					</div>
				)}

				{/* Product Info Card */}
				<Card className="shadow-none border border-foreground/15 rounded-lg">
					<CardHeader className="space-y-4 sm:space-y-2">
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
							<div className="flex items-center gap-3">
								<div className="relative w-8 h-5 shrink-0">
									<Image src="/usa.png" alt="USA Flag" width={32} height={20} className="object-cover rounded-sm" style={{ width: "auto", height: "auto" }} />
								</div>
								<CardTitle className="text-lg">Made in California, USA</CardTitle>
							</div>
							<Badge variant="secondary" className="w-fit">
								Family Owned
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Product Details */}
						<div className="grid gap-4">
							<div className="grid sm:grid-cols-2 gap-4 text-sm">
								<div className="space-y-2">
									{product.productType && (
										<div className="flex items-center justify-between sm:justify-start sm:gap-3">
											<span className="text-muted-foreground font-medium">Category</span>
											<span>{product.productType}</span>
										</div>
									)}
									{product.vendor && (
										<div className="flex items-center justify-between sm:justify-start sm:gap-3">
											<span className="text-muted-foreground font-medium">Brand</span>
											<span>{product.vendor}</span>
										</div>
									)}
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between sm:justify-start sm:gap-3">
										<span className="text-muted-foreground font-medium">SKU</span>
										<span className="text-xs font-medium">{selectedVariant.id.split("/").pop()}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Features Grid */}
						<div className="grid sm:grid-cols-2 gap-3">
							<FeatureCard icon={Award} title="Small Family Business" description="Family Owned & Operated in California" />
							<FeatureCard icon={Microscope} title="Expert Mycology Knowledge" description="Decades of Experience" />
							<FeatureCard icon={Leaf} title="Eco-Friendly Practices" description="100% Sustainable" />
							<FeatureCard icon={Clock} title="Same-Day Processing" description="Lightning Fast Shipping" />
						</div>

						<div className="text-center pt-2">
							<p className="text-sm text-muted-foreground">Trusted by thousands of mycology enthusiasts nationwide</p>
						</div>
					</CardContent>
				</Card>

				{/* Product Description */}
				<section aria-labelledby="description-heading" className="product-description mt-2" itemProp="description">
					<h2 id="description-heading" className="text-2xl font-bold mb-4 text-foreground/90">
						Product Description
					</h2>
					<div className="prose prose-neutral dark:prose-invert max-w-none prose-p:text-foreground/80" dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }} />
				</section>
			</div>

			{/* Frequently Bought Together */}
			{complementaryProducts.length > 0 && (
				<div className="mt-8">
					<FrequentlyBoughtTogether mainProduct={product} complementaryProducts={complementaryProducts} />
				</div>
			)}
		</>
	);
}
