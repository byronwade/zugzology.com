"use client";

import React from "react";
<<<<<<< HEAD
import type { ShopifyProduct } from "@/lib/types";

export default function ProductList({ products }: { products: ShopifyProduct[] }) {
=======
import { ShopifyProduct } from "@/lib/types";
import { ProductCard } from "./product-card";

interface ProductListProps {
	products: ShopifyProduct[];
	collectionHandle?: string;
	view?: "grid" | "list";
}

export default function ProductList({ products, collectionHandle, view = "grid" }: ProductListProps) {
	if (!products.length) {
		return (
			<div className="text-center py-12">
				<h2 className="text-xl font-semibold">No products found</h2>
				<p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
			</div>
		);
	}

>>>>>>> fae339299d7c36f74097585aff30db77f2e11300
	return (
		<div className={view === "grid" ? "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-4"}>
			{products.map((product) => (
<<<<<<< HEAD
				<div key={product.id} className="flex p-4 bg-background">
					<div className="w-32 h-32 md:w-48 md:h-48 relative flex-shrink-0 bg-gray-100 flex items-center justify-center border-b border-gray-200 rounded-md">
						<img src={product.images.edges[0]?.node.url} alt={product.title} className="object-contain rounded-md" style={{ width: "100%", height: "100%" }} />
					</div>
					<div className="flex-grow pl-4 flex flex-col">
						<a href={`/products/${product.handle}`} className="hover:underline">
							<h2 className="font-medium text-base line-clamp-2">{product.title}</h2>
						</a>
						<div className="mt-1">
							<span className="text-2xl font-bold">${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}</span>
						</div>
						<div className="mt-1 space-y-0.5 text-sm">
							<p>FREE delivery</p>
							<p className={product.availableForSale ? "text-green-600" : "text-red-600"}>{product.availableForSale ? "In Stock" : "Out of Stock"}</p>
						</div>
						<button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full mt-2 md:mt-3 md:max-w-[200px]" disabled={!product.availableForSale}>
							Add to cart
						</button>
						<p className="mt-4 text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">{product.description}</p>
					</div>
				</div>
=======
				<ProductCard key={product.id} product={product} collectionHandle={collectionHandle} view={view} />
>>>>>>> fae339299d7c36f74097585aff30db77f2e11300
			))}
		</div>
	);
}
