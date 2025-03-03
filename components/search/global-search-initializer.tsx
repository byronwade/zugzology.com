"use client";

import { useEffect, useRef } from "react";
import { useSearch } from "@/lib/providers/search-provider";
import { getProducts, getAllBlogPosts } from "@/lib/actions/shopify";

export function GlobalSearchInitializer() {
	const searchContext = useSearch();
	const initialized = useRef(false);

	useEffect(() => {
		if (!searchContext || initialized.current) return;

		const initializeSearch = async () => {
			try {
				console.log("🔍 [Search] Initializing global search data...");
				const startTime = performance.now();

				const [products, blogPosts] = await Promise.all([getProducts(), getAllBlogPosts()]);

				if (products?.length > 0) {
					searchContext.setAllProducts(products);
				}

				if (blogPosts?.length > 0) {
					searchContext.setAllBlogPosts(blogPosts);
				}

				const duration = performance.now() - startTime;
				console.log(
					`🔍 [Search] Initialized with ${products.length} products and ${
						blogPosts.length
					} blog posts in ${duration.toFixed(2)}ms`
				);

				initialized.current = true;
			} catch (error) {
				console.error("❌ [Search] Failed to initialize global search:", error);
			}
		};

		initializeSearch();
	}, [searchContext]);

	return null;
}
