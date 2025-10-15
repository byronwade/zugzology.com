import type { ShopifyProduct } from "@/lib/types";
import { ProductSection } from "./recommendations/product-section";
import type { RecommendationSection } from "./recommendations/types";
import { calculateTrendingScore } from "./recommendations/utils/tracking";

type HistoryRecommendationsProps = {
	products: ShopifyProduct[]; // History products
	recommendedProducts?: ShopifyProduct[]; // Optional recommended products
	randomProducts?: ShopifyProduct[]; // Optional random products
	currentProductId?: string;
};

export function HistoryRecommendations({
	products,
	recommendedProducts = [],
	randomProducts = [],
	currentProductId,
}: HistoryRecommendationsProps) {
	// Filter out current product and create unique product sets
	const filterCurrentProduct = (p: ShopifyProduct | null | undefined) => {
		if (!p?.id) {
			return false;
		}
		return p.id !== currentProductId;
	};

	const isUnique = (product: ShopifyProduct | null | undefined, existingProducts: Set<string>) => {
		if (!product?.id) {
			return false;
		}
		if (existingProducts.has(product.id)) {
			return false;
		}
		existingProducts.add(product.id);
		return true;
	};

	const usedProductIds = new Set<string>();

	// Helper function to validate product data
	const isValidProduct = (p: ShopifyProduct | null | undefined): p is ShopifyProduct => {
		if (!p) {
			return false;
		}
		return Boolean(
			p.id &&
				p.title &&
				p.priceRange?.minVariantPrice?.amount &&
				Number.parseFloat(p.priceRange.minVariantPrice.amount) > 0 &&
				p.variants?.nodes?.[0]
		);
	};

	// Filter out invalid products but keep basic validation
	const validProducts = (products || []).filter(isValidProduct);
	const validRecommended = (recommendedProducts || []).filter(isValidProduct);
	const validRandom = (randomProducts || []).filter(isValidProduct);

	// Combine all available products for sections
	const allProducts = [...validRecommended, ...validRandom].filter(isValidProduct);

	// Helper to ensure minimum products and respect mobile limits
	const ensureMinimumProducts = (inputProducts: ShopifyProduct[], minCount = 4) => {
		// For mobile, we want to limit to 4 items per section
		const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
		const maxItems = isMobile ? 4 : 12;
		const targetCount = isMobile ? Math.min(4, minCount) : minCount;

		if (!Array.isArray(inputProducts)) {
			return [];
		}
		if (inputProducts.length >= targetCount) {
			return inputProducts.slice(0, maxItems);
		}

		const needed = targetCount - inputProducts.length;
		const additionalProducts = validRandom
			.filter(filterCurrentProduct)
			.filter((p) => !inputProducts.some((existing) => existing && p && existing.id === p.id))
			.slice(0, needed);

		return [...inputProducts, ...additionalProducts].slice(0, maxItems);
	};

	// Prepare different product sections with unique products
	const sections: RecommendationSection[] = [];

	// Add Recently Viewed section if we have history
	if (validProducts.length > 0) {
		sections.push({
			id: "recently-viewed",
			title: "Recently Viewed",
			description: "Continue exploring products you've shown interest in",
			priority: 1,
			products: validProducts
				.filter(filterCurrentProduct)
				.filter((p) => isUnique(p, usedProductIds))
				.map((p) => ({ product: p, source: "history" as const, sectionId: "recently-viewed" })),
		});
	} else if (validRecommended.length > 0) {
		// If no history, use recommended products with a "Recommended for You" section instead
		sections.push({
			id: "recommended-for-you",
			title: "Recommended For You",
			description: "Products we think you'll love based on popular items",
			priority: 1,
			products: validRecommended
				.filter(filterCurrentProduct)
				.filter((p) => isUnique(p, usedProductIds))
				.map((p) => ({ product: p, source: "recommended" as const, sectionId: "recommended-for-you" })),
		});
	} else if (validRandom.length > 0) {
		// If no history and no recommended, use random products
		sections.push({
			id: "products-you-might-like",
			title: "Products You Might Like",
			description: "Explore our popular products",
			priority: 1,
			products: validRandom
				.filter(filterCurrentProduct)
				.filter((p) => isUnique(p, usedProductIds))
				.map((p) => ({ product: p, source: "popular" as const, sectionId: "products-you-might-like" })),
		});
	}

	// Add Best Sellers section
	const bestSellers = allProducts.filter((p) => p.tags?.includes("best-seller") || p.tags?.includes("bestseller"));
	if (bestSellers.length > 0) {
		sections.push({
			id: "best-sellers",
			title: "Best Sellers",
			description: "Our most popular products",
			priority: 2,
			products: bestSellers
				.filter(filterCurrentProduct)
				.filter((p) => isUnique(p, usedProductIds))
				.map((p) => ({ product: p, source: "best-seller" as const, sectionId: "best-sellers" })),
		});
	}

	// Add New Arrivals section
	const twoWeeksAgo = new Date();
	twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
	const newArrivals = allProducts.filter((p) => {
		const publishedAt = p.publishedAt ? new Date(p.publishedAt) : null;
		return publishedAt && publishedAt > twoWeeksAgo;
	});

	if (newArrivals.length > 0) {
		sections.push({
			id: "new-arrivals",
			title: "New Arrivals",
			description: "Latest additions to our collection",
			priority: 3,
			products: newArrivals
				.filter(filterCurrentProduct)
				.filter((p) => isUnique(p, usedProductIds))
				.map((p) => ({ product: p, source: "new" as const, sectionId: "new-arrivals" })),
		});
	}

	// Add Trending Now section
	const trendingProducts = allProducts
		.map((product) => ({
			product,
			score: calculateTrendingScore(product),
		}))
		.filter(({ score }) => score > 5)
		.sort((a, b) => b.score - a.score)
		.slice(0, 12);

	if (trendingProducts.length > 0) {
		sections.push({
			id: "trending",
			title: "Trending Now",
			description: "Most popular products our customers love",
			priority: 4,
			products: trendingProducts
				.filter(({ product }) => filterCurrentProduct(product))
				.filter(({ product }) => isUnique(product, usedProductIds))
				.map(({ product }) => ({
					product,
					source: "trending" as const,
					sectionId: "trending",
				})),
		});
	}

	// Add Recommended section
	if (validRecommended.length > 0) {
		sections.push({
			id: "recommended",
			title: "Recommended For You",
			description: "Personalized picks based on your shopping preferences",
			priority: 5,
			products: validRecommended
				.filter(filterCurrentProduct)
				.filter((p) => isUnique(p, usedProductIds))
				.map((p) => ({ product: p, source: "recommended" as const, sectionId: "recommended" })),
		});
	}

	// Add On Sale section
	const onSaleProducts = allProducts.filter((p) => {
		const variant = p.variants?.nodes?.[0];
		return (
			variant?.compareAtPrice &&
			Number.parseFloat(variant.compareAtPrice.amount) > Number.parseFloat(variant.price.amount)
		);
	});

	if (onSaleProducts.length > 0) {
		sections.push({
			id: "on-sale",
			title: "On Sale",
			description: "Limited time offers and special deals",
			priority: 6,
			products: onSaleProducts
				.filter(filterCurrentProduct)
				.filter((p) => isUnique(p, usedProductIds))
				.map((p) => ({ product: p, source: "sale" as const, sectionId: "on-sale" })),
		});
	}

	// Always add Related section with random products
	if (validRandom.length > 0) {
		sections.push({
			id: "related",
			title: "You May Also Like",
			description: "Similar products you might be interested in",
			priority: 7,
			products: validRandom
				.filter(filterCurrentProduct)
				.filter((p) => isUnique(p, usedProductIds))
				.map((p) => ({ product: p, source: "related" as const, sectionId: "related" })),
		});
	}

	// Process sections to ensure minimum products and remove empty ones
	const processedSections = sections
		.filter((section) => section.products.length > 0)
		.map((section) => ({
			...section,
			products: ensureMinimumProducts(section.products.map((p) => p.product)).map((p) => ({
				product: p,
				source: section.products[0].source,
				sectionId: section.id,
			})),
		}))
		.filter((section) => section.products.length > 0);

	// Ensure we always display at least one section
	if (processedSections.length === 0 && validRandom.length > 0) {
		// If we still have no processed sections, create a fallback section with random products
		return (
			<section aria-label="Product recommendations" className="w-full" itemScope itemType="https://schema.org/ItemList">
				<meta content="Product Recommendations" itemProp="name" />
				<ProductSection
					currentProductId={currentProductId || ""}
					description="Products you might be interested in"
					products={validRandom
						.filter(filterCurrentProduct)
						.slice(0, 12)
						.map((p) => ({ product: p, source: "popular" as const, sectionId: "discover-more" }))}
					sectionId="discover-more"
					title="Discover More Products"
				/>
			</section>
		);
	}

	return (
		<section
			aria-label="Product recommendations"
			className="w-full space-y-16"
			itemScope
			itemType="https://schema.org/ItemList"
		>
			<meta content="Product Recommendations" itemProp="name" />
			<meta
				content="Personalized product recommendations based on your browsing history and preferences"
				itemProp="description"
			/>
			<meta
				content={String(processedSections.reduce((sum, section) => sum + section.products.length, 0))}
				itemProp="numberOfItems"
			/>

			{processedSections.map((section, index) => (
				<div itemProp="itemListElement" itemScope itemType="https://schema.org/ItemList" key={section.id}>
					<meta content={section.title} itemProp="name" />
					<meta content={section.description} itemProp="description" />
					<meta content={String(index + 1)} itemProp="position" />
					<ProductSection
						currentProductId={currentProductId || ""}
						description={section.description}
						onAddToCart={() => {
							// This is just a placeholder since the ProductCard component already handles the add to cart functionality
							return;
						}}
						products={section.products}
						sectionId={section.id}
						title={section.title}
					/>
				</div>
			))}
		</section>
	);
}
