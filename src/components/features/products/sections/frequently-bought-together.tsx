"use client";

import { ChevronRight, Info } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ShopifyProduct } from "@/lib/types";
import { debugLog } from "@/lib/utils";

type FrequentlyBoughtTogetherProps = {
	mainProduct: ShopifyProduct;
	complementaryProducts: ShopifyProduct[];
};

export function FrequentlyBoughtTogether({ mainProduct, complementaryProducts }: FrequentlyBoughtTogetherProps) {
	const isMainProductValid = Boolean(
		mainProduct?.id &&
			mainProduct?.title &&
			mainProduct?.priceRange?.minVariantPrice?.amount &&
			mainProduct?.variants?.nodes?.[0]
	);

	const { validComplementaryProducts, invalidProductCount } = useMemo(() => {
		if (!Array.isArray(complementaryProducts)) {
			return { validComplementaryProducts: [] as ShopifyProduct[], invalidProductCount: 0 };
		}

		const uniqueProducts = new Map<string, ShopifyProduct>();
		let invalidCount = 0;

		complementaryProducts.forEach((product) => {
			const hasRequiredFields = Boolean(
				product?.id && product?.title && product?.priceRange?.minVariantPrice?.amount && product?.variants?.nodes?.[0]
			);

			if (!hasRequiredFields) {
				invalidCount += 1;
				return;
			}

			if (!uniqueProducts.has(product.id)) {
				uniqueProducts.set(product.id, product);
			}
		});

		return { validComplementaryProducts: Array.from(uniqueProducts.values()), invalidProductCount: invalidCount };
	}, [complementaryProducts]);

	const [selectedProducts, setSelectedProducts] = useState<Set<string>>(() =>
		isMainProductValid && mainProduct.id ? new Set([mainProduct.id]) : new Set()
	);
	const [isLoading, setIsLoading] = useState(false);
	const { addItem } = useCart();

	useEffect(() => {
		if (isMainProductValid && mainProduct.id) {
			setSelectedProducts((prev) => {
				if (prev.size === 1 && prev.has(mainProduct.id)) {
					return prev;
				}
				return new Set([mainProduct.id]);
			});
		}
	}, [isMainProductValid, mainProduct.id]);

	const allProducts = useMemo(() => {
		const items: ShopifyProduct[] = [];
		if (isMainProductValid) {
			items.push(mainProduct);
		}
		return items.concat(validComplementaryProducts);
	}, [isMainProductValid, mainProduct, validComplementaryProducts]);

	const totalPrice = useMemo(
		() =>
			allProducts
				.filter((product) => selectedProducts.has(product.id))
				.reduce((sum, product) => sum + Number.parseFloat(product.priceRange.minVariantPrice.amount), 0),
		[allProducts, selectedProducts]
	);

	if (!isMainProductValid) {
		debugLog("FrequentlyBoughtTogether", "Invalid mainProduct data");
		return null;
	}

	if (invalidProductCount > 0) {
		debugLog("FrequentlyBoughtTogether", `Filtered out ${invalidProductCount} invalid complementary products`);
	}

	if (validComplementaryProducts.length === 0) {
		debugLog("FrequentlyBoughtTogether", "No valid complementary products to display");
		return null;
	}

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

	const getProductImage = (product: ShopifyProduct) => product.images?.nodes?.[0]?.url || "/placeholder.svg";

	const handleAddToCart = async () => {
		setIsLoading(true);
		try {
			const selectedProductsArray = allProducts.filter((product) => selectedProducts.has(product.id));
			const cartItems = selectedProductsArray.map((product) => ({
				merchandiseId: product.variants.nodes[0].id,
				quantity: 1,
			}));

			await addItem(cartItems[0]);
			if (cartItems.length > 1) {
				for (let i = 1; i < cartItems.length; i++) {
					await addItem(cartItems[i]);
				}
			}

			toast.success(`Added ${selectedProducts.size} items to cart`);
		} catch (_error) {
			toast.error("Failed to add items to cart");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="mx-auto w-full max-w-3xl">
			<CardContent className="space-y-6 p-6">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-2xl">Frequently Bought Together</h2>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button size="icon" variant="ghost">
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
						<Image
							alt={mainProduct.title}
							className="rounded-lg object-cover"
							height={120}
							src={getProductImage(mainProduct)}
							width={120}
						/>
					</div>
					<div>
						<h3 className="font-semibold text-lg">{mainProduct.title}</h3>
						<p className="mt-2 font-bold text-lg">
							${Number.parseFloat(mainProduct.priceRange.minVariantPrice.amount).toFixed(2)}
						</p>
					</div>
				</div>
				<Separator />
				<div className="space-y-4">
					{validComplementaryProducts.map((product) => (
						<div className="flex items-start justify-between" key={`complementary-${product.id}`}>
							<div className="flex items-start space-x-4">
								<div className="relative h-16 w-16 flex-shrink-0">
									<Image
										alt={product.title}
										className="rounded-md object-cover"
										fill
										sizes="(max-width: 64px) 100vw, 64px"
										src={getProductImage(product)}
									/>
								</div>
								<div>
									<p className="font-medium">{product.title}</p>
									<p className="mt-1 font-bold text-sm">
										${Number.parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
									</p>
								</div>
							</div>
							<Switch checked={selectedProducts.has(product.id)} onCheckedChange={() => toggleProduct(product.id)} />
						</div>
					))}
				</div>
				<Separator />
				<div className="flex items-center justify-between">
					<div>
						<p className="text-muted-foreground text-sm">
							Total for {selectedProducts.size} item{selectedProducts.size !== 1 ? "s" : ""}
						</p>
						<p className="font-bold text-2xl">${totalPrice.toFixed(2)}</p>
					</div>
					<Button className="px-6" disabled={isLoading} onClick={handleAddToCart}>
						{isLoading ? "Adding..." : "Add to Cart"}
						<ChevronRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
