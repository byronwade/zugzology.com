"use client";

import { Award, Clock, Leaf, Microscope } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { FrequentlyBoughtTogether } from "./frequently-bought-together";

type ProductInfoProps = {
	product: ShopifyProduct;
	selectedVariant: ShopifyProductVariant | null;
	selectedOptions: Record<string, string>;
	onOptionChange: (name: string, value: string) => void;
	complementaryProducts?: ShopifyProduct[];
};

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="group relative flex cursor-help items-start gap-3 rounded-lg border bg-card p-3 transition-colors duration-200 hover:bg-accent">
						<div className="rounded-full bg-primary/10 p-2 text-primary">
							<Icon className="h-4 w-4" />
						</div>
						<div className="space-y-1">
							<h3 className="font-medium text-sm leading-none">{title}</h3>
							<p className="text-muted-foreground text-xs leading-none">{description}</p>
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

export function ProductInfo({
	product,
	selectedVariant,
	selectedOptions,
	onOptionChange,
	complementaryProducts = [],
}: ProductInfoProps) {
	const [_showMore, _setShowMore] = useState(false);

	// Get all available variants
	const variants = product.variants?.nodes || [];

	// Get all options for the product
	const _options =
		product.options?.map((option) => ({
			name: option.name,
			values: Array.from(
				new Set(
					variants
						.map((variant) => variant.selectedOptions?.find((opt) => opt.name === option.name)?.value)
						.filter(Boolean)
				)
			),
		})) || [];

	// Early return if required data is missing
	if (!(product && selectedVariant)) {
		return null;
	}

	const _isAvailable = selectedVariant.availableForSale;
	const hasMultipleVariants = (product.variants?.nodes?.length || 0) > 1;

	// Get variant availability
	const _variantAvailability = variants.map((variant) => ({
		...variant.selectedOptions?.reduce((acc, opt) => ({ ...acc, [opt.name]: opt.value }), {}),
		available: variant.availableForSale,
	}));

	// Function to check if a variant with given options is available
	const _isOptionAvailable = (optionName: string, optionValue: string) => {
		const currentOptions = {
			...selectedOptions,
			[optionName]: optionValue,
		};

		return variants.some((variant) =>
			variant.selectedOptions?.every((option) => currentOptions[option.name] === option.value)
		);
	};

	// Get complementary products data
	const _complementaryProductsData = complementaryProducts.map((product) => ({
		...product,
		firstVariant: product.variants?.nodes?.[0],
	}));

	return (
		<>
			<div className="flex h-full flex-col gap-4">
				{/* Product Options */}
				{hasMultipleVariants && product.options && (
					<div className="product-options space-y-3">
						{product.options.map(
							(option) =>
								option && (
									<div className="space-y-2" key={option.id}>
										<label className="block font-medium text-foreground text-sm">{option.name}</label>
										<div className="flex flex-wrap gap-1.5">
											{(option.values || []).map((value) => (
												<button
													className={`rounded-md border px-2.5 py-1.5 text-sm transition-colors ${selectedOptions[option.name] === value ? "border-primary bg-primary/10 font-medium text-primary dark:bg-primary/20 dark:border-primary/70" : "border-border bg-background hover:border-primary/50 hover:bg-accent dark:hover:border-primary/40"}`}
													key={value}
													onClick={() => onOptionChange(option.name, value)}
												>
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
				<Card className="rounded-lg border border-foreground/15 shadow-none">
					<CardHeader className="space-y-4 sm:space-y-2">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center gap-3">
								<div className="relative h-5 w-8 shrink-0">
									<Image alt="USA Flag" className="rounded-sm object-cover" height={20} src="/usa.png" width={32} />
								</div>
								<CardTitle className="text-lg">Made in California, USA</CardTitle>
							</div>
							<Badge className="w-fit" variant="secondary">
								Family Owned
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Product Details */}
						<div className="grid gap-4">
							<div className="grid gap-4 text-sm sm:grid-cols-2">
								<div className="space-y-2">
									{product.productType && (
										<div className="flex items-center justify-between sm:justify-start sm:gap-3">
											<span className="font-medium text-muted-foreground">Category</span>
											<span>{product.productType}</span>
										</div>
									)}
									{product.vendor && (
										<div className="flex items-center justify-between sm:justify-start sm:gap-3">
											<span className="font-medium text-muted-foreground">Brand</span>
											<span>{product.vendor}</span>
										</div>
									)}
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between sm:justify-start sm:gap-3">
										<span className="font-medium text-muted-foreground">SKU</span>
										<span className="font-medium text-xs">{selectedVariant.id.split("/").pop()}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Features Grid */}
						<div className="grid gap-3 sm:grid-cols-2">
							<FeatureCard
								description="Family Owned & Operated in California"
								icon={Award}
								title="Small Family Business"
							/>
							<FeatureCard description="Decades of Experience" icon={Microscope} title="Expert Mycology Knowledge" />
							<FeatureCard description="100% Sustainable" icon={Leaf} title="Eco-Friendly Practices" />
							<FeatureCard description="Lightning Fast Shipping" icon={Clock} title="Same-Day Processing" />
						</div>

						<div className="pt-2 text-center">
							<p className="text-muted-foreground text-sm">Trusted by thousands of mycology enthusiasts nationwide</p>
						</div>
					</CardContent>
				</Card>

				{/* Product Description */}
				<section aria-labelledby="description-heading" className="product-description mt-2" itemProp="description">
					<h2 className="mb-4 font-bold text-2xl text-foreground/90" id="description-heading">
						Product Description
					</h2>
					<div
						className="prose prose-neutral dark:prose-invert max-w-none prose-p:text-foreground/80"
						dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
					/>
				</section>
			</div>

			{/* Frequently Bought Together */}
			{complementaryProducts.length > 0 && (
				<div className="mt-8">
					<FrequentlyBoughtTogether complementaryProducts={complementaryProducts} mainProduct={product} />
				</div>
			)}
		</>
	);
}
