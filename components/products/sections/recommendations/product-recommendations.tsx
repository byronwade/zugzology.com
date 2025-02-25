"use client";

import { useState, useEffect } from "react";
import { HistoryRecommendations } from "@/components/products/sections/history-recommendations";
import { ProductSection } from "@/components/products/sections/recommendations/product-section";
import type { ShopifyProduct, ShopifyBlogArticle, ShopifyMetafield, ShopifyProductVariant } from "@/lib/types";
import { calculateTrendingScore } from "./utils/tracking";
import Image from "next/image";
import Link from "next/link";
import { ProductSource, ProductWithSource } from "./types";

interface ProductRecommendationsProps {
	featuredProducts: ShopifyProduct[];
	relatedPosts: ShopifyBlogArticle[];
	currentPost: ShopifyBlogArticle & { blogHandle: string; blogTitle: string };
	blogHandle: string;
}

// Helper function to get metafield value
const getMetafieldValue = (metafields: ShopifyMetafield[] | undefined, namespace: string, key: string): string | undefined => {
	return metafields?.find((field) => field.namespace === namespace && field.key === key)?.value;
};

// Helper function to get rating data
const getRatingData = (product: ShopifyProduct) => {
	const rating = parseFloat(getMetafieldValue(product.metafields, "custom", "rating") || "0");
	const ratingCount = parseInt(getMetafieldValue(product.metafields, "custom", "rating_count") || "0", 10);
	const recentPurchases = parseInt(getMetafieldValue(product.metafields, "custom", "recent_purchases") || "0", 10);
	return { rating, ratingCount, recentPurchases };
};

// Helper function to calculate total quantity
const calculateTotalQuantity = (variants: { nodes: ShopifyProductVariant[] }): number => {
	let total = 0;
	for (const variant of variants.nodes) {
		total += variant.quantityAvailable || 0;
	}
	return total;
};

// Update the product recommendations array types
const bestSellerProducts = featuredProducts
	.filter((product: ShopifyProduct) => calculateTotalQuantity(product.variants) > 100)
	.map((product: ShopifyProduct) => ({
		product,
		source: "best-seller" as ProductSource,
		sectionId: "best-sellers",
	}));

const complementaryProducts = featuredProducts
	.filter((product: ShopifyProduct) => {
		// Your existing filter logic
		return true; // Simplified for example
	})
	.map((product: ShopifyProduct) => ({
		product,
		source: "complementary" as ProductSource,
		sectionId: "complementary-products",
	}));

const popularProducts = featuredProducts
	.filter((product: ShopifyProduct) => {
		const recentPurchases = product.metafields?.find((field: ShopifyMetafield) => field.key === "recent_purchases")?.value;
		return recentPurchases && parseInt(recentPurchases, 10) > 10;
	})
	.map((product: ShopifyProduct) => ({
		product,
		source: "popular" as ProductSource,
		sectionId: "popular-products",
	}));

// Helper function to calculate total inventory
const calculateTotalInventory = (variants: { nodes: ShopifyProductVariant[] }): number => {
	let total = 0;
	for (const variant of variants.nodes) {
		total += variant.quantityAvailable || 0;
	}
	return total;
};

