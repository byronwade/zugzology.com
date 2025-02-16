"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { ShopifyProduct, ShopifyBlogArticle } from "@/lib/types";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface SearchResult {
	type: "product" | "blog";
	item: ShopifyProduct | ShopifyBlogArticle;
}

interface SearchContextType {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	searchResults: SearchResult[];
	isSearching: boolean;
	allProducts: ShopifyProduct[];
	setAllProducts: (products: ShopifyProduct[]) => void;
	allBlogPosts: ShopifyBlogArticle[];
	setAllBlogPosts: (posts: ShopifyBlogArticle[]) => void;
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
	allBlogPosts: [],
	setAllBlogPosts: () => {},
	totalProducts: 0,
	isDropdownOpen: false,
	setIsDropdownOpen: () => {},
	recentSearches: [],
	addRecentSearch: () => {},
});

const MAX_RECENT_SEARCHES = 5;
const SEARCH_DEBOUNCE_MS = 300;
const MAX_RESULTS = {
	PRODUCTS: 5,
	BLOGS: 3,
};

export function SearchProvider({ children }: { children: React.ReactNode }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
	const [allBlogPosts, setAllBlogPosts] = useState<ShopifyBlogArticle[]>([]);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [recentSearches, setRecentSearches] = useState<string[]>([]);

	// Memoize total products count
	const totalProducts = useMemo(() => allProducts.length, [allProducts]);

	// Debounce search query
	const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

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

	// Memoize search function
	const performSearch = useCallback(
		(query: string) => {
			if (!query.trim()) {
				setSearchResults([]);
				setIsSearching(false);
				return;
			}

			setIsSearching(true);
			const searchTerms = query.toLowerCase().split(/\s+/);

			// Search products first - using memoized function
			const productResults = allProducts
				.filter((product) => {
					const searchableText = [product.title, product.description, product.productType, product.vendor, ...(product.tags || [])].filter(Boolean).join(" ").toLowerCase();
					return searchTerms.every((term) => searchableText.includes(term));
				})
				.slice(0, MAX_RESULTS.PRODUCTS)
				.map((product) => ({ type: "product" as const, item: product }));

			// Then search blog posts - using memoized function
			const blogResults = allBlogPosts
				.filter((post) => {
					const searchableText = [post.title, post.excerpt, post.content, post.author.name, ...(post.tags || [])].filter(Boolean).join(" ").toLowerCase();
					return searchTerms.every((term) => searchableText.includes(term));
				})
				.slice(0, MAX_RESULTS.BLOGS)
				.map((post) => ({ type: "blog" as const, item: post }));

			// Combine results with products first
			const combinedResults = [...productResults, ...blogResults];

			setSearchResults(combinedResults);
			setIsSearching(false);
		},
		[allProducts, allBlogPosts]
	);

	// Use debounced search query
	useEffect(() => {
		if (debouncedSearchQuery) {
			performSearch(debouncedSearchQuery);
		} else {
			setSearchResults([]);
		}
	}, [debouncedSearchQuery, performSearch]);

	// Handle search query changes
	const handleSearchQueryChange = useCallback((query: string) => {
		setSearchQuery(query);
		if (query.trim()) {
			setIsDropdownOpen(true);
		} else {
			setSearchResults([]);
			setIsDropdownOpen(false);
			setIsSearching(false);
		}
	}, []);

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

	const contextValue = useMemo(
		() => ({
			searchQuery,
			setSearchQuery: handleSearchQueryChange,
			searchResults,
			isSearching,
			allProducts,
			setAllProducts,
			allBlogPosts,
			setAllBlogPosts,
			totalProducts,
			isDropdownOpen,
			setIsDropdownOpen,
			recentSearches,
			addRecentSearch,
		}),
		[searchQuery, handleSearchQueryChange, searchResults, isSearching, allProducts, setAllProducts, allBlogPosts, setAllBlogPosts, totalProducts, isDropdownOpen, setIsDropdownOpen, recentSearches, addRecentSearch]
	);

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