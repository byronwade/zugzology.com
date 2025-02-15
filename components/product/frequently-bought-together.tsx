"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ChevronRight, Info } from "lucide-react";
import { type ShopifyProduct } from "@/lib/types";
import { useCart } from "@/lib/providers/cart-provider";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface FrequentlyBoughtTogetherProps {
	mainProduct: ShopifyProduct;
	complementaryProducts: ShopifyProduct[];
}

export function FrequentlyBoughtTogether({ mainProduct, complementaryProducts }: FrequentlyBoughtTogetherProps) {
	const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set([mainProduct.id]));
	const [isLoading, setIsLoading] = useState(false);
	const { addItem, createNewCart } = useCart();

	const toggleProduct = (productId: string) => {
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

	const allProducts = [mainProduct, ...complementaryProducts];

	const totalPrice = useMemo(() => {
		return allProducts.filter((product) => selectedProducts.has(product.id)).reduce((sum, product) => sum + parseFloat(product.priceRange.minVariantPrice.amount), 0);
	}, [selectedProducts, allProducts]);

	const getProductImage = (product: ShopifyProduct) => {
		return product.images?.edges[0]?.node?.url || "/placeholder.svg";
	};

	const handleAddToCart = async () => {
		setIsLoading(true);
		try {
			const selectedProductsArray = allProducts.filter((product) => selectedProducts.has(product.id));
			const cartItems = selectedProductsArray.map((product) => ({
				merchandiseId: product.variants.edges[0].node.id,
				quantity: 1,
			}));

			await addItem(cartItems[0]);
			if (cartItems.length > 1) {
				for (let i = 1; i < cartItems.length; i++) {
					await addItem(cartItems[i]);
				}
			}

			toast.success(`Added ${selectedProducts.size} items to cart`);
		} catch (error) {
			console.error("Error adding items to cart:", error);
			toast.error("Failed to add items to cart");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-3xl mx-auto">
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
								<p>Items frequently purchased together with {mainProduct.title}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<div className="flex items-start space-x-4">
					<div className="flex-shrink-0">
						<Image src={getProductImage(mainProduct)} alt={mainProduct.title} width={120} height={120} className="rounded-lg object-cover" />
					</div>
					<div>
						<h3 className="text-lg font-semibold">{mainProduct.title}</h3>
						<p className="text-sm text-gray-500 mt-1">{mainProduct.description}</p>
						<p className="text-lg font-bold mt-2">${parseFloat(mainProduct.priceRange.minVariantPrice.amount).toFixed(2)}</p>
					</div>
				</div>
				<Separator />
				<div className="space-y-4">
					{complementaryProducts.map((product) => (
						<div key={product.id} className="flex items-start justify-between">
							<div className="flex items-start space-x-4">
								<div className="relative w-16 h-16 flex-shrink-0">
									<Image src={getProductImage(product)} alt={product.title} fill className="object-cover rounded-md" sizes="(max-width: 64px) 100vw, 64px" />
								</div>
								<div>
									<p className="font-medium">{product.title}</p>
									<p className="text-sm text-gray-500">{product.description}</p>
									<p className="text-sm font-bold mt-1">${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}</p>
								</div>
							</div>
							<Switch checked={selectedProducts.has(product.id)} onCheckedChange={() => toggleProduct(product.id)} />
						</div>
					))}
				</div>
				<Separator />
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-gray-500">
							Total for {selectedProducts.size} item{selectedProducts.size !== 1 ? "s" : ""}
						</p>
						<p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
					</div>
					<Button className="px-6" onClick={handleAddToCart} disabled={isLoading}>
						{isLoading ? "Adding..." : "Add to Cart"}
						<ChevronRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
