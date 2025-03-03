"use client";

import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { ProductGallery } from "@/components/products/sections/product-gallery";
import { ShopifyProduct, ShopifyProductVariant, ShopifyMediaImage, ShopifyMediaVideo, ShopifyExternalVideo, ShopifyBlogArticle } from "@/lib/types";
import { ProductInfo } from "@/components/products/sections/product-info";
import { ProductActions } from "@/components/products/sections/product-actions";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getProducts, getAllBlogPosts, getProductsByIds } from "@/lib/api/shopify/actions";
import { RelatedProducts } from "./sections/related-products";
import { RecentPosts } from "@/components/blog/recent-posts";
import { HistoryRecommendations } from "./sections/history-recommendations";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { FrequentlyBoughtTogether } from "./sections/frequently-bought-together";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { debugLog } from "@/lib/utils";
import { TrustooReviews } from "./sections/trustoo-reviews";
import { ProductRecommendations } from "./sections/recommendations/product-recommendations";
import { ProductSection } from "./sections/recommendations/product-section";
import { ProductSource } from "./sections/recommendations/types";
import { ChevronRight, ArrowRight } from "lucide-react";
import { ImageIcon } from "lucide-react";

interface ProductWithRecommendations extends ShopifyProduct {
	recommendations?: {
		nodes: ShopifyProduct[];
	};
	collections?: {
		edges: Array<{
			node: {
				handle: string;
				title: string;
			};
		}>;
	};
}

interface ProductContentClientProps {
	product: ProductWithRecommendations;
}

interface SelectedOptions {
	[key: string]: string;
}

type MediaNode = ShopifyMediaImage | ShopifyMediaVideo | ShopifyExternalVideo;

// Memoized helper functions
const getInitialSelectedOptions = (variant: ShopifyProductVariant | null): SelectedOptions => {
	return (
		variant?.selectedOptions?.reduce(
			(acc, option) => ({
				...acc,
				[option.name]: option.value,
			}),
			{} as SelectedOptions
		) || {}
	);
};

const findMatchingVariant = (
	variants: ShopifyProductVariant[],
	selectedOptions: SelectedOptions
): ShopifyProductVariant | undefined => {
	return variants.find((variant) =>
		variant.selectedOptions?.every((option) => selectedOptions[option.name] === option.value)
	);
};

// Memoized Breadcrumb component
const Breadcrumb = memo(({ title }: { title: string }) => (
	<nav aria-label="Breadcrumb" className="mb-4 hidden md:block">
		<ol className="flex items-center space-x-2 text-sm">
			<li>
				<a href="/" className="text-neutral-500 hover:text-neutral-700">
					Home
				</a>
			</li>
			<li className="text-neutral-500">/</li>
			<li>
				<a href="/products" className="text-neutral-500 hover:text-neutral-700">
					Products
				</a>
			</li>
			<li className="text-neutral-500">/</li>
			<li className="text-neutral-900" aria-current="page">
				{title}
			</li>
		</ol>
	</nav>
));

Breadcrumb.displayName = "Breadcrumb";

// Helper function to get media URL safely
const getMediaUrl = (media: MediaNode): string => {
	if (media.mediaContentType === "IMAGE" && (media as ShopifyMediaImage).image) {
		return (media as ShopifyMediaImage).image.url;
	} else if (
		media.mediaContentType === "VIDEO" &&
		(media as ShopifyMediaVideo).sources &&
		(media as ShopifyMediaVideo).sources.length > 0
	) {
		return (media as ShopifyMediaVideo).sources[0].url;
	} else if (media.previewImage) {
		return media.previewImage.url;
	}
	return "";
};

// Helper function to get media alt text safely
const getMediaAltText = (media: MediaNode): string => {
	if (media.mediaContentType === "IMAGE" && (media as ShopifyMediaImage).image) {
		return (media as ShopifyMediaImage).image.altText || "";
	} else if (media.alt) {
		return media.alt;
	} else if (media.previewImage && media.previewImage.altText) {
		return media.previewImage.altText;
	}
	return "";
};

