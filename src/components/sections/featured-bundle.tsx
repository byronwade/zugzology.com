"use client";

import { Check, Loader2, Minus, Package, Percent, Plus, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AddToCartButton } from "@/components/features/products/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/actions/shopify";
import { formatPrice } from "@/lib/utils";

// Updated bulk pricing tiers with more descriptive savings
const bulkPricingTiers = [
	{ quantity: "2+", discount: 15, minQuantity: 2, label: "Starter Pack" },
	{ quantity: "5+", discount: 25, minQuantity: 5, label: "Small Bulk" },
	{ quantity: "10+", discount: 30, minQuantity: 10, label: "Medium Bulk" },
	{ quantity: "20+", discount: 35, minQuantity: 20, label: "Large Bulk" },
	{ quantity: "50+", discount: 40, minQuantity: 50, label: "Wholesale" },
];

// Helper function to get discount percentage based on quantity
function getDiscountForQuantity(quantity: number) {
	const tier = [...bulkPricingTiers].reverse().find((tier) => quantity >= tier.minQuantity);
	return tier ? tier.discount : 0;
}

// Add this helper function at the top
function getExcerptOrDescription(product: any) {
	if (product.excerpt) {
		return product.excerpt;
	}
	const description = product.description || "";
	const sentences = `${description
		.split(/[.!?]+/)
		.slice(0, 2)
		.join(". ")}.`;
	return sentences.length < 150 ? sentences : `${description.slice(0, 150)}...`;
}

