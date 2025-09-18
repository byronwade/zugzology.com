"use client";

import { Button } from "@/components/ui/button";
import { Link } from '@/components/ui/link';
import { Badge } from "@/components/ui/badge";
import { Package, Check, ArrowRight, Star, Plus, Minus, ShoppingCart, Percent, Loader2 } from "lucide-react";
import Image from "next/image";
import { getProducts } from "@/lib/actions/shopify";
import { useState, useEffect } from "react";
import { AddToCartButton } from "@/components/features/products/add-to-cart-button";
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
	if (product.excerpt) return product.excerpt;
	const description = product.description || "";
	const sentences =
		description
			.split(/[.!?]+/)
			.slice(0, 2)
			.join(". ") + ".";
	return sentences.length < 150 ? sentences : description.slice(0, 150) + "...";
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
				if (!products || !Array.isArray(products)) {
					console.warn("No products found or invalid response format");
					setProduct(null);
					return;
				}

				const foundProduct = products.find((p) => p?.id?.includes("7264768655420"));
				if (!foundProduct) {
					console.warn("Featured bundle product not found");
					setProduct(null);
					return;
				}

				setProduct(foundProduct);
			} catch (error) {
				console.error("Error fetching featured bundle:", error);
				setProduct(null);
			} finally {
				setLoading(false);
			}
		}
		fetchProduct();
	}, []);

	if (loading) {
		return (
			<section className="w-full py-16 bg-white dark:bg-gray-950">
				<div className="container mx-auto px-4 md:px-6">
					<div className="grid lg:grid-cols-2 gap-12">
						<div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
						<div className="space-y-4">
							<div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
							<div className="h-8 w-3/4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
							<div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
						</div>
					</div>
				</div>
			</section>
		);
	}

	if (!product) return null;

	const variant = product.variants?.nodes?.[0];
	if (!variant) return null;

	const basePrice = parseFloat(variant.price.amount);
	const compareAtPrice = variant.compareAtPrice ? parseFloat(variant.compareAtPrice.amount) : basePrice;
	const discountPercentage = getDiscountForQuantity(quantity);
	const pricePerBag = basePrice * (1 - discountPercentage / 100);
	const totalPrice = pricePerBag * quantity;
	const totalSavings = compareAtPrice * quantity - totalPrice;

	const handleQuantityChange = (newQuantity: number) => {
		setQuantity(Math.max(1, Math.min(1000, newQuantity)));
	};

	return (
		<section className="w-full py-16 bg-white dark:bg-gray-950">
			<div className="container mx-auto px-4 md:px-6">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Image Side */}
					<div className="relative">
						<div className="relative aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
							<Image src={product.images.nodes[0]?.url || "/placeholder.jpg"} alt={product.title} fill className="object-cover rounded-lg" sizes="(max-width: 768px) 100vw, 50vw" />
						</div>
						{/* Floating Elements */}
						<div className="absolute -top-6 -right-6">
							<Badge className="bg-primary text-white text-lg px-4 py-2">Best Seller</Badge>
						</div>
						<div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
							<Package className="h-8 w-8 text-primary" />
						</div>
					</div>

					{/* Content Side */}
					<div className="flex flex-col justify-center">
						<Badge variant="secondary" className="w-fit bg-primary/10 text-primary mb-4">
							Most Popular Product
						</Badge>
						<div className="flex items-center gap-2 mb-4">
							<div className="flex">
								{[...Array(5)].map((_, i) => (
									<Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
								))}
							</div>
							<span className="text-sm text-gray-600 dark:text-gray-400">(500+ Reviews)</span>
						</div>
						<h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl lg:text-5xl">{product.title}</h2>
						<p className="mt-4 text-lg text-gray-600 dark:text-gray-400 line-clamp-3">{getExcerptOrDescription(product)}</p>

						{/* Compact Pricing Section */}
						<div className="mt-8 space-y-6">
							{/* Price Display */}
							<div className="flex items-baseline gap-2">
								<span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{formatPrice(pricePerBag, variant.price.currencyCode)}</span>
								{discountPercentage > 0 && <span className="text-xl text-green-500 font-semibold">-{discountPercentage}% OFF</span>}
								{compareAtPrice > pricePerBag && <span className="text-lg text-gray-500 line-through">{formatPrice(compareAtPrice, variant.price.currencyCode)}</span>}
							</div>

							{/* Bulk Pricing Tiers */}
							<div className="grid grid-cols-5 gap-2">
								{bulkPricingTiers.map((tier) => (
									<button key={tier.quantity} onClick={() => handleQuantityChange(tier.minQuantity)} className={`relative p-2 rounded-lg text-center transition-all ${quantity >= tier.minQuantity ? "bg-green-500 text-white" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
										<div className="text-sm font-semibold">{tier.quantity}</div>
										<div className="text-xs opacity-90">{tier.discount}%</div>
									</button>
								))}
							</div>

							{/* Quantity and Add to Cart */}
							<div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-4">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(quantity - 1)}>
											<Minus className="h-4 w-4" />
										</Button>
										<input type="number" className="flex h-8 w-16 rounded-md border border-input bg-transparent px-2 text-sm text-center" min="1" max="1000" value={quantity} onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)} />
										<Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(quantity + 1)}>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
									<div className="text-right">
										<div className="font-bold text-xl text-gray-900 dark:text-gray-100">{formatPrice(totalPrice, variant.price.currencyCode)}</div>
										{totalSavings > 0 && <div className="text-sm font-medium text-green-500">Save {formatPrice(totalSavings, variant.price.currencyCode)}</div>}
									</div>
								</div>

								<div className="grid grid-cols-2 gap-2">
									<AddToCartButton variantId={variant.id} quantity={quantity} availableForSale={variant.availableForSale} className="h-12 bg-secondary hover:bg-secondary/80 text-foreground border border-foreground/10 hover:border-foreground/20 shadow-none" />
									<Button
										size="lg"
										className="h-12 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 transition-colors disabled:opacity-60 group"
										disabled={isCheckingOut}
										onClick={() => {
											setIsCheckingOut(true);
											const variantId = variant.id.split("/").pop();
											const checkoutUrl = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/cart/${variantId}:${quantity}`;
											window.location.href = checkoutUrl;
										}}
									>
										<ShoppingCart className="mr-2 h-4 w-4" />
										<span>{isCheckingOut ? "Redirecting..." : "Buy Now"}</span>
										{isCheckingOut && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
									</Button>
								</div>

								<div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