export const ProductContentClient = ({ product }: ProductContentClientProps) => {
	// Debug log the incoming product data
	debugLog("ProductContentClient", "Initial product data:", product);

	// Early return if no product data
	if (!product) {
		console.error("ProductContentClient - No product data provided");
		return null;
	}

	// 1. All useState hooks
	const [mounted, setMounted] = useState(false);
	const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant | null>(() => {
		const firstVariant = product?.variants?.nodes?.[0] || null;
		debugLog("ProductContentClient", "Initial selected variant:", firstVariant);
		return firstVariant;
	});
	const [quantity, setQuantity] = useState(1);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(() => {
		const initialOptions = getInitialSelectedOptions(product?.variants?.nodes?.[0] || null);
		debugLog("ProductContentClient", "Initial selected options:", initialOptions);
		return initialOptions;
	});
	const [complementaryProducts, setComplementaryProducts] = useState<ShopifyProduct[]>([]);
	const [recommendedProducts, setRecommendedProducts] = useState<ShopifyProduct[]>([]);
	const [recentPosts, setRecentPosts] = useState<ShopifyBlogArticle[]>([]);
	const [historyProducts, setHistoryProducts] = useState<ShopifyProduct[]>([]);
	const [randomProducts, setRandomProducts] = useState<ShopifyProduct[]>([]);

	// 2. All useCallback hooks
	const handleOptionChange = useCallback((optionName: string, value: string) => {
		setSelectedOptions((prev) => ({
			...prev,
			[optionName]: value,
		}));
	}, []);

	const handleQuantityChange = useCallback((newQuantity: number) => {
		setQuantity(newQuantity);
	}, []);

	const handleImageSelect = useCallback((index: number) => {
		setSelectedImageIndex(index);
	}, []);

	// 3. All useMemo hooks
	const mediaItems = useMemo(() => {
		debugLog("ProductContentClient", "Building media items from", {
			media: product.media?.nodes,
			images: product.images?.nodes,
		});

		const items: (ShopifyMediaImage | ShopifyMediaVideo | ShopifyExternalVideo)[] = [];

		try {
			// Process media nodes
			if (product.media?.nodes) {
				product.media.nodes.forEach((node) => {
					debugLog("ProductContentClient", "Processing media node", node);

					if (node.mediaContentType === "IMAGE") {
						items.push(node as ShopifyMediaImage);
					} else if (node.mediaContentType === "VIDEO") {
						items.push(node as ShopifyMediaVideo);
					} else if (node.mediaContentType === "EXTERNAL_VIDEO") {
						items.push(node as ShopifyExternalVideo);
					}
				});
			}

			// Add any images that might not be in media
			if (product.images?.nodes) {
				product.images.nodes.forEach((node) => {
					// Only add if there isn't already media for this image
					if (
						!items.some(
							(media) => media.mediaContentType === "IMAGE" && (media as ShopifyMediaImage).image?.url === node.url
						)
					) {
						items.push({
							id: `image-${node.url}`,
							mediaContentType: "IMAGE",
							image: node,
						} as ShopifyMediaImage);
					}
				});
			}

			debugLog("ProductContentClient", "Final media items", items);
		} catch (error) {
			console.error("Error processing product media:", error);
		}

		return items;
	}, [product.media?.nodes, product.images?.nodes]);

	// 4. All useEffect hooks
	useEffect(() => {
		setMounted(true);
		debugLog("ProductContentClient", "Component mounted");

		// Try to get pre-fetched blog posts from the hidden input
		try {
			const blogPostsElement = document.getElementById("recent-blog-posts-data") as HTMLInputElement;
			if (blogPostsElement && blogPostsElement.value) {
				const posts = JSON.parse(blogPostsElement.value);
				if (Array.isArray(posts) && posts.length > 0) {
					debugLog("ProductContentClient", "Using pre-fetched blog posts", posts.length);
					setRecentPosts(posts);
				} else {
					// If no blog posts from server, fetch them directly
					fetchBlogPosts();
				}
			} else {
				// No blog posts element, fetch directly
				fetchBlogPosts();
			}
		} catch (error) {
			console.error("Error parsing pre-fetched blog posts:", error);
			// Attempt to fetch directly after error
			fetchBlogPosts();
		}
	}, []);

	// Helper function to fetch blog posts
	const fetchBlogPosts = async () => {
		try {
			console.log("📚 [Product] Fetching recent blog posts");
			const posts = await getAllBlogPosts();
			if (Array.isArray(posts) && posts.length > 0) {
				// Sort posts by date (newest first)
				const sortedPosts = [...posts].sort(
					(a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
				);

				// Take only the three most recent posts
				const recentThreePosts = sortedPosts.slice(0, 3);

				// Make sure each post has the blog handle set
				const postsWithBlogHandle = recentThreePosts.map((post) => ({
					...post,
					// Use blog.handle if available, otherwise fallback to blogHandle
					blogHandle: post.blog?.handle || post.blogHandle || "blog",
				}));

				setRecentPosts(postsWithBlogHandle);
				console.log(`📚 [Product] Fetched ${postsWithBlogHandle.length} recent blog posts`);
			} else {
				console.log("📚 [Product] No blog posts found");
				setRecentPosts([]);
			}
		} catch (error) {
			console.error("Error fetching blog posts:", error);
			setRecentPosts([]);
		}
	};

	useEffect(() => {
		if (!mounted) return;

		const variants = product?.variants?.nodes || [];
		const matchingVariant = findMatchingVariant(variants, selectedOptions);
		if (matchingVariant) {
			setSelectedVariant(matchingVariant);
			debugLog("ProductContentClient", "Matching variant found:", matchingVariant);
		}
	}, [selectedOptions, product?.variants?.nodes, mounted]);

	useEffect(() => {
		const fetchComplementaryProducts = async () => {
			if (product.metafields && mounted) {
				try {
					// Check if we already have recommendations from the server
					if (product.recommendations?.nodes && product.recommendations.nodes.length > 0) {
						debugLog(
							"ProductContentClient",
							"Using server-provided recommendations",
							product.recommendations.nodes.length
						);
						setComplementaryProducts(product.recommendations.nodes);
						setRecommendedProducts(product.recommendations.nodes.slice(0, 8));
						return;
					}

					// Find the complementary_products metafield
					const complementaryMetafield = product.metafields.find(
						(metafield) =>
							metafield &&
							metafield.namespace === "shopify--discovery--product_recommendation" &&
							metafield.key === "complementary_products"
					);

					debugLog("ProductContentClient", "Found complementary metafield:", complementaryMetafield);

					if (complementaryMetafield?.value) {
						try {
							// Parse the complementary product data
							const complementaryData = JSON.parse(complementaryMetafield.value);
							debugLog("Raw complementary data:", complementaryData);

							// Get the product references from the correct structure
							const productReferences = (complementaryData?.recommendations || []).filter(Boolean);
							debugLog("Product references:", productReferences);

							if (productReferences.length > 0) {
								// Extract product IDs
								const productIds = productReferences
									.map((ref: any) => {
										if (!ref) return null;
										// Extract the product ID from the reference
										return typeof ref === "string" ? ref : ref.id;
									})
									.filter(Boolean);

								// Fetch only the specific products we need
								if (productIds.length > 0) {
									const complementaryProducts = await getProductsByIds(productIds);
									debugLog("ProductContentClient", "Fetched complementary products", complementaryProducts.length);
									setComplementaryProducts(complementaryProducts);
								}
							}
						} catch (error) {
							console.error("Error parsing complementary products:", error);
							setComplementaryProducts([]);
						}
					} else {
						console.log("No complementary products metafield found");
						setComplementaryProducts([]);
					}
				} catch (error) {
					console.error("Error fetching complementary products:", error);
					setComplementaryProducts([]);
				}
			}
		};

		fetchComplementaryProducts();
	}, [product.metafields, product.recommendations?.nodes, mounted]);

	useEffect(() => {
		if (!mounted) return;

		try {
			// Get existing history from localStorage
			const existingHistory = JSON.parse(localStorage.getItem("viewedProducts") || "[]");

			// Create a clean product object with only necessary data
			const cleanProduct = {
				id: product.id,
				title: product.title,
				handle: product.handle,
				description: product.description,
				productType: product.productType,
				vendor: product.vendor,
				tags: product.tags,
				availableForSale: product.availableForSale,
				priceRange: product.priceRange,
				images: product.images,
				variants: {
					nodes: product.variants.nodes.map((variant) => ({
						id: variant.id,
						title: variant.title,
						availableForSale: variant.availableForSale,
						quantityAvailable: variant.quantityAvailable,
						price: variant.price,
						compareAtPrice: variant.compareAtPrice,
						selectedOptions: variant.selectedOptions,
					})),
				},
			};

			// Only add the current product if it's not already in history
			if (!existingHistory.some((p: { id: string }) => p.id === product.id)) {
				const updatedHistory = [cleanProduct, ...existingHistory].slice(0, 20);
				localStorage.setItem("viewedProducts", JSON.stringify(updatedHistory));
				setHistoryProducts(updatedHistory);
			} else {
				// Update the existing product data in history
				const updatedHistory = existingHistory.map((p: ShopifyProduct) => (p.id === product.id ? cleanProduct : p));
				localStorage.setItem("viewedProducts", JSON.stringify(updatedHistory));
				setHistoryProducts(updatedHistory);
			}
		} catch (error) {
			console.error("Error managing product history:", error);
			// If there's an error, try to clear the history
			localStorage.removeItem("viewedProducts");
			setHistoryProducts([]);
		}
	}, [mounted, product]);

	useEffect(() => {
		const fetchRandomProducts = async () => {
			// If we already have recommendations from the server, use those
			if (product.recommendations?.nodes && product.recommendations.nodes.length > 0) {
				debugLog("ProductContentClient", "Using server-provided recommendations for random products");
				setRandomProducts(product.recommendations.nodes);
				setRecommendedProducts(product.recommendations.nodes.slice(0, 8));
				return;
			}

			// If we've already fetched products, don't fetch again
			if (randomProducts.length > 0) {
				return;
			}

			// Try up to 2 attempts for fetching random products
			let success = false;
			let attempts = 0;
			const MAX_ATTEMPTS = 2;

			while (!success && attempts < MAX_ATTEMPTS) {
				attempts++;
				const controller = new AbortController();
				let timeoutId: NodeJS.Timeout | null = null;

				try {
					debugLog("ProductContentClient", `Fetching random products from API (attempt ${attempts}/${MAX_ATTEMPTS})`);

					// Set a longer timeout for the first attempt, shorter for retry
					const timeoutMs = attempts === 1 ? 8000 : 4000;

					// Set up the timeout after controller is created
					timeoutId = setTimeout(() => {
						controller.abort("Timeout exceeded");
					}, timeoutMs);

					// Use a cache-busting parameter only on retry attempts
					const cacheBuster = attempts > 1 ? `&_cacheBust=${Date.now()}` : "";

					// Try to use cached response if available on first attempt
					const cacheMode = attempts === 1 ? "force-cache" : "no-store";

					const randomProductsResponse = await fetch(
						`/api/random-products-new?exclude=${encodeURIComponent(product.id)}${cacheBuster}`,
						{
							signal: controller.signal,
							cache: cacheMode as RequestCache,
							// Use shorter timeout on second attempt
							next: { revalidate: attempts === 1 ? 3600 : 0 },
						}
					);

					// Clear timeout as soon as the fetch completes
					if (timeoutId) {
						clearTimeout(timeoutId);
						timeoutId = null;
					}

					if (!randomProductsResponse.ok) {
						throw new Error(`API returned ${randomProductsResponse.status}`);
					}

					const responseData = await randomProductsResponse.json();

					// Check if the response is an error message or has an error property
					if (responseData && responseData.error) {
						debugLog("ProductContentClient", "API returned an error", responseData);

						// If this is our last attempt, use fallbacks
						if (attempts >= MAX_ATTEMPTS) {
							useFallbackRecommendations();
							return;
						}

						// Otherwise continue to next attempt
						continue;
					}

					// Check if the response is a valid array of products
					if (Array.isArray(responseData) && responseData.length > 0) {
						debugLog("ProductContentClient", "Successfully fetched random products", responseData.length);
						setRandomProducts(responseData);
						setRecommendedProducts(responseData.slice(0, 8));
						success = true;
						return;
					} else {
						debugLog("ProductContentClient", "No products returned from API");

						// If this is our last attempt, use fallbacks
						if (attempts >= MAX_ATTEMPTS) {
							useFallbackRecommendations();
							return;
						}

						// Otherwise continue to next attempt
						continue;
					}
				} catch (fetchError) {
					// Always clear the timeout to prevent memory leaks
					if (timeoutId) {
						clearTimeout(timeoutId);
						timeoutId = null;
					}

					// Log the error but don't show to user
					console.warn(
						`Random products fetch failed (attempt ${attempts}/${MAX_ATTEMPTS}):`,
						fetchError instanceof Error ? fetchError.message : fetchError
					);

					// If we've tried enough times, give up and use fallbacks
					if (attempts >= MAX_ATTEMPTS) {
						useFallbackRecommendations();
						return;
					}

					// Small delay before next attempt
					await new Promise((resolve) => setTimeout(resolve, 500));
				}
			}
		};

		// Helper function to use fallback recommendations
		const useFallbackRecommendations = () => {
			// Try to use server-provided recommendations if available
			if (product.recommendations?.nodes?.length) {
				debugLog("ProductContentClient", "Using server recommendations as fallback");
				setRandomProducts(product.recommendations.nodes);
				setRecommendedProducts(product.recommendations.nodes.slice(0, 8));
			} else {
				// Last resort - empty arrays
				debugLog("ProductContentClient", "No fallback options available, using empty arrays");
				setRandomProducts([]);
				setRecommendedProducts([]);
			}
		};

		// Only fetch if we're mounted
		if (mounted) {
			fetchRandomProducts();
		}
	}, [mounted, product, randomProducts.length]);

	if (!mounted) {
		debugLog("ProductContentClient", "Not mounted yet");
		return null;
	}

	// Prepare JSON-LD data
	const jsonLd = {
		"@context": "https://schema.org/",
		"@type": "Product",
		name: product.title,
		description: product.description,
		image: product.images?.nodes?.[0]?.url,
		identifier: product.variants?.nodes?.[0]?.id,
		brand: {
			"@type": "Brand",
			name: product.vendor || "Zugzology",
		},
		offers: {
			"@type": "AggregateOffer",
			priceCurrency: "USD",
			lowPrice: product.priceRange.minVariantPrice.amount,
			highPrice: product.priceRange.maxVariantPrice.amount,
			offerCount: product.variants?.nodes?.length || 0,
			offers: product.variants?.nodes?.map((variant) => ({
				"@type": "Offer",
				price: variant.price.amount,
				priceCurrency: "USD",
				availability: variant.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
				url: `https://zugzology.com/products/${product.handle}?variant=${variant.id}`,
				priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
			})),
		},
	};

	// Add review data if available
	const reviewCount = product.metafields?.find((metafield) => metafield?.key === "review_count")?.value || "0";
	const ratingValue = product.metafields?.find((metafield) => metafield?.key === "rating")?.value || "5.0";

	// Only add review data if we have valid values
	if (reviewCount && ratingValue && parseFloat(reviewCount) > 0) {
		(jsonLd as any).aggregateRating = {
			"@type": "AggregateRating",
			ratingValue,
			reviewCount,
			bestRating: "5",
			worstRating: "1",
		};
	}

	return (
		<>
			{/* Add JSON-LD script */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLd),
				}}
			/>

			<section className="max-w-full mx-auto p-4" itemScope itemType="https://schema.org/Product">
				{/* Breadcrumb */}
				<Breadcrumb title={product.title} />

				<div className="grid grid-cols-1 md:grid-cols-[1fr_400px] xl:grid-cols-[minmax(0,1fr)_400px] gap-6 mb-8">
					{/* Left side container for gallery and info */}
					<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
						{/* Product Gallery */}
						<section aria-label="Product gallery" className="col-span-1">
							<div className="sticky top-[126px]">
								<ProductGallery
									product={product}
									media={mediaItems}
									title={product.title}
									selectedIndex={selectedImageIndex}
									onMediaSelect={handleImageSelect}
								/>
							</div>
						</section>

						{/* Product Info */}
						<section aria-label="Product information" className="col-span-1">
							<div className="space-y-4">
								{/* Product Title and Badges */}
								<div className="space-y-4">
									<h1 className="text-3xl font-bold tracking-tight text-gray-900" itemProp="name">
										{product.title}
									</h1>
									<meta
										itemProp="description"
										content={product.description || `${product.title} - Available at Zugzology`}
									/>
									<meta itemProp="brand" content={product.vendor || "Zugzology"} />
									<meta itemProp="category" content={product.productType || ""} />
									{product.tags && (
										<meta
											itemProp="keywords"
											content={Array.isArray(product.tags) ? product.tags.join(", ") : product.tags}
										/>
									)}

									{/* Ratings Section */}
									<div
										className="flex items-center gap-2"
										itemProp="aggregateRating"
										itemScope
										itemType="https://schema.org/AggregateRating"
									>
										<div className="flex items-center">
											{[1, 2, 3, 4, 5].map((star) => (
												<Star
													key={star}
													className={cn(
														"w-5 h-5",
														parseFloat(ratingValue) >= star
															? "fill-yellow-400 text-yellow-400"
															: parseFloat(ratingValue) >= star - 0.5
															? "fill-yellow-400/50 text-yellow-400"
															: "fill-muted text-muted-foreground"
													)}
												/>
											))}
										</div>
										<div className="flex items-center gap-1.5">
											<span className="text-sm font-medium" itemProp="ratingValue">
												{parseFloat(ratingValue).toFixed(1)}
											</span>
											<span className="text-sm text-gray-500">
												({reviewCount} {parseInt(reviewCount) === 1 ? "review" : "reviews"})
											</span>
											<button className="text-sm text-purple-600 hover:underline ml-2">View all reviews</button>
										</div>
										<meta itemProp="bestRating" content="5" />
										<meta itemProp="worstRating" content="1" />
										<meta itemProp="reviewCount" content={reviewCount} />
									</div>

									{/* Badges */}
									<div className="flex flex-wrap gap-2" aria-label="Product badges">
										{/* Brand Badge - Always show with fallback to vendor */}
										<Badge
											variant="secondary"
											className="text-xs font-semibold bg-purple-100 text-purple-800 hover:bg-purple-200"
										>
											{product.vendor || "Zugzology"}
										</Badge>

										{/* Category Badge */}
										{product.productType && (
											<Badge
												variant="secondary"
												className="text-xs font-semibold bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
											>
												{product.productType}
											</Badge>
										)}

										{/* Status Badges */}
										{!selectedVariant?.availableForSale && (
											<Badge variant="secondary" className="text-xs font-semibold bg-red-100 text-red-800">
												Out of Stock
											</Badge>
										)}
										{product.tags?.includes("new") && (
											<Badge variant="secondary" className="text-xs font-semibold bg-green-100 text-green-800">
												New Arrival
											</Badge>
										)}
										{product.tags?.includes("bestseller") && (
											<Badge variant="secondary" className="text-xs font-semibold bg-amber-100 text-amber-800">
												Best Seller
											</Badge>
										)}
									</div>
								</div>

								{/* Product Info Component */}
								<ProductInfo
									product={product}
									selectedVariant={selectedVariant}
									selectedOptions={selectedOptions}
									onOptionChange={handleOptionChange}
									complementaryProducts={recommendedProducts}
								/>
							</div>
						</section>
					</div>

					{/* Product Actions */}
					<section aria-label="Purchase options" className="col-span-1 w-full lg:max-w-[400px] justify-self-end">
						<div className="sticky top-[126px]">
							<ProductActions
								selectedVariant={selectedVariant}
								quantity={quantity}
								onQuantityChange={handleQuantityChange}
								productHandle={product.handle}
							/>
						</div>
					</section>
				</div>

				{/* Additional Sections */}

				{/* History & Recommendations - Most likely to convert (personalized to user) */}
				{mounted && (
					<section className="mt-16">
						<HistoryRecommendations
							products={historyProducts}
							recommendedProducts={recommendedProducts}
							randomProducts={randomProducts}
							currentProductId={product.id}
						/>
					</section>
				)}

				{/* Frequently Bought Together - High conversion rate (complementary products) */}
				{mounted && (
					<section className="mt-16">
						<FrequentlyBoughtTogether
							mainProduct={product}
							complementaryProducts={
								complementaryProducts.length > 0 ? complementaryProducts : randomProducts.slice(0, 3)
							}
						/>
					</section>
				)}

				{/* Related Products - Good conversion (product-specific recommendations) */}
				{mounted && recommendedProducts.length > 0 && (
					<section className="mt-16" itemScope itemType="https://schema.org/ItemList">
						<meta itemProp="name" content="Related Products" />
						<meta itemProp="description" content={`Products related to ${product.title}`} />
						<RelatedProducts products={recommendedProducts} currentProductId={product.id} />
					</section>
				)}

				{/* Additional Product Section - General interest recommendations */}
				{mounted && randomProducts.length > 0 && (
					<section className="mt-16">
						<ProductSection
							title="You Might Also Like"
							description="Products you might be interested in"
							products={randomProducts.map((product) => ({
								product,
								source: "recommendation" as ProductSource,
								sectionId: "you-might-also-like",
							}))}
							sectionId="you-might-also-like"
							currentProductId={product.id}
						/>
					</section>
				)}

				{/* Recent Blog Posts - Always at the bottom of the list */}
				{mounted && (
					<section className="mt-16 mb-16" itemScope itemType="https://schema.org/Blog">
						<meta itemProp="name" content="Latest Blog Posts" />
						{recentPosts.length > 0 ? (
							<RecentPosts posts={recentPosts} />
						) : (
							<div className="border-t dark:border-neutral-800 pt-16">
								<h2 className="text-2xl font-bold mb-8 text-gray-900">Latest from Our Blog</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
									{Array.from({ length: 3 }).map((_, i) => (
										<div key={i} className="space-y-4 animate-pulse">
											<div className="aspect-[16/9] bg-neutral-200 dark:bg-neutral-800 rounded-xl"></div>
											<div className="space-y-2">
												<div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3"></div>
												<div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3"></div>
												<div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
												<div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</section>
				)}
			</section>
		</>
	);
};

export default ProductContentClient;
