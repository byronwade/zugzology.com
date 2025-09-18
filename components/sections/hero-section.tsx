import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Shield, Star, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/types";

interface HeroSectionProps {
	product?: ShopifyProduct & {
		excerpt?: string | null;
	};
}

export function HeroSection({ product }: HeroSectionProps) {
	// Return a default hero section if no product is provided
	if (!product) {
		return (
			<section className="relative min-h-screen bg-background overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-primary/5" />
				<div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl transform translate-x-1/4" />
				
				<div className="container relative mx-auto px-4 py-16 sm:px-6 lg:px-8">
					<div className="relative min-h-[80vh] flex flex-col justify-center">
						<div className="text-center space-y-8">
							<div className="space-y-4">
								<h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[0.95] tracking-tight">
									Premium Mushroom Growing Supplies
								</h1>
								<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
									Everything you need for successful mushroom cultivation, from spawn to harvest.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
								<Button size="lg" className="h-12 px-8 text-base font-semibold" asChild>
									<Link href="/collections/all">
										Shop Now <ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
								<Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
									<Link href="/products">
										Browse Products
									</Link>
								</Button>
							</div>

							<div className="flex items-center justify-center gap-2 text-sm text-primary">
								<CheckCircle className="h-4 w-4" />
								<span className="font-medium">Free shipping on orders over $50</span>
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	const primaryVariant = product.variants?.nodes?.[0];
	const priceAmount = primaryVariant?.price?.amount ?? product.priceRange?.minVariantPrice?.amount ?? "0";
	const currencyCode = primaryVariant?.price?.currencyCode ?? product.priceRange?.minVariantPrice?.currencyCode ?? "USD";
	const compareAtPrice = primaryVariant?.compareAtPrice?.amount;

	const formattedPrice = formatPrice(priceAmount, currencyCode);
	const formattedCompareAtPrice = compareAtPrice ? formatPrice(compareAtPrice, currencyCode) : null;
	const hasDiscount = compareAtPrice ? parseFloat(compareAtPrice) > parseFloat(priceAmount) : false;
	const discountPercentage = hasDiscount
		? Math.round(((parseFloat(compareAtPrice ?? "0") - parseFloat(priceAmount)) / parseFloat(compareAtPrice ?? "1")) * 100)
		: null;

	const quantityAvailable = typeof primaryVariant?.quantityAvailable === "number" ? primaryVariant.quantityAvailable : null;
	const isInStock = primaryVariant?.availableForSale && (quantityAvailable === null || quantityAvailable > 0);

	const ratingMetafield = product.metafields?.find(
		(field) => field?.namespace === "custom" && field?.key === "rating"
	);
	const ratingCountMetafield = product.metafields?.find(
		(field) => field?.namespace === "custom" && field?.key === "rating_count"
	);

	const ratingValue = ratingMetafield ? Number.parseFloat(ratingMetafield.value) : null;
	const ratingCount = ratingCountMetafield ? Number.parseInt(ratingCountMetafield.value, 10) : null;

	const primaryImage = product.images?.nodes?.[0];
	const shortDescription = buildShortDescription(product);

	return (
		<section className="relative min-h-screen bg-background overflow-hidden">
			{/* Background Elements */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-primary/5" />
			<div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl transform translate-x-1/4" />
			
			<div className="container relative mx-auto px-4 py-16 sm:px-6 lg:px-8">
				{/* Hero Content */}
				<div className="relative min-h-[80vh] flex flex-col justify-center">
					{/* Top Bar - Trust Indicators */}
					{(product.productType || (ratingValue && ratingCount)) && (
						<div className="flex items-center justify-center gap-6 mb-8">
							{product.productType && (
								<Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
									{product.productType}
								</Badge>
							)}
							{ratingValue && ratingCount && (
								<div className="flex items-center gap-2 text-sm">
									<div className="flex">
										{[...Array(5)].map((_, i) => (
											<Star key={i} className={`h-4 w-4 ${i < Math.floor(ratingValue) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
										))}
									</div>
									<span className="font-medium">{ratingValue}</span>
									<span className="text-muted-foreground">({ratingCount.toLocaleString()}+ reviews)</span>
								</div>
							)}
						</div>
					)}

					{/* Main Content Layout */}
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
						
						{/* Left Column - Text Content */}
						<div className="lg:col-span-7 text-center lg:text-left space-y-8">
							{/* Main Headline */}
							<div className="space-y-4">
								<h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[0.95] tracking-tight">
									{product.title}
								</h1>
								<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
									{shortDescription}
								</p>
							</div>

							{/* Price and CTA Row */}
							<div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
								{/* Price */}
								<div className="flex items-baseline gap-3">
									<span className="text-3xl md:text-4xl font-bold">{formattedPrice}</span>
									{formattedCompareAtPrice && (
										<span className="text-lg text-muted-foreground line-through">{formattedCompareAtPrice}</span>
									)}
									{hasDiscount && discountPercentage && (
										<Badge className="bg-destructive/10 text-destructive border-destructive/20">
											-{discountPercentage}%
										</Badge>
									)}
								</div>

								{/* Primary CTA */}
								<Button size="lg" className="h-12 px-8 text-base font-semibold" asChild>
									<Link href={`/products/${product.handle}`}>
										Shop Now <ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
							</div>

							{/* Features Grid */}
							{product.tags && product.tags.length > 0 && (
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0">
									{product.tags.slice(0, 3).map((tag, index) => {
										const icons = [CheckCircle, Shield, TrendingUp];
										const IconComponent = icons[index] || CheckCircle;
										return (
											<div key={tag} className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/50 border">
												<IconComponent className="h-4 w-4 text-primary flex-shrink-0" />
												<span className="font-medium capitalize">{tag.replace('-', ' ')}</span>
											</div>
										);
									})}
								</div>
							)}

							{/* Stock Status */}
							{isInStock && (
								<div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-primary">
									<CheckCircle className="h-4 w-4" />
									<span className="font-medium">In stock • Ships within 24 hours</span>
								</div>
							)}

							{/* Secondary CTA */}
							<div className="flex justify-center lg:justify-start">
								<Button variant="outline" size="lg" className="px-6" asChild>
									<Link href="/collections/all">Browse All Products</Link>
								</Button>
							</div>
						</div>

						{/* Right Column - Product Image */}
						{primaryImage && (
							<div className="lg:col-span-5 relative">
								{/* Main Product Image */}
								<div className="relative aspect-square max-w-md mx-auto lg:max-w-none">
									<div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/20 rounded-2xl" />
									<Image
										src={primaryImage.url}
										alt={primaryImage.altText || product.title}
										fill
										priority
										className="object-cover rounded-2xl"
										sizes="(max-width: 768px) 100vw, 40vw"
									/>
									
									{/* Floating Elements */}
									{hasDiscount && (
										<div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold">
											{discountPercentage}% OFF
										</div>
									)}
								</div>

								{/* Vendor Badge */}
								{product.vendor && (
									<div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-background border rounded-full px-4 py-2 shadow-lg">
										<div className="text-center">
											<div className="text-sm font-semibold">{product.vendor}</div>
											<div className="text-xs text-muted-foreground">Trusted Brand</div>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}

function buildShortDescription(product: HeroSectionProps["product"]): string {
	const source = product.excerpt || product.descriptionHtml || product.description || "";
	const plainText = source
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	if (plainText) {
		return plainText.length > 180 ? `${plainText.slice(0, 170).trim()}…` : plainText;
	}

	if (product.productType && product.vendor) {
		return `Premium ${product.productType.toLowerCase()} from ${product.vendor} for your cultivation needs.`;
	}

	return `Premium mushroom growing supplies for serious cultivators.`;
}

