"use client";

import { useEffect } from "react";
import { useSearch } from "@/lib/providers/search-provider";
import type { ShopifyProduct } from "@/lib/types";

export function InitializeSearch({ products }: { products: ShopifyProduct[] }) {
	const { setAllProducts } = useSearch();

	useEffect(() => {
		if (products?.length > 0) {
			console.log("Initializing search with products:", products.length);
			setAllProducts(products);
		}
	}, [products, setAllProducts]);

	return null;
}
