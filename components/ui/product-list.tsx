"use client";

import React from "react";
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

	return (
		<div className={view === "grid" ? "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-4"}>
			{products.map((product) => (
				<ProductCard key={product.id} product={product} collectionHandle={collectionHandle} view={view} />
			))}
		</div>
	);
}
