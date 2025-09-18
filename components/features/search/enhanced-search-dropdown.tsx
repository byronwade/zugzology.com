"use client";

import { useSearch } from "@/components/providers";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, BookOpen, Grid3X3, ArrowRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { useCallback } from "react";

const DROPDOWN_BASE_CLASS =
	"absolute top-full left-0 right-0 z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900";

const WRAPPER_CLASS = "max-h-[70vh] overflow-y-auto";

export function EnhancedSearchDropdown() {
	const { isDropdownOpen, searchResults, debouncedQuery, clearSearch, searchQuery, isSearching } = useSearch();
	const router = useRouter();

	const handleViewAllResults = useCallback(() => {
		if (debouncedQuery.trim()) {
			router.push(`/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
			clearSearch();
		}
	}, [debouncedQuery, router, clearSearch]);

	if (!isDropdownOpen) {
		return null;
	}

	const { products, blogs, collections } = searchResults;
	const hasResults = products.length > 0 || blogs.length > 0 || collections.length > 0;
	const totalResults = products.length + blogs.length + collections.length;

	if (!debouncedQuery.trim()) {
		return (
			<div className={DROPDOWN_BASE_CLASS}>
				<div className="p-6 text-center">
					<Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
					<p className="text-gray-500 dark:text-gray-400 text-sm">
						Start typing to search products, articles, and collections
					</p>
				</div>
			</div>
		);
	}

	// Show loading state when searching
	if (searchQuery && searchQuery !== debouncedQuery) {
		return (
			<div className={DROPDOWN_BASE_CLASS}>
				<div className="p-6 text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
					<p className="text-gray-500 dark:text-gray-400 text-sm">
						Searching...
					</p>
				</div>
			</div>
		);
	}

	if (!hasResults) {
		return (
			<div className={DROPDOWN_BASE_CLASS}>
				<div className="p-6 text-center">
					<Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
					<p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
						No results found for <span className="font-medium">&ldquo;{debouncedQuery}&rdquo;</span>
					</p>
					<Button 
						variant="outline" 
						size="sm" 
						onClick={handleViewAllResults}
						className="text-xs"
					>
						Search all products
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className={DROPDOWN_BASE_CLASS}>
			<div className={WRAPPER_CLASS}>
				{/* Header */}
				<div className="p-4 border-b border-gray-100 dark:border-gray-800">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Search className="h-4 w-4 text-gray-500" />
							<span className="text-sm text-gray-600 dark:text-gray-400">
								{totalResults} result{totalResults !== 1 ? 's' : ''} for <span className="font-medium">&ldquo;{debouncedQuery}&rdquo;</span>
							</span>
						</div>
						<Button 
							variant="ghost" 
							size="sm" 
							onClick={handleViewAllResults}
							className="text-xs gap-1"
						>
							View all
							<ArrowRight className="h-3 w-3" />
						</Button>
					</div>
				</div>

				<div className="p-2">
					{/* Products Section */}
					{products.length > 0 && (
						<div className="mb-4">
							<div className="flex items-center gap-2 px-2 py-1 mb-2">
								<ShoppingBag className="h-4 w-4 text-purple-600" />
								<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
									Products ({products.length})
								</span>
							</div>
							<div className="space-y-1">
								{products.map((product) => (
									<Link
										key={product.id}
										href={`/products/${product.handle}`}
										onClick={clearSearch}
										className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
									>
										<div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
											{product.images?.nodes?.[0] ? (
												<Image
													src={product.images.nodes[0].url}
													alt={product.images.nodes[0].altText || product.title}
													fill
													className="object-cover"
													sizes="40px"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<ShoppingBag className="h-4 w-4 text-gray-400" />
												</div>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
												{product.title}
											</p>
											<div className="flex items-center gap-2">
												<span className="text-sm font-semibold text-purple-600">
													{formatPrice(product.priceRange.minVariantPrice.amount)}
												</span>
												{product.vendor && (
													<Badge variant="secondary" className="text-xs">
														{product.vendor}
													</Badge>
												)}
												{!product.availableForSale && (
													<Badge variant="outline" className="text-xs text-red-600">
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
							<div className="flex items-center gap-2 px-2 py-1 mb-2">
								<Grid3X3 className="h-4 w-4 text-blue-600" />
								<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
									Collections ({collections.length})
								</span>
							</div>
							<div className="space-y-1">
								{collections.map((collection) => (
									<Link
										key={collection.id}
										href={`/collections/${collection.handle}`}
										onClick={clearSearch}
										className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
									>
										<div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
											{collection.image ? (
												<Image
													src={collection.image.url}
													alt={collection.image.altText || collection.title}
													fill
													className="object-cover"
													sizes="40px"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<Grid3X3 className="h-4 w-4 text-gray-400" />
												</div>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
												{collection.title}
											</p>
											{collection.description && (
												<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
													{collection.description}
												</p>
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
							<div className="flex items-center gap-2 px-2 py-1 mb-2">
								<BookOpen className="h-4 w-4 text-green-600" />
								<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
									Articles ({blogs.length})
								</span>
							</div>
							<div className="space-y-1">
								{blogs.map((blog) => (
									<Link
										key={blog.id}
										href={`/blogs/${blog.blog?.handle || 'blog'}/${blog.handle}`}
										onClick={clearSearch}
										className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
									>
										<div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
											{blog.image ? (
												<Image
													src={blog.image.url}
													alt={blog.image.altText || blog.title}
													fill
													className="object-cover"
													sizes="40px"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<BookOpen className="h-4 w-4 text-gray-400" />
												</div>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
												{blog.title}
											</p>
											{blog.summary && (
												<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
													{blog.summary}
												</p>
											)}
											{blog.publishedAt && (
												<p className="text-xs text-gray-400 dark:text-gray-500">
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
				<div className="border-t border-gray-100 dark:border-gray-800 p-3">
					<Button 
						onClick={handleViewAllResults}
						className="w-full justify-center gap-2"
						size="sm"
					>
						<TrendingUp className="h-4 w-4" />
						View all {totalResults} results
					</Button>
				</div>
			</div>
		</div>
	);
}
