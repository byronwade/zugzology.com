"use client";

import React, { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { ShopifyBlogArticle, ShopifyCollection, ShopifyProduct } from "@/lib/types";

type SearchResults = {
	products: ShopifyProduct[];
	blogs: ShopifyBlogArticle[];
	collections: ShopifyCollection[];
};

type SearchContextType = {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	debouncedQuery: string;
	isSearching: boolean;
	setIsSearching: (isSearching: boolean) => void;
	isDropdownOpen: boolean;
	setIsDropdownOpen: (isOpen: boolean) => void;
	allProducts: ShopifyProduct[];
	setAllProducts: (products: ShopifyProduct[]) => void;
	allBlogs: ShopifyBlogArticle[];
	setAllBlogs: (blogs: ShopifyBlogArticle[]) => void;
	allCollections: ShopifyCollection[];
	setAllCollections: (collections: ShopifyCollection[]) => void;
	searchResults: SearchResults;
	clearSearch: () => void;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	React.useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

export function SearchProvider({ children }: { children: ReactNode }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
	const [allBlogs, setAllBlogs] = useState<ShopifyBlogArticle[]>([]);
	const [allCollections, setAllCollections] = useState<ShopifyCollection[]>([]);

	// Debounce search query to prevent excessive API calls
	const debouncedQuery = useDebounce(searchQuery, 300);

	// Memoized search results to prevent unnecessary recalculations
	const searchResults = useMemo(() => {
		if (!debouncedQuery.trim()) {
			return { products: [], blogs: [], collections: [] };
		}

		const query = debouncedQuery.toLowerCase();
		const searchTerms = query.split(/\s+/).filter(Boolean);

		// Search products with simple relevance scoring
		const products = allProducts
			.filter((product) => {
				const searchableText = [
					product.title,
					product.description,
					product.productType,
					product.vendor,
					...(product.tags || []),
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();

				return searchTerms.some((term) => searchableText.includes(term));
			})
			.map((product) => {
				// Calculate simple relevance score based on title and description matches
				const title = (product.title || "").toLowerCase();
				const description = (product.description || "").toLowerCase();
				let score = 0;

				searchTerms.forEach((term) => {
					if (title.includes(term)) score += 10; // Title matches are most important
					if (description.includes(term)) score += 5; // Description matches are secondary
				});

				return {
					...product,
					_searchScore: score,
				};
			})
			.sort((a, b) => (b._searchScore || 0) - (a._searchScore || 0))
			.slice(0, 8); // Sort by relevance score

		// Search blogs
		const blogs = allBlogs
			.filter((blog) => {
				const searchableText = [blog.title, blog.summary, blog.contentHtml, ...(blog.tags || [])]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();

				return searchTerms.some((term) => searchableText.includes(term));
			})
			.slice(0, 6); // Limit for dropdown performance

		// Search collections
		const collections = allCollections
			.filter((collection) => {
				const searchableText = [collection.title, collection.description].filter(Boolean).join(" ").toLowerCase();

				return searchTerms.some((term) => searchableText.includes(term));
			})
			.slice(0, 4); // Limit for dropdown performance

		return { products, blogs, collections };
	}, [debouncedQuery, allProducts, allBlogs, allCollections]);

	// Memoized clear function
	const clearSearch = useCallback(() => {
		setSearchQuery("");
		setIsDropdownOpen(false);
	}, []);

	// Memoized context value to prevent unnecessary re-renders
	const contextValue = useMemo(
		() => ({
			searchQuery,
			setSearchQuery,
			debouncedQuery,
			isSearching,
			setIsSearching,
			isDropdownOpen,
			setIsDropdownOpen,
			allProducts,
			setAllProducts,
			allBlogs,
			setAllBlogs,
			allCollections,
			setAllCollections,
			searchResults,
			clearSearch,
		}),
		[
			searchQuery,
			debouncedQuery,
			isSearching,
			isDropdownOpen,
			allProducts,
			allBlogs,
			allCollections,
			searchResults,
			clearSearch,
		]
	);

	return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchContextType {
	const context = useContext(SearchContext);
	if (context === undefined) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return context;
}
