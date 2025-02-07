"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useRef, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import type { ShopifyProduct } from "@/lib/types";
import { usePathname } from "next/navigation";

interface SearchContextType {
	searchQuery: string;
	debouncedQuery: string;
	setSearchQuery: (query: string) => void;
	isSearching: boolean;
	setIsSearching: (searching: boolean) => void;
	searchResults: ShopifyProduct[];
	allProducts: ShopifyProduct[];
	setAllProducts: (products: ShopifyProduct[]) => void;
	totalProducts: number;
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
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const debouncedQuery = useDebounce(searchQuery, 300);
	const pathname = usePathname();

	// Reset search state when navigating to product or collection pages
	useEffect(() => {
		if (pathname.startsWith("/products/") || pathname.startsWith("/collections/")) {
			setSearchQuery("");
			setIsSearchFocused(false);
		}
	}, [pathname]);

	const handleSetAllProducts = useCallback((products: ShopifyProduct[]) => {
		if (!Array.isArray(products)) {
			console.warn("[SEARCH] Invalid products data:", products);
			return;
		}

		setAllProducts(products);
		console.log("[SEARCH] Products updated:", {
			count: products.length,
			firstProduct: products[0]?.title,
		});
	}, []);

	const isSearching = useMemo(() => {
		// Don't show search on product/collection pages unless actively searching
		if (pathname.startsWith("/products/") || pathname.startsWith("/collections/")) {
			return searchQuery.length > 0;
		}
		// Otherwise, show search when focused or has query
		return searchQuery.length > 0 || isSearchFocused;
	}, [searchQuery, isSearchFocused, pathname]);

	const searchResults = useMemo(() => {
		const results = searchProducts(allProducts, debouncedQuery);
		console.log("[SEARCH] Results:", {
			query: debouncedQuery,
			total: results.length,
			first: results[0]?.title,
			path: pathname,
		});
		return results;
	}, [allProducts, debouncedQuery, pathname]);

	// Debug logging
	useEffect(() => {
		console.log("[SEARCH] State update:", {
			productsCount: allProducts.length,
			searchQuery,
			isSearching,
			resultsCount: searchResults.length,
			firstProduct: allProducts[0]?.title,
			path: pathname,
		});
	}, [searchQuery, isSearching, searchResults, allProducts, pathname]);

	const value = useMemo(
		() => ({
			searchQuery,
			debouncedQuery,
			setSearchQuery,
			isSearching,
			setIsSearching: setIsSearchFocused,
			searchResults,
			allProducts,
			setAllProducts: handleSetAllProducts,
			totalProducts: allProducts.length,
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
