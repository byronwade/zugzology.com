import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ShopifyProduct } from "@/lib/types";

export type SortOption = "featured" | "price-asc" | "price-desc" | "title-asc" | "title-desc" | "newest";

interface Filters {
	sort: SortOption;
}

const defaultFilters: Filters = {
	sort: "featured",
};

export function useProductFilters(initialProducts: ShopifyProduct[]) {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Get current sort value from URL
	const currentSort = (searchParams.get("sort") as SortOption) || defaultFilters.sort;

	const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>(initialProducts);

	// Update URL with new sort value
	const updateFilter = useCallback(
		(key: string, value: string) => {
			const newSearchParams = new URLSearchParams(searchParams.toString());

			if (value === "featured") {
				newSearchParams.delete(key);
			} else {
				newSearchParams.set(key, value);
			}

			// Create clean URL without empty params
			const queryString = newSearchParams.toString();
			const newPath = queryString ? `?${queryString}` : window.location.pathname;

			router.push(newPath, { scroll: false });
		},
		[router, searchParams]
	);

	const applySort = useCallback(() => {
		let result = [...initialProducts];

		// Apply sorting
		result.sort((a, b) => {
			switch (currentSort) {
				case "price-asc":
					return parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount);
				case "price-desc":
					return parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount);
				case "title-asc":
					return a.title.localeCompare(b.title);
				case "title-desc":
					return b.title.localeCompare(a.title);
				case "newest":
					return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
				default: // featured
					return 0;
			}
		});

		setFilteredProducts(result);
	}, [initialProducts, currentSort]);

	useEffect(() => {
		applySort();
	}, [applySort]);

	return {
		filters: {
			sort: currentSort,
		},
		filteredProducts,
		updateFilter,
	};
}
