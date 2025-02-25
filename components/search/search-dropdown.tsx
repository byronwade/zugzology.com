"use client";

import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearch } from "@/lib/providers/search-provider";
import { formatPrice, debugLog } from "@/lib/utils";
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
	const animationFrameRef = useRef<number | null>(null);
	const isClosingRef = useRef(false);

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

	// Reset selected index when search results change
	useEffect(() => {
		setSelectedIndex(-1);
	}, [searchResults]);

	// CRITICAL FIX: Use useLayoutEffect to ensure our click handlers are set up before React's synthetic events
	useLayoutEffect(() => {
		if (!isDropdownOpen) return;

		debugLog("DROPDOWN", "Setting up click outside handlers");

		// Store original overflow style
		const originalOverflow = document.body.style.overflow;

		// Function to check if an element is a child of another
		const isDescendantOf = (child: Node | null, parent: Node | null): boolean => {
			if (!child || !parent) return false;
			let node: Node | null = child;
			while (node) {
				if (node === parent) return true;
				node = node.parentNode;
			}
			return false;
		};

		// The main close handler - will be attached directly to document
		const handleDocumentInteraction = (e: MouseEvent | TouchEvent | FocusEvent) => {
			if (isClosingRef.current) return;

			// Get the target element
			const target = e.target as Node;

			// Check if click is inside dropdown
			if (dropdownRef.current && isDescendantOf(target, dropdownRef.current)) {
				return;
			}

			// If we get here, the interaction was outside our dropdown
			isClosingRef.current = true;

			// Use requestAnimationFrame to ensure we're not fighting with React's rendering
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}

			animationFrameRef.current = requestAnimationFrame(() => {
				debugLog("DROPDOWN", "Closing dropdown from document interaction");
				// Just close the dropdown without submitting the form
				setIsDropdownOpen(false);
				isClosingRef.current = false;
			});
		};

		// Handle scroll events
		const handleScroll = () => {
			if (isClosingRef.current) return;
			isClosingRef.current = true;

			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}

			animationFrameRef.current = requestAnimationFrame(() => {
				debugLog("DROPDOWN", "Closing dropdown from scroll");
				// Just close the dropdown without submitting the form
				setIsDropdownOpen(false);
				isClosingRef.current = false;
			});
		};

		// Add all event listeners with capture phase to ensure they run first
		document.addEventListener("mousedown", handleDocumentInteraction, true);
		document.addEventListener("touchstart", handleDocumentInteraction, true);
		document.addEventListener("click", handleDocumentInteraction, true);
		window.addEventListener("scroll", handleScroll, true);

		// Prevent scrolling when dropdown is open on mobile
		if (isMobile) {
			document.body.style.overflow = "hidden";
		}

		// Clean up all event listeners
		return () => {
			document.removeEventListener("mousedown", handleDocumentInteraction, true);
			document.removeEventListener("touchstart", handleDocumentInteraction, true);
			document.removeEventListener("click", handleDocumentInteraction, true);
			window.removeEventListener("scroll", handleScroll, true);

			// Restore original overflow
			document.body.style.overflow = originalOverflow;

			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}

			isClosingRef.current = false;
		};
	}, [isDropdownOpen, setIsDropdownOpen, isMobile]);

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
		debugLog("DROPDOWN", "State:", {
			isDropdownOpen,
			searchQuery,
			isSearching,
			resultsCount: searchResults.length,
			recentSearchesCount: recentSearches.length,
		});
	}, [isDropdownOpen, searchQuery, isSearching, searchResults, recentSearches]);

	if (!isDropdownOpen) {
		debugLog("DROPDOWN", "Not showing - dropdown is closed");
		return null;
	}

	const handleSearchClick = (query: string) => {
		debugLog("DROPDOWN", "Search clicked:", { query });
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

	// Add a transparent overlay to capture clicks outside the dropdown
	return (
		<>
			{/* Invisible overlay to capture clicks */}
			<div
				className="fixed inset-0 z-[99]"
				onClick={() => {
					debugLog("DROPDOWN", "Overlay clicked");
					setIsDropdownOpen(false);
				}}
			/>

			{/* Actual dropdown */}
			<div
				className={cn("fixed md:absolute left-0 right-0 md:top-full bg-background border-t md:border-t-0 md:border md:rounded-lg shadow-lg overflow-hidden z-[100]", "md:mt-2 md:mx-0", "top-[var(--header-height)] h-[calc(100vh-var(--header-height))] md:h-auto")}
				ref={dropdownRef}
				onClick={(e) => {
					// Stop propagation to prevent the overlay click handler from firing
					e.stopPropagation();
				}}
			>
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
												<Link key={post.id} href={`/blogs/${post.blogHandle}/${post.handle}`} className={cn("flex items-start gap-4 p-3 hover:bg-accent rounded-lg transition-colors", selectedIndex === displayedProducts.length + index && "bg-accent")} data-index={displayedProducts.length + index} onClick={handleProductClick}>
													{/* Blog Image */}
													<div className="relative w-20 h-20 flex-shrink-0">
														<div className="relative bg-muted rounded-md overflow-hidden border border-foreground/10 group-hover:border-foreground/20 transition-colors duration-200 w-full h-full">{getBlogImageUrl(post) ? <Image src={getBlogImageUrl(post)!} alt={getBlogImageAlt(post)} fill className="object-cover" sizes="80px" /> : <ImagePlaceholder />}</div>
													</div>

													{/* Blog Info */}
													<div className="flex-1 min-w-0">
														<h4 className="text-sm font-medium line-clamp-1">{post.title}</h4>
														<p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{post.excerpt || post.content?.substring(0, 100)}</p>
													</div>
												</Link>
											))}
										</div>
									</div>
								)}

								{/* View All Results Button */}
								{(displayedProducts.length > 0 || displayedBlogs.length > 0) && searchQuery && (
									<div className="pt-2 border-t">
										<Link href={`/search?q=${encodeURIComponent(searchQuery)}`} className="block w-full text-center p-3 text-sm text-primary hover:underline" onClick={() => handleSearchClick(searchQuery)}>
											View all results for "{searchQuery}"
										</Link>
									</div>
								)}
							</div>
						)}
					</div>
				</ScrollArea>
			</div>
		</>
	);
}
