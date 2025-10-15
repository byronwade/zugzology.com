"use client";

import { useEffect, useRef, useState } from "react";
import { useSearch } from "@/components/providers";

export function SearchDataLoader() {
	const { setAllProducts, setAllBlogs, setAllCollections } = useSearch();
	const [_loadingProducts, setLoadingProducts] = useState(false);
	const [_loadingBlogs, setLoadingBlogs] = useState(false);
	const [_loadingCollections, setLoadingCollections] = useState(false);
	const productsRequestedRef = useRef(false);
	const blogsRequestedRef = useRef(false);
	const collectionsRequestedRef = useRef(false);

	// Load products for search
	useEffect(() => {
		if (productsRequestedRef.current) {
			return;
		}
		productsRequestedRef.current = true;

		let cancelled = false;

		const loadProducts = async () => {
			setLoadingProducts(true);
			try {
				const response = await fetch("/api/products?limit=100", {
					cache: "no-store",
					headers: { Accept: "application/json" },
				});

				if (!response.ok) {
					throw new Error(`Request failed with status ${response.status}`);
				}

				const data = await response.json();
				const products = Array.isArray(data.products) ? data.products : [];

				if (!cancelled && products.length) {
					setAllProducts(products);
				}
			} catch (_error) {
				if (!cancelled) {
				}
			} finally {
				if (!cancelled) {
					setLoadingProducts(false);
				}
			}
		};

		loadProducts();

		return () => {
			cancelled = true;
		};
	}, [setAllProducts]);

	// Load blog posts for search
	useEffect(() => {
		if (blogsRequestedRef.current) {
			return;
		}
		blogsRequestedRef.current = true;

		let cancelled = false;

		const loadBlogs = async () => {
			setLoadingBlogs(true);
			try {
				const response = await fetch("/api/blogs", {
					cache: "no-store",
					headers: { Accept: "application/json" },
				});

				if (!response.ok) {
					throw new Error(`Request failed with status ${response.status}`);
				}

				const data = await response.json();
				const blogs = Array.isArray(data.blogs) ? data.blogs : [];

				if (!cancelled && blogs.length) {
					setAllBlogs(blogs);
				}
			} catch (_error) {
				if (!cancelled) {
				}
			} finally {
				if (!cancelled) {
					setLoadingBlogs(false);
				}
			}
		};

		loadBlogs();

		return () => {
			cancelled = true;
		};
	}, [setAllBlogs]);

	// Load collections for search
	useEffect(() => {
		if (collectionsRequestedRef.current) {
			return;
		}
		collectionsRequestedRef.current = true;

		let cancelled = false;

		const loadCollections = async () => {
			setLoadingCollections(true);
			try {
				const response = await fetch("/api/collections", {
					cache: "no-store",
					headers: { Accept: "application/json" },
				});

				if (!response.ok) {
					throw new Error(`Request failed with status ${response.status}`);
				}

				const data = await response.json();
				const collections = Array.isArray(data.collections) ? data.collections : [];

				if (!cancelled && collections.length) {
					setAllCollections(collections);
				}
			} catch (_error) {
				if (!cancelled) {
				}
			} finally {
				if (!cancelled) {
					setLoadingCollections(false);
				}
			}
		};

		loadCollections();

		return () => {
			cancelled = true;
		};
	}, [setAllCollections]);

	// This component doesn't render anything visible
	return null;
}
