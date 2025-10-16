import type { ShopifyProduct } from "@/lib/types";

export type FilterState = {
	priceRange: {
		min: number;
		max: number;
	};
	availability: "all" | "in-stock" | "out-of-stock";
	productTypes: string[];
	vendors: string[];
	tags: string[];
	collections: string[];
};

export type FilterOptions = {
	priceRange: {
		min: number;
		max: number;
	};
	productTypes: string[];
	vendors: string[];
	tags: string[];
	collections: string[];
};

/**
 * Extract unique filter options from products
 */
export function extractFilterOptions(products: ShopifyProduct[]): FilterOptions {
	const productTypes = new Set<string>();
	const vendors = new Set<string>();
	const tags = new Set<string>();
	const collections = new Set<string>();
	let minPrice = Number.POSITIVE_INFINITY;
	let maxPrice = 0;

	products.forEach((product) => {
		// Extract product type
		if (product.productType) {
			productTypes.add(product.productType);
		}

		// Extract vendor
		if (product.vendor) {
			vendors.add(product.vendor);
		}

		// Extract tags (filter out internal tags starting with __)
		if (product.tags) {
			product.tags.forEach((tag) => {
				if (!tag.startsWith("__")) {
					tags.add(tag);
				}
			});
		}

		// Extract collections
		if (product.collections?.edges) {
			product.collections.edges.forEach((edge) => {
				collections.add(edge.node.handle);
			});
		}

		// Calculate price range
		const price = Number.parseFloat(product.priceRange.minVariantPrice.amount);
		if (price < minPrice) {
			minPrice = price;
		}
		if (price > maxPrice) {
			maxPrice = price;
		}
	});

	return {
		priceRange: {
			min: minPrice === Number.POSITIVE_INFINITY ? 0 : Math.floor(minPrice),
			max: maxPrice === 0 ? 100 : Math.ceil(maxPrice),
		},
		productTypes: Array.from(productTypes).sort(),
		vendors: Array.from(vendors).sort(),
		tags: Array.from(tags).sort(),
		collections: Array.from(collections).sort(),
	};
}

// Cache for parsed prices and collections (WeakMap for automatic garbage collection)
const priceCache = new WeakMap<ShopifyProduct, number>();
const collectionsCache = new WeakMap<ShopifyProduct, string[]>();

/**
 * Get cached price for a product
 */
function getProductPrice(product: ShopifyProduct): number {
	let price = priceCache.get(product);
	if (price === undefined) {
		price = Number.parseFloat(product.priceRange.minVariantPrice.amount);
		priceCache.set(product, price);
	}
	return price;
}

/**
 * Get cached collections for a product
 */
function getProductCollections(product: ShopifyProduct): string[] {
	let collections = collectionsCache.get(product);
	if (collections === undefined) {
		collections = product.collections?.edges.map((edge) => edge.node.handle) || [];
		collectionsCache.set(product, collections);
	}
	return collections;
}

/**
 * Apply filters to products - OPTIMIZED VERSION
 */
