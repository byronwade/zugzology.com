"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { ShopifyProduct } from "@/lib/types";
import {
	applyFilters,
	countActiveFilters,
	deserializeFilters,
	extractFilterOptions,
	getDefaultFilterState,
	serializeFilters,
	type FilterOptions,
	type FilterState,
} from "@/lib/utils/filter-utils";

export function useProductFiltering(products: ShopifyProduct[]) {
	const searchParams = useSearchParams();

	// Extract available filter options from products
	const filterOptions = useMemo(() => extractFilterOptions(products), [products]);

	// Get default filter state
	const defaultFilters = useMemo(() => getDefaultFilterState(filterOptions), [filterOptions]);

	// Initialize filters from URL or defaults
	const [filters, setFilters] = useState<FilterState>(() => deserializeFilters(searchParams, defaultFilters));

	// Apply filters to products
	const filteredProducts = useMemo(() => applyFilters(products, filters), [products, filters]);

	// Count active filters
	const activeFilterCount = useMemo(() => countActiveFilters(filters, defaultFilters), [filters, defaultFilters]);

	// Update URL with new filters (without page navigation)
	const updateUrl = useCallback(
		(newFilters: FilterState) => {
			if (typeof window === "undefined") return;

			const params = serializeFilters(newFilters, defaultFilters);
			const currentParams = new URLSearchParams(searchParams.toString());

			// Preserve existing params like sort
			const sort = currentParams.get("sort");
			if (sort) params.set("sort", sort);

			// Reset to page 1 when filters change
			params.delete("page");

			// Update URL without navigation - instant update!
			const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
			window.history.replaceState({}, "", newUrl);
		},
		[searchParams, defaultFilters]
	);

	// Update price range filter
	const updatePriceRange = useCallback(
		(min: number, max: number) => {
			const newFilters = {
				...filters,
				priceRange: { min, max },
			};
			setFilters(newFilters);
			updateUrl(newFilters);
		},
		[filters, updateUrl]
	);

	// Update availability filter
	const updateAvailability = useCallback(
		(availability: FilterState["availability"]) => {
			const newFilters = {
				...filters,
				availability,
			};
			setFilters(newFilters);
			updateUrl(newFilters);
		},
		[filters, updateUrl]
	);

	// Toggle array filter (product types, vendors, tags, collections)
	const toggleArrayFilter = useCallback(
		(filterKey: "productTypes" | "vendors" | "tags" | "collections", value: string) => {
			const currentValues = filters[filterKey];
			const newValues = currentValues.includes(value)
				? currentValues.filter((v) => v !== value)
				: [...currentValues, value];

			const newFilters = {
				...filters,
				[filterKey]: newValues,
			};
			setFilters(newFilters);
			updateUrl(newFilters);
		},
		[filters, updateUrl]
	);

	// Clear all filters
	const clearFilters = useCallback(() => {
		setFilters(defaultFilters);
		updateUrl(defaultFilters);
	}, [defaultFilters, updateUrl]);

	// Clear specific filter
	const clearFilter = useCallback(
		(filterKey: keyof FilterState) => {
			let newFilters: FilterState;

			if (filterKey === "priceRange") {
				newFilters = {
					...filters,
					priceRange: defaultFilters.priceRange,
				};
			} else if (filterKey === "availability") {
				newFilters = {
					...filters,
					availability: "all",
				};
			} else {
				newFilters = {
					...filters,
					[filterKey]: [],
				};
			}

			setFilters(newFilters);
			updateUrl(newFilters);
		},
		[filters, defaultFilters, updateUrl]
	);

	return {
		filters,
		filterOptions,
		defaultFilters,
		filteredProducts,
		activeFilterCount,
		updatePriceRange,
		updateAvailability,
		toggleArrayFilter,
		clearFilters,
		clearFilter,
	};
}
