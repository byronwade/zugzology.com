"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { aiProductFilter } from "@/lib/services/ai-product-filter";
import type { ShopifyProduct } from "@/lib/types";
import type { FilterContext, ProductRecommendation } from "@/lib/services/ai-product-filter";

export type SortOption = "featured" | "recommended" | "price-asc" | "price-desc" | "title-asc" | "title-desc" | "newest";

interface AIFilters {
	sort: SortOption;
	priceRange?: { min: number; max: number };
	categories?: string[];
	brands?: string[];
}

const defaultFilters: AIFilters = {
	sort: "recommended", // Default to AI recommendations
};

export interface AIFilterResult {
	filteredProducts: ShopifyProduct[];
	aiRecommendations: ProductRecommendation[];
	filters: AIFilters;
	metadata: {
		aiFiltered: boolean;
		strategy: string;
		contextualBoosts: string[];
		relatedProducts: string[];
	};
	updateFilter: (key: string, value: string | number | string[]) => void;
	clearFilters: () => void;
}

/**
 * Enhanced product filters hook that integrates AI-powered product recommendations
 * and intelligent sorting based on user behavior and business metrics.
 */
export function useAIProductFilters(
	initialProducts: ShopifyProduct[],
	context: {
		page: 'collection' | 'search' | 'all-products' | 'home';
		searchQuery?: string;
		collectionHandle?: string;
	}
): AIFilterResult {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Get current filters from URL
	const currentSort = (searchParams.get("sort") as SortOption) || defaultFilters.sort;
	const priceMin = searchParams.get("price_min") ? parseFloat(searchParams.get("price_min")!) : undefined;
	const priceMax = searchParams.get("price_max") ? parseFloat(searchParams.get("price_max")!) : undefined;
	const categories = searchParams.get("categories")?.split(",").filter(Boolean) || [];
	const brands = searchParams.get("brands")?.split(",").filter(Boolean) || [];

	const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>(initialProducts);
	const [aiRecommendations, setAiRecommendations] = useState<ProductRecommendation[]>([]);
	const [filterMetadata, setFilterMetadata] = useState<any>({
		aiFiltered: false,
		strategy: 'standard',
		contextualBoosts: [],
		relatedProducts: []
	});

	// Build filter context for AI system
	const filterContext: FilterContext = useMemo(() => ({
		page: context.page,
		userAppliedFilters: {
			priceRange: priceMin && priceMax ? { min: priceMin, max: priceMax } : undefined,
			categories: categories.length > 0 ? categories : undefined,
			brands: brands.length > 0 ? brands : undefined,
			sortBy: currentSort
		},
		searchQuery: context.searchQuery,
		collectionHandle: context.collectionHandle
	}), [context, currentSort, priceMin, priceMax, categories, brands]);

	// Update URL with new filter values
	const updateFilter = useCallback(
		(key: string, value: string | number | string[]) => {
			const newSearchParams = new URLSearchParams(searchParams.toString());

			if (key === "sort") {
				if (value === "recommended") {
					newSearchParams.delete("sort");
				} else {
					newSearchParams.set("sort", value as string);
				}
			} else if (key === "price_min" || key === "price_max") {
				if (value === 0 || value === "" || value === undefined) {
					newSearchParams.delete(key);
				} else {
					newSearchParams.set(key, value.toString());
				}
			} else if (key === "categories" || key === "brands") {
				if (Array.isArray(value) && value.length > 0) {
					newSearchParams.set(key, value.join(","));
				} else {
					newSearchParams.delete(key);
				}
			}

			// Create clean URL
			const queryString = newSearchParams.toString();
			const newPath = pathname + (queryString ? `?${queryString}` : "");

			router.push(newPath, { scroll: false });
		},
		[router, searchParams, pathname]
	);

	// Clear all filters
	const clearFilters = useCallback(() => {
		router.push(pathname, { scroll: false });
	}, [router, pathname]);

	// Apply AI filtering and sorting
	const applyAIFilters = useCallback(() => {
		if (initialProducts.length === 0) {
			setFilteredProducts([]);
			setAiRecommendations([]);
			return;
		}

		console.log('🎯 [AI Filters] Applying AI filtering:', {
			productsCount: initialProducts.length,
			context: filterContext,
			sort: currentSort
		});

		try {
			// Use AI filtering system if sort is "recommended" or "featured", otherwise use standard sorting
			if (currentSort === "recommended" || currentSort === "featured") {
				const aiResult = aiProductFilter.filterProducts(initialProducts, filterContext, 24);
				
				console.log('🎯 [AI Filters] AI filtering result:', {
					originalCount: initialProducts.length,
					filteredCount: aiResult.products.length,
					strategy: aiResult.appliedStrategy,
					aiFiltered: aiResult.metadata.aiFiltered
				});

				setFilteredProducts(aiResult.products.map(rec => rec.product));
				setAiRecommendations(aiResult.products);
				setFilterMetadata({
					aiFiltered: aiResult.metadata.aiFiltered,
					strategy: aiResult.appliedStrategy,
					contextualBoosts: aiResult.metadata.contextualBoosts,
					relatedProducts: aiResult.metadata.relatedProducts
				});
			} else {
				// Apply standard sorting for non-AI sorts
				let result = [...initialProducts];

				// Apply user filters first (price, category, brand)
				if (priceMin !== undefined || priceMax !== undefined) {
					result = result.filter(product => {
						const price = parseFloat(product.priceRange.minVariantPrice.amount);
						if (priceMin !== undefined && price < priceMin) return false;
						if (priceMax !== undefined && price > priceMax) return false;
						return true;
					});
				}

				if (categories.length > 0) {
					result = result.filter(product => 
						categories.some(category => 
							product.productType.toLowerCase().includes(category.toLowerCase()) ||
							product.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
						)
					);
				}

				if (brands.length > 0) {
					result = result.filter(product => brands.includes(product.vendor));
				}

				// Apply standard sorting
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
						default:
							return 0;
					}
				});

				// Convert to AI recommendation format for consistency
				const standardRecommendations: ProductRecommendation[] = result.map(product => ({
					product,
					score: 0,
					reasons: ["Standard sorting applied"],
					contextualRelevance: 0,
					aiConfidence: 0
				}));

				setFilteredProducts(result);
				setAiRecommendations(standardRecommendations);
				setFilterMetadata({
					aiFiltered: false,
					strategy: `standard-${currentSort}`,
					contextualBoosts: [],
					relatedProducts: []
				});
			}
		} catch (error) {
			console.error('🎯 [AI Filters] Error applying AI filters:', error);
			// Fallback to original products
			setFilteredProducts(initialProducts);
			setAiRecommendations([]);
			setFilterMetadata({
				aiFiltered: false,
				strategy: 'fallback',
				contextualBoosts: [],
				relatedProducts: []
			});
		}
	}, [initialProducts, filterContext, currentSort, priceMin, priceMax, categories, brands]);

	// Apply filters when dependencies change
	useEffect(() => {
		applyAIFilters();
	}, [applyAIFilters]);

	// Listen for user behavior changes to re-filter
	useEffect(() => {
		const handleBehaviorChange = (event: CustomEvent) => {
			console.log('🎯 [AI Filters] User behavior changed, re-filtering:', event.detail);
			// Debounce re-filtering to avoid excessive updates
			setTimeout(() => {
				applyAIFilters();
			}, 1000);
		};

		window.addEventListener('user-behavior-changed', handleBehaviorChange as EventListener);
		
		return () => {
			window.removeEventListener('user-behavior-changed', handleBehaviorChange as EventListener);
		};
	}, [applyAIFilters]);

	return {
		filteredProducts,
		aiRecommendations,
		filters: {
			sort: currentSort,
			priceRange: priceMin && priceMax ? { min: priceMin, max: priceMax } : undefined,
			categories: categories.length > 0 ? categories : undefined,
			brands: brands.length > 0 ? brands : undefined
		},
		metadata: filterMetadata,
		updateFilter,
		clearFilters
	};
}