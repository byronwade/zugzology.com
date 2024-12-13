"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import type { ShopifyProduct } from "@/lib/types";

interface SearchContextType {
	searchQuery: string;
	debouncedQuery: string;
	setSearchQuery: (query: string) => void;
	isSearching: boolean;
	searchResults: ShopifyProduct[];
	allProducts: ShopifyProduct[];
	setAllProducts: (products: ShopifyProduct[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const searchProducts = (products: ShopifyProduct[], query: string): ShopifyProduct[] => {
	if (!query.trim()) return products;

	const searchTerms = query.toLowerCase().split(" ").filter(Boolean);
	return products.filter((product) => {
		const searchableText = [product.title, product.description, product.productType, product.vendor, ...(product.tags || []), ...(product.variants?.edges?.map((edge) => edge.node.title) || [])].filter(Boolean).join(" ").toLowerCase();

		return searchTerms.every((term) => searchableText.includes(term));
	});
};

export function SearchProvider({ children }: { children: ReactNode }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
	const productsRef = useRef<ShopifyProduct[]>([]);
	const debouncedQuery = useDebounce(searchQuery, 300);
	const initRef = useRef(false);

	const handleSetAllProducts = useCallback((products: ShopifyProduct[]) => {
		if (!Array.isArray(products) || products.length === 0) return;

		// Only update if products are different
		const currentIds = productsRef.current
			.map((p) => p.id)
			.sort()
			.join(",");
		const newIds = products
			.map((p) => p.id)
			.sort()
			.join(",");

		if (currentIds !== newIds) {
			productsRef.current = products;
			setAllProducts(products);
			console.log("[SEARCH] Products updated:", products.length);
		}
	}, []);

	const isSearching = useMemo(() => {
		return Boolean(debouncedQuery.trim());
	}, [debouncedQuery]);

	const searchResults = useMemo(() => {
		if (!isSearching) return productsRef.current;
		return searchProducts(productsRef.current, debouncedQuery);
	}, [isSearching, debouncedQuery]);

	// Prevent unnecessary re-renders
	const value = useMemo(
		() => ({
			searchQuery,
			debouncedQuery,
			setSearchQuery,
			isSearching,
			searchResults,
			allProducts,
			setAllProducts: handleSetAllProducts,
		}),
		[searchQuery, debouncedQuery, isSearching, searchResults, allProducts, handleSetAllProducts]
	);

	return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export const useSearch = () => {
	const context = useContext(SearchContext);
	if (!context) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return context;
};
