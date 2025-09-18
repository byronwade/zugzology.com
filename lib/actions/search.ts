import { getProducts } from "@/lib/actions/shopify";

/**
 * Get search results with caching
 */
export async function getSearchData(query: string, sort = "featured", page = 1) {
	 // No semicolon to avoid formatter issues

	if (!query || typeof query !== "string") {
		return { products: [], totalProducts: 0 };
	}

	const startTime = performance.now();

	const products = await getProducts();
	const searchTerms = query.toLowerCase().split(/\s+/);
	const searchCache = new Map<string, boolean>();

	// Filter products
	let filteredProducts = products.filter((product) => {
		const cacheKey = `${product.id}-${query}`;
		const cachedResult = searchCache.get(cacheKey);

		if (cachedResult !== undefined) {
			return cachedResult;
		}

		const searchableText = [product.title, product.productType, product.vendor, ...(product.tags || [])].filter(Boolean).join(" ").toLowerCase();

		const basicMatch = searchTerms.every((term) => searchableText.includes(term));
		const result = basicMatch || (product.description && searchTerms.every((term) => product.description?.toLowerCase().includes(term)));

		searchCache.set(cacheKey, Boolean(result));
		return result;
	});

	// Apply sorting if not featured
	if (sort && sort !== "featured") {
		filteredProducts.sort((a, b) => {
			switch (sort) {
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
	}

	const duration = performance.now() - startTime;
	if (duration > 100) {
		console.log(`⚡ [Search Data] ${duration.toFixed(2)}ms | Results: ${filteredProducts.length}`);
	}

	// Apply pagination
	const PRODUCTS_PER_PAGE = 50;
	const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
	const endIndex = startIndex + PRODUCTS_PER_PAGE;
	const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

	return {
		products: paginatedProducts,
		totalProducts: filteredProducts.length,
	};
}
