"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { ShopifyProduct, ShopifyBlogArticle } from "@/lib/types";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface SearchResult {
	type: "product" | "blog";
	item: ShopifyProduct | ShopifyBlogArticle;
	relevance: number; // Add relevance score for better sorting
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
	shouldUpdateMainContent: boolean;
	setShouldUpdateMainContent: (shouldUpdate: boolean) => void;
	clearSearchCache: () => void; // Add function to clear search cache
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
	shouldUpdateMainContent: false,
	setShouldUpdateMainContent: () => {},
	clearSearchCache: () => {},
});

const MAX_RECENT_SEARCHES = 5;
const SEARCH_DEBOUNCE_MS = 150;
const MAX_RESULTS = {
	PRODUCTS: 8, // Increased from 5
	BLOGS: 4, // Increased from 3
};

// Create a search cache outside component to persist between renders
const searchCache = new Map<string, SearchResult[]>();

// Helper function to calculate relevance score
function calculateRelevance(text: string, searchTerms: string[]): number {
	if (!text || !searchTerms.length) return 0;

	const lowerText = text.toLowerCase();
	let score = 0;

	// Exact match bonus
	if (searchTerms.length === 1 && lowerText.includes(searchTerms[0])) {
		score += 10;

		// Title starts with search term (higher relevance)
		if (lowerText.startsWith(searchTerms[0])) {
			score += 15;
		}

		// Exact word match (not substring)
		const words = lowerText.split(/\s+/);
		if (words.includes(searchTerms[0])) {
			score += 5;
		}
	}

	// All terms match (basic score)
	if (searchTerms.every((term) => lowerText.includes(term))) {
		score += 5;
	}

	// Percentage of terms that match
	const matchingTerms = searchTerms.filter((term) => lowerText.includes(term));
	score += (matchingTerms.length / searchTerms.length) * 5;

	return score;
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
	const [searchState, setSearchState] = useState({
		query: "",
		results: [] as SearchResult[],
		isSearching: false,
		isDropdownOpen: false,
		recentSearches: [] as string[],
		shouldUpdateMainContent: false, // Default to false - don't update main content during search
	});

	const [data, setData] = useState({
		products: [] as ShopifyProduct[],
		blogPosts: [] as ShopifyBlogArticle[],
	});

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

	// Clear search cache
	const clearSearchCache = useCallback(() => {
		searchCache.clear();
		console.log("🔍 [Search] Cache cleared");
	}, []);

	// Memoize search function with improved relevance scoring
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

			const searchTerms = trimmedQuery
				.toLowerCase()
				.split(/\s+/)
				.filter((term) => term.length > 1);

			// If no valid search terms, return empty results
			if (searchTerms.length === 0) {
				setSearchState((prev) => ({
					...prev,
					results: [],
					isSearching: false,
					isDropdownOpen: false,
				}));
				return;
			}

			// Search products with relevance scoring
			const productResults = data.products
				.map((product) => {
					const titleScore = calculateRelevance(product.title, searchTerms) * 2; // Title is most important
					const typeScore = calculateRelevance(product.productType || "", searchTerms);
					const vendorScore = calculateRelevance(product.vendor || "", searchTerms);
					const tagsScore = calculateRelevance((product.tags || []).join(" "), searchTerms);
					const descriptionScore = calculateRelevance(product.description || "", searchTerms) * 0.5; // Description less important

					const totalScore = titleScore + typeScore + vendorScore + tagsScore + descriptionScore;

					return {
						type: "product" as const,
						item: product,
						relevance: totalScore,
					};
				})
				.filter((result) => result.relevance > 0) // Only include results with some relevance
				.sort((a, b) => b.relevance - a.relevance) // Sort by relevance
				.slice(0, MAX_RESULTS.PRODUCTS);

			// Search blog posts with relevance scoring
			const blogResults = data.blogPosts
				.map((post) => {
					const titleScore = calculateRelevance(post.title, searchTerms) * 2; // Title is most important
					const excerptScore = calculateRelevance(post.excerpt || "", searchTerms);
					const authorScore = calculateRelevance(post.author?.name || "", searchTerms);
					const contentScore = calculateRelevance(post.contentHtml || "", searchTerms) * 0.3; // Content less important

					const totalScore = titleScore + excerptScore + authorScore + contentScore;

					return {
						type: "blog" as const,
						item: post,
						relevance: totalScore,
					};
				})
				.filter((result) => result.relevance > 0) // Only include results with some relevance
				.sort((a, b) => b.relevance - a.relevance) // Sort by relevance
				.slice(0, MAX_RESULTS.BLOGS);

			// Combine and sort results by relevance
			const results = [...productResults, ...blogResults].sort((a, b) => b.relevance - a.relevance);

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
				setSearchState((prev) => ({
					...prev,
					query,
					isDropdownOpen: !!query.trim(),
					isSearching: !!query.trim(),
				}));
			},
			searchResults: searchState.results,
			isSearching: searchState.isSearching,
			allProducts: data.products,
			setAllProducts: (products: ShopifyProduct[]) => {
				setData((prev) => ({ ...prev, products }));
				// Clear cache when products change
				searchCache.clear();
				console.log(`🔍 [Search] Loaded ${products.length} products`);
			},
			allBlogPosts: data.blogPosts,
			setAllBlogPosts: (blogPosts: ShopifyBlogArticle[]) => {
				setData((prev) => ({ ...prev, blogPosts }));
				console.log(`🔍 [Search] Loaded ${blogPosts.length} blog posts`);
			},
			totalProducts: data.products.length,
			isDropdownOpen: searchState.isDropdownOpen,
			setIsDropdownOpen: (open: boolean) => {
				setSearchState((prev) => ({
					...prev,
					isDropdownOpen: open,
					isSearching: open && !!prev.query,
				}));
			},
			recentSearches: searchState.recentSearches,
			addRecentSearch,
			shouldUpdateMainContent: searchState.shouldUpdateMainContent,
			setShouldUpdateMainContent: (shouldUpdate: boolean) => {
				setSearchState((prev) => ({
					...prev,
					shouldUpdateMainContent: shouldUpdate,
				}));
			},
			clearSearchCache,
		}),
		[searchState, data, addRecentSearch, clearSearchCache]
	);

	return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>;
}

export const useSearch = () => {
	const context = useContext(SearchContext);
	if (!context) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return context;
}; 