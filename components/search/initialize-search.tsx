"use client";

import { useEffect, useRef } from "react";
import { useSearch } from "@/lib/providers/search-provider";
import type { ShopifyProduct, ShopifyBlogArticle } from "@/lib/types";

interface InitializeSearchProps {
	products: ShopifyProduct[];
	blogPosts: ShopifyBlogArticle[];
}

export function InitializeSearch({ products, blogPosts }: InitializeSearchProps) {
	const searchContext = useSearch();
	const initialized = useRef(false);

	useEffect(() => {
		if (!searchContext || initialized.current) return;

		try {
			const { setAllProducts, setAllBlogPosts } = searchContext;

			if (products?.length > 0) {
				setAllProducts(products);
			}

			if (blogPosts?.length > 0) {
				setAllBlogPosts(blogPosts);
			}

			initialized.current = true;
		} catch (error) {
			console.error("❌ [Search] Failed to initialize search:", error);
		}
	}, [products, blogPosts, searchContext]);

	return null;
}