export function FeaturedBundle() {
	const [quantity, setQuantity] = useState(1);
	const [product, setProduct] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [isCheckingOut, setIsCheckingOut] = useState(false);

	useEffect(() => {
		async function fetchProduct() {
			try {
				const products = await getProducts();
				if (!(products && Array.isArray(products))) {
					setProduct(null);
					return;
				}

				const foundProduct = products.find((p) => p?.id?.includes("7264768655420"));
				if (!foundProduct) {
					setProduct(null);
					return;
				}

				setProduct(foundProduct);
			} catch (_error) {
				setProduct(null);
			} finally {
				setLoading(false);
			}
		}
		fetchProduct();
	}, []);

	if (loading) {
		return (
			<section className="w-full bg-background">
				<div className="container mx-auto px-4 py-12">
					<div className="grid gap-12 lg:grid-cols-2">
						<div className="aspect-square animate-pulse rounded-lg bg-muted" />
						<div className="space-y-4">
							<div className="h-4 w-24 animate-pulse rounded bg-muted" />
							<div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
							<div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
						</div>
					</div>
				</div>
			</section>
		);
	}

	if (!product) {
		return null;
	}

	const variant = product.variants?.nodes?.[0];
	if (!variant) {
		return null;
	}

	const basePrice = Number.parseFloat(variant.price.amount);
	const compareAtPrice = variant.compareAtPrice ? Number.parseFloat(variant.compareAtPrice.amount) : basePrice;
	const discountPercentage = getDiscountForQuantity(quantity);
	const pricePerBag = basePrice * (1 - discountPercentage / 100);
	const totalPrice = pricePerBag * quantity;
	const totalSavings = compareAtPrice * quantity - totalPrice;

	const handleQuantityChange = (newQuantity: number) => {
		setQuantity(Math.max(1, Math.min(1000, newQuantity)));
	};

	return (
		<section className="w-full bg-background">
			<div className="container mx-auto px-4 py-12">
				<div className="grid items-center gap-12 lg:grid-cols-2">
					{/* Image Side */}
					<div className="relative">
						<div className="relative aspect-square rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
							<Image
								alt={product.title}
								className="rounded-lg object-cover"
								fill
								sizes="(max-width: 768px) 100vw, 50vw"
								src={product.images.nodes[0]?.url || "/placeholder.jpg"}
							/>
						</div>
						{/* Floating Elements */}
						<div className="-top-6 -right-6 absolute">
							<Badge className="bg-primary px-4 py-2 text-lg text-white">Best Seller</Badge>
						</div>
						<div className="-bottom-6 -left-6 absolute rounded-full bg-card p-4 shadow-lg">
							<Package className="h-8 w-8 text-primary" />
						</div>
					</div>

					{/* Content Side */}
					<div className="flex flex-col justify-center">
						<Badge className="mb-4 w-fit bg-primary/10 text-primary" variant="secondary">
							Most Popular Product
						</Badge>
						<div className="mb-4 flex items-center gap-2">
							<div className="flex">
								{[...new Array(5)].map((_, i) => (
									<Star className="h-5 w-5 fill-yellow-400 text-yellow-400" key={i} />
								))}
							</div>
							<span className="text-muted-foreground text-sm">(500+ Reviews)</span>
						</div>
						<h2 className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
							{product.title}
						</h2>
						<p className="mt-4 line-clamp-3 text-lg text-muted-foreground">{getExcerptOrDescription(product)}</p>

						{/* Compact Pricing Section */}
						<div className="mt-8 space-y-6">
							{/* Price Display */}
							<div className="flex items-baseline gap-2">
								<span className="font-bold text-4xl text-foreground">
									{formatPrice(pricePerBag, variant.price.currencyCode)}
								</span>
								{discountPercentage > 0 && (
									<span className="font-semibold text-green-500 text-xl">-{discountPercentage}% OFF</span>
								)}
								{compareAtPrice > pricePerBag && (
									<span className="text-lg text-muted-foreground line-through">
										{formatPrice(compareAtPrice, variant.price.currencyCode)}
									</span>
								)}
							</div>

							{/* Bulk Pricing Tiers */}
							<div className="grid grid-cols-5 gap-2">
								{bulkPricingTiers.map((tier) => (
									<button
										className={`relative rounded-lg p-2 text-center transition-all ${quantity >= tier.minQuantity ? "bg-green-500 text-white" : "bg-muted hover:bg-muted dark:hover:bg-muted"}`}
										key={tier.quantity}
										onClick={() => handleQuantityChange(tier.minQuantity)}
									>
										<div className="font-semibold text-sm">{tier.quantity}</div>
										<div className="text-xs opacity-90">{tier.discount}%</div>
									</button>
								))}
							</div>

							{/* Quantity and Add to Cart */}
							<div className="space-y-4 rounded-lg bg-muted/50 p-4">
								<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
									<div className="flex items-center gap-3">
										<Button
											className="h-8 w-8"
											onClick={() => handleQuantityChange(quantity - 1)}
											size="icon"
											variant="outline"
										>
											<Minus className="h-4 w-4" />
										</Button>
										<input
											className="flex h-8 w-16 rounded-md border border-input bg-transparent px-2 text-center text-sm"
											max="1000"
											min="1"
											onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value, 10) || 1)}
											type="number"
											value={quantity}
										/>
										<Button
											className="h-8 w-8"
											onClick={() => handleQuantityChange(quantity + 1)}
											size="icon"
											variant="outline"
										>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
									<div className="text-right">
										<div className="font-bold text-foreground text-xl">
											{formatPrice(totalPrice, variant.price.currencyCode)}
										</div>
										{totalSavings > 0 && (
											<div className="font-medium text-green-500 text-sm">
												Save {formatPrice(totalSavings, variant.price.currencyCode)}
											</div>
										)}
									</div>
								</div>

								<div className="grid grid-cols-2 gap-2">
									<AddToCartButton
										availableForSale={variant.availableForSale}
										className="h-12 border border-foreground/10 bg-secondary text-foreground shadow-none hover:border-foreground/20 hover:bg-secondary/80"
										quantity={quantity}
										variantId={variant.id}
									/>
									<Button
										className="group h-12 bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
										disabled={isCheckingOut}
										onClick={() => {
											setIsCheckingOut(true);
											const variantId = variant.id.split("/").pop();
											const checkoutUrl = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/cart/${variantId}:${quantity}`;
											window.location.href = checkoutUrl;
										}}
										size="lg"
									>
										<ShoppingCart className="mr-2 h-4 w-4" />
										<span>{isCheckingOut ? "Redirecting..." : "Buy Now"}</span>
										{isCheckingOut && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
									</Button>
								</div>

								<div className="flex flex-col items-center justify-center gap-4 text-muted-foreground text-sm sm:flex-row">
									<div className="flex items-center gap-1">
										<Percent className="h-4 w-4 text-green-500" />
										<span>Bulk Savings</span>
									</div>
									<div className="flex items-center gap-1">
										<Check className="h-4 w-4 text-green-500" />
										<span>Free Shipping</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
