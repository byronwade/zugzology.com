"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ShopifyProduct } from "@/lib/types";

interface SearchContextType {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	searchResults: ShopifyProduct[];
	isSearching: boolean;
	allProducts: ShopifyProduct[];
	setAllProducts: (products: ShopifyProduct[]) => void;
	totalProducts: number;
	isDropdownOpen: boolean;
	setIsDropdownOpen: (open: boolean) => void;
	recentSearches: string[];
	addRecentSearch: (query: string) => void;
}

const SearchContext = createContext<SearchContextType>({
	searchQuery: "",
	setSearchQuery: () => {},
	searchResults: [],
	isSearching: false,
	allProducts: [],
	setAllProducts: () => {},
	totalProducts: 0,
	isDropdownOpen: false,
	setIsDropdownOpen: () => {},
	recentSearches: [],
	addRecentSearch: () => {},
});

const MAX_RECENT_SEARCHES = 5;

export function SearchProvider({ children }: { children: React.ReactNode }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<ShopifyProduct[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [recentSearches, setRecentSearches] = useState<string[]>([]);

	// Load recent searches from localStorage on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("recentSearches");
			if (saved) {
				try {
					setRecentSearches(JSON.parse(saved));
				} catch (e) {
					console.error("Failed to parse recent searches:", e);
				}
			}
		}
		setMounted(true);
	}, []);

	const addRecentSearch = useCallback((query: string) => {
		if (!query.trim()) return;

		setRecentSearches((prev) => {
			const newSearches = [query, ...prev.filter((s) => s !== query)].slice(0, MAX_RECENT_SEARCHES);
			localStorage.setItem("recentSearches", JSON.stringify(newSearches));
			return newSearches;
		});
	}, []);

	// Real-time search function
	const performSearch = useCallback(
		(query: string) => {
			if (!query.trim()) {
				setSearchResults([]);
				setIsSearching(false);
				return;
			}

			console.log("[SEARCH] Performing search:", {
				query,
				allProductsCount: allProducts.length,
				hasProducts: allProducts.length > 0,
			});

			setIsSearching(true);
			const searchTerms = query.toLowerCase().split(/\s+/);

			const results = allProducts
				.filter((product) => {
					const searchableText = [product.title, product.description, product.productType, product.vendor, ...(product.tags || [])].filter(Boolean).join(" ").toLowerCase();

					return searchTerms.every((term) => searchableText.includes(term));
				})
				.slice(0, 10); // Limit to top 10 results for dropdown

			console.log("[SEARCH] Found results:", {
				count: results.length,
				firstResult: results[0]?.title,
				searchTerms,
			});

			setSearchResults(results);
			setIsSearching(false);
		},
		[allProducts]
	);

	// Handle search query changes
	const handleSearchQueryChange = useCallback(
		(query: string) => {
			console.log("[SEARCH] Query changed:", {
				query,
				hasProducts: allProducts.length > 0,
			});
			setSearchQuery(query);
			if (query.trim()) {
				setIsDropdownOpen(true);
				performSearch(query);
			} else {
				setSearchResults([]);
				setIsDropdownOpen(false);
				setIsSearching(false);
			}
		},
		[performSearch]
	);

	// Auto-close dropdown when clicking outside
	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target.closest("[data-search-container]")) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, []);

	const contextValue = {
		searchQuery,
		setSearchQuery: handleSearchQueryChange,
		searchResults,
		isSearching,
		allProducts,
		setAllProducts: (products: ShopifyProduct[]) => {
			console.log("[SEARCH] Setting all products:", {
				count: products.length,
				firstProduct: products[0]?.title,
			});
			setAllProducts(products);
		},
		totalProducts: allProducts.length,
		isDropdownOpen,
		setIsDropdownOpen,
		recentSearches,
		addRecentSearch,
	};

	if (!mounted) {
		return <>{children}</>;
	}

	return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>;
}

export const useSearch = () => {
	const context = useContext(SearchContext);
	if (!context) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return context;
}; 