"use client";

import {
	ArrowRight,
	BookmarkIcon,
	Check,
	Headphones,
	Heart,
	HeartHandshake,
	Info,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
		if (typeof window === 'undefined') return;

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
		if (typeof window === 'undefined') return;

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
					"fixed top-[100px] left-0 right-0 z-50 h-[60px] border-border border-b bg-background/95 backdrop-blur-md transition-all duration-200",
					showFloating && !isDismissed ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
				)}
			>
				<div className="container mx-auto flex h-full items-center gap-4 px-4">
					{/* Close Button */}
					<Button
						className="h-8 w-8 flex-shrink-0"
						onClick={handleDismissFloating}
						size="icon"
						variant="ghost"
					>
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
							<Badge className="h-5 bg-orange-100 px-2 py-0 text-orange-700 hover:bg-orange-100 hover:text-orange-700" variant="secondary">
								Backorder
							</Badge>
						) : selectedVariant.quantityAvailable <= 3 && selectedVariant.quantityAvailable > 0 ? (
							<Badge className="h-5 bg-red-100 px-2 py-0 text-red-700 hover:bg-red-100 hover:text-red-700" variant="secondary">
								Low Stock
							</Badge>
						) : (
							<Badge className="h-5 bg-green-100 px-2 py-0 text-green-700 hover:bg-green-100 hover:text-green-700" variant="secondary">
								In Stock
							</Badge>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex flex-shrink-0 items-center gap-2">
						<Button
							className={
								Number.parseFloat(selectedVariant?.price?.amount || "0") === 0
									? "bg-primary text-foreground hover:bg-primary/90 dark:text-background dark:hover:bg-primary/80"
									: "bg-foreground text-background hover:bg-foreground/90 dark:bg-background dark:text-foreground dark:border dark:border-border dark:hover:bg-accent"
							}
							disabled={isLoading}
							onClick={handleAddToCart}
							size="sm"
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<>
									<ShoppingCart className="mr-1.5 h-4 w-4" />
									<span className="hidden sm:inline">
										{Number.parseFloat(selectedVariant?.price?.amount || "0") === 0 ? "Claim Free" : "Add"}
									</span>
								</>
							)}
						</Button>
						{Number.parseFloat(selectedVariant?.price?.amount || "0") > 0 && (
							<Button
								className="bg-primary text-foreground hover:bg-primary/90 dark:text-background dark:hover:bg-primary/80"
								disabled={isBuyingNow}
								onClick={handleBuyNow}
								size="sm"
							>
								{isBuyingNow ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<>
										Buy Now
										<ArrowRight className="ml-1.5 h-4 w-4" />
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
								className="w-24"
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
						<Button
							className={
								Number.parseFloat(selectedVariant?.price?.amount || "0") === 0
									? "w-full bg-primary text-foreground hover:bg-primary/90 dark:text-background dark:hover:bg-primary/80"
									: "w-full bg-foreground text-background hover:bg-foreground/90 dark:bg-background dark:text-foreground dark:border dark:border-border dark:hover:bg-accent"
							}
							disabled={isLoading}
							onClick={handleAddToCart}
							variant="secondary"
						>
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
							<Button
								className="w-full bg-primary text-foreground hover:bg-primary/90 dark:text-background dark:hover:bg-primary/80"
								disabled={isBuyingNow}
								onClick={handleBuyNow}
								variant="default"
							>
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
								className={cn("flex-1", isWishlisted && "border-primary bg-primary/5 text-primary")}
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

					{/* Trust Badges */}
					<div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
						<div className="mb-3 text-center font-semibold text-foreground text-sm">Why Shop With Us</div>
						<div className="grid grid-cols-1 gap-2.5">
							<div className="flex items-center gap-3 rounded-md bg-background p-2.5 transition-colors hover:bg-accent">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
									<Shield className="h-4 w-4 text-primary" />
								</div>
								<div className="flex-1">
									<div className="font-medium text-foreground text-xs">Secure Checkout</div>
									<div className="text-muted-foreground text-xs">SSL encrypted payment</div>
								</div>
							</div>
							<div className="flex items-center gap-3 rounded-md bg-background p-2.5 transition-colors hover:bg-accent">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
									<TruckIcon className="h-4 w-4 text-primary" />
								</div>
								<div className="flex-1">
									<div className="font-medium text-foreground text-xs">Fast Shipping</div>
									<div className="text-muted-foreground text-xs">Free 3-8 day delivery</div>
								</div>
							</div>
							<div className="flex items-center gap-3 rounded-md bg-background p-2.5 transition-colors hover:bg-accent">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
									<HeartHandshake className="h-4 w-4 text-primary" />
								</div>
								<div className="flex-1">
									<div className="font-medium text-foreground text-xs">Satisfaction Guaranteed</div>
									<div className="text-muted-foreground text-xs">30-day money back</div>
								</div>
							</div>
							<div className="flex items-center gap-3 rounded-md bg-background p-2.5 transition-colors hover:bg-accent">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
									<Headphones className="h-4 w-4 text-primary" />
								</div>
								<div className="flex-1">
									<div className="font-medium text-foreground text-xs">24/7 Support</div>
									<div className="text-muted-foreground text-xs">Expert help anytime</div>
								</div>
							</div>
						</div>
					</div>

					{/* Collapsible Information Sections */}
					<Accordion className="w-full space-y-2" type="single">
						{/* Secure Transaction */}
						<AccordionItem
							className="rounded-lg border bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 transition-all hover:shadow-sm"
							value="secure-transaction"
						>
							<AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-transparent">
								<div className="flex items-center">
									<Shield className="mr-2 h-5 w-5 text-primary" />
									<span className="font-semibold">Secure Transaction</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div className="flex items-center">
										<Info className="mr-2 h-4 w-4 text-blue-500" />
										<span>SSL Encrypted</span>
									</div>
									<div className="flex items-center">
										<Info className="mr-2 h-4 w-4 text-blue-500" />
										<span>PCI Compliant</span>
									</div>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex cursor-help items-center">
												<TruckIcon className="mr-2 h-4 w-4 text-blue-500" />
												<span className="font-medium">30-Day Returns</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p>You can return the item within 30 days of receipt for a full refund or replacement</p>
										</TooltipContent>
									</Tooltip>
									<div className="flex items-center">
										<Shield className="mr-2 h-4 w-4 text-blue-500" />
										<span>Buyer Protection</span>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>

						{/* Shipping Information */}
						<AccordionItem className="rounded-lg border bg-accent/50 transition-all hover:shadow-sm hover:bg-accent/60" value="shipping">
							<AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-transparent">
								<div className="flex items-center">
									<TruckIcon className="mr-2 h-5 w-5 text-primary" />
									<span className="font-semibold">Shipping Information</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<div className="space-y-2.5">
									<div className="flex items-center text-green-600">
										<span className="font-medium">Free Shipping</span>
										<Badge className="ml-2 text-xs" variant="secondary">
											Ships from USA
										</Badge>
									</div>
									<div className="flex items-center text-muted-foreground">
										<Package className="mr-2 h-4 w-4" />
										<span>Estimated delivery: 3-5 business days</span>
									</div>
									<ul className="space-y-1.5 text-muted-foreground text-sm">
										<li className="flex items-center">
											<Check className="mr-2 h-4 w-4 text-green-500" />
											Order before 2 PM EST for same-day shipping
										</li>
										<li className="flex items-center">
											<Check className="mr-2 h-4 w-4 text-green-500" />
											Express shipping available at checkout
										</li>
										<li className="flex items-center">
											<Check className="mr-2 h-4 w-4 text-green-500" />
											Real-time tracking provided
										</li>
										<li className="flex items-center">
											<Check className="mr-2 h-4 w-4 text-green-500" />
											Insurance included on all orders
										</li>
									</ul>
								</div>
							</AccordionContent>
						</AccordionItem>

						{/* Discreet Packaging */}
						<AccordionItem className="rounded-lg border bg-accent/50 transition-all hover:shadow-sm hover:bg-accent/60" value="packaging">
							<AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-transparent">
								<div className="flex items-center">
									<Package className="mr-2 h-5 w-5 text-primary" />
									<span className="font-semibold">Discreet Packaging</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<ul className="space-y-2 text-sm">
									<li className="flex items-center">
										<Check className="mr-2 h-4 w-4 text-green-500" />
										<span>Plain, unmarked outer box</span>
									</li>
									<li className="flex items-center">
										<Check className="mr-2 h-4 w-4 text-green-500" />
										<span>No visible product names or logos</span>
									</li>
									<li className="flex items-center">
										<Check className="mr-2 h-4 w-4 text-green-500" />
										<span>Secure, tamper-evident seal</span>
									</li>
									<li className="flex items-center">
										<Check className="mr-2 h-4 w-4 text-green-500" />
										<span>Neutral shipping label</span>
									</li>
								</ul>
								<p className="mt-2 text-muted-foreground text-sm">
									We prioritize your privacy. Our discreet packaging ensures your purchase remains confidential from
									shipment to delivery.
								</p>
							</AccordionContent>
						</AccordionItem>

						{/* Customer Satisfaction Guarantee */}
						<AccordionItem className="rounded-lg border bg-accent/50 transition-all hover:shadow-sm hover:bg-accent/60" value="guarantee">
							<AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-transparent">
								<div className="flex items-center">
									<HeartHandshake className="mr-2 h-5 w-5 text-primary" />
									<span className="font-semibold">100% Satisfaction Guarantee</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<div className="space-y-3">
									<p className="font-medium text-primary text-sm">Your satisfaction is our top priority</p>
									<ul className="space-y-2 text-muted-foreground text-sm">
										<li className="flex items-center">
											<Check className="mr-2 h-4 w-4 text-green-500" />
											30-day money-back guarantee
										</li>
										<li className="flex items-center">
											<Check className="mr-2 h-4 w-4 text-green-500" />
											Free replacements for any quality issues
										</li>
										<li className="flex items-center">
											<Check className="mr-2 h-4 w-4 text-green-500" />
											No questions asked returns
										</li>
										<li className="flex items-center">
											<Check className="mr-2 h-4 w-4 text-green-500" />
											Lifetime support for your growing journey
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
									<AccordionItem className="rounded-lg border bg-accent/50 transition-all hover:shadow-sm hover:bg-accent/60" value="discounts">
										<AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-transparent">
											<div className="flex items-center">
												<Percent className="mr-2 h-5 w-5 text-primary" />
												<span className="font-semibold">Volume Discounts</span>
												<Badge
													className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
													variant="secondary"
												>
													Save up to 40%
												</Badge>
											</div>
										</AccordionTrigger>
										<AccordionContent className="px-4 pb-4">
											<div className="space-y-3">
												<p className="font-medium text-primary text-sm">Buy more, save more!</p>
												<ul className="space-y-2 divide-y text-muted-foreground text-sm">
													<li className="flex items-center justify-between pt-2">
														<span>2-4 Bags</span>
														<Badge className="font-semibold text-green-600" variant="outline">
															15% OFF
														</Badge>
													</li>
													<li className="flex items-center justify-between pt-2">
														<span>5-9 Bags</span>
														<Badge className="font-semibold text-green-600" variant="outline">
															25% OFF
														</Badge>
													</li>
													<li className="flex items-center justify-between pt-2">
														<span>10-19 Bags</span>
														<Badge className="font-semibold text-green-600" variant="outline">
															30% OFF
														</Badge>
													</li>
													<li className="flex items-center justify-between pt-2">
														<span>20-49 Bags</span>
														<Badge className="font-semibold text-green-600" variant="outline">
															35% OFF
														</Badge>
													</li>
													<li className="flex items-center justify-between pt-2">
														<span>50+ Bags</span>
														<Badge
															className="bg-green-50 font-semibold text-green-600 dark:bg-green-950/20"
															variant="outline"
														>
															40% OFF
														</Badge>
													</li>
												</ul>
												<p className="mt-2 text-muted-foreground text-xs">
													✨ Bulk discounts automatically applied at checkout
												</p>
											</div>
										</AccordionContent>
									</AccordionItem>
								)
							);
						})()}

						{/* Expert Support */}
						<AccordionItem className="rounded-lg border bg-accent/50 transition-all hover:shadow-sm hover:bg-accent/60" value="support">
							<AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-transparent">
								<div className="flex items-center">
									<Headphones className="mr-2 h-5 w-5 text-primary" />
									<span className="font-semibold">Expert Support</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<div className="space-y-3">
									<p className="font-medium text-primary text-sm">Get help from our mycology experts</p>
									<ul className="space-y-2 text-muted-foreground text-sm">
										<li className="flex items-center">
											<Check className="mr-2 h-4 w-4 text-green-500" />
											Free growing guides and resources
										</li>
										<li className="flex items-center">
											<Check className="mr-2 h-4 w-4 text-green-500" />
											24/7 email support
										</li>
										<li className="flex items-center">
											<Check className="mr-2 h-4 w-4 text-green-500" />
											Priority phone support (Mon-Fri)
										</li>
										<li className="flex items-center">
											<Check className="mr-2 h-4 w-4 text-green-500" />
											Access to private growing community
										</li>
									</ul>
									<Button className="h-auto p-0 font-medium text-primary" variant="link">
										Join our community
										<ArrowRight className="ml-1 h-4 w-4" />
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
