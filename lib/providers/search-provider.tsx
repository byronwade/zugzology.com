"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from "react";
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

// Memoized search function
const searchProducts = (products: ShopifyProduct[], query: string): ShopifyProduct[] => {
	if (!query.trim()) return [];

	const searchTerms = query.toLowerCase().split(" ").filter(Boolean);
	return products.filter((product) => {
		const searchableText = [product.title, product.description, product.productType, product.vendor, ...(product.tags || [])].filter(Boolean).join(" ").toLowerCase();
		return searchTerms.every((term) => searchableText.includes(term));
	});
};

export function SearchProvider({ children }: { children: ReactNode }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
	const [searchResults, setSearchResults] = useState<ShopifyProduct[]>([]);
	const debouncedQuery = useDebounce(searchQuery, 300);

	// Memoize the search results calculation
	const currentSearchResults = useMemo(() => searchProducts(allProducts, debouncedQuery), [allProducts, debouncedQuery]);

	// Update search results when the memoized results change
	useEffect(() => {
		setSearchResults(currentSearchResults);
	}, [currentSearchResults]);

	// Memoize context value to prevent unnecessary rerenders
	const value = useMemo(
		() => ({
			searchQuery,
			debouncedQuery,
			setSearchQuery,
			isSearching: debouncedQuery.trim().length > 0,
			searchResults,
			allProducts,
			setAllProducts,
		}),
		[searchQuery, debouncedQuery, searchResults, allProducts]
	);

	return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export const useSearch = () => {
	const context = useContext(SearchContext);
	if (context === undefined) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return context;
};
