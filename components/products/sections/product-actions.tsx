"use client";

import { useState } from "react";
import { ShopifyProductVariant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/providers/cart-provider";
import { Loader2, ShoppingCart, Package, ArrowRight, Shield, TruckIcon, Gift, Star, Info, Check, ChevronDown, HeartHandshake, Users, Headphones, Percent } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ProductActionsProps {
	selectedVariant: ShopifyProductVariant;
	quantity: number;
	onQuantityChange: (quantity: number) => void;
	productHandle: string;
}

export function ProductActions({ selectedVariant, quantity, onQuantityChange, productHandle }: ProductActionsProps) {
	const { addItem, createNewCart } = useCart();
	const [isLoading, setIsLoading] = useState(false);
	const [isBuyingNow, setIsBuyingNow] = useState(false);

	console.log("Product Handle:", productHandle);

	const handleAddToCart = async () => {
		if (!selectedVariant?.id) {
			toast.error("Please select a product variant");
			return;
		}

		setIsLoading(true);
		try {
			const merchandiseId = selectedVariant.id.includes("gid://shopify/ProductVariant/") ? selectedVariant.id : `gid://shopify/ProductVariant/${selectedVariant.id}`;

			await addItem({
				merchandiseId,
				quantity,
				isPreOrder: !selectedVariant.availableForSale,
			});
			toast.success("Added to cart");
		} catch (error) {
			console.error("Error in handleAddToCart:", error);
			toast.error("Failed to add to cart");
		} finally {
			setIsLoading(false);
		}
	};

	const handleBuyNow = async () => {
		if (!selectedVariant?.id) {
			toast.error("Please select a product variant");
			return;
		}

		setIsBuyingNow(true);
		try {
			const merchandiseId = selectedVariant.id.includes("gid://shopify/ProductVariant/") ? selectedVariant.id : `gid://shopify/ProductVariant/${selectedVariant.id}`;

			const cart = await createNewCart([
				{
					merchandiseId,
					quantity,
					isPreOrder: !selectedVariant.availableForSale,
				},
			]);

			if (cart?.checkoutUrl) {
				window.location.assign(cart.checkoutUrl);
			} else {
				throw new Error("No checkout URL available");
			}
		} catch (error) {
			console.error("Error in handleBuyNow:", error);
			toast.error("Failed to proceed to checkout");
		} finally {
			setIsBuyingNow(false);
		}
	};

	const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;

		// Allow empty input for better UX while typing
		if (value === "") {
			onQuantityChange(1);
			return;
		}

		const numValue = parseInt(value, 10);

		// Validate the input
		if (isNaN(numValue) || numValue < 1) {
			return;
		}

		// Optional: Limit to available quantity if you want to prevent overordering
		const maxQuantity = selectedVariant.quantityAvailable || 9999;
		const finalQuantity = Math.min(numValue, maxQuantity);

		onQuantityChange(finalQuantity);
	};

	return (
		<TooltipProvider>
			<Card className="rounded-lg border border-foreground/15 shadow-none w-full mx-auto">
				<CardContent className="p-6 space-y-6">
					{/* Price and Stock Status */}
					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<div className="text-3xl font-bold text-primary">{formatPrice(parseFloat(selectedVariant?.price?.amount || "0"))}</div>
							<Tooltip>
								<TooltipTrigger asChild>
									<Badge variant="secondary" className="text-xs font-semibold cursor-help">
										Best Seller
									</Badge>
								</TooltipTrigger>
								<TooltipContent>
									<p>This product is one of our top-selling items</p>
								</TooltipContent>
							</Tooltip>
						</div>
						{selectedVariant?.availableForSale ? (
							<div className="text-sm text-green-600 font-medium flex items-center">
								<div className="w-2 h-2 rounded-full bg-green-600 mr-2" />
								In Stock
							</div>
						) : (
							<div className="text-sm text-yellow-600 font-medium flex items-center">
								<div className="w-2 h-2 rounded-full bg-yellow-600 mr-2" />
								Pre-order
							</div>
						)}
						{typeof selectedVariant.quantityAvailable === "number" && <p className="text-sm text-neutral-600">{selectedVariant.quantityAvailable} units available</p>}
					</div>

					<div className="flex items-center space-x-1">
						{[1, 2, 3, 4, 5].map((star) => (
							<Star key={star} className="w-4 h-4 fill-primary text-primary" />
						))}
						<span className="text-sm text-muted-foreground ml-2">(4.8 out of 5)</span>
					</div>

					<Separator className="my-4" />

					{/* Updated Quantity Selector */}
					<div className="space-y-2">
						<Label htmlFor="quantity" className="text-sm font-medium">
							Quantity
						</Label>
						<div className="flex items-center space-x-2">
							<Input id="quantity" type="number" min="1" max={selectedVariant.quantityAvailable || 9999} value={quantity} onChange={handleQuantityChange} className="w-24" />
							{selectedVariant.quantityAvailable && <span className="text-sm text-muted-foreground">Max: {selectedVariant.quantityAvailable}</span>}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="space-y-3">
						<Button variant="secondary" onClick={handleAddToCart} disabled={isLoading || !selectedVariant?.availableForSale} className="w-full">
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Adding...
								</>
							) : (
								<>
									<ShoppingCart className="mr-2 h-4 w-4" />
									Add to Cart
								</>
							)}
						</Button>
						<Button variant="default" onClick={handleBuyNow} disabled={isBuyingNow || !selectedVariant?.availableForSale} className="w-full">
							{isBuyingNow ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Processing...
								</>
							) : (
								<>
									Buy Now
									<ArrowRight className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>
					</div>

					<Separator className="my-4" />

					{/* Collapsible Information Sections */}
					<Accordion type="single" collapsible className="w-full space-y-2">
						{/* Secure Transaction */}
						<AccordionItem value="secure-transaction" className="border rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
							<AccordionTrigger className="px-4 py-2 hover:no-underline">
								<div className="flex items-center">
									<Shield className="h-5 w-5 mr-2 text-primary" />
									<span className="font-semibold">Secure Transaction</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div className="flex items-center">
										<Info className="h-4 w-4 mr-2 text-blue-500" />
										<span>SSL Encrypted</span>
									</div>
									<div className="flex items-center">
										<Info className="h-4 w-4 mr-2 text-blue-500" />
										<span>PCI Compliant</span>
									</div>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center cursor-help">
												<TruckIcon className="h-4 w-4 mr-2 text-blue-500" />
												<span className="font-medium">30-Day Returns</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p>You can return the item within 30 days of receipt for a full refund or replacement</p>
										</TooltipContent>
									</Tooltip>
									<div className="flex items-center">
										<Shield className="h-4 w-4 mr-2 text-blue-500" />
										<span>Buyer Protection</span>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>

						{/* Shipping Information */}
						<AccordionItem value="shipping" className="border rounded-lg bg-accent/50">
							<AccordionTrigger className="px-4 py-2 hover:no-underline">
								<div className="flex items-center">
									<TruckIcon className="h-5 w-5 mr-2 text-primary" />
									<span className="font-semibold">Shipping Information</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<div className="space-y-2.5">
									<div className="flex items-center text-green-600">
										<span className="font-medium">Free Shipping</span>
										{selectedVariant.requiresShipping && (
											<Badge variant="secondary" className="ml-2 text-xs">
												Ships from USA
											</Badge>
										)}
									</div>
									<div className="flex items-center text-muted-foreground">
										<Package className="h-4 w-4 mr-2" />
										<span>Estimated delivery: 3-5 business days</span>
									</div>
									<ul className="text-sm space-y-1.5 text-muted-foreground">
										<li className="flex items-center">
											<Check className="h-4 w-4 mr-2 text-green-500" />
											Order before 2 PM EST for same-day shipping
										</li>
										<li className="flex items-center">
											<Check className="h-4 w-4 mr-2 text-green-500" />
											Express shipping available at checkout
										</li>
										<li className="flex items-center">
											<Check className="h-4 w-4 mr-2 text-green-500" />
											Real-time tracking provided
										</li>
										<li className="flex items-center">
											<Check className="h-4 w-4 mr-2 text-green-500" />
											Insurance included on all orders
										</li>
									</ul>
								</div>
							</AccordionContent>
						</AccordionItem>

						{/* Discreet Packaging */}
						<AccordionItem value="packaging" className="border rounded-lg bg-accent/50">
							<AccordionTrigger className="px-4 py-2 hover:no-underline">
								<div className="flex items-center">
									<Package className="h-5 w-5 mr-2 text-primary" />
									<span className="font-semibold">Discreet Packaging</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<ul className="space-y-2 text-sm">
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" />
										<span>Plain, unmarked outer box</span>
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" />
										<span>No visible product names or logos</span>
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" />
										<span>Secure, tamper-evident seal</span>
									</li>
									<li className="flex items-center">
										<Check className="h-4 w-4 mr-2 text-green-500" />
										<span>Neutral shipping label</span>
									</li>
								</ul>
								<p className="mt-2 text-sm text-muted-foreground">We prioritize your privacy. Our discreet packaging ensures your purchase remains confidential from shipment to delivery.</p>
							</AccordionContent>
						</AccordionItem>

						{/* Customer Satisfaction Guarantee */}
						<AccordionItem value="guarantee" className="border rounded-lg bg-accent/50">
							<AccordionTrigger className="px-4 py-2 hover:no-underline">
								<div className="flex items-center">
									<HeartHandshake className="h-5 w-5 mr-2 text-primary" />
									<span className="font-semibold">100% Satisfaction Guarantee</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<div className="space-y-3">
									<p className="text-sm font-medium text-primary">Your satisfaction is our top priority</p>
									<ul className="text-sm space-y-2 text-muted-foreground">
										<li className="flex items-center">
											<Check className="h-4 w-4 mr-2 text-green-500" />
											30-day money-back guarantee
										</li>
										<li className="flex items-center">
											<Check className="h-4 w-4 mr-2 text-green-500" />
											Free replacements for any quality issues
										</li>
										<li className="flex items-center">
											<Check className="h-4 w-4 mr-2 text-green-500" />
											No questions asked returns
										</li>
										<li className="flex items-center">
											<Check className="h-4 w-4 mr-2 text-green-500" />
											Lifetime support for your growing journey
										</li>
									</ul>
								</div>
							</AccordionContent>
						</AccordionItem>

						{/* Bulk Discounts */}
						{(() => {
							console.log("Checking product handle:", productHandle);
							return (
								productHandle === "all-in-one-mushroom-grow-bags-1-pack" && (
									<AccordionItem value="discounts" className="border rounded-lg bg-accent/50">
										<AccordionTrigger className="px-4 py-2 hover:no-underline">
											<div className="flex items-center">
												<Percent className="h-5 w-5 mr-2 text-primary" />
												<span className="font-semibold">Volume Discounts</span>
												<Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
													Save up to 40%
												</Badge>
											</div>
										</AccordionTrigger>
										<AccordionContent className="px-4 pb-4">
											<div className="space-y-3">
												<p className="text-sm font-medium text-primary">Buy more, save more!</p>
												<ul className="text-sm space-y-2 text-muted-foreground divide-y">
													<li className="flex items-center justify-between pt-2">
														<span>2-4 Bags</span>
														<Badge variant="outline" className="text-green-600 font-semibold">
															15% OFF
														</Badge>
													</li>
													<li className="flex items-center justify-between pt-2">
														<span>5-9 Bags</span>
														<Badge variant="outline" className="text-green-600 font-semibold">
															25% OFF
														</Badge>
													</li>
													<li className="flex items-center justify-between pt-2">
														<span>10-19 Bags</span>
														<Badge variant="outline" className="text-green-600 font-semibold">
															30% OFF
														</Badge>
													</li>
													<li className="flex items-center justify-between pt-2">
														<span>20-49 Bags</span>
														<Badge variant="outline" className="text-green-600 font-semibold">
															35% OFF
														</Badge>
													</li>
													<li className="flex items-center justify-between pt-2">
														<span>50+ Bags</span>
														<Badge variant="outline" className="text-green-600 font-semibold bg-green-50 dark:bg-green-950/20">
															40% OFF
														</Badge>
													</li>
												</ul>
												<p className="text-xs text-muted-foreground mt-2">✨ Bulk discounts automatically applied at checkout</p>
											</div>
										</AccordionContent>
									</AccordionItem>
								)
							);
						})()}

						{/* Expert Support */}
						<AccordionItem value="support" className="border rounded-lg bg-accent/50">
							<AccordionTrigger className="px-4 py-2 hover:no-underline">
								<div className="flex items-center">
									<Headphones className="h-5 w-5 mr-2 text-primary" />
									<span className="font-semibold">Expert Support</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<div className="space-y-3">
									<p className="text-sm font-medium text-primary">Get help from our mycology experts</p>
									<ul className="text-sm space-y-2 text-muted-foreground">
										<li className="flex items-center">
											<Check className="h-4 w-4 mr-2 text-green-500" />
											Free growing guides and resources
										</li>
										<li className="flex items-center">
											<Check className="h-4 w-4 mr-2 text-green-500" />
											24/7 email support
										</li>
										<li className="flex items-center">
											<Check className="h-4 w-4 mr-2 text-green-500" />
											Priority phone support (Mon-Fri)
										</li>
										<li className="flex items-center">
											<Check className="h-4 w-4 mr-2 text-green-500" />
											Access to private growing community
										</li>
									</ul>
									<Button variant="link" className="text-primary p-0 h-auto font-medium">
										Join our community
										<ArrowRight className="w-4 h-4 ml-1" />
									</Button>
								</div>
							</AccordionContent>
						</AccordionItem>

						{/* Social Proof */}
						<AccordionItem value="social-proof" className="border rounded-lg bg-accent/50">
							<AccordionTrigger className="px-4 py-2 hover:no-underline">
								<div className="flex items-center">
									<Users className="h-5 w-5 mr-2 text-primary" />
									<span className="font-semibold">Why Customers Love Us</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center">
											<div className="flex">
												{[1, 2, 3, 4, 5].map((star) => (
													<Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
												))}
											</div>
											<span className="ml-2 text-sm font-medium">4.9/5</span>
										</div>
										<span className="text-sm text-muted-foreground">Based on 1,500+ reviews</span>
									</div>
									<div className="space-y-3">
										<div className="bg-background/50 p-3 rounded-lg">
											<p className="text-sm italic">"Best quality I've found. Fast shipping and excellent results!"</p>
											<p className="text-xs text-muted-foreground mt-1">- John D. (Verified Buyer)</p>
										</div>
										<div className="bg-background/50 p-3 rounded-lg">
											<p className="text-sm italic">"The customer service is outstanding. They helped me every step of the way."</p>
											<p className="text-xs text-muted-foreground mt-1">- Sarah M. (Verified Buyer)</p>
										</div>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-primary font-medium">Join 10,000+ satisfied customers</span>
										<Button variant="link" className="text-primary p-0 h-auto font-medium">
											Read all reviews
											<ArrowRight className="w-4 h-4 ml-1" />
										</Button>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</CardContent>
			</Card>
		</TooltipProvider>
	);
}
