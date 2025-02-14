"use client";

import { useState } from "react";
import { ShopifyProductVariant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/providers/cart-provider";
import { Loader2, ShoppingCart, Package, ArrowRight, Shield, TruckIcon, Gift, Star, Info, Check } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

interface ProductActionsProps {
	selectedVariant: ShopifyProductVariant;
	quantity: number;
	onQuantityChange: (quantity: number) => void;
}

export function ProductActions({ selectedVariant, quantity, onQuantityChange }: ProductActionsProps) {
	const { addItem, createNewCart } = useCart();
	const [isLoading, setIsLoading] = useState(false);
	const [isBuyingNow, setIsBuyingNow] = useState(false);

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
			<Card className="w-full mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
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

					{/* Shipping Info */}
					<div className="space-y-3 text-sm">
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center text-green-600 cursor-help">
									<TruckIcon className="h-4 w-4 mr-2" />
									<span className="font-medium">Free shipping on orders over $50</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Enjoy free shipping when your order total exceeds $50</p>
							</TooltipContent>
						</Tooltip>
						<div className="flex items-center text-muted-foreground">
							<Package className="h-4 w-4 mr-2" />
							<span>Estimated delivery: 3-5 business days</span>
						</div>
					</div>

					<Separator className="my-4" />

					{/* Discreet Packaging */}
					<div className="bg-accent/50 p-4 rounded-lg border border-accent-foreground/10">
						<h3 className="text-lg font-semibold mb-2 flex items-center">
							<Package className="h-5 w-5 mr-2 text-primary" />
							Discreet Packaging
						</h3>
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
					</div>

					{/* Secure Transaction */}
					<div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-accent-foreground/10">
						<h3 className="text-lg font-semibold mb-2 flex items-center">
							<Shield className="h-5 w-5 mr-2 text-green-600" />
							Secure Transaction
						</h3>
						<ul className="space-y-2 text-sm">
							<li className="flex items-center">
								<Info className="h-4 w-4 mr-2 text-blue-500" />
								<span>SSL Encrypted Checkout</span>
							</li>
							<li className="flex items-center">
								<Info className="h-4 w-4 mr-2 text-blue-500" />
								<span>PCI DSS Compliant</span>
							</li>
							<Tooltip>
								<TooltipTrigger asChild>
									<li className="flex items-center cursor-help">
										<TruckIcon className="h-4 w-4 mr-2 text-blue-500" />
										<span>
											<span className="font-medium">30-Day Returns:</span> Hassle-free refunds or replacements
										</span>
									</li>
								</TooltipTrigger>
								<TooltipContent>
									<p>You can return the item within 30 days of receipt for a full refund or replacement</p>
								</TooltipContent>
							</Tooltip>
						</ul>
					</div>
				</CardContent>
			</Card>
		</TooltipProvider>
	);
}
