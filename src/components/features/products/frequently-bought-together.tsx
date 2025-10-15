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

type FrequentlyBoughtTogetherProps = {
	mainProduct: ShopifyProduct;
	complementaryProducts: ShopifyProduct[];
};

// Custom hook for mobile detection
function useIsMobile() {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 640);
		};

		// Initial check
		checkMobile();

		// Add event listener
		window.addEventListener("resize", checkMobile);

		// Cleanup
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return isMobile;
}

export function FrequentlyBoughtTogether({ mainProduct, complementaryProducts }: FrequentlyBoughtTogetherProps) {
	const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set([mainProduct.id]));
	const [isLoading, setIsLoading] = useState(false);
	const { addItem } = useCart();
	const isMobile = useIsMobile();

	// Limit complementary products on mobile while keeping stable references
	const displayProducts = useMemo(
		() => (isMobile ? complementaryProducts.slice(0, 4) : complementaryProducts),
		[complementaryProducts, isMobile]
	);

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

	const productsToConsider = useMemo(() => [mainProduct, ...displayProducts], [displayProducts, mainProduct]);

	const totalPrice = useMemo(
		() =>
			productsToConsider
				.filter((product) => selectedProducts.has(product.id))
				.reduce((sum, product) => sum + Number.parseFloat(product.priceRange.minVariantPrice.amount), 0),
		[productsToConsider, selectedProducts]
	);

	const getProductImage = (product: ShopifyProduct) => product.images?.nodes[0]?.url || "/placeholder.svg";

	const handleAddToCart = async () => {
		setIsLoading(true);
		try {
			const selectedProductsArray = productsToConsider.filter((product) => selectedProducts.has(product.id));
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
				<div className={isMobile ? "space-y-4" : "flex items-start space-x-4"}>
					<div className={isMobile ? "flex items-center space-x-4" : "flex-shrink-0"}>
						<Image
							alt={mainProduct.title}
							className="rounded-lg object-cover"
							height={isMobile ? 80 : 120}
							src={getProductImage(mainProduct)}
							width={isMobile ? 80 : 120}
						/>
						<div className={isMobile ? "flex-1" : ""}>
							<h3 className={`font-semibold ${isMobile ? "text-base" : "text-lg"}`}>{mainProduct.title}</h3>
							<p className={`mt-2 font-bold ${isMobile ? "text-base" : "text-lg"}`}>
								${Number.parseFloat(mainProduct.priceRange.minVariantPrice.amount).toFixed(2)}
							</p>
						</div>
					</div>
				</div>
				<Separator />
				<div className="space-y-4">
					{displayProducts.map((product) => (
						<div className="flex items-start justify-between" key={product.id}>
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
						<p className="text-gray-500 text-sm">
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
