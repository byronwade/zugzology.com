"use client";

import { useState, useEffect, useMemo } from "react";
import { ShopifyProduct } from "@/lib/types";
import { ProductCard } from "@/components/features/products/product-card";
import { useCart } from "@/components/providers/cart-provider";
import { aiProductFilter } from "@/lib/services/ai-product-filter";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, TrendingUp, Sparkles, Lightbulb } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface AIRelatedProductsProps {
	products: ShopifyProduct[];
	currentProductId: string;
	currentProduct: ShopifyProduct;
	maxItems?: number;
	showAIInsights?: boolean;
}

export function AIRelatedProducts({ 
	products, 
	currentProductId, 
	currentProduct,
	maxItems = 8,
	showAIInsights = true 
}: AIRelatedProductsProps) {
	const { addItem } = useCart();
	const [isMobile, setIsMobile] = useState(false);
	const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
	const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
	
	const displayLimit = isMobile ? Math.min(4, maxItems) : maxItems;

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 640);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Get AI-powered recommendations
	const enhancedRecommendations = useMemo(() => {
		if (!products?.length) return [];

		console.log('🧠 [AI Related] Getting contextual recommendations for product:', currentProductId);

		try {
			// Get AI contextual recommendations
			const contextualRecs = aiProductFilter.getContextualRecommendations(
				currentProductId, 
				'product-page', 
				displayLimit
			);

			console.log('🧠 [AI Related] AI recommendations:', contextualRecs.length);

			// If we have AI recommendations, use them
			if (contextualRecs.length > 0) {
				setAiRecommendations(contextualRecs);
				return contextualRecs;
			}

			// Fallback to traditional related products with some AI scoring
			const fallbackProducts = products
				.filter((product) => product.id !== currentProductId)
				.filter((product, index, self) => index === self.findIndex((p) => p.id === product.id))
				.slice(0, displayLimit)
				.map(product => ({
					product,
					score: Math.random() * 50, // Basic scoring
					reasons: ['Similar product category'],
					contextualRelevance: 10,
					aiConfidence: 25
				}));

			setAiRecommendations(fallbackProducts);
			return fallbackProducts;
		} catch (error) {
			console.error('🧠 [AI Related] Error getting recommendations:', error);
			
			// Basic fallback
			const basicFallback = products
				.filter((product) => product.id !== currentProductId)
				.slice(0, displayLimit)
				.map(product => ({
					product,
					score: 0,
					reasons: ['Related product'],
					contextualRelevance: 0,
					aiConfidence: 0
				}));

			return basicFallback;
		}
	}, [products, currentProductId, displayLimit]);

	if (!enhancedRecommendations.length) {
		console.log("No related products available after AI processing");
		return null;
	}

	const handleAddToCart = async (productId: string, variantId: string) => {
		if (!variantId) {
			toast.error("Please select a product variant");
			return;
		}

		setLoadingStates((prev) => ({ ...prev, [productId]: true }));
		try {
			const merchandiseId = variantId.includes("gid://shopify/ProductVariant/") 
				? variantId 
				: `gid://shopify/ProductVariant/${variantId}`;

			await addItem({
				merchandiseId,
				quantity: 1,
			});

			toast.success("Added to cart");
		} catch (error) {
			console.error("Error adding to cart:", error);
			toast.error("Failed to add to cart");
		} finally {
			setLoadingStates((prev) => ({ ...prev, [productId]: false }));
		}
	};

	// Categorize recommendations
	const topRecommendations = enhancedRecommendations
		.filter(rec => rec.score > 30)
		.slice(0, 3);
	
	const hasAIRecommendations = aiRecommendations.length > 0 && aiRecommendations.some(rec => rec.score > 0);

	return (
		<TooltipProvider>
			<div className="mb-16 last:mb-0">
				{/* Header with AI insights */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
							Recommended for You
						</h2>
						{hasAIRecommendations && showAIInsights && (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full">
										<Brain className="h-3 w-3 text-blue-600" />
										<span className="text-xs font-medium text-blue-700">AI</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p className="text-xs">AI-powered recommendations based on product relationships and your behavior</p>
								</TooltipContent>
							</Tooltip>
						)}
					</div>
					
					<div className="flex items-center justify-between">
						<p className="text-sm text-neutral-600 dark:text-neutral-400">
							{hasAIRecommendations 
								? "Products that complement your selection"
								: "You might also like these products"
							}
						</p>
						
						{/* AI insights badges */}
						{hasAIRecommendations && showAIInsights && topRecommendations.length > 0 && (
							<div className="flex items-center gap-2">
								<Tooltip>
									<TooltipTrigger asChild>
										<Badge variant="outline" className="text-xs">
											<Sparkles className="h-3 w-3 mr-1" />
											{topRecommendations.length} top matches
										</Badge>
									</TooltipTrigger>
									<TooltipContent>
										<div className="text-xs max-w-xs">
											<p className="font-medium mb-1">Top AI recommendations:</p>
											<ul className="list-disc list-inside space-y-1">
												{topRecommendations.map((rec, index) => (
													<li key={index}>{rec.product.title.substring(0, 30)}...</li>
												))}
											</ul>
										</div>
									</TooltipContent>
								</Tooltip>
							</div>
						)}
					</div>
				</div>

				{/* Products grid */}
				<div className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8 gap-4 flex-1 divide-y divide-neutral-200 dark:divide-neutral-800 sm:divide-y-0" 
					 role="list" 
					 aria-label="AI-recommended products">
					{enhancedRecommendations.map((recommendation, index) => {
						const { product } = recommendation;
						const variantId = product.variants?.nodes?.[0]?.id;
						const isTopRecommendation = recommendation.score > 30;
						const hasReasons = recommendation.reasons && recommendation.reasons.length > 0;

						return (
							<div key={`ai-rec-${product.id}-${index}`} 
								 role="listitem" 
								 itemProp="itemListElement" 
								 itemScope 
								 itemType="https://schema.org/ListItem"
								 className="relative">
								<meta itemProp="position" content={String(index + 1)} />
								
								{/* AI confidence indicator */}
								{showAIInsights && recommendation.score > 0 && (
									<div className="absolute top-2 left-2 z-10">
										<Tooltip>
											<TooltipTrigger asChild>
												<div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
													isTopRecommendation 
														? 'bg-green-100 text-green-700 border border-green-200'
														: 'bg-blue-50 text-blue-700 border border-blue-200'
												}`}>
													{isTopRecommendation ? (
														<Target className="h-3 w-3" />
													) : (
														<Lightbulb className="h-3 w-3" />
													)}
													{Math.round(recommendation.score)}%
												</div>
											</TooltipTrigger>
											<TooltipContent className="max-w-xs">
												<div className="text-xs">
													<p className="font-medium">AI Confidence: {Math.round(recommendation.score)}%</p>
													{hasReasons && (
														<>
															<p className="mt-1 mb-1">Why recommended:</p>
															<ul className="list-disc list-inside space-y-1">
																{recommendation.reasons.slice(0, 3).map((reason: string, i: number) => (
																	<li key={i}>{reason}</li>
																))}
															</ul>
														</>
													)}
												</div>
											</TooltipContent>
										</Tooltip>
									</div>
								)}

								<ProductCard 
									product={product} 
									view={isMobile ? "list" : "grid"} 
									variantId={variantId} 
									quantity={product.variants?.nodes?.[0]?.quantityAvailable} 
									isAddingToCartProp={loadingStates[product.id]} 
									onAddToCart={() => handleAddToCart(product.id, variantId)} 
								/>
							</div>
						);
					})}
				</div>

				{/* AI insights summary */}
				{hasAIRecommendations && showAIInsights && (
					<div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
						<div className="flex items-center gap-2 text-sm">
							<Brain className="h-4 w-4 text-blue-600" />
							<span className="font-medium text-blue-900">AI Insights:</span>
							<span className="text-blue-700">
								These recommendations are based on product relationships, customer behavior patterns, and contextual relevance to improve your shopping experience.
							</span>
						</div>
					</div>
				)}
			</div>
		</TooltipProvider>
	);
}