"use client";

import { ShopifyProduct } from "@/lib/types";
import { ProductCard } from "@/components/products/product-card";

interface RelatedProductsProps {
	products: ShopifyProduct[];
	currentProductId: string;
}

export function RelatedProducts({ products, currentProductId }: RelatedProductsProps) {
	// Filter out current product and take up to 4 products
	const relatedProducts = products.filter((product) => product.id !== currentProductId).slice(0, 4);

	if (!relatedProducts.length) return null;

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Related Products</h2>
				<p className="text-muted-foreground">You might also like these products</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{relatedProducts.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>
		</div>
	);
}
