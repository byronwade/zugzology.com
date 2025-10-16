"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { ProductCard } from "@/components/features/products/product-card";
import { useCart } from "@/components/providers/cart-provider";
import { getRelatedProducts } from "@/lib/ranking/product-ranker";
import type { ShopifyProduct } from "@/lib/types";

type RelatedProductsProps = {
	products: ShopifyProduct[];
	currentProductId: string;
	currentProduct: ShopifyProduct;
	maxItems?: number;
};

export function RelatedProducts({ products, currentProductId, currentProduct, maxItems = 8 }: RelatedProductsProps) {
	const { addItem } = useCart();

	// Get related products using simple tag/type matching
	const relatedProducts = useMemo(
		() => getRelatedProducts(currentProduct, products, maxItems),
		[currentProduct, products, maxItems]
	);

	if (!relatedProducts.length) {
		return null;
	}

	const handleAddToCart = async (_productId: string, variantId: string) => {
		if (!variantId) {
			toast.error("Please select a product variant");
			return;
		}

		try {
			const merchandiseId = variantId.includes("gid://shopify/ProductVariant/")
				? variantId
				: `gid://shopify/ProductVariant/${variantId}`;

			await addItem({
				merchandiseId,
				quantity: 1,
			});

			toast.success("Added to cart");
		} catch (_error) {
			toast.error("Failed to add to cart");
		}
	};

	return (
		<div className="mb-16 last:mb-0">
			{/* Header */}
			<div className="mb-8">
				<h2 className="mb-2 font-bold text-2xl text-neutral-900 dark:text-neutral-100">You May Also Like</h2>
				<p className="text-neutral-600 text-sm dark:text-neutral-400">Similar products based on type and category</p>
			</div>

			{/* Products grid */}
			<div
				aria-label="Related products"
				className="flex-1 3xl:grid-cols-8 gap-4 divide-y divide-neutral-200 sm:grid sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 dark:divide-neutral-800"
				role="list"
			>
				{relatedProducts.map((product, index) => {
					const variantId = product.variants?.nodes?.[0]?.id;

					return (
						<div
							itemProp="itemListElement"
							itemScope
							itemType="https://schema.org/ListItem"
							key={`related-${product.id}-${index}`}
							role="listitem"
						>
							<meta content={String(index + 1)} itemProp="position" />
							<ProductCard
								onAddToCart={() => handleAddToCart(product.id, variantId)}
								product={product}
								quantity={product.variants?.nodes?.[0]?.quantityAvailable}
								variantId={variantId}
								view="grid"
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
