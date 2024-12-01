"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FilterState } from "./filter-content";

const DEFAULT_FILTERS = {
	sort: "featured",
	availability: "all",
	price: "all",
	category: [] as string[],
} as const;

export function useFilters() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [filters, setFilters] = useState<FilterState>(() => ({
		sort: searchParams.get("sort") || DEFAULT_FILTERS.sort,
		availability: searchParams.get("availability") || DEFAULT_FILTERS.availability,
		price: searchParams.get("price") || DEFAULT_FILTERS.price,
		category: searchParams.get("category")?.split(",").filter(Boolean) || [],
	}));

	// Update URL when filters change
	useEffect(() => {
		const params = new URLSearchParams(searchParams.toString());

		Object.entries(filters).forEach(([key, value]) => {
			if (Array.isArray(value)) {
				if (value.length > 0) {
					params.set(key, value.join(","));
				} else {
					params.delete(key);
				}
			} else if (value && value !== DEFAULT_FILTERS[key as keyof typeof DEFAULT_FILTERS]) {
				params.set(key, value.toString());
			} else {
				params.delete(key);
			}
		});

		router.replace(`?${params.toString()}`, { scroll: false });
	}, [filters, router, searchParams]);

	const handleFilterChange = useCallback((key: keyof FilterState, value: string | string[]) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
	}, []);

	const clearFilters = useCallback(() => {
		setFilters(DEFAULT_FILTERS);
	}, []);

	const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
		if (Array.isArray(value)) {
			return value.length > 0;
		}
		return value !== DEFAULT_FILTERS[key as keyof typeof DEFAULT_FILTERS];
	});

	return {
		filters,
		hasActiveFilters,
		handleFilterChange,
		clearFilters,
	};
}
