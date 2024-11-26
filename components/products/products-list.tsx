"use client";

import { Product } from "@/lib/types/shopify";
import { ProductCard } from "./product-card";
import { useEffect, useState } from "react";

interface ProductsListProps {
	initialProducts: Product[];
}

export function ProductsList({ initialProducts }: ProductsListProps) {
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	if (!isHydrated) {
		return (
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="animate-pulse">
						<div className="aspect-square bg-gray-200 rounded-lg mb-4" />
						<div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
						<div className="h-4 bg-gray-200 rounded w-1/2" />
					</div>
				))}
			</div>
		);
	}

	if (!initialProducts?.length) {
		return (
			<div className="text-center py-12">
				<h2 className="text-xl font-semibold">No products found</h2>
				<p className="text-gray-600 mt-2">Please try a different category or check back later.</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{initialProducts.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	);
}
