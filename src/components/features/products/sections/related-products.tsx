"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProductCard } from "@/components/features/products/product-card";
import { useCart } from "@/components/providers/cart-provider";
import type { ShopifyProduct } from "@/lib/types";

type RelatedProductsProps = {
	products: ShopifyProduct[];
	currentProductId?: string;
};

export function RelatedProducts({ products, currentProductId }: RelatedProductsProps) {
	const { addItem } = useCart();
	const [isMobile, setIsMobile] = useState(false);
	const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
	const maxItems = isMobile ? 4 : 12;

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

	if (!products?.length) {
		return null;
	}

	// Filter out current product and duplicates
	const uniqueProducts = products
		.filter((product) => product.id !== currentProductId)
		.filter((product, index, self) => index === self.findIndex((p) => p.id === product.id))
		.slice(0, maxItems);

	if (!uniqueProducts.length) {
		return null;
	}

	const handleAddToCart = async (productId: string, variantId: string) => {
		if (!variantId) {
			toast.error("Please select a product variant");
			return;
		}

		setLoadingStates((prev) => ({ ...prev, [productId]: true }));
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
		} finally {
			setLoadingStates((prev) => ({ ...prev, [productId]: false }));
		}
	};

	return (
		<div className="mb-16 last:mb-0">
			<div className="mb-8">
				<h2 className="font-bold text-2xl text-neutral-900 dark:text-neutral-100">Related Products</h2>
				<p className="mt-2 text-neutral-600 text-sm dark:text-neutral-400">You might also like these products</p>
			</div>
			<div
				aria-label="Related products"
				className="flex-1 3xl:grid-cols-8 gap-4 divide-y divide-neutral-200 sm:grid sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 dark:divide-neutral-800"
				role="list"
			>
				{uniqueProducts.map((product, index) => {
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
								isAddingToCartProp={loadingStates[product.id]}
								onAddToCart={() => handleAddToCart(product.id, variantId)}
								product={product}
								quantity={product.variants?.nodes?.[0]?.quantityAvailable}
								variantId={variantId}
								view={isMobile ? "list" : "grid"}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
