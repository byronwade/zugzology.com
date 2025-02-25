"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShopifyProduct } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/providers/cart-provider";
import { toast } from "sonner";
import { Loader2, ShoppingCart, ArrowRight, Sparkles, Clock } from "lucide-react";

interface ProductAdProps {
	products: ShopifyProduct[];
}

export function ProductAd({ products }: ProductAdProps) {
	const { addItem, createNewCart } = useCart();
	const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
	const [buyingStates, setBuyingStates] = useState<{ [key: string]: boolean }>({});

	if (!products.length) return null;

	const handleAddToCart = async (e: React.MouseEvent, product: ShopifyProduct) => {
		e.preventDefault();
		e.stopPropagation();

		const variantId = product.variants?.edges[0]?.node?.id;
		if (!variantId) {
			toast.error("Product variant not found");
			return;
		}

		setLoadingStates((prev) => ({ ...prev, [product.id]: true }));
		try {
			const merchandiseId = variantId.includes("gid://shopify/ProductVariant/") ? variantId : `gid://shopify/ProductVariant/${variantId}`;

			await addItem({
				merchandiseId,
				quantity: 1,
				isPreOrder: !product.availableForSale,
			});
			toast.success("Added to cart");
		} catch (error) {
			console.error("Error in handleAddToCart:", error);
			toast.error("Failed to add to cart");
		} finally {
			setLoadingStates((prev) => ({ ...prev, [product.id]: false }));
		}
	};

	const handleBuyNow = async (e: React.MouseEvent, product: ShopifyProduct) => {
		e.preventDefault();
		e.stopPropagation();

		const variantId = product.variants?.edges[0]?.node?.id;
		if (!variantId) {
			toast.error("Product variant not found");
			return;
		}

		setBuyingStates((prev) => ({ ...prev, [product.id]: true }));
		try {
			const merchandiseId = variantId.includes("gid://shopify/ProductVariant/") ? variantId : `gid://shopify/ProductVariant/${variantId}`;

			const cart = await createNewCart([
				{
					merchandiseId,
					quantity: 1,
					isPreOrder: !product.availableForSale,
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
			setBuyingStates((prev) => ({ ...prev, [product.id]: false }));
		}
	};

	return (
		<aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
			<div className="sticky top-[120px] bg-white dark:bg-neutral-900 rounded-xl border dark:border-neutral-800 p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Featured Products</h2>
					<Link href="/products" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
						View all
					</Link>
				</div>
				<div className="space-y-6">
					{products.map((product) => {
						const firstImage = product.images?.edges[0]?.node;
						const price = product.priceRange?.minVariantPrice?.amount || "0";
						const compareAtPrice = product.priceRange?.maxVariantPrice?.amount;
						const isOnSale = compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price);
						const isLoading = loadingStates[product.id];
						const isBuying = buyingStates[product.id];

						return (
							<Link key={product.id} href={`/products/${product.handle}`} className="group flex gap-4 items-start relative">
								{firstImage && (
									<div className="relative w-20 h-20 flex-shrink-0">
										<div className="relative bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden border border-foreground/10 group-hover:border-foreground/20 transition-colors duration-200 w-full h-full">
											<Image src={firstImage.url} alt={firstImage.altText || product.title} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes="80px" />
											{isOnSale && (
												<Badge variant="destructive" className="absolute top-1 left-1 text-[10px] px-1 py-0">
													Sale
												</Badge>
											)}
										</div>
									</div>
								)}
								<div className="flex-1 min-w-0 space-y-1">
									<h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">{product.title}</h3>
									<div className="flex items-center gap-2">
										<span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{formatPrice(parseFloat(price))}</span>
										{isOnSale && <span className="text-xs text-neutral-500 line-through">{formatPrice(parseFloat(compareAtPrice!))}</span>}
									</div>
									<div className="flex gap-2 mt-2">
										<Button size="sm" variant="secondary" className="h-7 px-2 text-xs bg-secondary hover:bg-secondary/80 text-foreground border border-foreground/10 hover:border-foreground/20 shadow-none" onClick={(e) => handleAddToCart(e, product)} disabled={isLoading}>
											{isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShoppingCart className="h-3 w-3" />}
										</Button>
										<Button size="sm" variant="default" className="h-7 px-2 text-xs" onClick={(e) => handleBuyNow(e, product)} disabled={isBuying}>
											{isBuying ? <Loader2 className="h-3 w-3 animate-spin" /> : "Buy Now"}
										</Button>
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</aside>
	);
}
