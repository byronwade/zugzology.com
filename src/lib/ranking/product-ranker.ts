/**
 * Simple, Transparent Product Ranking Algorithm
 *
 * This ranking system provides consistent, predictable product ordering
 * without external dependencies or AI. It uses basic product attributes
 * that any e-commerce store already has.
 */

import type { ShopifyProduct } from "@/lib/types";

export type RankedProduct = ShopifyProduct & {
	rankingScore: number;
	rankingFactors: {
		stockScore: number;
		priceScore: number;
		recencyScore: number;
		featuredBonus: number;
	};
};

export type RankingOptions = {
	/** Boost featured products (via metafield) */
	considerFeatured?: boolean;
	/** Boost recently added products */
	considerRecency?: boolean;
	/** Balance price variety */
	considerPriceTier?: boolean;
	/** Boost in-stock products */
	considerStock?: boolean;
};

const DEFAULT_OPTIONS: RankingOptions = {
	considerFeatured: true,
	considerRecency: true,
	considerPriceTier: true,
	considerStock: true,
};

/**
 * Calculate stock availability score (0-25 points)
 * In-stock products are prioritized
 */
function calculateStockScore(product: ShopifyProduct): number {
	if (!product.availableForSale) {
		return 0;
	}

	const firstVariant = product.variants?.nodes?.[0];
	if (!firstVariant) {
		return 10; // Unknown stock, give moderate score
	}

	const quantity = firstVariant.quantityAvailable || 0;

	// Score based on stock levels
	if (quantity >= 10) return 25; // Well stocked
	if (quantity >= 5) return 20; // Adequate stock
	if (quantity >= 1) return 15; // Low stock
	return 0; // Out of stock
}

/**
 * Calculate price tier score (0-20 points)
 * Promotes variety by giving bonus to mid-range products
 */
function calculatePriceScore(product: ShopifyProduct, allProducts: ShopifyProduct[]): number {
	const price = parseFloat(product.priceRange?.minVariantPrice?.amount || "0");

	if (price === 0) {
		return 0;
	}

	// Calculate price percentiles from all products
	const prices = allProducts
		.map((p) => parseFloat(p.priceRange?.minVariantPrice?.amount || "0"))
		.filter((p) => p > 0)
		.sort((a, b) => a - b);

	if (prices.length === 0) {
		return 10;
	}

	const p25 = prices[Math.floor(prices.length * 0.25)];
	const p75 = prices[Math.floor(prices.length * 0.75)];

	// Mid-range products get the highest score
	if (price >= p25 && price <= p75) {
		return 20; // Sweet spot for variety
	}
	if (price < p25) {
		return 15; // Budget-friendly
	}
	return 12; // Premium
}

/**
 * Calculate recency score (0-20 points)
 * Boost recently added products
 */
function calculateRecencyScore(product: ShopifyProduct): number {
	if (!product.publishedAt) {
		return 0;
	}

	const publishedDate = new Date(product.publishedAt);
	const now = new Date();
	const daysSincePublished = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));

	// Boost products added in last 90 days
	if (daysSincePublished <= 7) return 20; // Very new (1 week)
	if (daysSincePublished <= 30) return 15; // New (1 month)
	if (daysSincePublished <= 90) return 10; // Recent (3 months)
	if (daysSincePublished <= 180) return 5; // Somewhat recent (6 months)
	return 0; // Older products
}

/**
 * Check if product is marked as featured via metafield
 */
function getFeaturedBonus(product: ShopifyProduct): number {
	// Check for featured metafield
	const metafields = (product as any).metafields?.nodes || [];
	const featuredField = metafields.find(
		(m: any) => m.namespace === "custom" && m.key === "featured_rank"
	);

	if (featuredField?.value) {
		const rank = parseInt(featuredField.value, 10);
		if (!isNaN(rank) && rank > 0) {
			// Lower rank number = higher priority (rank 1 is best)
			// Convert to score: rank 1 = 100pts, rank 2 = 90pts, etc.
			return Math.max(100 - (rank - 1) * 10, 0);
		}
	}

	return 0;
}

/**
 * Rank a single product based on multiple factors
 */
export function rankProduct(
	product: ShopifyProduct,
	allProducts: ShopifyProduct[],
	options: RankingOptions = DEFAULT_OPTIONS
): RankedProduct {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	const stockScore = opts.considerStock ? calculateStockScore(product) : 0;
	const priceScore = opts.considerPriceTier ? calculatePriceScore(product, allProducts) : 0;
	const recencyScore = opts.considerRecency ? calculateRecencyScore(product) : 0;
	const featuredBonus = opts.considerFeatured ? getFeaturedBonus(product) : 0;

	// Base score from all factors (max 65 points without featured bonus)
	const baseScore = stockScore + priceScore + recencyScore;

	// Featured bonus can boost any product to the top
	const totalScore = baseScore + featuredBonus;

	return {
		...product,
		rankingScore: totalScore,
		rankingFactors: {
			stockScore,
			priceScore,
			recencyScore,
			featuredBonus,
		},
	};
}

/**
 * Rank multiple products and sort by score
 */
export function rankProducts(
	products: ShopifyProduct[],
	options: RankingOptions = DEFAULT_OPTIONS
): RankedProduct[] {
	const rankedProducts = products.map((product) => rankProduct(product, products, options));

	// Sort by ranking score (highest first)
	return rankedProducts.sort((a, b) => b.rankingScore - a.rankingScore);
}

/**
 * Get related products using simple tag/type matching
 * Much simpler than AI-based recommendations
 */
export function getRelatedProducts(
	currentProduct: ShopifyProduct,
	allProducts: ShopifyProduct[],
	limit = 8
): ShopifyProduct[] {
	const currentTags = new Set(currentProduct.tags || []);
	const currentType = currentProduct.productType;

	// Score products by similarity
	const scoredProducts = allProducts
		.filter((p) => p.id !== currentProduct.id) // Exclude current product
		.map((product) => {
			let score = 0;

			// Same product type is worth a lot
			if (product.productType === currentType) {
				score += 50;
			}

			// Count matching tags
			const matchingTags = (product.tags || []).filter((tag) => currentTags.has(tag));
			score += matchingTags.length * 10;

			return { product, score };
		})
		.filter((item) => item.score > 0) // Only keep products with some similarity
		.sort((a, b) => b.score - a.score);

	return scoredProducts.slice(0, limit).map((item) => item.product);
}

/**
 * Get "frequently bought together" products
 * Based on collection overlap (simple but effective)
 */
export function getFrequentlyBoughtTogether(
	currentProduct: ShopifyProduct,
	allProducts: ShopifyProduct[],
	limit = 4
): ShopifyProduct[] {
	// This would ideally use actual purchase data from Shopify
	// For now, use tag overlap as a proxy
	return getRelatedProducts(currentProduct, allProducts, limit);
}

/**
 * Filter products by collection handle
 */
export function filterByCollection(products: ShopifyProduct[], collectionHandle: string): ShopifyProduct[] {
	// In a real implementation, you'd check if product is in the collection
	// For now, return all products (collections are fetched separately in Shopify)
	return products;
}

/**
 * Apply simple text search to products
 */
export function searchProducts(products: ShopifyProduct[], query: string): ShopifyProduct[] {
	const lowerQuery = query.toLowerCase();

	return products.filter((product) => {
		const titleMatch = product.title.toLowerCase().includes(lowerQuery);
		const descMatch = product.description?.toLowerCase().includes(lowerQuery);
		const tagMatch = product.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));

		return titleMatch || descMatch || tagMatch;
	});
}
