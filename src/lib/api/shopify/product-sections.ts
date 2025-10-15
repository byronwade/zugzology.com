"use server";

import { cache } from "react";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/types";
import { getAllCollections } from "./actions";
import {
	getCachedBestSellers,
	getCachedSaleProducts,
	getCachedLatestProducts,
	getCachedSameCategoryProducts,
	getCachedSimilarTagProducts,
	getCachedRandomProducts,
} from "./product-cache";

/**
 * Section data fetchers for product pages
 * Now uses shared product cache manager for optimal performance
 */

// Get best selling products
export const getBestSellers = async (limit = 8): Promise<ShopifyProduct[]> => {
	try {
		return await getCachedBestSellers(limit);
	} catch {
		return [];
	}
};

// Get products on sale
export const getSaleProducts = async (limit = 8): Promise<ShopifyProduct[]> => {
	try {
		return await getCachedSaleProducts(limit);
	} catch {
		return [];
	}
};

// Get latest products
export const getLatestProducts = async (limit = 8): Promise<ShopifyProduct[]> => {
	try {
		return await getCachedLatestProducts(limit);
	} catch {
		return [];
	}
};

// Get products from the same category
export const getSameCategoryProducts = async (
	productType: string,
	currentProductId: string,
	limit = 8
): Promise<ShopifyProduct[]> => {
	try {
		return await getCachedSameCategoryProducts(productType, currentProductId, limit);
	} catch {
		return [];
	}
};

// Get products with similar tags
export const getSimilarTagProducts = async (
	tags: string[],
	currentProductId: string,
	limit = 8
): Promise<ShopifyProduct[]> => {
	try {
		return await getCachedSimilarTagProducts(tags, currentProductId, limit);
	} catch {
		return [];
	}
};

// Get featured collections (kept with cache wrapper for now)
export const getFeaturedCollections = cache(async (limit = 4): Promise<ShopifyCollection[]> => {
	try {
		const collections = await getAllCollections();
		return collections
			.filter((c) => c.products?.nodes && c.products.nodes.length > 0)
			.slice(0, limit);
	} catch {
		return [];
	}
});

// Get products from a specific collection (kept with cache wrapper for now)
export const getCollectionProducts = cache(
	async (collectionHandle: string, currentProductId: string, limit = 8): Promise<ShopifyProduct[]> => {
		if (!collectionHandle) return [];

		try {
			const collections = await getAllCollections();
			const collection = collections.find((c) => c.handle === collectionHandle);

			if (!collection?.products?.nodes) return [];

			return collection.products.nodes
				.filter((p) => p.id !== currentProductId)
				.slice(0, limit);
		} catch {
			return [];
		}
	}
);

// Get random products as final fallback
export const getRandomProducts = async (currentProductId: string, limit = 8): Promise<ShopifyProduct[]> => {
	try {
		return await getCachedRandomProducts(currentProductId, limit);
	} catch {
		return [];
	}
};

/**
 * Section type definition
 */
export type ProductSection = {
	id: string;
	title: string;
	description: string;
	products?: ShopifyProduct[];
	collections?: ShopifyCollection[];
	type: "products" | "collections";
	priority: number;
};

/**
 * Fetch all potential sections for a product
 * Returns an array of section data
 */
export async function getProductSections(
	product: ShopifyProduct,
	relatedProducts: ShopifyProduct[]
): Promise<ProductSection[]> {
	const sections: ProductSection[] = [];

	// Extract product collection if available
	const productCollection = product.collections?.nodes?.[0]?.handle || "";

	// Fetch all section data in parallel
	const [
		bestSellers,
		saleProducts,
		latestProducts,
		sameCategoryProducts,
		similarTagProducts,
		featuredCollections,
		collectionProducts,
		randomProducts,
	] = await Promise.all([
		getBestSellers(8),
		getSaleProducts(8),
		getLatestProducts(8),
		getSameCategoryProducts(product.productType || "", product.id, 8),
		getSimilarTagProducts(product.tags || [], product.id, 8),
		getFeaturedCollections(4),
		getCollectionProducts(productCollection, product.id, 8),
		getRandomProducts(product.id, 8),
	]);

	// Priority 1: Related Products (from recommendations)
	if (relatedProducts?.length > 0) {
		sections.push({
			id: "related-products",
			title: "You May Also Like",
			description: "Products similar to this one",
			products: relatedProducts,
			type: "products",
			priority: 1,
		});
	}

	// Priority 2: Best Sellers
	if (bestSellers.length > 0) {
		sections.push({
			id: "best-sellers",
			title: "Best Sellers",
			description: "Our most popular products",
			products: bestSellers,
			type: "products",
			priority: 2,
		});
	}

	// Priority 3: Sale Products
	if (saleProducts.length > 0) {
		sections.push({
			id: "sale-products",
			title: "On Sale Now",
			description: "Limited time offers",
			products: saleProducts,
			type: "products",
			priority: 3,
		});
	}

	// Priority 4: Latest Products
	if (latestProducts.length > 0) {
		sections.push({
			id: "latest-products",
			title: "New Arrivals",
			description: "Check out our newest products",
			products: latestProducts,
			type: "products",
			priority: 4,
		});
	}

	// Priority 5: Same Category
	if (sameCategoryProducts.length > 0) {
		sections.push({
			id: "same-category",
			title: `More ${product.productType}`,
			description: `Explore other ${product.productType} products`,
			products: sameCategoryProducts,
			type: "products",
			priority: 5,
		});
	}

	// Priority 6: Collection Products
	if (collectionProducts.length > 0) {
		sections.push({
			id: "collection-products",
			title: "From This Collection",
			description: "More products from the same collection",
			products: collectionProducts,
			type: "products",
			priority: 6,
		});
	}

	// Priority 7: Featured Collections
	if (featuredCollections.length > 0) {
		sections.push({
			id: "featured-collections",
			title: "Shop by Category",
			description: "Explore our collections",
			collections: featuredCollections,
			type: "collections",
			priority: 7,
		});
	}

	// Priority 8: Similar Tags
	if (similarTagProducts.length > 0) {
		sections.push({
			id: "similar-tags",
			title: "Similar Products",
			description: "Products with similar features",
			products: similarTagProducts,
			type: "products",
			priority: 8,
		});
	}

	// Priority 9: Random Products (final fallback)
	if (randomProducts.length > 0) {
		sections.push({
			id: "random-products",
			title: "You Might Also Like",
			description: "Discover more products",
			products: randomProducts,
			type: "products",
			priority: 9,
		});
	}

	return sections;
}

/**
 * Get exactly 6 sections to display
 * Filters empty sections and returns top 6 by priority
 */
export async function getTop6Sections(
	product: ShopifyProduct,
	relatedProducts: ShopifyProduct[]
): Promise<ProductSection[]> {
	const allSections = await getProductSections(product, relatedProducts);

	// Filter out empty sections and sort by priority
	const validSections = allSections
		.filter((section) => {
			if (section.type === "products") {
				return section.products && section.products.length > 0;
			}
			return section.collections && section.collections.length > 0;
		})
		.sort((a, b) => a.priority - b.priority);

	// Return top 6 sections
	return validSections.slice(0, 6);
}
