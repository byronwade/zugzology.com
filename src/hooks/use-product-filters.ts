import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { ShopifyProduct } from "@/lib/types";

export type SortOption = "featured" | "price-asc" | "price-desc" | "title-asc" | "title-desc" | "newest";

type Filters = {
	sort: SortOption;
};

const defaultFilters: Filters = {
	sort: "featured",
};

/**
 * Hook for filtering and sorting products.
 *
 * IMPORTANT: This hook uses useSearchParams, so any component using it must be wrapped in a Suspense boundary:
 *
 * ```tsx
 * import { Suspense } from "react";
 *
 * function ProductsPage() {
 *   return (
 *     <Suspense fallback={<div>Loading...</div>}>
 *       <ProductsContent />
 *     </Suspense>
 *   );
 * }
 *
 * function ProductsContent() {
 *   const { filteredProducts, filters, updateFilter } = useProductFilters(products);
 *   // ...
 * }
 * ```
 */
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
		const result = [...initialProducts];

		// Apply sorting
		result.sort((a, b) => {
			switch (currentSort) {
				case "price-asc":
					return (
						Number.parseFloat(a.priceRange.minVariantPrice.amount) -
						Number.parseFloat(b.priceRange.minVariantPrice.amount)
					);
				case "price-desc":
					return (
						Number.parseFloat(b.priceRange.minVariantPrice.amount) -
						Number.parseFloat(a.priceRange.minVariantPrice.amount)
					);
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
