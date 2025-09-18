"use client";

import { useSearch } from "@/components/providers";
import AISearchSuggestions from "@/components/ai/ai-search-suggestions";
import { useAIPredictionStore } from "@/stores/ai-prediction-store";
import { useEffect, useRef } from "react";

export function SearchDropdown() {
	const { isDropdownOpen, query, setQuery } = useSearch();
	const { trackInteraction } = useAIPredictionStore();
	const lastTrackedQuery = useRef<string>("");

	// Track search queries
	useEffect(() => {
		if (query && query.length >= 2 && query !== lastTrackedQuery.current) {
			trackInteraction({
				productId: 'search', // Using 'search' as a special product ID for search queries
				type: 'view', // Using 'view' type for search activity
				context: 'search',
				metadata: {
					searchQuery: query,
					queryLength: query.length
				}
			});
			lastTrackedQuery.current = query;
		}
	}, [query, trackInteraction]);

	if (!isDropdownOpen) {
		return null;
	}

	return (
		<div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg z-50">
			{query ? (
				<AISearchSuggestions 
					query={query}
					onSuggestionClick={(suggestion) => setQuery(suggestion)}
					className="border-0 shadow-none rounded-md"
				/>
			) : (
				<div className="p-4 text-center text-gray-500 dark:text-gray-400">
					<p>Start typing to see AI-powered suggestions</p>
				</div>
			)}
		</div>
	);
}

