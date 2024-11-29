"use client";

import { useCart } from "@/hooks/useCart";
import type { ShopifyProduct } from "@/lib/types";

export default function ProductList({ products }: { products: ShopifyProduct[] }) {
	const { addItem, loading } = useCart();

	const handleAddToCart = async (product: ShopifyProduct) => {
		const variant = product.variants.edges[0]?.node;
		if (variant) {
			await addItem(variant.id, 1);
		}
	};

	return (
		<div className="flex-1 divide-y">
			{products.map((product) => (
				<div key={product.id} className="flex p-4 bg-background">
					<div className="w-32 h-32 md:w-48 md:h-48 relative flex-shrink-0 bg-gray-100 flex items-center justify-center border-b border-gray-200 rounded-md">
						<img src={product.images.edges[0]?.node.url} alt={product.images.edges[0]?.node.altText || product.title} className="object-contain rounded-md" style={{ width: "100%", height: "100%" }} />
					</div>
					<div className="flex-grow pl-4 flex flex-col">
						<a href={`/products/${product.handle}`} className="hover:underline">
							<h2 className="font-medium text-base line-clamp-2">{product.title}</h2>
						</a>
						<div className="mt-1">
							<span className="text-2xl font-bold">
								{product.priceRange.minVariantPrice.currencyCode} {product.priceRange.minVariantPrice.amount}
							</span>
						</div>
						<div className="mt-1 space-y-0.5 text-sm">
							<p>FREE delivery</p>
							{!product.availableForSale && <p className="text-red-600">Out of Stock</p>}
						</div>
						<button onClick={() => handleAddToCart(product)} disabled={!product.availableForSale || loading} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full mt-2 md:mt-3 md:max-w-[200px]">
							{loading ? "Adding..." : "Add to cart"}
						</button>
						<p className="mt-4 text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">{product.description}</p>
					</div>
				</div>
			))}
		</div>
	);
}
