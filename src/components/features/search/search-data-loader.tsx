"use client";

import { useEffect, useRef } from "react";
import { useSearch } from "@/components/providers";

async function fetchJson<T>(url: string): Promise<T | null> {
	try {
		const response = await fetch(url, {
			headers: { Accept: "application/json" },
			next: undefined,
		});
		if (!response.ok) {
			return null;
		}
		return (await response.json()) as T;
	} catch {
		return null;
	}
}

/**
 * Loads search indexes only after the browser is idle (or after first user interaction).
 * Avoids 3 no-store Shopify API round-trips on every page mount.
 */
export function SearchDataLoader(): null {
	const { setAllProducts, setAllBlogs, setAllCollections } = useSearch();
	const startedRef = useRef(false);

	useEffect(() => {
		if (startedRef.current) {
			return;
		}

		const load = () => {
			if (startedRef.current) {
				return;
			}
			startedRef.current = true;

			void (async () => {
				const [productsData, blogsData, collectionsData] = await Promise.all([
					fetchJson<{ products?: unknown[] }>("/api/products?limit=50"),
					fetchJson<{ blogs?: unknown[] }>("/api/blogs"),
					fetchJson<{ collections?: unknown[] }>("/api/collections"),
				]);

				if (productsData?.products?.length) {
					setAllProducts(productsData.products as never[]);
				}
				if (blogsData?.blogs?.length) {
					setAllBlogs(blogsData.blogs as never[]);
				}
				if (collectionsData?.collections?.length) {
					setAllCollections(collectionsData.collections as never[]);
				}
			})();
		};

		const idleId =
			typeof window.requestIdleCallback === "function"
				? window.requestIdleCallback(load, { timeout: 4000 })
				: window.setTimeout(load, 2000);

		const onInteract = () => load();
		window.addEventListener("pointerdown", onInteract, { once: true, passive: true });
		window.addEventListener("keydown", onInteract, { once: true });

		return () => {
			if (typeof window.cancelIdleCallback === "function" && typeof idleId === "number") {
				window.cancelIdleCallback(idleId);
			} else {
				window.clearTimeout(idleId as number);
			}
			window.removeEventListener("pointerdown", onInteract);
			window.removeEventListener("keydown", onInteract);
		};
	}, [setAllProducts, setAllBlogs, setAllCollections]);

	return null;
}
