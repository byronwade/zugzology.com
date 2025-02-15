"use client";

import { useState, useEffect } from "react";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Star, Info, Shield, TruckIcon, Gift, Award, Microscope, Leaf, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { FrequentlyBoughtTogether } from "./frequently-bought-together";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductInfoProps {
	product: ShopifyProduct;
	selectedVariant: ShopifyProductVariant;
	selectedOptions: Record<string, string>;
	onOptionChange: (optionName: string, value: string) => void;
	complementaryProducts: ShopifyProduct[];
}

interface ProductFeature {
	icon: string;
	text: string;
	description: string;
	highlight: string;
}

export function ProductInfo({ product, selectedVariant, selectedOptions, onOptionChange, complementaryProducts }: ProductInfoProps) {
	// Early return if required data is missing
	if (!product || !selectedVariant) return null;

	const [features, setFeatures] = useState<ProductFeature[]>([]);

	useEffect(() => {
		// Fetch features when component mounts
		async function loadFeatures() {
			try {
				// Updated features focused on unique selling points
				const data = [
					{
						icon: "Award",
						text: "Small Family Business in California",
						description: "Founded and operated by passionate mycology experts in California, ensuring personal attention to every order.",
						highlight: "Family Owned & Operated",
					},
					{
						icon: "Microscope",
						text: "Expert Mycology Knowledge",
						description: "Over 10 years of combined experience in mycology research and cultivation techniques.",
						highlight: "Decades of Experience",
					},
					{
						icon: "Leaf",
						text: "Eco-Friendly Practices",
						description: "Sustainable packaging and environmentally conscious cultivation methods.",
						highlight: "100% Sustainable",
					},
					{
						icon: "Clock",
						text: "Same-Day Processing",
						description: "Orders placed before 2 PM PST ship the same day, with real-time tracking provided.",
						highlight: "Lightning Fast Shipping",
					},
				];
				setFeatures(data);
			} catch (error) {
				console.error("Error loading features:", error);
				setFeatures([
					{
						icon: "Award",
						text: "Small Family Business in California",
						description: "Founded and operated by passionate mycology experts in California, ensuring personal attention to every order.",
						highlight: "Family Owned & Operated",
					},
					{
						icon: "Microscope",
						text: "Expert Mycology Knowledge",
						description: "Over 10 years of combined experience in mycology research and cultivation techniques.",
						highlight: "Decades of Experience",
					},
				]);
			}
		}

		loadFeatures();
	}, []); // Empty dependency array means this runs once on mount

	const isAvailable = selectedVariant.availableForSale;
	const hasMultipleVariants = product.variants?.edges?.length > 1;

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
										<label className="block text-sm font-medium text-primary/80">{option.name}</label>
										<div className="flex flex-wrap gap-2">
											{(option.values || []).map((value) => (
												<button key={value} onClick={() => onOptionChange(option.name, value)} className={`px-4 py-2 border rounded-md ${selectedOptions[option.name] === value ? "border-primary bg-primary/10 text-primary" : "border-primary/10 hover:border-primary/30 hover:bg-primary/5"}`}>
													{value}
												</button>
											))}
										</div>
									</div>
								)
						)}
					</div>
				)}

				<Separator className="bg-primary/5" />

				{/* Key Features */}
				<Card className="rounded-lg border border-primary/10 shadow-none bg-gradient-to-b from-primary/[0.02] to-transparent">
					<CardContent className="p-3 space-y-4">
						{/* USA and Family Owned Section */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1.5">
								<div className="relative w-6 h-[18px] rounded shadow-sm overflow-hidden">
									<Image src="/usa.png" alt="USA Flag" fill className="object-cover" priority />
								</div>
								<h2 className="font-semibold text-sm text-primary/90">Made in California, USA</h2>
							</div>
							<Badge variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
								Family Owned
							</Badge>
						</div>

						{/* Product Details Grid */}
						<div className="grid grid-cols-2 gap-2 text-sm border-t border-b border-primary/10 py-3 bg-primary/[0.02]">
							<div className="space-y-2.5">
								{product.productType && (
									<div className="flex items-center gap-2">
										<span className="text-primary/70 font-medium">Category</span>
										<span className="text-foreground/90">{product.productType}</span>
									</div>
								)}
								{product.vendor && (
									<div className="flex items-center gap-2">
										<span className="text-primary/70 font-medium">Brand</span>
										<span className="text-foreground/90">{product.vendor}</span>
									</div>
								)}
							</div>
							<div className="space-y-2.5">
								<div className="flex items-center gap-2">
									<span className="text-primary/70 font-medium">SKU</span>
									<span className="text-foreground/80 text-xs font-medium">{selectedVariant.id.split("/").pop()}</span>
								</div>
								{product.tags && product.tags.length > 0 && (
									<div className="flex items-start gap-2">
										<span className="text-primary/70 font-medium mt-1">Tags</span>
										<div className="flex flex-wrap gap-1">
											{product.tags.map((tag) => (
												<span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/5 text-primary/80 border border-primary/10 hover:bg-primary/10 transition-colors cursor-default">
													{tag}
												</span>
											))}
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Features Grid */}
						<div className="grid grid-cols-2 gap-1.5">
							<TooltipProvider>
								{features.map((feature, index) => (
									<Tooltip key={index}>
										<TooltipTrigger asChild>
											<div className="relative bg-white dark:bg-black/40 rounded-lg p-2.5 cursor-help border border-primary/10 hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-200">
												<div className="flex items-center gap-2">
													<div className="p-1.5 rounded-full bg-primary/10">
														{feature.icon === "Award" && <Award className="h-4 w-4 text-primary" />}
														{feature.icon === "Microscope" && <Microscope className="h-4 w-4 text-primary" />}
														{feature.icon === "Leaf" && <Leaf className="h-4 w-4 text-primary" />}
														{feature.icon === "Clock" && <Clock className="h-4 w-4 text-primary" />}
													</div>
													<div>
														<h3 className="font-medium text-xs leading-tight text-foreground/90">{feature.text}</h3>
														<p className="text-[10px] text-primary/70 leading-tight mt-0.5 font-medium">{feature.highlight}</p>
													</div>
												</div>
											</div>
										</TooltipTrigger>
										<TooltipContent side="top" className="max-w-[200px] p-2.5 text-xs">
											{feature.description}
										</TooltipContent>
									</Tooltip>
								))}
							</TooltipProvider>
						</div>

						<p className="text-[11px] text-center text-primary/60 font-medium">Trusted by thousands of mycology enthusiasts nationwide</p>
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
			<div className="mt-12 w-full">
				<FrequentlyBoughtTogether product={product} complementaryProducts={complementaryProducts} />
			</div>
		</>
	);
}
