"use client";

import { useState, useEffect } from "react";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Star, Info, Shield, TruckIcon, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface ProductInfoProps {
	product: ShopifyProduct;
	selectedVariant: ShopifyProductVariant;
	selectedOptions: Record<string, string>;
	onOptionChange: (optionName: string, value: string) => void;
}

interface ProductFeature {
	icon: string;
	text: string;
}

export function ProductInfo({ product, selectedVariant, selectedOptions, onOptionChange }: ProductInfoProps) {
	// Early return if required data is missing
	if (!product || !selectedVariant) return null;

	const [features, setFeatures] = useState<ProductFeature[]>([]);

	useEffect(() => {
		// Fetch features when component mounts
		async function loadFeatures() {
			try {
				// Fetch from Shopify metafields or your CMS
				const data = [
					{ icon: "Shield", text: "Premium Quality Guaranteed" },
					{ icon: "TruckIcon", text: "Fast & Free Shipping" },
					{ icon: "Gift", text: "Gift Wrapping Available" },
					{ icon: "Info", text: "Expert Support" },
				];
				setFeatures(data);
			} catch (error) {
				console.error("Error loading features:", error);
				// Set default features as fallback
				setFeatures([
					{ icon: "Shield", text: "Premium Quality Guaranteed" },
					{ icon: "TruckIcon", text: "Fast & Free Shipping" },
				]);
			}
		}

		loadFeatures();
	}, []); // Empty dependency array means this runs once on mount

	const isAvailable = selectedVariant.availableForSale;
	const hasMultipleVariants = product.variants?.edges?.length > 1;
	const rating = product.rating || 0;
	const reviewsCount = product.reviewsCount || 0;

	return (
		<div className="product-info space-y-6">
			{/* Product Title and Badges */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold tracking-tight" itemProp="name">
						{product.title}
					</h1>
					{product.tags?.includes("new") && <Badge variant="secondary">New Arrival</Badge>}
				</div>
				<div className="flex items-center space-x-2">
					{product.vendor && <Badge variant="outline">{product.vendor}</Badge>}
					{product.productType && <Badge variant="outline">{product.productType}</Badge>}
				</div>
			</div>

			{/* Rating */}
			{rating > 0 && (
				<div className="flex items-center space-x-4">
					<div className="flex items-center">
						{[...Array(5)].map((_, i) => (
							<Star key={i} className={`h-5 w-5 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-neutral-300"}`} />
						))}
					</div>
					<span className="text-sm text-neutral-600">
						{rating.toFixed(1)} ({reviewsCount} reviews)
					</span>
				</div>
			)}

			{/* Product Options */}
			{hasMultipleVariants && product.options && (
				<div className="product-options space-y-4">
					{product.options.map(
						(option) =>
							option && (
								<div key={option.id} className="space-y-2">
									<label className="block text-sm font-medium">{option.name}</label>
									<div className="flex flex-wrap gap-2">
										{(option.values || []).map((value) => (
											<button key={value} onClick={() => onOptionChange(option.name, value)} className={`px-4 py-2 border rounded-md ${selectedOptions[option.name] === value ? "border-primary bg-primary/10" : "border-neutral-200 hover:border-primary"}`}>
												{value}
											</button>
										))}
									</div>
								</div>
							)
					)}
				</div>
			)}

			<Separator />

			{/* Key Features */}
			<div className="key-features space-y-4">
				<h2 className="font-semibold">Key Features</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{features.map((feature, index) => (
						<div key={index} className="flex items-center space-x-3">
							{feature.icon === "Shield" && <Shield className="h-5 w-5 text-primary" />}
							{feature.icon === "TruckIcon" && <TruckIcon className="h-5 w-5 text-primary" />}
							{feature.icon === "Gift" && <Gift className="h-5 w-5 text-primary" />}
							{feature.icon === "Info" && <Info className="h-5 w-5 text-primary" />}
							<span className="text-sm">{feature.text}</span>
						</div>
					))}
				</div>
			</div>

			{/* Product Metadata Table */}
			<Table>
				<TableBody>
					<TableRow>
						<TableCell className="font-medium">SKU</TableCell>
						<TableCell className="text-wrap">{selectedVariant.id}</TableCell>
					</TableRow>
					{product.productType && (
						<TableRow>
							<TableCell className="font-medium">Category</TableCell>
							<TableCell>{product.productType}</TableCell>
						</TableRow>
					)}
					{product.tags && product.tags.length > 0 && (
						<TableRow>
							<TableCell className="font-medium">Tags</TableCell>
							<TableCell>{product.tags.join(", ")}</TableCell>
						</TableRow>
					)}
					{product.vendor && (
						<TableRow>
							<TableCell className="font-medium">Brand</TableCell>
							<TableCell>{product.vendor}</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			{/* Product Description */}
			<section aria-labelledby="description-heading" className="product-description" itemProp="description">
				<h2 id="description-heading" className="text-2xl font-bold mb-4">
					Product Description
				</h2>
				<div className="prose prose-neutral dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }} />
			</section>
		</div>
	);
}
