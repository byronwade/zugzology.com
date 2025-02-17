import React from "react";
import { ShopifyProduct } from "@/lib/types";
import { ProductSection } from "./recommendations/product-section";
import { calculateTrendingScore } from "./recommendations/utils/tracking";
import type { ProductWithSource, RecommendationSection } from "./recommendations/types";

interface HistoryRecommendationsProps {
	products: ShopifyProduct[]; // History products
	recommendedProducts?: ShopifyProduct[]; // Optional recommended products
	randomProducts?: ShopifyProduct[]; // Optional random products
	currentProductId: string;
}

export function HistoryRecommendations({ products, recommendedProducts = [], randomProducts = [], currentProductId }: HistoryRecommendationsProps) {
	// Filter out current product and create unique product sets
	const filterCurrentProduct = (p: ShopifyProduct) => p.id !== currentProductId;
	const isUnique = (product: ShopifyProduct, existingProducts: Set<string>) => {
		if (existingProducts.has(product.id)) return false;
		existingProducts.add(product.id);
		return true;
	};

	const usedProductIds = new Set<string>();

	// Helper to ensure minimum products and respect mobile limits
	const ensureMinimumProducts = (inputProducts: ShopifyProduct[], minCount: number = 6) => {
		// For mobile, we want to limit to 4 items per section
		const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
		const maxItems = isMobile ? 4 : 12;
		const targetCount = isMobile ? Math.min(4, minCount) : minCount;

		if (inputProducts.length >= targetCount) return inputProducts.slice(0, maxItems);

		const needed = targetCount - inputProducts.length;
		const additionalProducts = randomProducts
			.filter(filterCurrentProduct)
			.filter((p: ShopifyProduct) => !inputProducts.some((existing) => existing.id === p.id))
			.slice(0, needed);

		return [...inputProducts, ...additionalProducts].slice(0, maxItems);
	};

	// Prepare different product sections with unique products, ordered by conversion potential
	const sections: RecommendationSection[] = [
		{
			id: "trending",
			title: "Trending Now",
			description: "Most popular products our customers love",
			priority: 1,
			products: [...recommendedProducts, ...randomProducts]
				.filter(filterCurrentProduct)
				.filter((p) => isUnique(p, usedProductIds))
				.map((product) => ({
					product,
					score: calculateTrendingScore(product),
				}))
				.sort((a, b) => b.score - a.score)
				.slice(0, typeof window !== "undefined" && window.innerWidth < 640 ? 4 : 12)
				.map(({ product }) => ({
					product,
					source: "trending" as const,
					sectionId: "trending",
				})),
		},
		{
			id: "recently-viewed",
			title: "Recently Viewed",
			description: "Continue exploring products you've shown interest in",
			priority: 2,
			products: products
				.filter(filterCurrentProduct)
				.filter((p) => isUnique(p, usedProductIds))
				.slice(0, typeof window !== "undefined" && window.innerWidth < 640 ? 4 : 12)
				.map((p) => ({ product: p, source: "history" as const, sectionId: "recently-viewed" })),
		},
		{
			id: "recommended",
			title: "Recommended For You",
			description: "Personalized picks based on your shopping preferences",
			priority: 3,
			products: recommendedProducts
				.filter(filterCurrentProduct)
				.filter((p) => isUnique(p, usedProductIds))
				.slice(0, typeof window !== "undefined" && window.innerWidth < 640 ? 4 : 12)
				.map((p) => ({ product: p, source: "recommended" as const, sectionId: "recommended" })),
		},
		{
			id: "related",
			title: "You May Also Like",
			description: "Similar products you might be interested in",
			priority: 4,
			products: randomProducts
				.filter(filterCurrentProduct)
				.filter((p) => isUnique(p, usedProductIds))
				.slice(0, typeof window !== "undefined" && window.innerWidth < 640 ? 4 : 12)
				.map((p) => ({ product: p, source: "related" as const, sectionId: "related" })),
		},
	];

	// Process sections to ensure minimum products and filter empty sections
	const processedSections = sections
		.map((section) => ({
			...section,
			products:
				section.products.length > 0
					? section.products
					: section.id === "related"
					? randomProducts
							.filter(filterCurrentProduct)
							.filter((p) => isUnique(p, usedProductIds))
							.slice(0, typeof window !== "undefined" && window.innerWidth < 640 ? 4 : 12)
							.map((p) => ({ product: p, source: "related" as const, sectionId: "related" }))
					: [],
		}))
		.map((section) => ({
			...section,
			products: ensureMinimumProducts(section.products.map((p) => p.product)).map((p) => ({
				product: p,
				source: section.products[0]?.source || ("related" as const),
				sectionId: section.id,
			})),
		}))
		.filter((section) => section.products.length >= (typeof window !== "undefined" && window.innerWidth < 640 ? 2 : 6))
		.sort((a, b) => a.priority - b.priority);

	// Ensure we have at least one section with minimum products
	if (processedSections.length === 0) {
		const minProducts = typeof window !== "undefined" && window.innerWidth < 640 ? 2 : 6;
		const fallbackProducts = ensureMinimumProducts(randomProducts.filter(filterCurrentProduct));
		if (fallbackProducts.length >= minProducts) {
			processedSections.push({
				id: "discover",
				title: "Discover More",
				description: "Products you might be interested in",
				priority: 999,
				products: fallbackProducts.map((p) => ({
					product: p,
					source: "related" as const,
					sectionId: "discover",
				})),
			});
		}
	}

	if (processedSections.length === 0) return null;

	return (
		<section className="w-full space-y-16" itemScope itemType="https://schema.org/ItemList" aria-label="Product recommendations">
			<meta itemProp="name" content="Product Recommendations" />
			<meta itemProp="description" content="Personalized product recommendations based on your browsing history and preferences" />
			<meta itemProp="numberOfItems" content={String(processedSections.reduce((sum, section) => sum + section.products.length, 0))} />

			{processedSections.map((section, index) => (
				<div key={section.id} itemProp="itemListElement" itemScope itemType="https://schema.org/ItemList">
					<meta itemProp="name" content={section.title} />
					<meta itemProp="description" content={section.description} />
					<meta itemProp="position" content={String(index + 1)} />
					<ProductSection title={section.title} description={section.description} products={section.products} sectionId={section.id} currentProductId={currentProductId} />
				</div>
			))}
		</section>
	);
}
