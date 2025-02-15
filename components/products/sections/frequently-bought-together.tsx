"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Info, Package, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShopifyProduct, CartItem } from "@/lib/types";
import { useCart } from "@/lib/providers/cart-provider";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface FrequentlyBoughtTogetherProps {
	product: ShopifyProduct;
	complementaryProducts?: ShopifyProduct[];
}

export function FrequentlyBoughtTogether({ product, complementaryProducts = [] }: FrequentlyBoughtTogetherProps) {
	const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set([product.id]));
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const { addItem } = useCart();

	const allProducts = [product, ...complementaryProducts];

	const toggleProduct = (productId: string) => {
		if (productId === product.id) return; // Don't allow toggling main product
		setSelectedProducts((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(productId)) {
				newSet.delete(productId);
			} else {
				newSet.add(productId);
			}
			return newSet;
		});
	};

	const totalPrice = useMemo(() => {
		return allProducts
			.filter((product) => selectedProducts.has(product.id))
			.reduce((sum, product) => {
				const price = product.priceRange?.minVariantPrice?.amount || "0";
				return sum + parseFloat(price);
			}, 0);
	}, [selectedProducts, allProducts]);

	const addSelectedToCart = async () => {
		setIsAddingToCart(true);
		try {
			const selectedProductsArray = allProducts.filter((p) => selectedProducts.has(p.id));
			const cartItems: CartItem[] = [];

			for (const product of selectedProductsArray) {
				// Get the first available variant
				const variant = product.variants?.edges?.[0]?.node;

				if (!variant?.id) {
					console.error(`No variant found for product: ${product.title}`);
					continue;
				}

				// Format the variant ID correctly if needed
				const variantId = variant.id.includes("gid://shopify/ProductVariant/") ? variant.id : `gid://shopify/ProductVariant/${variant.id.replace(/\D/g, "")}`;

				console.log(`Adding to cart - Product: ${product.title}, Variant ID: ${variantId}`);

				if (!variantId.match(/^gid:\/\/shopify\/ProductVariant\/\d+$/)) {
					console.error(`Invalid variant ID format for product: ${product.title}`);
					continue;
				}

				cartItems.push({
					merchandiseId: variantId,
					quantity: 1,
					attributes: [
						{
							key: "source",
							value: "frequently_bought_together",
						},
					],
				});
			}

			if (cartItems.length === 0) {
				throw new Error("No valid items to add to cart");
			}

			// Add items to cart sequentially with better error handling
			for (const item of cartItems) {
				try {
					await addItem(item);
					// Small delay between additions to prevent rate limiting
					await new Promise((resolve) => setTimeout(resolve, 500));
				} catch (error) {
					console.error("Error adding item to cart:", error);
					// Continue with other items even if one fails
					continue;
				}
			}

			const successCount = cartItems.length;
			if (successCount > 0) {
				toast.success(`Added ${successCount} ${successCount === 1 ? "item" : "items"} to cart`);
			} else {
				throw new Error("Failed to add any items to cart");
			}
		} catch (error) {
			console.error("Error adding to cart:", error);
			toast.error(error instanceof Error ? error.message : "Failed to add items to cart");
		} finally {
			setIsAddingToCart(false);
		}
	};

	if (!complementaryProducts?.length) return null;

	return (
		<Card className="rounded-lg border border-foreground/15 shadow-none">
			<CardContent className="p-6 space-y-6">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold">Frequently Bought Together</h2>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon">
									<Info className="h-4 w-4" />
									<span className="sr-only">More information</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Items frequently purchased together with {product.title}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>

				<div className="flex items-start space-x-4">
					<div className="flex-shrink-0">
						<Image src={product.images?.edges?.[0]?.node?.url || "/placeholder.svg"} alt={product.title} width={120} height={120} className="rounded-lg object-cover" />
					</div>
					<div>
						<h3 className="text-lg font-semibold">{product.title}</h3>
						<div className="flex items-center gap-3 mt-2">
							<p className="text-lg font-bold">{formatPrice(parseFloat(product.priceRange.minVariantPrice.amount))}</p>
							<Link href={`/products/${product.handle}`} className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
								View Details
								<ExternalLink className="h-3 w-3" />
							</Link>
						</div>
					</div>
				</div>

				<Separator />

				{complementaryProducts.length > 0 && (
					<>
						<div className="space-y-4">
							{complementaryProducts.map((product) => (
								<div key={product.id} className="flex items-start justify-between">
									<div className="flex items-start space-x-4">
										<div className="relative w-16 h-16 flex-shrink-0">
											<Image src={product.images?.edges?.[0]?.node?.url || "/placeholder.svg"} alt={product.title} fill className="object-cover rounded-md" sizes="64px" />
										</div>
										<div className="flex flex-col">
											<p className="font-medium">{product.title}</p>
											<div className="flex items-center gap-3">
												<p className="text-sm font-bold">{formatPrice(parseFloat(product.priceRange?.minVariantPrice?.amount || "0"))}</p>
												<Link href={`/products/${product.handle}`} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
													View Details
													<ExternalLink className="h-3 w-3" />
												</Link>
											</div>
										</div>
									</div>
									<Switch checked={selectedProducts.has(product.id)} onCheckedChange={() => toggleProduct(product.id)} />
								</div>
							))}
						</div>
					</>
				)}

				<Separator />

				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-muted-foreground">
							Total for {selectedProducts.size} item{selectedProducts.size !== 1 ? "s" : ""}
						</p>
						<p className="text-2xl font-bold">{formatPrice(totalPrice)}</p>
					</div>
					<Button onClick={addSelectedToCart} disabled={isAddingToCart} className="px-6">
						{isAddingToCart ? (
							<>
								<Package className="mr-2 h-4 w-4 animate-spin" />
								Adding...
							</>
						) : (
							<>
								Add to Cart
								<ChevronRight className="ml-2 h-4 w-4" />
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