export function ProductRecommendations({ featuredProducts, relatedPosts, currentPost, blogHandle }: ProductRecommendationsProps) {
	const [trendingProducts, setTrendingProducts] = useState<ShopifyProduct[]>([]);
	const [historyProducts, setHistoryProducts] = useState<ShopifyProduct[]>([]);
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

	// Helper function to calculate total inventory
	const calculateTotalInventory = (variants: { nodes: ShopifyProductVariant[] }): number => {
		let total = 0;
		for (const variant of variants.nodes) {
			total += variant.quantityAvailable || 0;
		}
		return total;
	};

	// Get best sellers
	const getBestSellers = (): ProductWithSource[] => {
		return featuredProducts
			.filter((product: ShopifyProduct) => {
				const tags = Array.isArray(product.tags) ? product.tags : [];
				return tags.includes("bestseller") || tags.includes("best-seller");
			})
			.slice(0, 12)
			.map((product: ShopifyProduct) => ({
				product,
				source: "best-seller" as ProductSource,
				sectionId: "best-sellers",
			}));
	};

	// Get new arrivals
	const getNewArrivals = (): ProductWithSource[] => {
		const twoWeeksAgo = new Date();
		twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

		return featuredProducts
			.filter((product: ShopifyProduct) => {
				const publishedAt = product.publishedAt ? new Date(product.publishedAt) : null;
				return publishedAt && publishedAt > twoWeeksAgo;
			})
			.slice(0, 12)
			.map((product: ShopifyProduct) => ({
				product,
				source: "new" as ProductSource,
				sectionId: "new-arrivals",
			}));
	};

	// Get complementary products
	const getComplementaryProducts = (): ProductWithSource[] => {
		return featuredProducts
			.filter((product: ShopifyProduct) => {
				// Your existing filter logic
				return true; // Simplified for example
			})
			.slice(0, 12)
			.map((product: ShopifyProduct) => ({
				product,
				source: "complementary" as ProductSource,
				sectionId: "complementary-products",
			}));
	};

	// Get popular products
	const getPopularProducts = (): ProductWithSource[] => {
		return featuredProducts
			.filter((product: ShopifyProduct) => {
				const recentPurchases = product.metafields?.find((field: ShopifyMetafield) => field.key === "recent_purchases")?.value;
				return recentPurchases && parseInt(recentPurchases, 10) > 10;
			})
			.slice(0, 12)
			.map((product: ShopifyProduct) => ({
				product,
				source: "popular" as ProductSource,
				sectionId: "popular-products",
			}));
	};

	// Get the products for each section
	const bestSellers = getBestSellers();
	const newArrivals = getNewArrivals();
	const complementaryProducts = getComplementaryProducts();
	const popularProducts = getPopularProducts();

	// Filter and sort products for each section
	const getRelatedProducts = () => {
		// Get products related to the blog post's title and content
		const searchTerms = [...currentPost.title.toLowerCase().split(" "), ...(currentPost.excerpt?.toLowerCase().split(" ") || [])].filter((term) => term.length > 3);

		return featuredProducts
			.filter((product) => {
				const productTerms = [...product.title.toLowerCase().split(" "), ...(product.description?.toLowerCase().split(" ") || []), ...(Array.isArray(product.tags) ? product.tags.map((tag) => tag.toLowerCase()) : [])];
				return searchTerms.some((term) => productTerms.includes(term));
			})
			.slice(0, 12)
			.map((product) => ({
				product,
				source: "related" as const,
				sectionId: "related-products",
			}));
	};

	const getSeasonalPicks = () => {
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
				product,
				source: "recommended" as const,
				sectionId: "seasonal-picks",
			}));
	};

	const getBeginnerFriendlyProducts = () => {
		// Tags that indicate beginner-friendly products
		const beginnerTags = ["beginner-friendly", "starter-kit", "easy-grow", "all-in-one", "beginner", "starter"];

		// Characteristics of beginner-friendly products
		const isBeginnerFriendly = (product: ShopifyProduct) => {
			const tags = Array.isArray(product.tags) ? product.tags.map((tag) => tag.toLowerCase()) : [];
			const hasBeginnerTag = tags.some((tag) => beginnerTags.includes(tag));

			// Check product complexity from metafields
			const complexityLevel = product.metafields?.find((field) => field.key === "complexity_level")?.value;
			const isLowComplexity = complexityLevel ? parseInt(complexityLevel, 10) <= 2 : false;

			// Check if it's an all-in-one solution
			const isAllInOne = tags.includes("all-in-one") || product.title.toLowerCase().includes("kit") || product.title.toLowerCase().includes("starter");

			// Check price point (assuming beginner products are typically lower priced)
			const price = parseFloat(product.priceRange?.minVariantPrice?.amount || "0");
			const isAffordable = price > 0 && price <= 50; // Adjust price threshold as needed

			// Product must meet at least two criteria to be considered beginner-friendly
			const criteria = [hasBeginnerTag, isLowComplexity, isAllInOne, isAffordable];
			return criteria.filter(Boolean).length >= 2;
		};

		return featuredProducts
			.filter(isBeginnerFriendly)
			.slice(0, 12)
			.map((product) => ({
				product,
				source: "recommended" as const,
				sectionId: "beginner-friendly",
			}));
	};

	const getAdvancedCultivatorPicks = () => {
		// Get user's purchase and viewing history to determine expertise level
		const viewedProducts = JSON.parse(localStorage.getItem("viewedProducts") || "[]");
		const purchaseHistory = JSON.parse(localStorage.getItem("purchaseHistory") || "[]");

		// Calculate user's expertise level based on their history
		const calculateExpertiseLevel = () => {
			let score = 0;

			// Check viewed products complexity
			viewedProducts.forEach((product: ShopifyProduct) => {
				const complexityLevel = product.metafields?.find((field) => field.key === "complexity_level")?.value;
				if (complexityLevel) {
					score += parseInt(complexityLevel, 10);
				}
			});

			// Give more weight to purchased products
			purchaseHistory.forEach((product: ShopifyProduct) => {
				const complexityLevel = product.metafields?.find((field) => field.key === "complexity_level")?.value;
				if (complexityLevel) {
					score += parseInt(complexityLevel, 10) * 2;
				}
			});

			// Consider history length
			const historyLength = viewedProducts.length + purchaseHistory.length;
			score *= 1 + historyLength / 20; // Increase score based on history length

			return score;
		};

		const expertiseScore = calculateExpertiseLevel();

		// Tags that indicate advanced products
		const advancedTags = ["advanced", "expert", "professional", "pro-grade", "specialized", "technical"];

		// Characteristics of advanced products
		const isAdvancedProduct = (product: ShopifyProduct) => {
			const tags = Array.isArray(product.tags) ? product.tags.map((tag) => tag.toLowerCase()) : [];
			const hasAdvancedTag = tags.some((tag) => advancedTags.includes(tag));

			// Check product complexity
			const complexityLevel = product.metafields?.find((field) => field.key === "complexity_level")?.value;
			const isHighComplexity = complexityLevel ? parseInt(complexityLevel, 10) >= 4 : false;

			// Check if it's specialized equipment or advanced supplies
			const isSpecialized = tags.some((tag) => tag.includes("laboratory") || tag.includes("scientific") || tag.includes("professional") || tag.includes("specialized"));

			// Consider price as a factor (advanced equipment often costs more)
			const price = parseFloat(product.priceRange?.minVariantPrice?.amount || "0");
			const isPremium = price > 100; // Adjust threshold as needed

			// Product must meet criteria based on user's expertise
			const criteria = [hasAdvancedTag, isHighComplexity, isSpecialized, isPremium];
			return expertiseScore > 50 // Only show truly advanced products to experienced users
				? criteria.filter(Boolean).length >= 2
				: criteria.filter(Boolean).length >= 3;
		};

		return featuredProducts
			.filter(isAdvancedProduct)
			.slice(0, 12)
			.map((product) => ({
				product,
				source: "recommended" as const,
				sectionId: "advanced-picks",
			}));
	};

	const getLimitedTimeOffers = () => {
		const now = new Date();

		// Helper to calculate discount percentage
		const calculateDiscount = (product: ShopifyProduct) => {
			const compareAtPrice = parseFloat(product.priceRange?.maxVariantPrice?.amount || "0");
			const currentPrice = parseFloat(product.priceRange?.minVariantPrice?.amount || "0");
			if (compareAtPrice > currentPrice && currentPrice > 0) {
				return ((compareAtPrice - currentPrice) / compareAtPrice) * 100;
			}
			return 0;
		};

		// Helper to check if product is part of a bundle
		const isBundle = (product: ShopifyProduct) => {
			const tags = Array.isArray(product.tags) ? product.tags.map((tag) => tag.toLowerCase()) : [];
			return tags.some((tag) => tag.includes("bundle") || tag.includes("pack") || tag.includes("kit") || tag.includes("combo"));
		};

		// Helper to check if product has time-sensitive offer
		const hasTimeSensitiveOffer = (product: ShopifyProduct) => {
			// Check sale end date from metafields
			const saleEndDate = product.metafields?.find((field) => field.key === "sale_end_date")?.value;

			if (saleEndDate) {
				const endDate = new Date(saleEndDate);
				// Only include if sale ends within next 7 days
				return endDate > now && endDate.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000;
			}

			return false;
		};

		// Helper to check if product has limited quantity
		const hasLimitedQuantity = (product: ShopifyProduct) => {
			const totalInventory =
				product.variants?.edges?.reduce((sum, { node }) => {
					return sum + (node.quantityAvailable || 0);
				}, 0) || 0;

			// Consider it limited if less than 20 units available
			return totalInventory > 0 && totalInventory < 20;
		};

		// Helper to check if product is part of a promotion
		const isPromotional = (product: ShopifyProduct) => {
			const tags = Array.isArray(product.tags) ? product.tags.map((tag) => tag.toLowerCase()) : [];
			return tags.some((tag) => tag.includes("sale") || tag.includes("special") || tag.includes("promotion") || tag.includes("limited-time") || tag.includes("flash-sale"));
		};

		// Score each product based on offer attractiveness
		const scoredProducts = featuredProducts
			.map((product) => {
				let score = 0;
				const discount = calculateDiscount(product);

				// Weight different factors
				if (discount >= 30) score += 5; // Big discounts
				else if (discount >= 15) score += 3;
				else if (discount > 0) score += 1;

				if (isBundle(product)) score += 3; // Bundles are attractive
				if (hasTimeSensitiveOffer(product)) score += 4; // Urgency
				if (hasLimitedQuantity(product)) score += 2; // Scarcity
				if (isPromotional(product)) score += 2; // Explicit promotions

				// Check recent views/purchases to avoid showing stale offers
				const recentViews = product.metafields?.find((field) => field.key === "recent_views")?.value;
				if (recentViews && parseInt(recentViews, 10) > 50) score += 1;

				return {
					product,
					score,
					discount,
				};
			})
			.filter(({ score, discount }) => score >= 3 || discount >= 15) // Only significant offers
			.sort((a, b) => b.score - a.score) // Best offers first
			.slice(0, 12)
			.map(({ product }) => ({
				product,
				source: "recommended" as const,
				sectionId: "limited-time-offers",
			}));

		return scoredProducts;
	};

	const relatedProducts = getRelatedProducts();
	const seasonalPicks = getSeasonalPicks();
	const beginnerFriendly = getBeginnerFriendlyProducts();
	const advancedPicks = getAdvancedCultivatorPicks();
	const limitedTimeOffers = getLimitedTimeOffers();

	// Loading state
	if (isLoading) {
		return (
			<section className="w-full pb-24">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
					<div className="animate-pulse space-y-8">
						{/* Loading skeleton for sections */}
						{[1, 2, 3].map((i) => (
							<div key={i} className="space-y-4">
								<div className="h-8 bg-neutral-200 dark:bg-neutral-800 w-48 rounded" />
								<div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-96 rounded" />
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
									{[1, 2, 3, 4, 5, 6].map((j) => (
										<div key={j} className="space-y-4">
											<div className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
											<div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-3/4 rounded" />
											<div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-1/2 rounded" />
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="w-full pb-24" itemScope itemType="https://schema.org/ItemList" aria-label="Product recommendations">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
				<meta itemProp="name" content="Product Recommendations" />
				<meta itemProp="description" content="Personalized product recommendations based on your browsing history and preferences" />
				<meta itemProp="numberOfItems" content={String(featuredProducts.length)} />

				{/* Related Articles - Always at the top */}
				{relatedPosts.length > 0 && (
					<div className="w-full" itemProp="itemListElement" itemScope itemType="https://schema.org/ItemList">
						<meta itemProp="name" content="Related Articles" />
						<meta itemProp="position" content="1" />
						<div className="space-y-8">
							<div>
								<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Related Articles</h2>
								<p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">More articles you might be interested in</p>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{relatedPosts.map((post) => (
									<Link key={post.id} href={`/blogs/${post.blogHandle}/${post.handle}`} className="group">
										<article className="space-y-4">
											<div className="not-prose">
												<div className="aspect-[16/9] relative overflow-hidden rounded-xl transition-transform group-hover:scale-[1.02] border border-foreground/10 hover:border-foreground/20">
													{post.image ? (
														<Image src={post.image.url} alt={post.image.altText || post.title} fill className="object-cover rounded-xl" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
													) : (
														<div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
															<div className="text-center p-4">
																<div className="text-4xl mb-2">🍄</div>
																<p className="text-sm text-neutral-600 dark:text-neutral-400">Article Preview</p>
															</div>
														</div>
													)}
												</div>
											</div>
											<div className="space-y-2">
												<div className="space-y-1">
													{post.blogHandle !== currentPost.blogHandle && <p className="text-sm font-medium text-purple-600 dark:text-purple-400">{post.blogTitle}</p>}
													<h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{post.title}</h3>
												</div>
												<p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{post.excerpt}</p>
												<div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
													<span>{post.author.name}</span>
													<span>•</span>
													<time dateTime={post.publishedAt}>
														{new Date(post.publishedAt).toLocaleDateString("en-US", {
															year: "numeric",
															month: "long",
															day: "numeric",
														})}
													</time>
												</div>
											</div>
										</article>
									</Link>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Limited Time Offers - High priority placement */}
				{limitedTimeOffers.length > 0 && (
					<div className="w-full" itemProp="itemListElement" itemScope itemType="https://schema.org/ItemList">
						<meta itemProp="name" content="Limited Time Offers" />
						<meta itemProp="position" content="2" />
						<ProductSection
							title="Limited Time Offers"
							description="Special deals and bundles - Don't miss out!"
							products={limitedTimeOffers}
							sectionId="limited-time-offers"
							currentProductId=""
							onAddToCart={() => {
								// This is just a placeholder since the ProductCard component already handles the add to cart functionality
								return;
							}}
						/>
					</div>
				)}

				{/* History and Trending Products */}
				{(historyProducts.length > 0 || trendingProducts.length > 0) && (
					<div className="w-full" itemProp="itemListElement" itemScope itemType="https://schema.org/ItemList">
						<meta itemProp="name" content="Personalized Recommendations" />
						<meta itemProp="position" content="3" />
						<HistoryRecommendations products={historyProducts} recommendedProducts={trendingProducts} randomProducts={featuredProducts} currentProductId="" />
					</div>
				)}

				{/* Related Products */}
				{relatedProducts.length > 0 && (
					<div className="w-full" itemProp="itemListElement" itemScope itemType="https://schema.org/ItemList">
						<meta itemProp="name" content="Related Products" />
						<meta itemProp="position" content="4" />
						<ProductSection
							title="You May Also Like"
							description="Products related to this article"
							products={relatedProducts}
							sectionId="related-products"
							currentProductId=""
							onAddToCart={() => {
								// This is just a placeholder since the ProductCard component already handles the add to cart functionality
								return;
							}}
						/>
					</div>
				)}

				{/* Beginner Friendly Products */}
				{beginnerFriendly.length > 0 && (
					<div className="w-full" itemProp="itemListElement" itemScope itemType="https://schema.org/ItemList">
						<meta itemProp="name" content="Beginner Friendly" />
						<meta itemProp="position" content="5" />
						<ProductSection
							title="Perfect for Beginners"
							description="Easy-to-use products ideal for starting your cultivation journey"
							products={beginnerFriendly}
							sectionId="beginner-friendly"
							currentProductId=""
							onAddToCart={() => {
								// This is just a placeholder since the ProductCard component already handles the add to cart functionality
								return;
							}}
						/>
					</div>
				)}

				{/* Advanced Cultivator Picks */}
				{advancedPicks.length > 0 && (
					<div className="w-full" itemProp="itemListElement" itemScope itemType="https://schema.org/ItemList">
						<meta itemProp="name" content="Advanced Cultivator Picks" />
						<meta itemProp="position" content="6" />
						<ProductSection
							title="Advanced Cultivator Picks"
							description="Specialized products for experienced growers"
							products={advancedPicks}
							sectionId="advanced-picks"
							currentProductId=""
							onAddToCart={() => {
								// This is just a placeholder since the ProductCard component already handles the add to cart functionality
								return;
							}}
						/>
					</div>
				)}

				{/* Seasonal Picks */}
				{seasonalPicks.length > 0 && (
					<div className="w-full" itemProp="itemListElement" itemScope itemType="https://schema.org/ItemList">
						<meta itemProp="name" content="Seasonal Picks" />
						<meta itemProp="position" content="7" />
						<ProductSection
							title="Seasonal Picks"
							description="Perfect products for the current season"
							products={seasonalPicks}
							sectionId="seasonal-picks"
							currentProductId=""
							onAddToCart={() => {
								// This is just a placeholder since the ProductCard component already handles the add to cart functionality
								return;
							}}
						/>
					</div>
				)}

				{bestSellers.length > 0 && (
					<div className="w-full" itemProp="itemListElement" itemScope itemType="https://schema.org/ItemList">
						<meta itemProp="name" content="Best Sellers" />
						<meta itemProp="position" content="8" />
						<ProductSection
							title="Best Sellers"
							description="Our most popular products"
							products={bestSellers}
							sectionId="best-sellers"
							currentProductId=""
							onAddToCart={() => {
								// This is just a placeholder since the ProductCard component already handles the add to cart functionality
								return;
							}}
						/>
					</div>
				)}

				{complementaryProducts.length > 0 && (
					<div className="w-full" itemProp="itemListElement" itemScope itemType="https://schema.org/ItemList">
						<meta itemProp="name" content="Complete Your Collection" />
						<meta itemProp="position" content="9" />
						<ProductSection
							title="Complete Your Collection"
							description="Products that pair well with your interests"
							products={complementaryProducts}
							sectionId="complementary-products"
							currentProductId=""
							onAddToCart={() => {
								// This is just a placeholder since the ProductCard component already handles the add to cart functionality
								return;
							}}
						/>
					</div>
				)}

				{newArrivals.length > 0 && (
					<div className="w-full" itemProp="itemListElement" itemScope itemType="https://schema.org/ItemList">
						<meta itemProp="name" content="New Arrivals" />
						<meta itemProp="position" content="10" />
						<ProductSection
							title="New Arrivals"
							description="Latest additions to our collection"
							products={newArrivals}
							sectionId="new-arrivals"
							currentProductId=""
							onAddToCart={() => {
								// This is just a placeholder since the ProductCard component already handles the add to cart functionality
								return;
							}}
						/>
					</div>
				)}
			</div>
		</section>
	);
}
