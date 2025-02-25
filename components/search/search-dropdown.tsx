"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearch } from "@/lib/providers/search-provider";
import { formatPrice } from "@/lib/utils";
import { Clock, Search, TrendingUp, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShopifyProduct, ShopifyBlogArticle } from "@/lib/types";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";

export function SearchDropdown() {
	const router = useRouter();
	const pathname = usePathname();
	const { searchResults, isSearching, searchQuery, isDropdownOpen, recentSearches, addRecentSearch, setIsDropdownOpen } = useSearch();
	const [isMobile, setIsMobile] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Split results into products and blog posts with proper typing
	const productResults = searchResults.filter((result): result is { type: "product"; item: ShopifyProduct } => result.type === "product").map((result) => result.item);
	const blogResults = searchResults.filter((result): result is { type: "blog"; item: ShopifyBlogArticle } => result.type === "blog").map((result) => result.item);

	const displayedProducts = productResults.slice(0, isMobile ? 2 : 4);
	const displayedBlogs = blogResults.slice(0, isMobile ? 1 : 2);

	// Handle responsive state
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		// Initial check
		checkMobile();

		// Add resize listener
		window.addEventListener("resize", checkMobile);

		// Cleanup
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Close dropdown on route change
	useEffect(() => {
		setIsDropdownOpen(false);
	}, [pathname, setIsDropdownOpen]);

	// Ensure dropdown closes when clicking outside
	useEffect(() => {
		if (!isDropdownOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		// Add event listener with capture phase to ensure it fires before other handlers
		document.addEventListener("mousedown", handleClickOutside, true);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside, true);
		};
	}, [isDropdownOpen, setIsDropdownOpen]);

	// Reset selected index when search results change
	useEffect(() => {
		setSelectedIndex(-1);
	}, [searchResults]);

	// Handle keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isDropdownOpen) return;

			const totalResults = displayedProducts.length + displayedBlogs.length;

			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					setSelectedIndex((prev) => {
						const maxIndex = totalResults - 1;
						return prev < maxIndex ? prev + 1 : 0;
					});
					break;
				case "ArrowUp":
					e.preventDefault();
					setSelectedIndex((prev) => {
						const maxIndex = totalResults - 1;
						return prev > 0 ? prev - 1 : maxIndex;
					});
					break;
				case "Enter":
					e.preventDefault();
					if (selectedIndex === -1 && searchQuery?.trim()) {
						// If no item is selected and there's a search query, submit the search
						handleSearchClick(searchQuery);
					} else if (selectedIndex >= 0 && selectedIndex < totalResults) {
						// If an item is selected, navigate to it
						let selectedItem;
						if (selectedIndex < displayedProducts.length) {
							selectedItem = displayedProducts[selectedIndex];
							if (selectedItem?.handle) {
								router.push(`/products/${selectedItem.handle}`);
							}
						} else {
							selectedItem = displayedBlogs[selectedIndex - displayedProducts.length];
							if (selectedItem?.handle && selectedItem?.blogHandle) {
								router.push(`/blogs/${selectedItem.blogHandle}/${selectedItem.handle}`);
							}
						}
						setIsDropdownOpen(false);
						if (searchQuery?.trim()) {
							addRecentSearch(searchQuery);
						}
					}
					break;
				case "Escape":
					setIsDropdownOpen(false);
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isDropdownOpen, selectedIndex, displayedProducts, displayedBlogs, router, searchQuery, addRecentSearch, setIsDropdownOpen]);

	// Scroll selected item into view
	useEffect(() => {
		if (selectedIndex >= 0 && dropdownRef.current) {
			const selectedElement = dropdownRef.current.querySelector(`[data-index="${selectedIndex}"]`);
			if (selectedElement) {
				selectedElement.scrollIntoView({ block: "nearest" });
			}
		}
	}, [selectedIndex]);

	useEffect(() => {
		console.log("[DROPDOWN] State:", {
			isDropdownOpen,
			searchQuery,
			isSearching,
			resultsCount: searchResults.length,
			recentSearchesCount: recentSearches.length,
		});
	}, [isDropdownOpen, searchQuery, isSearching, searchResults, recentSearches]);

	if (!isDropdownOpen) {
		console.log("[DROPDOWN] Not showing - dropdown is closed");
		return null;
	}

	const handleSearchClick = (query: string) => {
		console.log("[DROPDOWN] Search clicked:", { query });
		addRecentSearch(query);
		setIsDropdownOpen(false);
		router.push(`/search?q=${encodeURIComponent(query)}`);
	};

	const handleProductClick = () => {
		if (searchQuery.trim()) {
			addRecentSearch(searchQuery);
		}
		setIsDropdownOpen(false);
	};

	// Helper function to get product image URL safely
	const getProductImageUrl = (product: ShopifyProduct): string | undefined => {
		return product.images?.nodes?.[0]?.url || product.media?.nodes?.[0]?.previewImage?.url;
	};

	// Helper function to get blog image URL safely
	const getBlogImageUrl = (post: ShopifyBlogArticle): string | undefined => {
		return post.image?.url;
	};

	// Helper function to get product image alt text safely
	const getProductImageAlt = (product: ShopifyProduct): string => {
		return product.images?.nodes?.[0]?.altText || product.media?.nodes?.[0]?.previewImage?.altText || product.title;
	};

	// Helper function to get blog image alt text safely
	const getBlogImageAlt = (post: ShopifyBlogArticle): string => {
		return post.image?.altText || post.title;
	};

	return (
		<div className={cn("fixed md:absolute left-0 right-0 md:top-full bg-background border-t md:border-t-0 md:border md:rounded-lg shadow-lg overflow-hidden z-[100]", "md:mt-2 md:mx-0", "top-[var(--header-height)] h-[calc(100vh-var(--header-height))] md:h-auto")} ref={dropdownRef}>
			<ScrollArea className="h-full md:max-h-[80vh]">
				<div className="p-4 space-y-6">
					{/* Recent Searches */}
					{recentSearches.length > 0 && !searchQuery && (
						<div>
							<h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
								<Clock className="w-4 h-4 mr-2" />
								Recent Searches
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
								{recentSearches.map((query) => (
									<Link key={query} href={`/search?q=${encodeURIComponent(query)}`} className="flex items-center gap-2 p-3 hover:bg-accent rounded-lg text-sm transition-colors" onClick={() => handleSearchClick(query)}>
										<Search className="w-4 h-4 text-muted-foreground" />
										<span className="line-clamp-1">{query}</span>
									</Link>
								))}
							</div>
						</div>
					)}

					{/* Loading State */}
					{isSearching && (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					)}

					{/* No Results */}
					{!isSearching && searchQuery && searchResults.length === 0 && (
						<div className="text-center py-12">
							<p className="text-muted-foreground">No results found for "{searchQuery}"</p>
						</div>
					)}

					{/* Search Results */}
					{!isSearching && searchResults.length > 0 && (
						<div className="space-y-6">
							{/* Product Results */}
							{displayedProducts.length > 0 && (
								<div>
									<h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
										<Tag className="w-4 h-4 mr-2" />
										Products
									</h3>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										{displayedProducts.map((product, index) => (
											<Link key={product.id} href={`/products/${product.handle}`} className={cn("flex items-start gap-4 p-3 hover:bg-accent rounded-lg transition-colors", selectedIndex === index && "bg-accent")} data-index={index} onClick={handleProductClick}>
												{/* Product Image */}
												<div className="relative w-20 h-20 flex-shrink-0">
													<div className="relative bg-muted rounded-md overflow-hidden border border-foreground/10 group-hover:border-foreground/20 transition-colors duration-200 w-full h-full">{getProductImageUrl(product) ? <Image src={getProductImageUrl(product)!} alt={getProductImageAlt(product)} fill className="object-cover" sizes="80px" /> : <ImagePlaceholder />}</div>
												</div>

												{/* Product Info */}
												<div className="flex-1 min-w-0">
													<h4 className="text-sm font-medium line-clamp-1">{product.title}</h4>
													<p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{product.description}</p>
													<div className="flex items-center gap-2 mt-2">
														<span className="text-sm font-medium">{formatPrice(parseFloat(product.priceRange.minVariantPrice.amount))}</span>
														{product.tags?.includes("trending") && (
															<Badge variant="secondary" className="text-[10px] px-1 py-0">
																<TrendingUp className="w-3 h-3 mr-1" />
																Trending
															</Badge>
														)}
													</div>
												</div>
											</Link>
										))}
									</div>
								</div>
							)}

							{/* Blog Results */}
							{displayedBlogs.length > 0 && (
								<div>
									<h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
										<Clock className="w-4 h-4 mr-2" />
										Blog Posts
									</h3>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										{displayedBlogs.map((post, index) => (
											<Link key={post.id} href={`/blogs/${post.blogHandle}/${post.handle}`} className={cn("flex items-start gap-4 p-3 hover:bg-accent rounded-lg transition-colors", selectedIndex === index + displayedProducts.length && "bg-accent")} data-index={index + displayedProducts.length} onClick={handleProductClick}>
												{/* Blog Post Image */}
												<div className="relative w-20 h-20 flex-shrink-0">
													<div className="relative bg-muted rounded-md overflow-hidden border border-foreground/10 group-hover:border-foreground/20 transition-colors duration-200 w-full h-full">{getBlogImageUrl(post) ? <Image src={getBlogImageUrl(post)!} alt={getBlogImageAlt(post)} fill className="object-cover" sizes="80px" /> : <ImagePlaceholder />}</div>
												</div>

												{/* Blog Post Info */}
												<div className="flex-1 min-w-0">
													<h4 className="text-sm font-medium line-clamp-1">{post.title}</h4>
													{post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{post.excerpt}</p>}
													<div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
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
											</Link>
										))}
									</div>
								</div>
							)}

							{/* View All Results */}
							<button onClick={() => handleSearchClick(searchQuery)} className="w-full text-center text-sm text-primary hover:text-primary/80 py-3 border-t transition-colors">
								View all {searchResults.length} results
							</button>
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
