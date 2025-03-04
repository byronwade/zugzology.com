"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface SearchContextType {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	isSearching: boolean;
	setIsSearching: (isSearching: boolean) => void;
	isDropdownOpen: boolean;
	setIsDropdownOpen: (isOpen: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	return (
		<SearchContext.Provider
			value={{
				searchQuery,
				setSearchQuery,
				isSearching,
				setIsSearching,
				isDropdownOpen,
				setIsDropdownOpen,
			}}
		>
			{children}
		</SearchContext.Provider>
	);
}

export function useSearch(): SearchContextType {
	const context = useContext(SearchContext);
	if (context === undefined) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return context;
} 