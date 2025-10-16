"use client";

import {
	ArrowRight,
	BookmarkIcon,
	Check,
	Headphones,
	Heart,
	HeartHandshake,
	Link2,
	Loader2,
	Mail,
	MessageCircle,
	Package,
	Percent,
	Share2,
	Shield,
	ShoppingCart,
	TruckIcon,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/providers/cart-provider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ShopifyProductVariant } from "@/lib/types";
import { cn, debugLog, formatPrice } from "@/lib/utils";

type ProductActionsProps = {
	selectedVariant: ShopifyProductVariant | null;
	quantity: number;
	onQuantityChange: (quantity: number) => void;
	productHandle: string;
};

export function ProductActions({ selectedVariant, quantity, onQuantityChange, productHandle }: ProductActionsProps) {
	const { addItem, cart } = useCart();
	const [isLoading, setIsLoading] = useState(false);
	const [isBuyingNow, setIsBuyingNow] = useState(false);
	const [isWishlisted, setIsWishlisted] = useState(false);
	const [showFloating, setShowFloating] = useState(false);
	const [isDismissed, setIsDismissed] = useState(false);
	const buttonRef = useRef<HTMLDivElement>(null);

	debugLog("ProductActions", "Product Handle:", productHandle);

	// Scroll detection for floating buy section - shows on any scroll
	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			const threshold = 50; // Show after scrolling 50px down

			// Show if user has scrolled past threshold and hasn't dismissed
			if (scrollY > threshold && !isDismissed) {
				setShowFloating(true);
			} else if (scrollY <= threshold) {
				// Reset dismiss state when scrolling back to top
				setShowFloating(false);
				setIsDismissed(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [isDismissed]);

	const handleDismissFloating = () => {
		setShowFloating(false);
		setIsDismissed(true);
	};

	// Check if product is in wishlist on mount
	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		debugLog("ProductActions", "Checking product handle:", productHandle);
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
			// Check if cart is available
			if (!cart?.id) {
				// Wait a moment for cart to initialize
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// If still not available, show a helpful message
				if (!cart?.id) {
					toast.error("Cart is still initializing. Please try again in a moment.");
					return;
				}
			}

			const merchandiseId = selectedVariant.id.includes("gid://shopify/ProductVariant/")
				? selectedVariant.id
				: `gid://shopify/ProductVariant/${selectedVariant.id}`;

			await addItem({
				merchandiseId,
				quantity,
			});
			// Toast message is already displayed by CartProvider
		} catch (_error) {
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

		setIsLoading(true);
		setIsBuyingNow(true);
		try {
			// Check if cart is available
			if (!cart?.id) {
				// Wait a moment for cart to initialize
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// If still not available, show a helpful message
				if (!cart?.id) {
					toast.error("Cart is still initializing. Please try again in a moment.");
					setIsBuyingNow(false);
					return;
				}
			}

			const merchandiseId = selectedVariant.id.includes("gid://shopify/ProductVariant/")
				? selectedVariant.id
				: `gid://shopify/ProductVariant/${selectedVariant.id}`;

			// Create a direct checkout URL for Shopify
			const variantId = merchandiseId.split("/").pop();
			const shopifyCheckoutUrl = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/cart/${variantId}:${quantity}`;

			// Redirect to checkout
			window.location.href = shopifyCheckoutUrl;
		} catch (_error) {
			toast.error("Failed to proceed to checkout");
		} finally {
			setIsLoading(false);
			setIsBuyingNow(false);
		}
	};

	const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement> | string) => {
		const value = typeof event === "string" ? event : event.target.value;

		// Allow empty input for better UX while typing
		if (value === "") {
			onQuantityChange(1);
			return;
		}

		const numValue = Number.parseInt(value, 10);

		// Validate the input
		if (Number.isNaN(numValue) || numValue < 1) {
			return;
		}

		// Optional: Limit to available quantity if you want to prevent overordering
		const maxQuantity = selectedVariant?.quantityAvailable || 9999;
		const finalQuantity = Math.min(numValue, maxQuantity);

		onQuantityChange(finalQuantity);
	};

	const _formatDeliveryDate = () => {
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
		if (typeof window === "undefined") {
			return;
		}

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
		const productTitle = selectedVariant?.title || productHandle;

		switch (platform) {
			case "copy":
				await navigator.clipboard.writeText(productUrl);
				toast.success("Link copied to clipboard");
				break;
			case "facebook":
				window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, "_blank");
				break;
			case "twitter":
				window.open(
					`https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(
						productTitle
					)}`,
					"_blank"
				);
				break;
			case "pinterest":
				window.open(
					`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
						productUrl
					)}&description=${encodeURIComponent(productTitle)}`,
					"_blank"
				);
				break;
			case "whatsapp":
				window.open(`https://wa.me/?text=${encodeURIComponent(`${productTitle} ${productUrl}`)}`, "_blank");
				break;
			case "email":
				window.open(
					`mailto:?subject=${encodeURIComponent(productTitle)}&body=${encodeURIComponent(productUrl)}`,
					"_blank"
				);
				break;
		}
	};

	// Add a helper function to format the quantity display
	const formatQuantityAvailable = (variant: {
		quantityAvailable?: number;
		title?: string;
		availableForSale?: boolean;
	}) => {
		const quantity = variant.quantityAvailable ?? 0;

		// Removed console.log for performance

		// Only show as backorder if quantity is 0 AND product is NOT available for sale
		if (quantity === 0 && !variant.availableForSale) {
			return "Backorder";
		}
		if (quantity === 0 && variant.availableForSale) {
			// If quantity is 0 but product is available for sale, it means inventory tracking is disabled in Shopify
			return "In Stock";
		}
		if (quantity === 1) {
			return "Last One";
		}
		if (quantity <= 5) {
			return `Last ${quantity} In Stock`;
		}
		if (quantity <= 10) {
			return `${quantity} available`;
		}
		if (quantity <= 20) {
			return "10+";
		}
		if (quantity <= 50) {
			return "20+";
		}
		if (quantity <= 100) {
			return "50+";
		}
		if (quantity <= 500) {
			return "100+";
		}
		if (quantity <= 1000) {
			return "500+";
		}
		return "1000+";
	};

	if (!selectedVariant) {
		return (
			<Card className="mx-auto w-full rounded-lg border border-foreground/15 shadow-none">
				<CardContent className="p-6">
					<div className="text-center text-muted-foreground">
						<p>Please select product options</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<TooltipProvider>
			{/* Premium Floating Purchase Bar */}
			<div
				className={cn(
					"fixed top-[var(--header-height)] right-0 left-0 z-50 h-[52px] border-border border-b bg-background/95 backdrop-blur-md transition-all duration-200",
					showFloating && !isDismissed ? "translate-y-0 opacity-100" : "-translate-y-full pointer-events-none opacity-0"
				)}
			>
				<div className="container mx-auto flex h-full items-center gap-2 px-4 sm:gap-4">
					{/* Close Button */}
					<Button className="h-8 w-8 flex-shrink-0" onClick={handleDismissFloating} size="icon" variant="ghost">
						<X className="h-4 w-4" />
						<span className="sr-only">Close</span>
					</Button>

					{/* Price & Stock Info */}
					<div className="flex flex-1 items-center gap-3">
						<div className="font-bold text-primary text-xl">
							{Number.parseFloat(selectedVariant?.price?.amount || "0") === 0
								? "Free"
								: formatPrice(Number.parseFloat(selectedVariant?.price?.amount || "0"))}
						</div>
						{selectedVariant.quantityAvailable === 0 && selectedVariant.availableForSale === false ? (
							<Badge
								className="h-5 bg-orange-100 px-2 py-0 text-orange-700 hover:bg-orange-100 hover:text-orange-700"
								variant="secondary"
							>
								Backorder
							</Badge>
						) : selectedVariant.quantityAvailable <= 3 && selectedVariant.quantityAvailable > 0 ? (
							<Badge
								className="h-5 bg-red-100 px-2 py-0 text-red-700 hover:bg-red-100 hover:text-red-700"
								variant="secondary"
							>
								Low Stock
							</Badge>
						) : (
							<Badge
								className="h-5 bg-green-100 px-2 py-0 text-green-700 hover:bg-green-100 hover:text-green-700"
								variant="secondary"
							>
								In Stock
							</Badge>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
						<Button
							className="h-9 px-3 sm:px-4"
							disabled={isLoading}
							onClick={handleAddToCart}
							size="sm"
							variant="outline"
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<>
									<ShoppingCart className="h-4 w-4 sm:mr-1.5" />
									<span className="hidden sm:inline">
										{Number.parseFloat(selectedVariant?.price?.amount || "0") === 0 ? "Claim Free" : "Add"}
									</span>
								</>
							)}
						</Button>
						{Number.parseFloat(selectedVariant?.price?.amount || "0") > 0 && (
							<Button className="h-9 px-3 sm:px-4" disabled={isBuyingNow} onClick={handleBuyNow} size="sm">
								{isBuyingNow ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<>
										<span className="hidden sm:inline">Buy Now</span>
										<span className="sm:hidden">Buy</span>
										<ArrowRight className="ml-1 h-4 w-4 sm:ml-1.5" />
									</>
								)}
							</Button>
						)}
					</div>
				</div>
			</div>

			<Card className="mx-auto w-full rounded-lg border border-foreground/15 shadow-none">
				<CardContent className="space-y-6 p-6">
					{/* Price and Stock Status */}
					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="font-bold text-3xl text-primary">
									{Number.parseFloat(selectedVariant?.price?.amount || "0") === 0
										? "Free"
										: formatPrice(Number.parseFloat(selectedVariant?.price?.amount || "0"))}
								</div>
								{selectedVariant?.compareAtPrice &&
									Number.parseFloat(selectedVariant.compareAtPrice.amount) >
										Number.parseFloat(selectedVariant.price.amount) && (
										<>
											<div className="text-muted-foreground text-xl line-through">
												{formatPrice(Number.parseFloat(selectedVariant.compareAtPrice.amount))}
											</div>
											<Badge className="font-semibold text-xs" variant="destructive">
												{Math.round(
													((Number.parseFloat(selectedVariant.compareAtPrice.amount) -
														Number.parseFloat(selectedVariant.price.amount)) /
														Number.parseFloat(selectedVariant.compareAtPrice.amount)) *
														100
												)}
												% OFF
											</Badge>
										</>
									)}
							</div>
						</div>
						{/* Stock and Shipping Info */}
						<div className="space-y-2">
							{/* Stock Status */}
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<h3 className="font-medium text-base">Stock Status</h3>
									{selectedVariant.quantityAvailable === 0 && selectedVariant.availableForSale === false ? (
										<Badge
											className="ml-2 h-5 bg-orange-100 px-2 py-0 text-orange-700 hover:bg-orange-100 hover:text-orange-700"
											variant="secondary"
										>
											Backorder
										</Badge>
									) : selectedVariant.quantityAvailable <= 3 && selectedVariant.quantityAvailable > 0 ? (
										<Badge
											className="ml-2 h-5 bg-red-100 px-2 py-0 text-red-700 hover:bg-red-100 hover:text-red-700"
											variant="secondary"
										>
											Low Stock
										</Badge>
									) : (
										<Badge
											className="ml-2 h-5 bg-green-100 px-2 py-0 text-green-700 hover:bg-green-100 hover:text-green-700"
											variant="secondary"
										>
											In Stock
										</Badge>
									)}
								</div>
								<span className="text-muted-foreground text-sm">{formatQuantityAvailable(selectedVariant)}</span>
							</div>

							{/* Shipping Info - Adjusted for backordered items */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1.5 text-primary">
									<span className="font-medium text-sm">
										{Number.parseFloat(selectedVariant?.price?.amount || "0") === 0 ? "FREE Product" : "FREE Shipping"}
									</span>
								</div>
								<span className="text-muted-foreground text-xs">
									{selectedVariant.quantityAvailable <= 0 && !selectedVariant.availableForSale
										? "Ships within 1-2 weeks"
										: "Delivery in 3-8 business days"}
								</span>
							</div>

							{/* Additional Info */}
							<div className="text-muted-foreground text-xs">
								{selectedVariant.quantityAvailable <= 0 && !selectedVariant.availableForSale ? (
									<p>Backordered items are prioritized for restocking</p>
								) : (
									<p>Orders placed before 2 PM EST ship same day</p>
								)}
							</div>
						</div>
					</div>

					{/* Updated Quantity Selector */}
					<div className="space-y-2">
						<Label className="font-medium text-sm" htmlFor="quantity">
							Quantity
						</Label>
						<div className="flex items-center space-x-2">
							<Input
								className="w-32 sm:w-24"
								id="quantity"
								max={selectedVariant.quantityAvailable || 9999}
								min="1"
								onChange={handleQuantityChange}
								type="number"
								value={quantity}
							/>
							{selectedVariant.quantityAvailable > 0 && (
								<span className="text-muted-foreground text-sm">Max: {selectedVariant.quantityAvailable}</span>
							)}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="space-y-3" ref={buttonRef}>
						<Button className="w-full" disabled={isLoading} onClick={handleAddToCart} size="lg" variant="outline">
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Adding...
								</>
							) : (
								<>
									<ShoppingCart className="mr-2 h-4 w-4" />
									{Number.parseFloat(selectedVariant?.price?.amount || "0") === 0 ? "Claim Free Item" : "Add to Cart"}
								</>
							)}
						</Button>
						{Number.parseFloat(selectedVariant?.price?.amount || "0") > 0 && (
							<Button className="w-full" disabled={isBuyingNow} onClick={handleBuyNow} size="lg">
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
						)}

						{/* Wishlist and Share Buttons */}
						<div className="mt-4 flex gap-2">
							<Button
								className={cn("flex-1", isWishlisted && "border-primary bg-primary/5 text-primary hover:bg-primary/10")}
								onClick={handleWishlist}
								variant="outline"
							>
								<Heart className={cn("mr-2 h-4 w-4", isWishlisted && "fill-primary")} />
								{isWishlisted ? "Saved" : "Save for Later"}
							</Button>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button className="flex-1" variant="outline">
										<Share2 className="mr-2 h-4 w-4" />
										Share
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuItem className="cursor-pointer" onClick={() => handleShare("copy")}>
										<Link2 className="mr-2 h-4 w-4" />
										Copy Link
									</DropdownMenuItem>
									<DropdownMenuItem className="cursor-pointer" onClick={() => handleShare("facebook")}>
										<BookmarkIcon className="mr-2 h-4 w-4" />
										Facebook
									</DropdownMenuItem>
									<DropdownMenuItem className="cursor-pointer" onClick={() => handleShare("twitter")}>
										<MessageCircle className="mr-2 h-4 w-4" />
										Twitter
									</DropdownMenuItem>
									<DropdownMenuItem className="cursor-pointer" onClick={() => handleShare("email")}>
										<Mail className="mr-2 h-4 w-4" />
										Email
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					{/* Collapsible Information Sections */}
					<Accordion className="w-full space-y-0 divide-y divide-border/50" type="single">
						{/* Secure Transaction */}
						<AccordionItem className="border-0" value="secure-transaction">
							<AccordionTrigger className="py-2.5 hover:no-underline">
								<div className="flex items-center gap-2.5">
									<div className="flex h-7 w-7 items-center justify-center rounded bg-primary/5">
										<Shield className="h-3.5 w-3.5 text-primary" />
									</div>
									<span className="text-sm">Secure Transaction</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="pt-0 pb-2.5">
								<div className="ml-9.5 space-y-1.5">
									<div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
										<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
											<Check className="h-3 w-3 flex-shrink-0 text-primary" />
											<span>SSL Encrypted</span>
										</div>
										<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
											<Check className="h-3 w-3 flex-shrink-0 text-primary" />
											<span>PCI Compliant</span>
										</div>
										<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
											<Check className="h-3 w-3 flex-shrink-0 text-primary" />
											<span>30-Day Returns</span>
										</div>
										<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
											<Check className="h-3 w-3 flex-shrink-0 text-primary" />
											<span>Buyer Protection</span>
										</div>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>

						{/* Shipping Information */}
						<AccordionItem className="border-0" value="shipping">
							<AccordionTrigger className="py-2.5 hover:no-underline">
								<div className="flex items-center gap-2.5">
									<div className="flex h-7 w-7 items-center justify-center rounded bg-primary/5">
										<TruckIcon className="h-3.5 w-3.5 text-primary" />
									</div>
									<span className="text-sm">Shipping Information</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="pt-0 pb-2.5">
								<div className="ml-9.5 space-y-1.5">
									<div className="flex flex-wrap items-center gap-1.5">
										<Badge
											className="h-5 border-green-600/20 bg-green-50 text-green-700 text-xs dark:bg-green-950/30 dark:text-green-400"
											variant="outline"
										>
											Free Shipping
										</Badge>
										<Badge className="h-5 text-xs" variant="secondary">
											Ships from USA
										</Badge>
									</div>
									<ul className="space-y-1.5">
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>Order before 2 PM EST for same-day shipping</span>
										</li>
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>Express shipping available at checkout</span>
										</li>
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>Real-time tracking provided</span>
										</li>
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>Insurance included on all orders</span>
										</li>
									</ul>
								</div>
							</AccordionContent>
						</AccordionItem>

						{/* Discreet Packaging */}
						<AccordionItem className="border-0" value="packaging">
							<AccordionTrigger className="py-2.5 hover:no-underline">
								<div className="flex items-center gap-2.5">
									<div className="flex h-7 w-7 items-center justify-center rounded bg-primary/5">
										<Package className="h-3.5 w-3.5 text-primary" />
									</div>
									<span className="text-sm">Discreet Packaging</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="pt-0 pb-2.5">
								<div className="ml-9.5 space-y-1.5">
									<ul className="space-y-1.5">
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>Plain, unmarked outer box</span>
										</li>
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>No visible product names or logos</span>
										</li>
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>Secure, tamper-evident seal</span>
										</li>
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>Neutral shipping label</span>
										</li>
									</ul>
									<p className="text-muted-foreground text-xs">
										We prioritize your privacy. Our discreet packaging ensures your purchase remains confidential.
									</p>
								</div>
							</AccordionContent>
						</AccordionItem>

						{/* Customer Satisfaction Guarantee */}
						<AccordionItem className="border-0" value="guarantee">
							<AccordionTrigger className="py-2.5 hover:no-underline">
								<div className="flex items-center gap-2.5">
									<div className="flex h-7 w-7 items-center justify-center rounded bg-primary/5">
										<HeartHandshake className="h-3.5 w-3.5 text-primary" />
									</div>
									<span className="text-sm">100% Satisfaction Guarantee</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="pt-0 pb-2.5">
								<div className="ml-9.5">
									<ul className="space-y-1.5">
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>30-day money-back guarantee</span>
										</li>
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>Free replacements for any quality issues</span>
										</li>
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>No questions asked returns</span>
										</li>
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>Lifetime support for your growing journey</span>
										</li>
									</ul>
								</div>
							</AccordionContent>
						</AccordionItem>

						{/* Bulk Discounts */}
						{(() => {
							debugLog("ProductActions", "Checking product handle:", productHandle);
							return (
								productHandle === "all-in-one-mushroom-grow-bags-1-pack" && (
									<AccordionItem className="border-0" value="discounts">
										<AccordionTrigger className="py-2.5 hover:no-underline">
											<div className="flex items-center gap-2.5">
												<div className="flex h-7 w-7 items-center justify-center rounded bg-primary/5">
													<Percent className="h-3.5 w-3.5 text-primary" />
												</div>
												<div className="flex flex-1 items-center gap-2">
													<span className="text-sm">Volume Discounts</span>
													<Badge
														className="h-5 border-green-600/20 bg-green-50 text-green-700 text-xs dark:bg-green-950/30 dark:text-green-400"
														variant="outline"
													>
														Save up to 40%
													</Badge>
												</div>
											</div>
										</AccordionTrigger>
										<AccordionContent className="pt-0 pb-2.5">
											<div className="ml-9.5 space-y-1.5">
												<ul className="space-y-1.5">
													<li className="flex items-center justify-between text-xs">
														<span className="text-muted-foreground">2-4 Bags</span>
														<span className="font-medium text-green-600">15% OFF</span>
													</li>
													<li className="flex items-center justify-between text-xs">
														<span className="text-muted-foreground">5-9 Bags</span>
														<span className="font-medium text-green-600">25% OFF</span>
													</li>
													<li className="flex items-center justify-between text-xs">
														<span className="text-muted-foreground">10-19 Bags</span>
														<span className="font-medium text-green-600">30% OFF</span>
													</li>
													<li className="flex items-center justify-between text-xs">
														<span className="text-muted-foreground">20-49 Bags</span>
														<span className="font-medium text-green-600">35% OFF</span>
													</li>
													<li className="flex items-center justify-between text-xs">
														<span className="text-muted-foreground">50+ Bags</span>
														<span className="font-medium text-green-600">40% OFF</span>
													</li>
												</ul>
												<p className="text-muted-foreground text-xs">Discounts automatically applied at checkout</p>
											</div>
										</AccordionContent>
									</AccordionItem>
								)
							);
						})()}

						{/* Expert Support */}
						<AccordionItem className="border-0" value="support">
							<AccordionTrigger className="py-2.5 hover:no-underline">
								<div className="flex items-center gap-2.5">
									<div className="flex h-7 w-7 items-center justify-center rounded bg-primary/5">
										<Headphones className="h-3.5 w-3.5 text-primary" />
									</div>
									<span className="text-sm">Expert Support</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="pt-0 pb-2.5">
								<div className="ml-9.5 space-y-1.5">
									<ul className="space-y-1.5">
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>Free growing guides and resources</span>
										</li>
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>24/7 email support</span>
										</li>
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>Priority phone support (Mon-Fri)</span>
										</li>
										<li className="flex items-start gap-1.5 text-muted-foreground text-xs">
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
											<span>Access to private growing community</span>
										</li>
									</ul>
									<Button className="mt-2 h-auto p-0 text-primary text-xs" variant="link">
										Join our community
										<ArrowRight className="ml-1 h-3 w-3" />
									</Button>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</CardContent>
			</Card>
		</TooltipProvider>
	);
}
