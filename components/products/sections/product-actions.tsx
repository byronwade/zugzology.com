"use client";

import { useState, useEffect } from "react";
import { ShopifyProductVariant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/providers/cart-provider";
import { Loader2, ShoppingCart, Package, ArrowRight, Shield, TruckIcon, Star, Info, Check, HeartHandshake, Users, Headphones, Percent, Heart, Share2, Link2, Mail, MessageCircle, BookmarkIcon } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { createCart, addToCart } from "@/lib/actions/shopify";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ProductActionsProps {
	selectedVariant: ShopifyProductVariant | null;
	quantity: number;
	onQuantityChange: (quantity: number) => void;
	productHandle: string;
}

export function ProductActions({ selectedVariant, quantity, onQuantityChange, productHandle }: ProductActionsProps) {
	const { addItem } = useCart();
	const [isLoading, setIsLoading] = useState(false);
	const [isBuyingNow, setIsBuyingNow] = useState(false);
	const [isWishlisted, setIsWishlisted] = useState(false);

	console.log("Product Handle:", productHandle);

	// If no variant is selected, show a message
	if (!selectedVariant) {
		return (
			<Card className="rounded-lg border border-foreground/15 shadow-none w-full mx-auto">
				<CardContent className="p-6">
					<div className="text-center text-muted-foreground">
						<p>Please select product options</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Check if product is in wishlist on mount
	useEffect(() => {
		const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
		setIsWishlisted(wishlist.includes(productHandle));
	}, [productHandle]);

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
			// Create a new cart
			const cart = await createCart();
			if (!cart?.id) {
				throw new Error("Failed to create cart");
			}

			// Add the item to the cart
			const merchandiseId = selectedVariant.id.includes("gid://shopify/ProductVariant/") ? selectedVariant.id : `gid://shopify/ProductVariant/${selectedVariant.id}`;
			const updatedCart = await addToCart(cart.id, [
				{
					merchandiseId,
					quantity,
				},
			]);

			if (!updatedCart?.checkoutUrl) {
				throw new Error("Failed to get checkout URL");
			}

			// Redirect to checkout
			window.location.href = updatedCart.checkoutUrl;
		} catch (error) {
			console.error("Error in handleBuyNow:", error);
			toast.error("Failed to proceed to checkout");
		}
		setIsBuyingNow(false);
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

	const formatDeliveryDate = () => {
		const today = new Date();
		// Add 3-5 business days for standard shipping
		const deliveryDate = new Date(today);
		deliveryDate.setDate(today.getDate() + 5); // Using max delivery time for conservative estimate

		return deliveryDate.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
		});
	};

	const handleWishlist = () => {
		const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
		let newWishlist;

		if (isWishlisted) {
			newWishlist = wishlist.filter((item: string) => item !== productHandle);
			toast.success("Removed from wishlist");
		} else {
			newWishlist = [...wishlist, productHandle];
			toast.success("Added to wishlist");
		}

		localStorage.setItem("wishlist", JSON.stringify(newWishlist));
		setIsWishlisted(!isWishlisted);
	};

	const handleShare = async (platform: string) => {
		const productUrl = `https://zugzology.com/products/${productHandle}`;
		const productTitle = selectedVariant.title;

		switch (platform) {
			case "copy":
				await navigator.clipboard.writeText(productUrl);
				toast.success("Link copied to clipboard");
				break;
			case "facebook":
				window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, "_blank");
				break;
			case "twitter":
				window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(productTitle)}`, "_blank");
				break;
			case "pinterest":
				window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&description=${encodeURIComponent(productTitle)}`, "_blank");
				break;
			case "whatsapp":
				window.open(`https://wa.me/?text=${encodeURIComponent(productTitle + " " + productUrl)}`, "_blank");
				break;
			case "email":
				window.open(`mailto:?subject=${encodeURIComponent(productTitle)}&body=${encodeURIComponent(productUrl)}`, "_blank");
				break;
		}
	};

	return (
		<TooltipProvider>
			<Card className="rounded-lg border border-foreground/15 shadow-none w-full mx-auto">
				<CardContent className="p-6 space-y-6">
					{/* Price and Stock Status */}
					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="text-3xl font-bold text-primary">{formatPrice(parseFloat(selectedVariant?.price?.amount || "0"))}</div>
								{selectedVariant?.compareAtPrice && parseFloat(selectedVariant.compareAtPrice.amount) > parseFloat(selectedVariant.price.amount) && (
									<>
										<div className="text-xl text-muted-foreground line-through">{formatPrice(parseFloat(selectedVariant.compareAtPrice.amount))}</div>
										<Badge variant="destructive" className="text-xs font-semibold">
											{Math.round(((parseFloat(selectedVariant.compareAtPrice.amount) - parseFloat(selectedVariant.price.amount)) / parseFloat(selectedVariant.compareAtPrice.amount)) * 100)}% OFF
										</Badge>
									</>
								)}
							</div>
						</div>
						{/* Stock and Shipping Info */}
						<div className="space-y-2">
							{/* Stock Status */}
							<div className="flex items-center justify-between">
								<div className={cn("flex items-center gap-1.5", selectedVariant.availableForSale ? "text-green-600" : "text-red-600")}>
									<span className="text-sm font-medium">{selectedVariant.availableForSale ? "In Stock" : "Out of Stock"}</span>
								</div>
								{selectedVariant.availableForSale && selectedVariant.quantityAvailable > 0 && selectedVariant.quantityAvailable <= 10 && <span className="text-xs text-muted-foreground">{selectedVariant.quantityAvailable > 10 ? "10+" : selectedVariant.quantityAvailable} left</span>}
							</div>

							{/* Shipping Info */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1.5 text-primary">
									<span className="text-sm">FREE Shipping</span>
								</div>
								<span className="text-xs text-muted-foreground">Delivery by {formatDeliveryDate()}</span>
							</div>

							{/* Additional Info */}
							<p className="text-xs text-muted-foreground">Orders placed before 2 PM EST ship same day</p>
						</div>
					</div>

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
						<Button variant="secondary" onClick={handleAddToCart} disabled={isLoading} className="w-full bg-secondary hover:bg-secondary/80 text-foreground border border-foreground/10 hover:border-foreground/20 shadow-none">
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
						<Button variant="default" onClick={handleBuyNow} disabled={isBuyingNow} className="w-full">
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

						{/* Wishlist and Share Buttons */}
						<div className="flex gap-2 mt-4">
							<Button variant="outline" onClick={handleWishlist} className={cn("flex-1", isWishlisted && "bg-primary/5 border-primary text-primary")}>
								<Heart className={cn("mr-2 h-4 w-4", isWishlisted && "fill-primary")} />
								{isWishlisted ? "Saved" : "Save for Later"}
							</Button>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="flex-1">
										<Share2 className="mr-2 h-4 w-4" />
										Share
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuItem onClick={() => handleShare("copy")} className="cursor-pointer">
										<Link2 className="mr-2 h-4 w-4" />
										Copy Link
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleShare("facebook")} className="cursor-pointer">
										<BookmarkIcon className="mr-2 h-4 w-4" />
										Facebook
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleShare("twitter")} className="cursor-pointer">
										<MessageCircle className="mr-2 h-4 w-4" />
										Twitter
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleShare("email")} className="cursor-pointer">
										<Mail className="mr-2 h-4 w-4" />
										Email
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
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
										<Badge variant="secondary" className="ml-2 text-xs">
											Ships from USA
										</Badge>
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
						{/* <AccordionItem value="social-proof" className="border rounded-lg bg-accent/50">
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
						</AccordionItem> */}
					</Accordion>
				</CardContent>
			</Card>
		</TooltipProvider>
	);
}
