"use client";

import { Loader2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Link } from "@/components/ui/link";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/providers/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ShopifyImage, ShopifyProduct, ShopifyProductVariant } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

type ProductWithEdges = {
	images: { edges: Array<{ node: ShopifyImage }> };
	variants: { edges: Array<{ node: ShopifyProductVariant }> };
};

type ProductWithNodes = {
	images: { nodes: ShopifyImage[] };
	variants: { nodes: ShopifyProductVariant[] };
};

type ProductAdProps = {
	products: Array<ShopifyProduct & (ProductWithEdges | ProductWithNodes)>;
};

export function ProductAd({ products }: ProductAdProps) {
	const { addItem, cart } = useCart();
	const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
	const [buyingStates, setBuyingStates] = useState<{ [key: string]: boolean }>({});

	if (!products.length) {
		return null;
	}

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

	const handleAddToCart = async (
		e: React.MouseEvent,
		product: ShopifyProduct & (ProductWithEdges | ProductWithNodes)
	) => {
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
			const merchandiseId = variantId.includes("gid://shopify/ProductVariant/")
				? variantId
				: `gid://shopify/ProductVariant/${variantId}`;

			await addItem({
				merchandiseId,
				quantity: 1,
				isPreOrder: !product.availableForSale,
			});
			toast.success("Added to cart");
		} catch (_error) {
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
			const merchandiseId = variantId.includes("gid://shopify/ProductVariant/")
				? variantId
				: `gid://shopify/ProductVariant/${variantId}`;

			// For "Buy Now", we want to create a checkout with just this item
			// We can construct a direct product checkout URL for Shopify
			const shopifyCheckoutUrl = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/cart/${merchandiseId.split("/").pop()}:1`;
			window.location.href = shopifyCheckoutUrl;
		} catch (_error) {
			toast.error("Failed to proceed to checkout");
		} finally {
			setBuyingStates((prev) => ({ ...prev, [product.id]: false }));
		}
	};

	return (
		<div className="space-y-4">
			{products.map((product) => {
				const firstImage = getFirstImage(product);
				const _firstVariant = getFirstVariant(product);
				const price = product.priceRange?.minVariantPrice?.amount || "0";
				const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
				const isLoading = loadingStates[product.id];
				const isBuying = buyingStates[product.id];
				const hasDiscount = compareAtPrice && Number(compareAtPrice) > Number(price);
				const discountPercentage = hasDiscount ? Math.round(100 - (Number(price) / Number(compareAtPrice)) * 100) : 0;

				return (
					<div className="group" key={product.id}>
						<Link
							className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-accent/50"
							href={`/products/${product.handle}`}
						>
							{/* Product Image */}
							<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
								{firstImage ? (
									<Image
										alt={firstImage.altText || product.title}
										className="object-cover transition-all group-hover:scale-110"
										fill
										sizes="64px"
										src={firstImage.url}
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-muted">
										<ShoppingCart className="h-6 w-6 text-muted-foreground" />
									</div>
								)}
								{hasDiscount && (
									<div className="absolute top-0 right-0 rounded-bl bg-red-500 px-1 font-medium text-[10px] text-white">
										-{discountPercentage}%
									</div>
								)}
							</div>

							{/* Product Info */}
							<div className="min-w-0 flex-1">
								<h4 className="line-clamp-2 font-medium text-sm transition-colors group-hover:text-primary">
									{product.title}
								</h4>
								<div className="mt-1 flex items-center">
									<p className="font-semibold text-sm">{formatPrice(price)}</p>
									{hasDiscount && (
										<p className="ml-2 text-muted-foreground text-xs line-through">{formatPrice(compareAtPrice)}</p>
									)}
								</div>
								<div className="mt-1 flex items-center gap-1">
									{product.availableForSale ? null : (
										<Badge className="h-4 py-0 text-[10px]" variant="outline">
											Pre-order
										</Badge>
									)}
									{product.tags?.includes("new") ? (
										<Badge className="h-4 py-0 text-[10px]" variant="outline">
											New
										</Badge>
									) : null}
								</div>
							</div>
						</Link>

						{/* Action Buttons */}
						<div className="mt-1 flex gap-2 px-2">
							<Button
								className="h-7 w-full text-xs"
								disabled={isLoading || isBuying}
								onClick={(e) => handleAddToCart(e, product)}
								size="sm"
								variant="secondary"
							>
								{isLoading ? (
									<Loader2 className="h-3 w-3 animate-spin" />
								) : (
									<>
										<ShoppingCart className="mr-1 h-3 w-3" />
										Add
									</>
								)}
							</Button>
							<Button
								className="h-7 w-full text-xs"
								disabled={isLoading || isBuying}
								onClick={(e) => handleBuyNow(e, product)}
								size="sm"
								variant="default"
							>
								{isBuying ? <Loader2 className="h-3 w-3 animate-spin" /> : "Buy Now"}
							</Button>
						</div>
					</div>
				);
			})}
		</div>
	);
}
