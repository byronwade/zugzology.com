"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShopifyProduct, ShopifyImage, ShopifyProductVariant } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/providers/cart-provider";
import { toast } from "sonner";
import { Loader2, ShoppingCart, ArrowRight, Sparkles, Clock, Star } from "lucide-react";

type ProductWithEdges = {
	images: { edges: Array<{ node: ShopifyImage }> };
	variants: { edges: Array<{ node: ShopifyProductVariant }> };
};

type ProductWithNodes = {
	images: { nodes: ShopifyImage[] };
	variants: { nodes: ShopifyProductVariant[] };
};

interface ProductAdProps {
	products: Array<ShopifyProduct & (ProductWithEdges | ProductWithNodes)>;
}

export function ProductAd({ products }: ProductAdProps) {
	const { addItem } = useCart();
	const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
	const [buyingStates, setBuyingStates] = useState<{ [key: string]: boolean }>({});

	if (!products.length) return null;

	const getFirstVariant = (product: ShopifyProduct & (ProductWithEdges | ProductWithNodes)) => {
		if ("edges" in product.variants) {
			return product.variants.edges[0]?.node;
		}
		return product.variants.nodes[0];
	};

	const getFirstImage = (product: ShopifyProduct & (ProductWithEdges | ProductWithNodes)) => {
		if ("edges" in product.images) {
			return product.images.edges[0]?.node;
		}
		return product.images.nodes[0];
	};

	const handleAddToCart = async (e: React.MouseEvent, product: ShopifyProduct & (ProductWithEdges | ProductWithNodes)) => {
		e.preventDefault();
		e.stopPropagation();

		const firstVariant = getFirstVariant(product);
		const variantId = firstVariant?.id;
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

	const handleBuyNow = async (e: React.MouseEvent, product: ShopifyProduct & (ProductWithEdges | ProductWithNodes)) => {
		e.preventDefault();
		e.stopPropagation();

		const firstVariant = getFirstVariant(product);
		const variantId = firstVariant?.id;
		if (!variantId) {
			toast.error("Product variant not found");
			return;
		}

		setBuyingStates((prev) => ({ ...prev, [product.id]: true }));
		try {
			const merchandiseId = variantId.includes("gid://shopify/ProductVariant/") ? variantId : `gid://shopify/ProductVariant/${variantId}`;
			window.location.href = `/checkout?variant=${merchandiseId}&quantity=1`;
		} catch (error) {
			console.error("Error in handleBuyNow:", error);
			toast.error("Failed to proceed to checkout");
		} finally {
			setBuyingStates((prev) => ({ ...prev, [product.id]: false }));
		}
	};

	return (
		<div className="space-y-4">
			{products.map((product) => {
				const firstImage = getFirstImage(product);
				const firstVariant = getFirstVariant(product);
				const price = product.priceRange?.minVariantPrice?.amount || "0";
				const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
				const isLoading = loadingStates[product.id] || false;
				const isBuying = buyingStates[product.id] || false;
				const hasDiscount = compareAtPrice && Number(compareAtPrice) > Number(price);
				const discountPercentage = hasDiscount ? Math.round(100 - (Number(price) / Number(compareAtPrice)) * 100) : 0;

				return (
					<div key={product.id} className="group">
						<Link href={`/products/${product.handle}`} className="flex gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
							{/* Product Image */}
							<div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border">
								{firstImage ? (
									<Image src={firstImage.url} alt={firstImage.altText || product.title} className="object-cover transition-all group-hover:scale-110" fill sizes="64px" />
								) : (
									<div className="w-full h-full bg-muted flex items-center justify-center">
										<ShoppingCart className="w-6 h-6 text-muted-foreground" />
									</div>
								)}
								{hasDiscount && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-medium px-1 rounded-bl">-{discountPercentage}%</div>}
							</div>

							{/* Product Info */}
							<div className="flex-1 min-w-0">
								<h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{product.title}</h4>
								<div className="flex items-center mt-1">
									<p className="text-sm font-semibold">{formatPrice(price)}</p>
									{hasDiscount && <p className="text-xs text-muted-foreground line-through ml-2">{formatPrice(compareAtPrice)}</p>}
								</div>
								<div className="flex items-center gap-1 mt-1">
									{!product.availableForSale ? (
										<Badge variant="outline" className="text-[10px] py-0 h-4">
											Pre-order
										</Badge>
									) : null}
									{product.tags?.includes("new") ? (
										<Badge variant="outline" className="text-[10px] py-0 h-4">
											New
										</Badge>
									) : null}
								</div>
							</div>
						</Link>

						{/* Action Buttons */}
						<div className="flex gap-2 mt-1 px-2">
							<Button size="sm" variant="secondary" className="w-full h-7 text-xs" onClick={(e) => handleAddToCart(e, product)} disabled={isLoading || isBuying}>
								{isLoading ? (
									<Loader2 className="h-3 w-3 animate-spin" />
								) : (
									<>
										<ShoppingCart className="mr-1 h-3 w-3" />
										Add
									</>
								)}
							</Button>
							<Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={(e) => handleBuyNow(e, product)} disabled={isLoading || isBuying}>
								{isBuying ? <Loader2 className="h-3 w-3 animate-spin" /> : "Buy Now"}
							</Button>
						</div>
					</div>
				);
			})}
		</div>
	);
}
