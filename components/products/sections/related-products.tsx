"use client";

import { useState, useEffect } from "react";
import { ShopifyProduct } from "@/lib/types";
import { ProductCard } from "@/components/products/product-card";

interface RelatedProductsProps {
	products: ShopifyProduct[];
	currentProductId: string;
}

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

export function RelatedProducts({ products, currentProductId }: RelatedProductsProps) {
	const isMobile = useIsMobile();
	const maxItems = isMobile ? 4 : 12;

	if (!products?.length) {
		console.log("No related products available");
		return null;
	}

	// Filter out current product if it's somehow included
	const relatedProducts = products.filter((product) => product.id !== currentProductId).slice(0, maxItems);

	if (!relatedProducts.length) {
		console.log("No related products after filtering");
		return null;
	}

	console.log("Displaying related products:", relatedProducts);

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Related Products</h2>
				<p className="text-muted-foreground">You might also like these products</p>
			</div>

			<div className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8 gap-4 flex-1 divide-y divide-neutral-200 dark:divide-neutral-800 sm:divide-y-0">
				{relatedProducts.map((product) => (
					<div key={product.id} className="relative bg-background">
						<ProductCard key={product.id} product={product} view={isMobile ? "list" : "grid"} variantId={product.variants?.edges?.[0]?.node?.id} quantity={product.variants?.edges?.[0]?.node?.quantityAvailable} />
					</div>
				))}
			</div>
		</div>
	);
}
