"use client";

import { ShopifyProduct } from "@/lib/types";
import { ProductCard } from "@/components/products/product-card";

interface RelatedProductsProps {
	products: ShopifyProduct[];
	currentProductId: string;
}

export function RelatedProducts({ products, currentProductId }: RelatedProductsProps) {
	if (!products?.length) {
		console.log("No related products available");
		return null;
	}

	// Filter out current product if it's somehow included
	const relatedProducts = products.filter((product) => product.id !== currentProductId);

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

			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
				{relatedProducts.map((product) => (
					<div key={product.id} className="relative bg-background rounded-lg">
						<ProductCard key={product.id} product={product} />
					</div>
				))}
			</div>
		</div>
	);
}
