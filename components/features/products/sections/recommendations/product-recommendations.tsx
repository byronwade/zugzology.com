"use client";

import { useState, useEffect } from "react";
import { HistoryRecommendations } from "@/components/features/products/sections/history-recommendations";
import { ProductSection } from "@/components/features/products/sections/recommendations/product-section";
import type { ShopifyProduct, ShopifyBlogArticle, ShopifyMetafield, ShopifyProductVariant, ShopifyImage } from "@/lib/types";
import { calculateTrendingScore } from "./utils/tracking";
import Image from "next/image";
import Link from "next/link";
import { ProductSource, ProductWithSource } from "./types";

interface TransformedProduct extends Omit<ShopifyProduct, "variants" | "images"> {
	images: {
		edges: Array<{
			node: {
				url: string;
				altText?: string;
				width?: number;
				height?: number;
			};
		}>;
		nodes: ShopifyImage[];
	};
	variants: {
		edges: Array<{
			node: ShopifyProductVariant;
		}>;
		nodes: ShopifyProductVariant[];
	};
}

interface ProductRecommendationsProps {
	featuredProducts: TransformedProduct[];
	relatedPosts: ShopifyBlogArticle[];
	currentPost: ShopifyBlogArticle & { blogHandle: string; blogTitle: string };
	blogHandle: string;
}

// Helper function to transform product data
const transformProduct = (product: TransformedProduct): ShopifyProduct => {
	return {
		...product,
		images: {
			nodes: product.images.edges.map((edge) => ({
				...edge.node,
				id: edge.node.url,
				width: edge.node.width || 0,
				height: edge.node.height || 0,
				altText: edge.node.altText || null,
			})),
		},
		variants: {
			nodes: product.variants.edges.map((edge) => edge.node),
		},
	} as ShopifyProduct;
};

// Helper function to get metafield value
const getMetafieldValue = (metafields: ShopifyMetafield[] | undefined, namespace: string, key: string): string | undefined => {
	return metafields?.find((field) => field.namespace === namespace && field.key === key)?.value;
};

// Helper function to get rating data
const getRatingData = (product: TransformedProduct) => {
	const rating = parseFloat(getMetafieldValue(product.metafields, "custom", "rating") || "0");
	const ratingCount = parseInt(getMetafieldValue(product.metafields, "custom", "rating_count") || "0", 10);
	const recentPurchases = parseInt(getMetafieldValue(product.metafields, "custom", "recent_purchases") || "0", 10);
	return { rating, ratingCount, recentPurchases };
};

// Helper function to calculate total quantity
const calculateTotalQuantity = (variants: { edges: Array<{ node: ShopifyProductVariant }> }): number => {
	let total = 0;
	for (const { node: variant } of variants.edges) {
		total += variant.quantityAvailable || 0;
	}
	return total;
};

