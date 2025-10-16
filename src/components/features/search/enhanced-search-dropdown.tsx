"use client";

import { ArrowRight, BookOpen, Grid3X3, Search, ShoppingBag, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useSearch } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { formatPrice } from "@/lib/utils";

const DROPDOWN_BASE_CLASS =
	"absolute top-full z-50 mt-1 overflow-hidden rounded-lg border bg-popover shadow-xl " +
	"left-0 right-0 w-full " +
	"max-sm:-ml-4 max-sm:-mr-4 max-sm:w-[calc(100%+2rem)]";

const WRAPPER_CLASS = "max-h-[70vh] overflow-y-auto";

export function EnhancedSearchDropdown() {
	const { isDropdownOpen, searchResults, debouncedQuery, clearSearch, searchQuery, isSearching, setIsDropdownOpen } =
		useSearch();
	const router = useRouter();
	const dropdownRef = useRef<HTMLDivElement>(null);

	const handleViewAllResults = useCallback(() => {
		if (debouncedQuery.trim()) {
			router.push(`/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
			clearSearch();
		}
	}, [debouncedQuery, router, clearSearch]);

	// Handle click outside to close dropdown
	useEffect(() => {
		if (!isDropdownOpen) {
			return;
		}

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;

			// Check if click is outside the dropdown
			if (dropdownRef.current && !dropdownRef.current.contains(target)) {
				// Also check if click is not on the search input itself
				const searchContainer = document.querySelector("[data-search-container]");
				if (searchContainer && !searchContainer.contains(target)) {
					setIsDropdownOpen(false);
				}
			}
		};

		// Add event listener after a small delay to avoid immediate closing
		const timeoutId = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
		}, 100);

		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isDropdownOpen, setIsDropdownOpen]);

	if (!isDropdownOpen) {
		return null;
	}

	const { products, blogs, collections } = searchResults;
	const hasResults = products.length > 0 || blogs.length > 0 || collections.length > 0;
	const totalResults = products.length + blogs.length + collections.length;

	if (!debouncedQuery.trim()) {
		return (
			<div className={DROPDOWN_BASE_CLASS} ref={dropdownRef}>
				<div className="p-6 text-center">
					<Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
					<p className="text-muted-foreground text-sm">Start typing to search products, articles, and collections</p>
				</div>
			</div>
		);
	}

	// Show loading state when searching
	if (searchQuery && searchQuery !== debouncedQuery) {
		return (
			<div className={DROPDOWN_BASE_CLASS} ref={dropdownRef}>
				<div className="p-6 text-center">
					<div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
					<p className="text-muted-foreground text-sm">Searching...</p>
				</div>
			</div>
		);
	}

	if (!hasResults) {
		return (
			<div className={DROPDOWN_BASE_CLASS} ref={dropdownRef}>
				<div className="p-6 text-center">
					<Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
					<p className="mb-3 text-muted-foreground text-sm">
						No results found for <span className="font-medium">&ldquo;{debouncedQuery}&rdquo;</span>
					</p>
					<Button className="text-xs" onClick={handleViewAllResults} size="sm" variant="outline">
						Search all products
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className={DROPDOWN_BASE_CLASS} ref={dropdownRef}>
			<div className={WRAPPER_CLASS}>
				{/* Header */}
				<div className="border border-b p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Search className="h-4 w-4 text-muted-foreground" />
							<span className="text-muted-foreground text-sm">
								{totalResults} result{totalResults !== 1 ? "s" : ""} for{" "}
								<span className="font-medium">&ldquo;{debouncedQuery}&rdquo;</span>
							</span>
						</div>
						<Button className="gap-1 text-xs" onClick={handleViewAllResults} size="sm" variant="ghost">
							View all
							<ArrowRight className="h-3 w-3" />
						</Button>
					</div>
				</div>

				<div className="p-2">
					{/* Products Section */}
					{products.length > 0 && (
						<div className="mb-4">
							<div className="mb-2 flex items-center gap-2 px-2 py-1">
								<ShoppingBag className="h-4 w-4 text-primary" />
								<span className="font-medium text-foreground text-sm">Products ({products.length})</span>
							</div>
							<div className="space-y-1">
								{products.map((product) => (
									<Link
										className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted"
										href={`/products/${product.handle}`}
										key={product.id}
										onClick={clearSearch}
									>
										<div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-muted">
											{product.images?.nodes?.[0] ? (
												<Image
													alt={product.images.nodes[0].altText || product.title}
													className="object-cover"
													fill
													sizes="40px"
													src={product.images.nodes[0].url}
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center">
													<ShoppingBag className="h-4 w-4 text-muted-foreground" />
												</div>
											)}
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium text-foreground text-sm">{product.title}</p>
											<div className="flex items-center gap-2">
												<span className="font-semibold text-primary text-sm">
													{formatPrice(product.priceRange.minVariantPrice.amount)}
												</span>
												{product.vendor && (
													<Badge className="text-xs" variant="secondary">
														{product.vendor}
													</Badge>
												)}
												{!product.availableForSale && (
													<Badge className="text-red-600 text-xs" variant="outline">
														Out of stock
													</Badge>
												)}
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>
					)}

					{/* Collections Section */}
					{collections.length > 0 && (
						<div className="mb-4">
							<div className="mb-2 flex items-center gap-2 px-2 py-1">
								<Grid3X3 className="h-4 w-4 text-blue-600" />
								<span className="font-medium text-foreground text-sm">Collections ({collections.length})</span>
							</div>
							<div className="space-y-1">
								{collections.map((collection) => (
									<Link
										className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted"
										href={`/collections/${collection.handle}`}
										key={collection.id}
										onClick={clearSearch}
									>
										<div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-muted">
											{collection.image ? (
												<Image
													alt={collection.image.altText || collection.title}
													className="object-cover"
													fill
													sizes="40px"
													src={collection.image.url}
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center">
													<Grid3X3 className="h-4 w-4 text-muted-foreground" />
												</div>
											)}
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium text-foreground text-sm">{collection.title}</p>
											{collection.description && (
												<p className="truncate text-muted-foreground text-xs">{collection.description}</p>
											)}
										</div>
									</Link>
								))}
							</div>
						</div>
					)}

					{/* Blog Posts Section */}
					{blogs.length > 0 && (
						<div className="mb-2">
							<div className="mb-2 flex items-center gap-2 px-2 py-1">
								<BookOpen className="h-4 w-4 text-green-600" />
								<span className="font-medium text-foreground text-sm">Articles ({blogs.length})</span>
							</div>
							<div className="space-y-1">
								{blogs.map((blog) => (
									<Link
										className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted"
										href={`/blogs/${blog.blog?.handle || "blog"}/${blog.handle}`}
										key={blog.id}
										onClick={clearSearch}
									>
										<div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-muted">
											{blog.image ? (
												<Image
													alt={blog.image.altText || blog.title}
													className="object-cover"
													fill
													sizes="40px"
													src={blog.image.url}
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center">
													<BookOpen className="h-4 w-4 text-muted-foreground" />
												</div>
											)}
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium text-foreground text-sm">{blog.title}</p>
											{blog.summary && <p className="truncate text-muted-foreground text-xs">{blog.summary}</p>}
											{blog.publishedAt && (
												<p className="text-muted-foreground text-xs">
													{new Date(blog.publishedAt).toLocaleDateString()}
												</p>
											)}
										</div>
									</Link>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="border border-t p-3">
					<Button className="w-full justify-center gap-2" onClick={handleViewAllResults} size="sm">
						<TrendingUp className="h-4 w-4" />
						View all {totalResults} results
					</Button>
				</div>
			</div>
		</div>
	);
}
