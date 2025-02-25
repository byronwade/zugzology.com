"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/lib/providers/search-provider";
import { Command } from "cmdk";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CommandInput } from "@/components/ui/command";
import { ShopifyProduct } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface SearchResult {
	type: "product" | "collection" | "suggestion";
	item: ShopifyProduct | string;
}

export function SearchBar() {
	const { searchQuery, setSearchQuery, searchResults, isSearching, searchRef, isDropdownOpen, setIsDropdownOpen } = useSearch();
	const [inputValue, setInputValue] = useState("");
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);
	const [suggestions, setSuggestions] = useState<SearchResult[]>([]);

	// Sync input value with search query
	useEffect(() => {
		setInputValue(searchQuery);
	}, [searchQuery]);

	// Generate search suggestions based on input and search results
	const generateSuggestions = useCallback(
		(query: string) => {
			if (!query) return [];

			const suggestions: SearchResult[] = [];

			// Add product results from searchResults
			searchResults
				.filter((result) => result.type === "product")
				.slice(0, 5)
				.forEach((result) => {
					suggestions.push({
						type: "product",
						item: result.item as ShopifyProduct,
					});
				});

			// Add category suggestions based on product types
			const productTypes = new Set(
				searchResults
					.filter((result) => result.type === "product")
					.map((result) => (result.item as ShopifyProduct).productType)
					.filter(Boolean)
			);

			[...productTypes].slice(0, 3).forEach((type) => {
				suggestions.push({
					type: "collection",
					item: type,
				});
			});

			// Add search term suggestions
			const terms = query.toLowerCase().split(" ").filter(Boolean);
			if (terms.length > 0) {
				const lastTerm = terms[terms.length - 1];

				const commonWords = searchResults
					.filter((result) => result.type === "product")
					.flatMap((result) => (result.item as ShopifyProduct).title.toLowerCase().split(" "))
					.filter((word) => word.startsWith(lastTerm) && word !== lastTerm)
					.slice(0, 3);

				commonWords.forEach((word) => {
					suggestions.push({
						type: "suggestion",
						item: [...terms.slice(0, -1), word].join(" "),
					});
				});
			}

			return suggestions;
		},
		[searchResults]
	);

	// Update suggestions when search results change
	useEffect(() => {
		setSuggestions(generateSuggestions(inputValue));
	}, [generateSuggestions, inputValue, searchResults]);

	// Handle search input change
	const handleInputChange = (value: string) => {
		setInputValue(value);
		setSearchQuery(value);

		// Ensure dropdown opens when typing
		if (value.trim().length > 0) {
			setIsDropdownOpen(true);
		} else {
			setIsDropdownOpen(false);
		}
	};

	// Handle selection of search results
	const handleSelect = (result: SearchResult) => {
		if (result.type === "product") {
			const product = result.item as ShopifyProduct;
			setInputValue("");
			setSearchQuery("");
			setIsDropdownOpen(false);
			router.push(`/products/${product.handle}`);
		} else if (result.type === "collection") {
			setInputValue("");
			setSearchQuery("");
			setIsDropdownOpen(false);
			router.push(`/collections/${(result.item as string).toLowerCase().replace(/\s+/g, "-")}`);
		} else {
			setInputValue(result.item as string);
			setSearchQuery(result.item as string);
		}
	};

	// Handle search form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (inputValue.trim()) {
			router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
			setIsDropdownOpen(false);
		}
	};

	// Handle clicks outside the search bar
	useEffect(() => {
		if (!isDropdownOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		// Add event listener with capture phase to ensure it fires before other handlers
		document.addEventListener("mousedown", handleClickOutside, true);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside, true);
		};
	}, [isDropdownOpen, searchRef, setIsDropdownOpen]);

	return (
		<div ref={searchRef} className="relative w-full max-w-md">
			<form onSubmit={handleSubmit} className="relative">
				<div className="relative">
					<SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<CommandInput
						ref={inputRef}
						value={inputValue}
						onValueChange={handleInputChange}
						className="pl-10 pr-10"
						placeholder="Search products..."
						onFocus={() => {
							if (inputValue.trim().length > 0) {
								setIsDropdownOpen(true);
							}
						}}
					/>
					{isSearching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
					{inputValue && !isSearching && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
							onClick={() => {
								setInputValue("");
								setSearchQuery("");
								setIsDropdownOpen(false);
								inputRef.current?.focus();
							}}
						>
							<span className="sr-only">Clear</span>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</Button>
					)}
				</div>
			</form>

			{isDropdownOpen && (
				<div className="absolute top-full left-0 z-50 mt-2 w-full rounded-md border bg-background shadow-lg">
					<div className="p-2">
						{isSearching ? (
							<div className="flex items-center justify-center p-4">
								<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								<span className="ml-2">Searching...</span>
							</div>
						) : suggestions.length > 0 ? (
							<div className="max-h-[300px] overflow-y-auto">
								{suggestions.map((result, index) => {
									if (result.type === "product") {
										const product = result.item as ShopifyProduct;
										return (
											<button key={`product-${index}`} className="w-full p-2 text-left hover:bg-accent flex items-center gap-2" onClick={() => handleSelect(result)}>
												{product.images?.nodes?.[0]?.url ? (
													<div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border">
														<Image src={product.images.nodes[0].url} alt={product.images.nodes[0].altText || product.title} width={40} height={40} className="h-full w-full object-cover" />
													</div>
												) : (
													<div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
														<SearchIcon className="h-4 w-4 text-muted-foreground" />
													</div>
												)}
												<div className="ml-2">
													<p className="text-sm font-medium">{product.title}</p>
													<p className="text-xs text-muted-foreground">{product.productType}</p>
												</div>
											</button>
										);
									}

									if (result.type === "collection") {
										return (
											<button key={`collection-${index}`} className="w-full p-2 text-left hover:bg-accent flex items-center gap-2" onClick={() => handleSelect(result)}>
												<span className="text-sm">Shop {result.item as string}</span>
											</button>
										);
									}

									return (
										<button key={`suggestion-${index}`} className="w-full p-2 text-left hover:bg-accent flex items-center gap-2" onClick={() => handleSelect(result)}>
											<SearchIcon className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm">{result.item as string}</span>
										</button>
									);
								})}
							</div>
						) : inputValue ? (
							<div className="p-4 text-center text-sm text-muted-foreground">No results found for "{inputValue}"</div>
						) : (
							<div className="p-4 text-center text-sm text-muted-foreground">Start typing to search products</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
