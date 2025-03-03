"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearch } from "@/lib/providers/search-provider";
import { ShopifyProduct, ShopifyBlogArticle } from "@/lib/types";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, Clock, Tag, BookOpen, Search, ShoppingBag, Sparkles, TrendingUp, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchDropdown() {
	const router = useRouter();
	const {
		searchQuery,
		searchResults,
		isSearching,
		isDropdownOpen,
		setIsDropdownOpen,
		recentSearches,
		addRecentSearch,
		allProducts,
	} = useSearch();

	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [setIsDropdownOpen]);

	// Handle navigation to search result
	const handleSelectItem = (item: ShopifyProduct | ShopifyBlogArticle, type: "product" | "blog") => {
		if (searchQuery.trim()) {
			addRecentSearch(searchQuery);
		}

		setIsDropdownOpen(false);

		if (type === "product") {
			const product = item as ShopifyProduct;
			router.push(`/products/${product.handle}`);
		} else {
			const article = item as ShopifyBlogArticle;
			// Check if blog exists before accessing handle
			if (article.blog) {
				router.push(`/blogs/${article.blog.handle}/${article.handle}`);
			} else {
				// Fallback if blog information is missing
				router.push(`/blogs/all/${article.handle}`);
			}
		}
	};

	// Handle navigation to search page
	const handleViewAllResults = () => {
		if (searchQuery.trim()) {
			addRecentSearch(searchQuery);
			router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
			setIsDropdownOpen(false);
		}
	};

	// Handle recent search click
	const handleRecentSearchClick = (query: string) => {
		router.push(`/search?q=${encodeURIComponent(query)}`);
		setIsDropdownOpen(false);
	};

	// Navigate to all products
	const handleBrowseAllProducts = () => {
		router.push("/products");
		setIsDropdownOpen(false);
	};

	// Navigate to featured collection
	const handleFeaturedCollection = () => {
		router.push("/collections/featured");
		setIsDropdownOpen(false);
	};

	// Navigate to trending products
	const handleTrendingProducts = () => {
		router.push("/collections/trending");
		setIsDropdownOpen(false);
	};

	// Navigate to new arrivals
	const handleNewArrivals = () => {
		router.push("/collections/new-arrivals");
		setIsDropdownOpen(false);
	};

	if (!isDropdownOpen) return null;

	// Group results by type
	const productResults = searchResults.filter((result) => result.type === "product");
	const blogResults = searchResults.filter((result) => result.type === "blog");

	// Get featured products for empty state
	const featuredProducts = allProducts.slice(0, 3);

	// Generate structured data for search
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		url: "https://zugzology.com/",
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: "https://zugzology.com/search?q={search_term_string}",
			},
			"query-input": "required name=search_term_string",
		},
	};

	return (
		<div
			ref={dropdownRef}
			className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden max-h-[70vh] sm:max-h-[80vh] w-full"
			style={{ maxWidth: "calc(100vw - 16px)" }}
			role="search"
			aria-label="Search products and articles"
		>
			{/* Add structured data for SEO */}
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

			<Command className="w-full">
				<CommandList className="max-h-[70vh] sm:max-h-[80vh] overflow-auto">
					{isSearching ? (
						<div className="py-8 text-center">
							<div
								className="animate-spin inline-block w-8 h-8 border-2 border-current border-t-transparent text-primary rounded-full"
								aria-hidden="true"
							></div>
							<p className="mt-3 text-sm text-muted-foreground">Searching our catalog...</p>
							<p className="text-xs text-muted-foreground mt-1">Finding the best matches for you</p>
						</div>
					) : (
						<>
							{/* Empty state when no search query */}
							{searchQuery.trim() === "" && (
								<>
									{/* Recent searches section */}
									{recentSearches.length > 0 && (
										<CommandGroup heading="Recent Searches">
											<ScrollArea className="max-h-[150px] sm:max-h-[200px]">
												{recentSearches.map((query, index) => (
													<CommandItem
														key={`recent-${index}`}
														onSelect={() => handleRecentSearchClick(query)}
														className="flex items-center gap-2 px-3 sm:px-4 py-2 cursor-pointer text-sm"
													>
														<Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
														<span className="truncate">{query}</span>
													</CommandItem>
												))}
											</ScrollArea>
										</CommandGroup>
									)}

									{/* Popular categories */}
									<CommandGroup heading="Popular Categories">
										<div className="grid grid-cols-2 gap-2 p-3">
											<Button
												variant="outline"
												size="sm"
												className="flex items-center justify-start gap-2 h-auto py-3"
												onClick={handleBrowseAllProducts}
											>
												<ShoppingBag className="h-4 w-4 text-purple-500" />
												<span>All Products</span>
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="flex items-center justify-start gap-2 h-auto py-3"
												onClick={handleFeaturedCollection}
											>
												<Sparkles className="h-4 w-4 text-amber-500" />
												<span>Featured</span>
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="flex items-center justify-start gap-2 h-auto py-3"
												onClick={handleTrendingProducts}
											>
												<TrendingUp className="h-4 w-4 text-green-500" />
												<span>Trending</span>
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="flex items-center justify-start gap-2 h-auto py-3"
												onClick={handleNewArrivals}
											>
												<Zap className="h-4 w-4 text-blue-500" />
												<span>New Arrivals</span>
											</Button>
										</div>
									</CommandGroup>

									{/* Featured products */}
									{featuredProducts.length > 0 && (
										<CommandGroup heading="Featured Products">
											<ScrollArea className="max-h-[250px] sm:max-h-[300px]">
												{featuredProducts.map((product) => (
													<CommandItem
														key={product.id}
														onSelect={() => handleSelectItem(product, "product")}
														className="flex items-start gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer"
													>
														{product.images && product.images.nodes && product.images.nodes.length > 0 && (
															<div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-800">
																<Image
																	src={product.images.nodes[0].url}
																	alt={product.title}
																	fill
																	sizes="(max-width: 640px) 40px, 48px"
																	className="object-cover"
																/>
															</div>
														)}
														<div className="flex-1 min-w-0">
															<p className="font-medium text-xs sm:text-sm truncate">{product.title}</p>
															<div className="flex items-center mt-1">
																<Tag className="h-3 w-3 text-muted-foreground mr-1" />
																<p className="text-xs text-muted-foreground truncate">
																	{product.priceRange.minVariantPrice.amount ===
																	product.priceRange.maxVariantPrice.amount
																		? `$${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}`
																		: `$${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(
																				2
																		  )} - $${parseFloat(product.priceRange.maxVariantPrice.amount).toFixed(2)}`}
																</p>
															</div>
														</div>
													</CommandItem>
												))}
											</ScrollArea>
										</CommandGroup>
									)}

									{/* Search tips */}
									<div className="p-4 border-t border-gray-200 dark:border-gray-800">
										<div className="text-xs text-muted-foreground">
											<p className="font-medium mb-1">Search Tips:</p>
											<ul className="list-disc pl-4 space-y-1">
												<li>Try specific product names or categories</li>
												<li>Use multiple keywords for better results</li>
												<li>Search by product type or brand</li>
											</ul>
										</div>
									</div>
								</>
							)}

							{/* Search results */}
							{searchQuery.trim() !== "" && (
								<>
									{productResults.length === 0 && blogResults.length === 0 ? (
										<div className="py-8 px-4">
											<div className="text-center mb-6">
												<div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
													<Search className="h-8 w-8 text-primary" />
												</div>
												<h3 className="text-lg font-semibold mb-2">No results found for "{searchQuery}"</h3>
												<p className="text-sm text-muted-foreground mb-4">
													We couldn't find any matches for your search. Try our suggestions below.
												</p>
											</div>

											{/* Suggestions for no results */}
											<div className="space-y-6">
												<div className="bg-accent/30 rounded-lg p-4">
													<h4 className="text-sm font-medium mb-2 flex items-center">
														<Search className="h-4 w-4 mr-2 text-primary" />
														Search Tips
													</h4>
													<ul className="text-sm text-muted-foreground space-y-2 pl-5 list-disc">
														<li>Check the spelling of your search terms</li>
														<li>Use more general keywords (e.g., "shirt" instead of "blue cotton shirt")</li>
														<li>Try searching for related products or categories</li>
														<li>Remove any special characters or punctuation</li>
													</ul>
												</div>

												<div>
													<h4 className="text-sm font-medium mb-3 flex items-center">
														<Sparkles className="h-4 w-4 mr-2 text-amber-500" />
														Popular Categories
													</h4>
													<div className="grid grid-cols-2 gap-2">
														<Button
															variant="outline"
															size="sm"
															className="flex items-center justify-start gap-2 h-auto py-2.5 hover:bg-primary/5 transition-colors"
															onClick={handleBrowseAllProducts}
														>
															<ShoppingBag className="h-4 w-4 text-purple-500" />
															<span>All Products</span>
														</Button>
														<Button
															variant="outline"
															size="sm"
															className="flex items-center justify-start gap-2 h-auto py-2.5 hover:bg-primary/5 transition-colors"
															onClick={handleFeaturedCollection}
														>
															<Sparkles className="h-4 w-4 text-amber-500" />
															<span>Featured</span>
														</Button>
														<Button
															variant="outline"
															size="sm"
															className="flex items-center justify-start gap-2 h-auto py-2.5 hover:bg-primary/5 transition-colors"
															onClick={handleTrendingProducts}
														>
															<TrendingUp className="h-4 w-4 text-green-500" />
															<span>Trending</span>
														</Button>
														<Button
															variant="outline"
															size="sm"
															className="flex items-center justify-start gap-2 h-auto py-2.5 hover:bg-primary/5 transition-colors"
															onClick={handleNewArrivals}
														>
															<Zap className="h-4 w-4 text-blue-500" />
															<span>New Arrivals</span>
														</Button>
													</div>
												</div>

												{featuredProducts.length > 0 && (
													<div>
														<h4 className="text-sm font-medium mb-3 flex items-center">
															<Star className="h-4 w-4 mr-2 text-yellow-500" />
															You Might Like
														</h4>
														<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
															{featuredProducts.slice(0, 2).map((product) => (
																<div
																	key={product.id}
																	className="border border-gray-200 dark:border-gray-800 rounded-lg p-2 cursor-pointer hover:border-primary/50 transition-colors"
																	onClick={() => handleSelectItem(product, "product")}
																>
																	<div className="flex items-start gap-2">
																		{product.images && product.images.nodes && product.images.nodes.length > 0 && (
																			<div className="relative h-14 w-14 rounded overflow-hidden flex-shrink-0">
																				<Image
																					src={product.images.nodes[0].url}
																					alt={product.title}
																					fill
																					sizes="56px"
																					className="object-cover"
																				/>
																			</div>
																		)}
																		<div className="flex-1 min-w-0">
																			<p className="font-medium text-xs truncate">{product.title}</p>
																			<p className="text-xs text-primary font-medium mt-1">
																				{product.priceRange.minVariantPrice.amount ===
																				product.priceRange.maxVariantPrice.amount
																					? `$${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}`
																					: `From $${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}`}
																			</p>
																		</div>
																	</div>
																</div>
															))}
														</div>
													</div>
												)}
											</div>
										</div>
									) : (
										<>
											{productResults.length > 0 && (
												<CommandGroup heading="Products">
													<ScrollArea className="max-h-[250px] sm:max-h-[300px]">
														{productResults.slice(0, 5).map((result) => {
															const product = result.item as ShopifyProduct;
															return (
																<CommandItem
																	key={product.id}
																	onSelect={() => handleSelectItem(product, "product")}
																	className="flex items-start gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer"
																>
																	{product.images && product.images.nodes && product.images.nodes.length > 0 && (
																		<div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-800">
																			<Image
																				src={product.images.nodes[0].url}
																				alt={product.title}
																				fill
																				sizes="(max-width: 640px) 40px, 48px"
																				className="object-cover"
																			/>
																		</div>
																	)}
																	<div className="flex-1 min-w-0">
																		<p className="font-medium text-xs sm:text-sm truncate">{product.title}</p>
																		<div className="flex items-center mt-1">
																			<Tag className="h-3 w-3 text-muted-foreground mr-1" />
																			<p className="text-xs text-muted-foreground truncate">
																				{product.priceRange.minVariantPrice.amount ===
																				product.priceRange.maxVariantPrice.amount
																					? `$${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}`
																					: `$${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(
																							2
																					  )} - $${parseFloat(product.priceRange.maxVariantPrice.amount).toFixed(2)}`}
																			</p>
																		</div>
																	</div>
																</CommandItem>
															);
														})}
													</ScrollArea>
												</CommandGroup>
											)}

											{blogResults.length > 0 && (
												<CommandGroup heading="Articles">
													<ScrollArea className="max-h-[150px] sm:max-h-[200px]">
														{blogResults.slice(0, 3).map((result) => {
															const article = result.item as ShopifyBlogArticle;
															return (
																<CommandItem
																	key={article.id}
																	onSelect={() => handleSelectItem(article, "blog")}
																	className="flex items-start gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer"
																>
																	<BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
																	<div className="flex-1 min-w-0">
																		<p className="font-medium text-xs sm:text-sm truncate">{article.title}</p>
																		{article.excerpt && (
																			<p className="text-xs text-muted-foreground truncate mt-1">{article.excerpt}</p>
																		)}
																	</div>
																</CommandItem>
															);
														})}
													</ScrollArea>
												</CommandGroup>
											)}
										</>
									)}

									{(productResults.length > 0 || blogResults.length > 0) && (
										<div className="p-2 border-t border-gray-200 dark:border-gray-800">
											<CommandItem
												onSelect={handleViewAllResults}
												className="flex items-center justify-center gap-1 sm:gap-2 w-full py-1.5 sm:py-2 font-medium text-xs sm:text-sm text-primary"
											>
												View all results for "{searchQuery}"
												<ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
											</CommandItem>
										</div>
									)}
								</>
							)}
						</>
					)}
				</CommandList>
			</Command>
		</div>
	);
}
