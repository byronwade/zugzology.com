"use client";

import { useEffect, useRef } from "react";
import { useSearch } from "@/components/providers";

export function GlobalSearchInitializer() {
	const searchContext = useSearch();
	const initialized = useRef(false);

	useEffect(() => {
		if (!searchContext || initialized.current) {
			return;
		}

		const initializeSearch = async () => {
			try {
				const startTime = performance.now();

				const [productsResponse, blogsResponse] = await Promise.all([
					fetch("/api/products?limit=100", { cache: "no-store", headers: { Accept: "application/json" } }),
					fetch("/api/blogs", { cache: "no-store", headers: { Accept: "application/json" } }),
				]);

				if (!productsResponse.ok) {
					throw new Error(`Products request failed with status ${productsResponse.status}`);
				}

				if (!blogsResponse.ok) {
					throw new Error(`Blogs request failed with status ${blogsResponse.status}`);
				}

				const productsData = await productsResponse.json();
				const blogsData = await blogsResponse.json();

				const products = Array.isArray(productsData.products) ? productsData.products : [];
				const blogs = Array.isArray(blogsData.blogs) ? blogsData.blogs : [];

				if (products.length) {
					searchContext.setAllProducts(products);
				}

				if (blogs.length) {
					searchContext.setAllBlogs(blogs);
				}

				const _duration = performance.now() - startTime;

				initialized.current = true;
			} catch (_error) {}
		};

		initializeSearch();
	}, [searchContext]);

	return null;
}