export function applyFilters(products: ShopifyProduct[], filters: FilterState): ShopifyProduct[] {
	// Early return if no filters active
	const hasFilters =
		filters.priceRange.min !== 0 ||
		filters.availability !== "all" ||
		filters.productTypes.length > 0 ||
		filters.vendors.length > 0 ||
		filters.tags.length > 0 ||
		filters.collections.length > 0;

	if (!hasFilters) {
		return products;
	}

	// Convert arrays to Sets for O(1) lookup instead of O(n)
	const productTypesSet = filters.productTypes.length > 0 ? new Set(filters.productTypes) : null;
	const vendorsSet = filters.vendors.length > 0 ? new Set(filters.vendors) : null;
	const tagsSet = filters.tags.length > 0 ? new Set(filters.tags) : null;
	const collectionsSet = filters.collections.length > 0 ? new Set(filters.collections) : null;

	return products.filter((product) => {
		// Price filter - using cached price
		const price = getProductPrice(product);
		if (price < filters.priceRange.min || price > filters.priceRange.max) {
			return false;
		}

		// Availability filter - fastest check first
		if (filters.availability === "in-stock" && !product.availableForSale) {
			return false;
		}
		if (filters.availability === "out-of-stock" && product.availableForSale) {
			return false;
		}

		// Product type filter - O(1) Set lookup
		if (productTypesSet && !productTypesSet.has(product.productType)) {
			return false;
		}

		// Vendor filter - O(1) Set lookup
		if (vendorsSet && !vendorsSet.has(product.vendor)) {
			return false;
		}

		// Tags filter - O(1) Set lookup
		if (tagsSet && product.tags) {
			const hasTag = product.tags.some((tag) => tagsSet.has(tag));
			if (!hasTag) {
				return false;
			}
		}

		// Collections filter - using cached collections with O(1) Set lookup
		if (collectionsSet) {
			const productCollections = getProductCollections(product);
			const hasCollection = productCollections.some((collection) => collectionsSet.has(collection));
			if (!hasCollection) {
				return false;
			}
		}

		return true;
	});
}

/**
 * Get default filter state from options
 */
export function getDefaultFilterState(options: FilterOptions): FilterState {
	return {
		priceRange: {
			min: options.priceRange.min,
			max: options.priceRange.max,
		},
		availability: "all",
		productTypes: [],
		vendors: [],
		tags: [],
		collections: [],
	};
}

/**
 * Count active filters
 */
export function countActiveFilters(filters: FilterState, defaultFilters: FilterState): number {
	let count = 0;

	// Check price range
	if (
		filters.priceRange.min !== defaultFilters.priceRange.min ||
		filters.priceRange.max !== defaultFilters.priceRange.max
	) {
		count++;
	}

	// Check availability
	if (filters.availability !== "all") {
		count++;
	}

	// Check array filters
	count += filters.productTypes.length;
	count += filters.vendors.length;
	count += filters.tags.length;
	count += filters.collections.length;

	return count;
}

/**
 * Serialize filters to URL search params
 */
export function serializeFilters(filters: FilterState, defaultFilters: FilterState): URLSearchParams {
	const params = new URLSearchParams();

	// Price range
	if (filters.priceRange.min !== defaultFilters.priceRange.min) {
		params.set("minPrice", filters.priceRange.min.toString());
	}
	if (filters.priceRange.max !== defaultFilters.priceRange.max) {
		params.set("maxPrice", filters.priceRange.max.toString());
	}

	// Availability
	if (filters.availability !== "all") {
		params.set("availability", filters.availability);
	}

	// Array filters
	if (filters.productTypes.length > 0) {
		params.set("types", filters.productTypes.join(","));
	}
	if (filters.vendors.length > 0) {
		params.set("vendors", filters.vendors.join(","));
	}
	if (filters.tags.length > 0) {
		params.set("tags", filters.tags.join(","));
	}
	if (filters.collections.length > 0) {
		params.set("collections", filters.collections.join(","));
	}

	return params;
}

/**
 * Deserialize filters from URL search params
 */
export function deserializeFilters(searchParams: URLSearchParams, defaultFilters: FilterState): FilterState {
	return {
		priceRange: {
			min: Number.parseInt(searchParams.get("minPrice") || defaultFilters.priceRange.min.toString(), 10),
			max: Number.parseInt(searchParams.get("maxPrice") || defaultFilters.priceRange.max.toString(), 10),
		},
		availability: (searchParams.get("availability") as FilterState["availability"]) || "all",
		productTypes: searchParams.get("types")?.split(",").filter(Boolean) || [],
		vendors: searchParams.get("vendors")?.split(",").filter(Boolean) || [],
		tags: searchParams.get("tags")?.split(",").filter(Boolean) || [],
		collections: searchParams.get("collections")?.split(",").filter(Boolean) || [],
	};
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currencyCode = "USD"): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currencyCode,
	}).format(amount);
}
