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
	
	const [mounted, setMounted] = useState(false);

	// Memoize total products count
	const totalProducts = useMemo(() => data.products.length, [data.products]);

	// Debounce search query
	const debouncedSearchQuery = useDebounce(searchState.query, SEARCH_DEBOUNCE_MS);

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
		setMounted(true);
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
			if (!query.trim()) {
				setSearchState((prev) => ({
					...prev,
					results: [],
					isSearching: false,
				}));
				return;
			}

			setSearchState((prev) => ({ ...prev, isSearching: true }));
			const searchTerms = query.toLowerCase().split(/\s+/);

			// Search products first
			const productResults = data.products
				.filter((product) => {
					const searchableText = [product.title, product.description, product.productType, product.vendor, ...(product.tags || [])].filter(Boolean).join(" ").toLowerCase();
					return searchTerms.every((term) => searchableText.includes(term));
				})
				.slice(0, MAX_RESULTS.PRODUCTS)
				.map((product) => ({ type: "product" as const, item: product }));

			// Then search blog posts
			const blogResults = data.blogPosts
				.filter((post) => {
					const searchableText = [post.title, post.excerpt, post.content, post.author.name, ...(post.tags || [])].filter(Boolean).join(" ").toLowerCase();
					return searchTerms.every((term) => searchableText.includes(term));
				})
				.slice(0, MAX_RESULTS.BLOGS)
				.map((post) => ({ type: "blog" as const, item: post }));

			setSearchState((prev) => ({
				...prev,
				results: [...productResults, ...blogResults],
				isSearching: false,
			}));
		},
		[data.products, data.blogPosts]
	);

	// Use debounced search query
	useEffect(() => {
		if (debouncedSearchQuery) {
			performSearch(debouncedSearchQuery);
		} else {
			setSearchState((prev) => ({
				...prev,
				results: [],
			}));
		}
	}, [debouncedSearchQuery, performSearch]);

	const contextValue = useMemo(
		() => ({
			searchQuery: searchState.query,
			setSearchQuery: (query: string) =>
				setSearchState((prev) => ({
					...prev,
					query,
					isDropdownOpen: !!query.trim(),
				})),
			searchResults: searchState.results,
			isSearching: searchState.isSearching,
			allProducts: data.products,
			setAllProducts: (products: ShopifyProduct[]) => setData((prev) => ({ ...prev, products })),
			allBlogPosts: data.blogPosts,
			setAllBlogPosts: (blogPosts: ShopifyBlogArticle[]) => setData((prev) => ({ ...prev, blogPosts })),
			totalProducts,
			isDropdownOpen: searchState.isDropdownOpen,
			setIsDropdownOpen: (open: boolean) => setSearchState((prev) => ({ ...prev, isDropdownOpen: open })),
			recentSearches: searchState.recentSearches,
			addRecentSearch,
		}),
		[searchState, data, totalProducts, addRecentSearch]
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