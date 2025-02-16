"use client";

import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { ProductGallery } from "./sections/product-gallery";
import { ShopifyProduct, ShopifyProductVariant, ShopifyMediaImage, ShopifyMediaVideo, ShopifyBlogArticle, ShopifyExternalVideo, ShopifyImage } from "@/lib/types";
import { ProductInfo } from "./sections/product-info";
import { ProductActions } from "./sections/product-actions";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getProducts, getAllBlogPosts } from "@/lib/actions/shopify";
import { RelatedProducts } from "./sections/related-products";
import { RecentPosts } from "@/components/blog/recent-posts";
import { HistoryRecommendations } from "./sections/history-recommendations";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { FrequentlyBoughtTogether } from "./sections/frequently-bought-together";

interface ProductContentClientProps {
	product: ShopifyProduct;
}

interface SelectedOptions {
	[key: string]: string;
}

type MediaNode = ShopifyMediaImage | ShopifyMediaVideo | ShopifyExternalVideo;

// Memoized helper functions
const getInitialSelectedOptions = (variant: ShopifyProductVariant): SelectedOptions => {
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

const findMatchingVariant = (variants: { node: ShopifyProductVariant }[], selectedOptions: SelectedOptions): ShopifyProductVariant | undefined => {
	return variants.find(({ node }) => node.selectedOptions?.every((option) => selectedOptions[option.name] === option.value))?.node;
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

export const ProductContentClient = ({ product }: ProductContentClientProps) => {
	const [mounted, setMounted] = useState(false);
	const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant>(product.variants.edges[0].node);
	const [quantity, setQuantity] = useState(1);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(() => getInitialSelectedOptions(product.variants.edges[0].node));
	const [recommendedProducts, setRecommendedProducts] = useState<ShopifyProduct[]>([]);
	const [recentPosts, setRecentPosts] = useState<ShopifyBlogArticle[]>([]);
	const [historyProducts, setHistoryProducts] = useState<ShopifyProduct[]>([]);
	const [randomProducts, setRandomProducts] = useState<ShopifyProduct[]>([]);
	const [complementaryProducts, setComplementaryProducts] = useState<ShopifyProduct[]>([]);

	// Get complementary products from metafield
	useEffect(() => {
		console.log("Product data:", product); // Debug log
		console.log("Complementary products data:", product.complementaryProducts); // Debug log

		if (product.complementaryProducts?.references?.edges) {
			const complementary = product.complementaryProducts.references.edges
				.map((edge) => edge.node)
				.filter((node) => {
					// Validate required fields
					const isValid = Boolean(node && node.id && node.title && node.priceRange?.minVariantPrice?.amount && node.variants?.edges?.[0]?.node);

					if (!isValid) {
						console.warn("Invalid complementary product:", node);
					}

					return isValid;
				});

			console.log("Validated complementary products:", complementary); // Debug log
			setComplementaryProducts(complementary);
		} else {
			console.log("No complementary products found in metafield"); // Debug log
			setComplementaryProducts([]);
		}
	}, [product.complementaryProducts?.references?.edges]);

	// Memoize media array
	const mediaItems = useMemo(() => {
		console.log("Building media items from:", {
			media: product.media?.edges,
			images: product.images?.edges,
		}); // Debug log

		const items: (ShopifyMediaImage | ShopifyMediaVideo | ShopifyExternalVideo)[] = [];

		try {
			// Add media items if they exist
			if (product.media?.edges) {
				product.media.edges.forEach(({ node }) => {
					console.log("Processing media node:", node); // Debug log

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
			if (product.images?.edges) {
				product.images.edges.forEach(({ node }) => {
					// Only add if there isn't already media for this image
					if (!items.some((media) => media.mediaContentType === "IMAGE" && (media as ShopifyMediaImage).image?.url === node.url)) {
						items.push({
							id: `image-${node.url}`,
							mediaContentType: "IMAGE",
							image: node,
						} as ShopifyMediaImage);
					}
				});
			}

			console.log("Final media items:", items); // Debug log
		} catch (error) {
			console.error("Error processing product media:", error);
		}

		return items;
	}, [product.media?.edges, product.images?.edges]);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Track viewed products in localStorage
	useEffect(() => {
		if (!mounted) return;

		// Get existing history
		const existingHistory = JSON.parse(localStorage.getItem("viewedProducts") || "[]");

		// Add current product to history if not already present
		if (!existingHistory.some((p: { id: string }) => p.id === product.id)) {
			const updatedHistory = [product, ...existingHistory].slice(0, 20); // Keep last 20 products
			localStorage.setItem("viewedProducts", JSON.stringify(updatedHistory));
		}

		// Set history products
		setHistoryProducts(existingHistory);
	}, [mounted, product]);

	// Get recommended products from metafield
	useEffect(() => {
		const recommendations = product.recommendations?.references?.edges?.map((edge) => edge.node) || [];
		console.log("Product recommendations:", recommendations);
		setRecommendedProducts(recommendations);
	}, [product.recommendations?.references?.edges]);

	// Get random products when no history or recommendations
	useEffect(() => {
		const fetchRandomProducts = async () => {
			if (!historyProducts.length && !recommendedProducts.length) {
				const allProducts = await getProducts();
				if (allProducts?.length) {
					// Shuffle products and take up to 10
					const shuffled = [...allProducts]
						.filter((p) => p.id !== product.id) // Exclude current product
						.sort(() => 0.5 - Math.random())
						.slice(0, 10);
					setRandomProducts(shuffled);
				}
			}
		};
		fetchRandomProducts();
	}, [historyProducts.length, recommendedProducts.length, product.id]);

	// Get recent blog posts
	useEffect(() => {
		const fetchRecentPosts = async () => {
			const posts = await getAllBlogPosts();
			setRecentPosts(posts || []);
		};
		fetchRecentPosts();
	}, []);

	// Memoize variant selection effect
	useEffect(() => {
		if (!mounted) return;

		const matchingVariant = findMatchingVariant(product.variants.edges, selectedOptions);
		if (matchingVariant) {
			setSelectedVariant(matchingVariant);

			// Find the matching image for this variant if it has one
			if (matchingVariant.image) {
				const variantImageIndex = product.images.edges.findIndex(({ node }) => node.url === matchingVariant.image?.url);
				if (variantImageIndex >= 0) {
					setSelectedImageIndex(variantImageIndex);
				}
			}
		}
	}, [selectedOptions, product.variants.edges, product.images.edges, mounted]);

	// Memoize handlers
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

	// Prepare JSON-LD data
	const jsonLd = {
		"@context": "https://schema.org/",
		"@type": "Product",
		name: product.title,
		description: product.description,
		image: product.images?.edges[0]?.node?.url,
		identifier: product.variants?.edges[0]?.node?.id,
		brand: {
			"@type": "Brand",
			name: product.vendor || "Zugzology",
		},
		offers: {
			"@type": "AggregateOffer",
			priceCurrency: "USD",
			lowPrice: product.priceRange.minVariantPrice.amount,
			highPrice: product.priceRange.maxVariantPrice.amount,
			offerCount: product.variants.edges.length,
			offers: product.variants.edges.map(({ node }) => ({
				"@type": "Offer",
				price: node.price.amount,
				priceCurrency: "USD",
				availability: node.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
				url: `https://zugzology.com/products/${product.handle}?variant=${node.id}`,
				priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
			})),
		},
	};

	// Add review data if available
	const reviewCount = product.metafields?.edges?.find(({ node }) => node.key === "review_count")?.node.value || "847";
	const ratingValue = product.metafields?.edges?.find(({ node }) => node.key === "rating")?.node.value || "4.8";

	if (reviewCount && ratingValue) {
		(jsonLd as any).aggregateRating = {
			"@type": "AggregateRating",
			ratingValue,
			reviewCount,
			bestRating: "5",
			worstRating: "1",
		};
	}

	if (!mounted) return null;

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
				{/* Add BreadcrumbList schema */}
				<nav aria-label="Breadcrumb" className="mb-4 hidden md:block" itemScope itemType="https://schema.org/BreadcrumbList">
					<ol className="flex items-center space-x-2 text-sm">
						<li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
							<a href="/" className="text-neutral-500 hover:text-neutral-700" itemProp="item">
								<span itemProp="name">Home</span>
							</a>
							<meta itemProp="position" content="1" />
						</li>
						<li className="text-neutral-500">/</li>
						<li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
							<a href="/products" className="text-neutral-500 hover:text-neutral-700" itemProp="item">
								<span itemProp="name">Products</span>
							</a>
							<meta itemProp="position" content="2" />
						</li>
						<li className="text-neutral-500">/</li>
						<li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
							<span className="text-neutral-900" itemProp="name" aria-current="page">
								{product.title}
							</span>
							<meta itemProp="position" content="3" />
						</li>
					</ol>
				</nav>

				<div className="grid grid-cols-1 md:grid-cols-[1fr_400px] xl:grid-cols-[minmax(0,1fr)_400px] gap-6 mb-8">
					{/* Left side container for gallery and info */}
					<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
						<section aria-label="Product gallery" className="col-span-1">
							<div className="sticky top-[126px]">
								<ProductGallery media={mediaItems} title={product.title} selectedIndex={selectedImageIndex} onMediaSelect={handleImageSelect} product={product} />
							</div>
						</section>

						{/* Mobile Title and Badges */}
						<div className="xl:hidden space-y-4">
							{/* Product Title with enhanced schema */}
							<h1 className="text-3xl font-bold tracking-tight" itemProp="name">
								{product.title}
							</h1>
							<meta itemProp="description" content={product.description || `${product.title} - Available at Zugzology`} />
							<meta itemProp="brand" content={product.vendor || "Zugzology"} />
							<meta itemProp="category" content={product.productType || ""} />
							{product.tags && <meta itemProp="keywords" content={Array.isArray(product.tags) ? product.tags.join(", ") : product.tags} />}

							{/* Ratings Section - Always show for testing */}
							<div className="flex items-center gap-2" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
								<div className="flex items-center">
									{[1, 2, 3, 4, 5].map((star) => (
										<Star key={star} className={cn("w-5 h-5", parseFloat(ratingValue) >= star ? "fill-yellow-400 text-yellow-400" : parseFloat(ratingValue) >= star - 0.5 ? "fill-yellow-400/50 text-yellow-400" : "fill-muted text-muted-foreground")} />
									))}
								</div>
								<div className="flex items-center gap-1.5">
									<span className="text-sm font-medium" itemProp="ratingValue">
										{parseFloat(ratingValue).toFixed(1)}
									</span>
									<span className="text-sm text-muted-foreground">
										({reviewCount} {parseInt(reviewCount) === 1 ? "review" : "reviews"})
									</span>
									<button className="text-sm text-primary hover:underline ml-2">View all reviews</button>
								</div>
								<meta itemProp="bestRating" content="5" />
								<meta itemProp="worstRating" content="1" />
								<meta itemProp="reviewCount" content={reviewCount} />
							</div>

							{/* Badges with semantic meaning */}
							<div className="flex flex-wrap gap-2" aria-label="Product badges">
								{/* Brand Badge - Always show with fallback to vendor */}
								<Badge variant="secondary" className="text-xs font-semibold bg-purple-100 text-purple-800 hover:bg-purple-200">
									{product.vendor || "Zugzology"}
								</Badge>

								{/* Category Badge */}
								{product.productType && (
									<Badge variant="secondary" className="text-xs font-semibold bg-neutral-100 text-neutral-800 hover:bg-neutral-200">
										{product.productType}
									</Badge>
								)}

								{/* Status Badges */}
								{!selectedVariant.availableForSale && (
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

						{/* Mobile Product Actions */}
						<div className="xl:hidden">
							<ProductActions selectedVariant={selectedVariant} quantity={quantity} onQuantityChange={handleQuantityChange} productHandle={product.handle} />
						</div>

						<section aria-label="Product information" className="col-span-1">
							<div className="space-y-4">
								{/* Desktop Title and Badges - hidden on mobile */}
								<div className="hidden xl:block">
									{/* Product Title with enhanced schema */}
									<h1 className="text-3xl font-bold tracking-tight" itemProp="name">
										{product.title}
									</h1>
									<meta itemProp="description" content={product.description || `${product.title} - Available at Zugzology`} />
									<meta itemProp="brand" content={product.vendor || "Zugzology"} />
									<meta itemProp="category" content={product.productType || ""} />
									{product.tags && <meta itemProp="keywords" content={Array.isArray(product.tags) ? product.tags.join(", ") : product.tags} />}

									{/* Ratings Section - Always show for testing */}
									<div className="flex items-center gap-2 mt-2" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
										<div className="flex items-center">
											{[1, 2, 3, 4, 5].map((star) => (
												<Star key={star} className={cn("w-5 h-5", parseFloat(ratingValue) >= star ? "fill-yellow-400 text-yellow-400" : parseFloat(ratingValue) >= star - 0.5 ? "fill-yellow-400/50 text-yellow-400" : "fill-muted text-muted-foreground")} />
											))}
										</div>
										<div className="flex items-center gap-1.5">
											<span className="text-sm font-medium" itemProp="ratingValue">
												{parseFloat(ratingValue).toFixed(1)}
											</span>
											<span className="text-sm text-muted-foreground">
												({reviewCount} {parseInt(reviewCount) === 1 ? "review" : "reviews"})
											</span>
											<button className="text-sm text-primary hover:underline ml-2">View all reviews</button>
										</div>
										<meta itemProp="bestRating" content="5" />
										<meta itemProp="worstRating" content="1" />
										<meta itemProp="reviewCount" content={reviewCount} />
									</div>

									{/* Badges with semantic meaning */}
									<div className="flex flex-wrap gap-2 mt-4" aria-label="Product badges">
										{/* Brand Badge - Always show with fallback to vendor */}
										<Badge variant="secondary" className="text-xs font-semibold bg-purple-100 text-purple-800 hover:bg-purple-200">
											{product.vendor || "Zugzology"}
										</Badge>

										{/* Category Badge */}
										{product.productType && (
											<Badge variant="secondary" className="text-xs font-semibold bg-neutral-100 text-neutral-800 hover:bg-neutral-200">
												{product.productType}
											</Badge>
										)}

										{/* Status Badges */}
										{!selectedVariant.availableForSale && (
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

								<ProductInfo product={product} selectedVariant={selectedVariant} selectedOptions={selectedOptions} onOptionChange={handleOptionChange} complementaryProducts={recommendedProducts} />
							</div>
						</section>
					</div>

					{/* Desktop Product Actions */}
					<section aria-label="Purchase options" className="hidden xl:block col-span-1 w-full lg:max-w-[400px] justify-self-end">
						<div className="sticky top-[126px]">
							<ProductActions selectedVariant={selectedVariant} quantity={quantity} onQuantityChange={handleQuantityChange} productHandle={product.handle} />
						</div>
					</section>
				</div>

				{/* History & Recommendations Section */}
				<section className="mt-16">
					<HistoryRecommendations products={historyProducts} recommendedProducts={recommendedProducts} randomProducts={randomProducts} currentProductId={product.id} />
				</section>

				{/* Related Products Section with enhanced schema */}
				{recommendedProducts.length > 0 && (
					<section className="mt-16" itemScope itemType="https://schema.org/ItemList">
						<meta itemProp="name" content="Related Products" />
						<meta itemProp="description" content="Products related to ${product.title}" />
						<RelatedProducts products={recommendedProducts} currentProductId={product.id} />
					</section>
				)}

				{/* Recent Blog Posts Section with enhanced schema */}
				{recentPosts.length > 0 && (
					<section itemScope itemType="https://schema.org/Blog">
						<meta itemProp="name" content="Latest Blog Posts" />
						<RecentPosts posts={recentPosts} />
					</section>
				)}

				{/* Frequently Bought Together Section */}
				{complementaryProducts && complementaryProducts.length > 0 && product && (
					<section className="mt-16 mb-16">
						<FrequentlyBoughtTogether mainProduct={product} complementaryProducts={complementaryProducts.filter((p) => p?.id)} />
					</section>
				)}
			</section>
		</>
	);
};

export default ProductContentClient;
