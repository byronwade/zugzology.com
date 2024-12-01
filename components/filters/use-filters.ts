"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Filters {
	sort?: string;
	[key: string]: string | undefined;
}

export function useFilters() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	const filters: Filters = {
		sort: searchParams?.get("sort") || undefined,
	};

	// Add any additional filter parameters here
	["category", "price", "availability"].forEach((param) => {
		const value = searchParams?.get(param);
		if (value) filters[param] = value;
	});

	const hasActiveFilters = Object.values(filters).some(Boolean);

	const handleFilterChange = useCallback(
		(key: string, value: string | null) => {
			const params = new URLSearchParams(searchParams?.toString());

			if (value) {
				params.set(key, value);
			} else {
				params.delete(key);
			}

			startTransition(() => {
				router.push(`?${params.toString()}`, { scroll: false });
			});
		},
		[router, searchParams]
	);

	const clearFilters = useCallback(() => {
		startTransition(() => {
			router.push("", { scroll: false });
		});
	}, [router]);

	return {
		filters,
		hasActiveFilters,
		handleFilterChange,
		clearFilters,
		isPending,
	};
}
