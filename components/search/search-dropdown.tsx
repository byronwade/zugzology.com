"use client";

import { useSearch } from "@/lib/providers/search-provider";

export function SearchDropdown() {
	const { isDropdownOpen } = useSearch();

	if (!isDropdownOpen) {
		return null;
	}

	return (
		<div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg z-50 p-2">
			<div className="p-4 text-center text-gray-500 dark:text-gray-400">
				<p>Search results will appear here</p>
			</div>
		</div>
	);
}

