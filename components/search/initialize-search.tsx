"use client";

import { useEffect } from "react";
import { useSearch } from "@/lib/providers/search-provider";
import type { ShopifyProduct } from "@/lib/types";

export function InitializeSearch({ products }: { products: ShopifyProduct[] }) {
	const { setAllProducts } = useSearch();

	useEffect(() => {
		console.log("[INITIALIZE] Setting products:", {
			count: products.length,
			firstProduct: products[0]?.title,
		});
		setAllProducts(products);
	}, [products, setAllProducts]);

	return null;
}
