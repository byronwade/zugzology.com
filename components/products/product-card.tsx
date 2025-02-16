"use client";

import Image from "next/image";
import { Link } from "@/components/ui/link";
import { formatPrice, cn } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/providers/cart-provider";
import { toast } from "sonner";
import { useState } from "react";
import { createCart, addToCart } from "@/lib/actions/shopify";

interface ProductCardProps {
	product: ShopifyProduct;
	collectionHandle?: string;
	view?: "grid" | "list";
	variantId?: string;
	quantity?: number;
}

export function ProductCard({ product, collectionHandle, view = "grid", variantId, quantity = 0 }: ProductCardProps) {
	const { addItem } = useCart();
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [isBuyingNow, setIsBuyingNow] = useState(false);

	// Get the first variant and its price
	const firstVariant = product.variants?.edges?.[0]?.node;
	const price = firstVariant?.price?.amount || "0";

	// Get the first image
	const firstImage = product.images?.edges?.[0]?.node;
	const imageUrl = firstImage?.url;
	const imageAlt = firstImage?.altText || product.title;

	// Use product's availability if not explicitly provided
	const isAvailable = firstVariant?.availableForSale ?? false;

	// Determine product URL with collection and variant params if available
	const productUrl = `/products/${product.handle}${collectionHandle ? `?collection=${collectionHandle}` : ""}${variantId ? `${collectionHandle ? "&" : "?"}variant=${variantId}` : ""}`;

	const handleAddToCart = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!variantId || isAddingToCart) return;

		setIsAddingToCart(true);
		try {
			await addItem({
				merchandiseId: variantId,
				quantity: 1,
			});
			toast.success("Added to cart");
		} catch (error) {
			console.error("Error adding to cart:", error);
			toast.error("Failed to add to cart");
		} finally {
			setIsAddingToCart(false);
		}
	};

	const handleBuyNow = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!variantId || isBuyingNow) return;

		setIsBuyingNow(true);
		try {
			// Create a new cart
			const cart = await createCart();
			if (!cart?.id) {
				throw new Error("Failed to create cart");
			}

			// Add the item to the cart
			const updatedCart = await addToCart(cart.id, [
				{
					merchandiseId: variantId,
					quantity: 1,
				},
			]);

			if (!updatedCart?.checkoutUrl) {
				throw new Error("Failed to get checkout URL");
			}

			// Redirect to checkout
			window.location.href = updatedCart.checkoutUrl;
		} catch (error) {
			console.error("Error processing buy now:", error);
			toast.error("Failed to process purchase");
			setIsBuyingNow(false);
		}
	};

	if (view === "list") {
		return (
			<div className="group py-4" role="article" aria-label={product.title}>
				<div className="flex">
					<Link href={productUrl} className="relative flex-shrink-0" aria-label={`View details for ${product.title}`}>
						<div className="relative bg-neutral-100 dark:bg-neutral-800 rounded-md overflow-hidden border border-foreground/10 hover:border-foreground/20 transition-colors duration-200 w-[200px] h-[200px]">
							<div className="w-full h-full rounded-md overflow-hidden">
								{imageUrl ? (
									<Image src={imageUrl} alt={imageAlt} fill className="object-cover hover:scale-105 transition-transform duration-300 rounded-md" sizes="200px" />
								) : (
									<div className="flex h-full items-center justify-center">
										<ShoppingBag className="h-12 w-12 text-neutral-400" aria-hidden="true" />
									</div>
								)}
							</div>
						</div>
					</Link>

					<div className="flex flex-col ml-4 flex-grow">
						<Link href={productUrl} className="block" aria-label={`View details for ${product.title}`}>
							<div className="flex flex-col min-h-0">
								<h2 className="font-medium text-base line-clamp-1 group-hover:text-primary transition-colors">{product.title}</h2>
								<div className="flex-1" />
							</div>

							<div className="mt-2 flex items-center gap-2">
								<div className="flex items-center gap-2">
									<span className="text-xl font-bold">{formatPrice(parseFloat(price))}</span>
								</div>
							</div>

							{quantity > 0 && (
								<div className="mt-2 space-y-1 text-sm">
									<div className="flex flex-col gap-1">
										<p className="text-green-600 dark:text-green-500 font-medium">{quantity} in stock</p>
										<p className="text-green-600 dark:text-green-500">FREE Shipping</p>
									</div>
								</div>
							)}
						</Link>

						<div className="mt-3 space-y-2">
							<Button type="button" className="w-full bg-secondary hover:bg-secondary/80 text-foreground border border-foreground/10 hover:border-foreground/20 shadow-none h-10 max-w-[200px]" onClick={handleAddToCart} disabled={isAddingToCart || !isAvailable || !variantId} aria-label={isAddingToCart ? "Adding to cart..." : "Add to cart"}>
								<div className="flex items-center justify-center gap-2">
									{isAddingToCart ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
											<span>Adding...</span>
										</>
									) : (
										<>
											<ShoppingCart className="h-4 w-4" aria-hidden="true" />
											<span>Add to Cart</span>
										</>
									)}
								</div>
							</Button>

							<Button type="button" className="w-full flex items-center justify-center max-w-[200px]" disabled={isBuyingNow || !isAvailable || !variantId} onClick={handleBuyNow} aria-label="Buy now">
								{isBuyingNow ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
										<span>Processing...</span>
									</>
								) : (
									<>
										Buy Now
										<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
									</>
								)}
							</Button>
						</div>

						<Link href={productUrl} className="block mt-4" aria-label={`View details for ${product.title}`}>
							<p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">{product.description}</p>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="group py-4 bg-background rounded-lg" role="article" aria-label={product.title}>
			<Link href={productUrl} className="block" aria-label={`View details for ${product.title}`}>
				<div className="relative bg-neutral-100 dark:bg-neutral-800 rounded-md overflow-hidden border border-foreground/10 hover:border-foreground/20 transition-colors duration-200 aspect-square w-full">
					<div className="w-full h-full rounded-md overflow-hidden">
						{imageUrl ? (
							<Image src={imageUrl} alt={imageAlt} fill className="object-cover hover:scale-105 transition-transform duration-300 rounded-md" sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />
						) : (
							<div className="flex h-full items-center justify-center">
								<ShoppingBag className="h-12 w-12 text-neutral-400" aria-hidden="true" />
							</div>
						)}
					</div>
				</div>

				<div className="flex flex-col mt-4 flex-1 justify-between">
					<div className="flex flex-col">
						<h2 className="font-medium text-base line-clamp-1 group-hover:text-primary transition-colors">{product.title}</h2>
						<div className="flex-1" />
					</div>

					<div className="mt-2 flex items-center gap-2">
						<div className="flex items-center gap-2">
							<span className="text-xl font-bold">{formatPrice(parseFloat(price))}</span>
						</div>
					</div>

					{quantity > 0 && (
						<div className="mt-2 space-y-1 text-sm">
							<div className="flex flex-col gap-1">
								<p className="text-green-600 dark:text-green-500 font-medium">{quantity} in stock</p>
								<p className="text-green-600 dark:text-green-500">FREE Shipping</p>
							</div>
						</div>
					)}
				</div>
			</Link>

			<div className="mt-3 space-y-2">
				<Button type="button" className="w-full bg-secondary hover:bg-secondary/80 text-foreground border border-foreground/10 hover:border-foreground/20 shadow-none h-10" onClick={handleAddToCart} disabled={isAddingToCart || !isAvailable || !variantId} aria-label={isAddingToCart ? "Adding to cart..." : "Add to cart"}>
					<div className="flex items-center justify-center gap-2">
						{isAddingToCart ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
								<span>Adding...</span>
							</>
						) : (
							<>
								<ShoppingCart className="h-4 w-4" aria-hidden="true" />
								<span>Add to Cart</span>
							</>
						)}
					</div>
				</Button>

				<Button type="button" className="w-full flex items-center justify-center" disabled={isBuyingNow || !isAvailable || !variantId} onClick={handleBuyNow} aria-label="Buy now">
					{isBuyingNow ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
							<span>Processing...</span>
						</>
					) : (
						<>
							Buy Now
							<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
