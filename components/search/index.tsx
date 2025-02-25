"use client";

import React from "react";
import { SearchDropdown } from "./search-dropdown";
import { SearchResults as SearchOverlay } from "./search-overlay";
export { InitializeSearch } from "./initialize-search";

export function Search() {
	return <SearchDropdown />;
}

export { SearchOverlay, SearchDropdown };
