"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from "react";
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
	searchRef: React.RefObject<HTMLDivElement>;
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
	searchRef: React.createRef<HTMLDivElement>(),
});

const MAX_RECENT_SEARCHES = 5;
const SEARCH_DEBOUNCE_MS = 150;
const MAX_RESULTS = {
	PRODUCTS: 5,
	BLOGS: 3,
};

// Create a search cache outside component to persist between renders
const searchCache = new Map<string, SearchResult[]>();

export function SearchProvider({ children }: { children: React.ReactNode }) {
	const [searchState, setSearchState] = useState({
		query: "",
		results: [] as SearchResult[],
		isSearching: false,
		isDropdownOpen: false,
		recentSearches: [] as string[],
	});

	const [data, setData] = useState({
		products: [] as ShopifyProduct[],
		blogPosts: [] as ShopifyBlogArticle[],
	});

	const searchRef = useRef<HTMLDivElement>(null);
	const debouncedSearchQuery = useDebounce(searchState.query, 100);

	// Handle click outside with improved reliability
	useEffect(() => {
		if (!searchState.isDropdownOpen) return;

		function handleClickOutside(event: MouseEvent | TouchEvent) {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setSearchState((prev) => ({
					...prev,
					query: "",
					results: [],
					isDropdownOpen: false,
					isSearching: false,
				}));
			}
		}

		document.addEventListener("mousedown", handleClickOutside as EventListener);
		document.addEventListener("touchstart", handleClickOutside as EventListener);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside as EventListener);
			document.removeEventListener("touchstart", handleClickOutside as EventListener);
		};
	}, [searchState.isDropdownOpen]);

	// Load recent searches from localStorage on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("recentSearches");
			if (saved) {
				try {
					setSearchState((prev) => ({
						...prev,
						recentSearches: JSON.parse(saved),
					}));
				} catch (e) {
					console.error("Failed to parse recent searches:", e);
				}
			}
		}
	}, []);

	const addRecentSearch = useCallback((query: string) => {
		if (!query.trim()) return;

		setSearchState((prev) => {
			const newSearches = [query, ...prev.recentSearches.filter((s) => s !== query)].slice(0, MAX_RECENT_SEARCHES);
			localStorage.setItem("recentSearches", JSON.stringify(newSearches));
			return {
				...prev,
				recentSearches: newSearches,
			};
		});
	}, []);

	// Memoize search function
	const performSearch = useCallback(
		(query: string) => {
			const trimmedQuery = query?.trim() || "";

			if (!trimmedQuery) {
				setSearchState((prev) => ({
					...prev,
					results: [],
					isSearching: false,
					isDropdownOpen: false,
				}));
				return;
			}

			// Check cache first
			const cacheKey = trimmedQuery.toLowerCase();
			if (searchCache.has(cacheKey)) {
				setSearchState((prev) => ({
					...prev,
					results: searchCache.get(cacheKey) || [],
					isSearching: false,
					isDropdownOpen: true,
				}));
				return;
			}

			setSearchState((prev) => ({ ...prev, isSearching: true }));

			const searchTerms = trimmedQuery.toLowerCase().split(/\s+/);

			// Search products
			const productResults = data.products
				.filter((product) => {
					const searchableText = [product.title, product.productType, product.vendor, ...(product.tags || [])].filter(Boolean).join(" ").toLowerCase();
					return searchTerms.every((term) => searchableText.includes(term));
				})
				.slice(0, MAX_RESULTS.PRODUCTS)
				.map((product) => ({
					type: "product" as const,
					item: product,
				}));

			// Search blog posts
			const blogResults = data.blogPosts
				.filter((post) => {
					const searchableText = [post.title, post.excerpt, post.author.name].filter(Boolean).join(" ").toLowerCase();
					return searchTerms.every((term) => searchableText.includes(term));
				})
				.slice(0, MAX_RESULTS.BLOGS)
				.map((post) => ({
					type: "blog" as const,
					item: post,
				}));

			const results = [...productResults, ...blogResults];

			// Cache the results
			searchCache.set(cacheKey, results);

			// Limit cache size
			if (searchCache.size > 100) {
				const firstKey = searchCache.keys().next().value;
				if (firstKey) searchCache.delete(firstKey);
			}

			setSearchState((prev) => ({
				...prev,
				results,
				isSearching: false,
				isDropdownOpen: true,
			}));
		},
		[data.products, data.blogPosts]
	);

	// Use debounced search query
	useEffect(() => {
		if (debouncedSearchQuery !== undefined) {
			performSearch(debouncedSearchQuery);
		}
	}, [debouncedSearchQuery, performSearch]);

	const contextValue = useMemo(
		() => ({
			searchQuery: searchState.query,
			setSearchQuery: (query: string) => {
				const trimmedQuery = query?.trim() || "";
				setSearchState((prev) => ({
					...prev,
					query: trimmedQuery,
					isDropdownOpen: !!trimmedQuery,
					isSearching: !!trimmedQuery,
				}));
			},
			searchResults: searchState.results,
			isSearching: searchState.isSearching,
			allProducts: data.products,
			setAllProducts: (products: ShopifyProduct[]) => {
				setData((prev) => ({ ...prev, products }));
				searchCache.clear();
			},
			allBlogPosts: data.blogPosts,
			setAllBlogPosts: (blogPosts: ShopifyBlogArticle[]) => setData((prev) => ({ ...prev, blogPosts })),
			totalProducts: data.products.length,
			isDropdownOpen: searchState.isDropdownOpen,
			setIsDropdownOpen: (open: boolean) => {
				setSearchState((prev) => ({
					...prev,
					isDropdownOpen: open,
					query: open ? prev.query : "",
					results: open ? prev.results : [],
					isSearching: open && !!prev.query,
				}));
			},
			recentSearches: searchState.recentSearches,
			addRecentSearch,
			searchRef,
		}),
		[searchState, data, addRecentSearch]
	);

	return (
		<SearchContext.Provider value={contextValue}>
			<div ref={searchRef} className="w-full">
				{children}
			</div>
		</SearchContext.Provider>
	);
}

export const useSearch = () => {
	const context = useContext(SearchContext);
	if (!context) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return context;
}; 