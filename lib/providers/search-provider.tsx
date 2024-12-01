"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
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

export function SearchProvider({ children }: { children: ReactNode }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
	const [searchResults, setSearchResults] = useState<ShopifyProduct[]>([]);
	const debouncedQuery = useDebounce(searchQuery, 300);

	// Update search results whenever the debounced query changes
	useEffect(() => {
		if (debouncedQuery.trim()) {
			const query = debouncedQuery.toLowerCase();
			const results = allProducts.filter((product) => {
				const searchableFields = [product.title, product.description, product.productType, product.vendor, ...(product.tags || [])].map((field) => (field || "").toLowerCase());
				return searchableFields.some((field) => field.includes(query));
			});
			setSearchResults(results);
		} else {
			setSearchResults([]);
		}
	}, [debouncedQuery, allProducts]);

	const handleSearchQuery = useCallback((query: string) => {
		setSearchQuery(query);
	}, []);

	const value = {
		searchQuery,
		debouncedQuery,
		setSearchQuery: handleSearchQuery,
		isSearching: debouncedQuery.trim().length > 0,
		searchResults,
		allProducts,
		setAllProducts,
	};

	return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
	const context = useContext(SearchContext);
	if (context === undefined) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return context;
}