export function ProductRecommendations({ featuredProducts = [], relatedPosts = [], currentPost, blogHandle }: ProductRecommendationsProps) {
	const [trendingProducts, setTrendingProducts] = useState<TransformedProduct[]>([]);
	const [historyProducts, setHistoryProducts] = useState<TransformedProduct[]>([]);
	const [mounted, setMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setMounted(true);
		setIsLoading(true);

		try {
			// Get history from localStorage
			const viewedProducts = JSON.parse(localStorage.getItem("viewedProducts") || "[]");
			setHistoryProducts(viewedProducts);

			// Calculate trending products
			const trending = featuredProducts
				.filter((product) => {
					try {
						const score = calculateTrendingScore(product);
						return score > 5; // Only show products with significant trending score
					} catch (error) {
						console.error("Error calculating trending score:", error);
						return false;
					}
				})
				.sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a))
				.slice(0, 12);
			setTrendingProducts(trending);
		} catch (error) {
			console.error("Error initializing recommendations:", error);
		} finally {
			setIsLoading(false);
		}
	}, [featuredProducts]);

	// Don't render anything until after client-side hydration
	if (!mounted) return null;

	// Get best sellers
	const bestSellers = featuredProducts
		.filter((product: TransformedProduct) => {
			const tags = Array.isArray(product.tags) ? product.tags : [];
			return tags.includes("bestseller") || tags.includes("best-seller");
		})
		.slice(0, 12)
		.map((product) => ({
			product: transformProduct(product),
			source: "best-seller" as const,
			sectionId: "best-sellers",
		}));

	// Get new arrivals
	const newArrivals = featuredProducts
		.filter((product: TransformedProduct) => {
			const twoWeeksAgo = new Date();
			twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
			const publishedAt = product.publishedAt ? new Date(product.publishedAt) : null;
			return publishedAt && publishedAt > twoWeeksAgo;
		})
		.slice(0, 12)
		.map((product) => ({
			product: transformProduct(product),
			source: "new" as const,
			sectionId: "new-arrivals",
		}));

	// Get complementary products
	const complementaryProducts = featuredProducts
		.filter((product: TransformedProduct) => {
			// Filter logic for complementary products
			const { rating, ratingCount } = getRatingData(product);
			return rating >= 4 && ratingCount >= 5;
		})
		.slice(0, 12)
		.map((product) => ({
			product: transformProduct(product),
			source: "complementary" as const,
			sectionId: "complementary-products",
		}));

	// Get popular products
	const popularProducts = featuredProducts
		.filter((product: TransformedProduct) => {
			const recentPurchases = product.metafields?.find((field: ShopifyMetafield) => field.key === "recent_purchases")?.value;
			return recentPurchases && parseInt(recentPurchases, 10) > 10;
		})
		.slice(0, 12)
		.map((product) => ({
			product: transformProduct(product),
			source: "popular" as const,
			sectionId: "popular-products",
		}));

	// Get related products
	const relatedProducts = featuredProducts
		.filter((product) => {
			const searchTerms = [...currentPost.title.toLowerCase().split(" "), ...(currentPost.excerpt?.toLowerCase().split(" ") || [])].filter((term) => term.length > 3);
			const productTerms = [...product.title.toLowerCase().split(" "), ...(product.description?.toLowerCase().split(" ") || []), ...(Array.isArray(product.tags) ? product.tags.map((tag) => tag.toLowerCase()) : [])];
			return searchTerms.some((term) => productTerms.includes(term));
		})
		.slice(0, 12)
		.map((product) => ({
			product: transformProduct(product),
			source: "related" as const,
			sectionId: "related-products",
		}));

	// Get seasonal picks
	const seasonalPicks = (() => {
		const currentMonth = new Date().getMonth();
		let seasonalTags: string[] = [];

		// Define seasonal tags based on current month
		if (currentMonth >= 2 && currentMonth <= 4) {
			// Spring (March-May)
			seasonalTags = ["spring", "spring-variety", "seasonal-spring"];
		} else if (currentMonth >= 5 && currentMonth <= 7) {
			// Summer (June-August)
			seasonalTags = ["summer", "summer-variety", "seasonal-summer"];
		} else if (currentMonth >= 8 && currentMonth <= 10) {
			// Fall (September-November)
			seasonalTags = ["fall", "autumn", "fall-variety", "seasonal-fall"];
		} else {
			// Winter (December-February)
			seasonalTags = ["winter", "winter-variety", "seasonal-winter"];
		}

		return featuredProducts
			.filter((product) => {
				const productTags = Array.isArray(product.tags) ? product.tags.map((tag) => tag.toLowerCase()) : [];
				return seasonalTags.some((tag) => productTags.includes(tag.toLowerCase()));
			})
			.slice(0, 12)
			.map((product) => ({
				product: transformProduct(product),
				source: "recommended" as const,
				sectionId: "seasonal-picks",
			}));
	})();

	// Loading state
	if (isLoading) {
		return (
			<div className="space-y-8">
				<div className="animate-pulse space-y-4">
					<div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	// Ensure featuredProducts is always an array
	const safeFeaturedProducts = featuredProducts || [];

	// Limit the number of products to 4
	const limitedFeaturedProducts = safeFeaturedProducts.slice(0, 4);

	return (
		<div className="space-y-12">
			{/* History Recommendations */}
			{limitedFeaturedProducts.length > 0 && <HistoryRecommendations products={limitedFeaturedProducts.map(transformProduct)} currentProductId={currentPost.id} />}

			{/* Product Sections */}
			{relatedProducts.length > 0 && <ProductSection title="Related Products" description="Products you might be interested in based on this article" products={relatedProducts} sectionId="related-products" currentProductId={currentPost.id} />}
			{bestSellers.length > 0 && <ProductSection title="Best Sellers" description="Our most popular products, loved by cultivators" products={bestSellers} sectionId="best-sellers" currentProductId={currentPost.id} />}
			{newArrivals.length > 0 && <ProductSection title="New Arrivals" description="Our latest products and additions" products={newArrivals} sectionId="new-arrivals" currentProductId={currentPost.id} />}
			{complementaryProducts.length > 0 && <ProductSection title="You Might Also Like" description="Products that complement your interests" products={complementaryProducts} sectionId="complementary-products" currentProductId={currentPost.id} />}
			{popularProducts.length > 0 && <ProductSection title="Popular Products" description="Trending products our customers love" products={popularProducts} sectionId="popular-products" currentProductId={currentPost.id} />}
			{seasonalPicks.length > 0 && <ProductSection title="Seasonal Picks" description="Products perfect for this time of year" products={seasonalPicks} sectionId="seasonal-picks" currentProductId={currentPost.id} />}
			{trendingProducts.length > 0 && (
				<ProductSection
					title="Trending Now"
					description="Products gaining popularity right now"
					products={trendingProducts.map((product) => ({
						product: transformProduct(product),
						source: "trending" as const,
						sectionId: "trending-products",
					}))}
					sectionId="trending-products"
					currentProductId={currentPost.id}
				/>
			)}
		</div>
	);
}
