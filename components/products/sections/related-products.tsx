"use client";

import { useState, useEffect } from "react";
import { ShopifyProduct } from "@/lib/types";
import { ProductCard } from "@/components/products/product-card";

interface RelatedProductsProps {
	products: ShopifyProduct[];
	currentProductId: string;
}

export function RelatedProducts({ products, currentProductId }: RelatedProductsProps) {
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
		console.log("No related products available");
		return null;
	}

	// Filter out current product and duplicates
	const uniqueProducts = products
		.filter((product) => product.id !== currentProductId)
		.filter((product, index, self) => index === self.findIndex((p) => p.id === product.id))
		.slice(0, maxItems);

	if (!uniqueProducts.length) {
		console.log("No related products after filtering");
		return null;
	}

	const handleAddToCart = async (productId: string) => {
		setLoadingStates((prev) => ({ ...prev, [productId]: true }));
		try {
			// Your add to cart logic here
		} finally {
			setLoadingStates((prev) => ({ ...prev, [productId]: false }));
		}
	};

	return (
		<div className="mb-16 last:mb-0">
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Related Products</h2>
				<p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">You might also like these products</p>
			</div>
			<div className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8 gap-4 flex-1 divide-y divide-neutral-200 dark:divide-neutral-800 sm:divide-y-0" role="list" aria-label="Related products">
				{uniqueProducts.map((product, index) => (
					<div key={`related-${product.id}-${index}`} role="listitem" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
						<meta itemProp="position" content={String(index + 1)} />
						<ProductCard product={product} view={isMobile ? "list" : "grid"} variantId={product.variants?.nodes?.[0]?.id} quantity={product.variants?.nodes?.[0]?.quantityAvailable} isAddingToCart={loadingStates[product.id]} onAddToCart={() => handleAddToCart(product.id)} />
					</div>
				))}
			</div>
		</div>
	);
}
