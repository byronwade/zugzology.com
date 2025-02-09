"use client";

import { useState, useEffect } from "react";
import { ShopifyProduct } from "@/lib/types";
import { ProductCard } from "@/components/products/product-card";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/providers/cart-provider";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Package } from "lucide-react";
import { toast } from "sonner";

interface FrequentlyBoughtTogetherProps {
	product: ShopifyProduct;
	complementaryProducts?: ShopifyProduct[];
}

export function FrequentlyBoughtTogether({ product, complementaryProducts = [] }: FrequentlyBoughtTogetherProps) {
	const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set([product.id]));
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const { addItem } = useCart();

	useEffect(() => {
		console.log("FrequentlyBoughtTogether rendered with:", {
			mainProduct: product.title,
			complementaryCount: complementaryProducts.length,
			complementaryTitles: complementaryProducts.map((p) => p.title),
		});
	}, [product, complementaryProducts]);

	const allProducts = [product, ...complementaryProducts];

	const totalPrice = allProducts
		.filter((p) => selectedProducts.has(p.id))
		.reduce((sum, p) => {
			const price = parseFloat(p.priceRange.minVariantPrice.amount);
			return sum + price;
		}, 0);

	const handleProductToggle = (productId: string) => {
		const newSelected = new Set(selectedProducts);
		if (newSelected.has(productId)) {
			if (productId !== product.id) {
				// Don't allow deselecting main product
				newSelected.delete(productId);
			}
		} else {
			newSelected.add(productId);
		}
		setSelectedProducts(newSelected);
	};

	const addSelectedToCart = async () => {
		setIsAddingToCart(true);
		try {
			const selectedProductsArray = allProducts.filter((p) => selectedProducts.has(p.id));

			for (const product of selectedProductsArray) {
				const firstVariant = product.variants?.edges?.[0]?.node;
				const productImage = product.images?.edges?.[0]?.node;

				if (firstVariant?.id) {
					await addItem({
						merchandiseId: firstVariant.id,
						quantity: 1,
						attributes: [
							{
								key: "image",
								value: productImage?.url || "",
							},
							{
								key: "title",
								value: product.title,
							},
							{
								key: "handle",
								value: product.handle,
							},
						],
					});
				}
			}

			toast.success("Products added to cart!");
		} catch (error) {
			console.error("Error adding products to cart:", error);
			toast.error("Failed to add products to cart");
		} finally {
			setIsAddingToCart(false);
		}
	};

	// Only render if there are complementary products
	if (!complementaryProducts?.length) {
		console.log("No complementary products available");
		return null;
	}

	return (
		<div className="space-y-8 py-8">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Frequently Bought Together</h2>
				<p className="text-muted-foreground">Get the complete setup and save!</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{allProducts.map((product) => (
					<div key={`product-${product.id}`} className="relative">
						<div
							className="absolute top-4 right-4 z-10 w-5 h-5 rounded border border-primary bg-background cursor-pointer"
							onClick={() => handleProductToggle(product.id)}
							style={{
								cursor: product.id === allProducts[0].id ? "not-allowed" : "pointer",
							}}
						>
							{selectedProducts.has(product.id) && (
								<svg viewBox="0 0 24 24" fill="none" className="absolute inset-0 h-full w-full stroke-primary" strokeWidth={2}>
									<polyline points="20 6 9 17 4 12" />
								</svg>
							)}
						</div>
						<ProductCard product={product} />
					</div>
				))}
			</div>

			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<p className="text-lg font-semibold">Total: {formatPrice(totalPrice)}</p>
					<p className="text-sm text-muted-foreground">
						{selectedProducts.size} {selectedProducts.size === 1 ? "item" : "items"} selected
					</p>
				</div>
				<Button size="lg" onClick={addSelectedToCart} disabled={isAddingToCart} className="w-full sm:w-auto">
					{isAddingToCart ? (
						<>
							<Package className="mr-2 h-4 w-4 animate-spin" />
							Adding...
						</>
					) : (
						<>
							<ShoppingCart className="mr-2 h-4 w-4" />
							Add Selected to Cart
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
