"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearch } from "@/lib/providers/search-provider";
import { formatPrice } from "@/lib/utils";
import { Clock, Search, TrendingUp, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter, usePathname } from "next/navigation";

export function SearchDropdown() {
	const router = useRouter();
	const pathname = usePathname();
	const { searchResults, isSearching, searchQuery, isDropdownOpen, recentSearches, addRecentSearch, allProducts, setIsDropdownOpen } = useSearch();
	const [isMobile, setIsMobile] = useState(false);

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

	useEffect(() => {
		console.log("[DROPDOWN] State:", {
			isDropdownOpen,
			searchQuery,
			isSearching,
			resultsCount: searchResults.length,
			recentSearchesCount: recentSearches.length,
			allProductsCount: allProducts.length,
		});
	}, [isDropdownOpen, searchQuery, isSearching, searchResults, recentSearches, allProducts]);

	if (!isDropdownOpen) {
		console.log("[DROPDOWN] Not showing - dropdown is closed");
		return null;
	}

	const handleSearchClick = (query: string) => {
		console.log("[DROPDOWN] Search clicked:", { query });
		addRecentSearch(query);
		setIsDropdownOpen(false);
	};

	const handleViewAllResults = () => {
		if (searchQuery.trim()) {
			addRecentSearch(searchQuery);
			setIsDropdownOpen(false);
			router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
		}
	};

	const handleProductClick = () => {
		if (searchQuery.trim()) {
			handleSearchClick(searchQuery);
		}
		setIsDropdownOpen(false);
	};

	const displayedResults = searchResults.slice(0, isMobile ? 2 : 4);

	return (
		<div className="fixed md:absolute left-0 right-0 md:top-full mt-2 bg-white dark:bg-neutral-950 border-t border-b md:border md:rounded-lg shadow-lg overflow-hidden md:mx-0 -mx-4 z-[100]">
			<ScrollArea className="max-h-[60vh] md:max-h-[80vh]">
				<div className="p-4">
					{/* Recent Searches */}
					{recentSearches.length > 0 && !searchQuery && (
						<div className="mb-6">
							<h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
								<Clock className="w-4 h-4 mr-2" />
								Recent Searches
							</h3>
							<div className="space-y-2">
								{recentSearches.map((query) => (
									<Link key={query} href={`/search?q=${encodeURIComponent(query)}`} className="flex items-center space-x-2 text-sm hover:bg-accent p-2 rounded-md" onClick={() => handleSearchClick(query)}>
										<Search className="w-4 h-4 text-muted-foreground" />
										<span>{query}</span>
									</Link>
								))}
							</div>
						</div>
					)}

					{/* Loading State */}
					{isSearching && (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					)}

					{/* No Results */}
					{!isSearching && searchQuery && searchResults.length === 0 && (
						<div className="text-center py-8">
							<p className="text-muted-foreground">No results found for "{searchQuery}"</p>
						</div>
					)}

					{/* Search Results */}
					{!isSearching && searchResults.length > 0 && (
						<div className="space-y-4">
							{displayedResults.map((product) => (
								<Link key={product.id} href={`/products/${product.handle}`} className="flex items-start gap-4 p-2 hover:bg-accent rounded-lg transition-colors" onClick={handleProductClick}>
									{/* Product Image */}
									{product.images?.edges[0]?.node && (
										<div className="relative w-16 h-16 flex-shrink-0">
											<div className="relative bg-neutral-100 dark:bg-neutral-800 rounded-md overflow-hidden border border-foreground/10 group-hover:border-foreground/20 transition-colors duration-200 w-full h-full">
												<Image src={product.images.edges[0].node.url} alt={product.images.edges[0].node.altText || product.title} fill className="object-cover" sizes="64px" />
											</div>
										</div>
									)}

									{/* Product Info */}
									<div className="flex-1 min-w-0">
										<h4 className="text-sm font-medium line-clamp-1">{product.title}</h4>
										<p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
										<div className="flex items-center gap-2 mt-1">
											<span className="text-sm font-medium">{formatPrice(parseFloat(product.priceRange.minVariantPrice.amount))}</span>
											{product.tags?.includes("trending") && (
												<Badge variant="secondary" className="text-[10px] px-1 py-0">
													<TrendingUp className="w-3 h-3 mr-1" />
													Trending
												</Badge>
											)}
										</div>
									</div>

									{/* Product Type */}
									{product.productType && (
										<div className="text-xs text-muted-foreground flex items-center">
											<Tag className="w-3 h-3 mr-1" />
											{product.productType}
										</div>
									)}
								</Link>
							))}

							{/* View All Results */}
							<button onClick={handleViewAllResults} className="block w-full text-center text-sm text-primary hover:text-primary/80 py-2 border-t">
								View all {searchResults.length} results
							</button>
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
