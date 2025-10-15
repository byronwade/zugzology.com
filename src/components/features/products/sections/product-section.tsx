"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/features/products/product-card";
import type { ShopifyProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { ProductWithSource } from "./recommendations/types";

// Custom hook for mobile detection
const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => {
			window.removeEventListener("resize", checkMobile);
		};
	}, []);

	return isMobile;
};

type ProductSectionProps = {
	title: string;
	description: string;
	products: ShopifyProduct[] | ProductWithSource[];
	sectionId: string;
	currentProductId?: string;
	onAddToCart?: () => void;
	className?: string;
	maxItems?: number;
};

export const ProductSection = memo(function ProductSection({
	title,
	description,
	products,
	sectionId,
	currentProductId = "",
	onAddToCart,
	className,
	maxItems,
}: ProductSectionProps) {
	const isMobile = useIsMobile();
	// Use ref instead of state to avoid re-renders
	const loadingStatesRef = useRef<Record<string, boolean>>({});
	const [, setForceUpdate] = useState({});

	// Determine maximum items to display based on screen size
	const displayMaxItems = maxItems || (isMobile ? 4 : 12);

	// Filter out current product if needed and determine if products have source
	const hasSource = products.length > 0 && "product" in products[0];

	const filteredProducts = currentProductId
		? products.filter((item) => {
				if (hasSource) {
					return (item as ProductWithSource).product.id !== currentProductId;
				}
				return (item as ShopifyProduct).id !== currentProductId;
			})
		: products;

	// Limit to max items
	const displayProducts = filteredProducts.slice(0, displayMaxItems);

	// Handle add to cart - use a stable reference that doesn't depend on state
	const handleAddToCart = useCallback(
		(productId: string) => {
			// Update loading state without causing re-renders
			loadingStatesRef.current[productId] = true;
			// Force a single update to reflect loading state
			setForceUpdate({});

			// Call the onAddToCart callback
			if (onAddToCart) {
				Promise.resolve(onAddToCart()).finally(() => {
					// Clear loading state after completion
					loadingStatesRef.current[productId] = false;
					setForceUpdate({});
				});
			} else {
				// If no callback, just clear the loading state
				setTimeout(() => {
					loadingStatesRef.current[productId] = false;
					setForceUpdate({});
				}, 500);
			}
		},
		[onAddToCart]
	);

	if (!products.length) {
		return null;
	}

	// If no products after filtering, return null
	if (!displayProducts.length) {
		return null;
	}

	return (
		<div className={cn("mb-16 last:mb-0", className)} id={sectionId}>
			{/* Section Header */}
			<div className="mb-8">
				<h2 className="font-bold text-2xl text-neutral-900 dark:text-neutral-100">{title}</h2>
				<p className="mt-2 text-neutral-600 text-sm dark:text-neutral-400">{description}</p>
			</div>

			{/* Products Grid */}
			<div
				aria-label={`${title} products`}
				className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
				role="list"
			>
				{displayProducts.map((item, index) => {
					// Handle both regular products and products with source
					const product = hasSource ? (item as ProductWithSource).product : (item as ShopifyProduct);
					const productId = product.id;

					// Get first variant and quantity
					const firstVariant = product.variants?.nodes?.[0];
					const variantId = firstVariant?.id;
					const quantity = firstVariant?.quantityAvailable || 0;

					return (
						<div
							itemProp="itemListElement"
							itemScope
							itemType="https://schema.org/ListItem"
							key={`${sectionId}-${productId}-${index}`}
							role="listitem"
						>
							<meta content={String(index + 1)} itemProp="position" />
							<ProductCard
								isAddingToCartProp={loadingStatesRef.current[productId]}
								onAddToCart={() => handleAddToCart(productId)}
								product={product}
								quantity={quantity}
								variantId={variantId}
								view={isMobile ? "list" : "grid"}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
});

ProductSection.displayName = "ProductSection";
