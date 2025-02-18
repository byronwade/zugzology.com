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
import { Link } from "@/components/ui/link";
import { formatPrice } from "@/lib/utils";

interface SearchResult {
	type: "product" | "collection" | "suggestion";
	item: ShopifyProduct | string;
}

export function SearchBar() {
	const router = useRouter();
	const { searchQuery, setSearchQuery, searchResults, isSearching } = useSearch();
	const [isOpen, setIsOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);

	// Generate search suggestions based on input
	const generateSuggestions = useCallback((query: string, results: ShopifyProduct[]) => {
		if (!query) return [];

		const suggestions: SearchResult[] = [];

		// Add product results
		results.slice(0, 5).forEach((product) => {
			suggestions.push({
				type: "product",
				item: product,
			});
		});

		// Add category suggestions based on product types
		const productTypes = new Set(results.map((p) => p.productType).filter(Boolean));
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
			const commonWords = results
				.flatMap((p) => p.title.toLowerCase().split(" "))
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
	}, []);

	// Update suggestions when search results change
	useEffect(() => {
		const newSuggestions = generateSuggestions(inputValue, searchResults);
		setSuggestions(newSuggestions);
	}, [inputValue, searchResults, generateSuggestions]);

	const handleInputChange = (value: string) => {
		setInputValue(value);
		setSearchQuery(value);
		setIsOpen(true);
	};

	const handleSelect = (result: SearchResult) => {
		if (result.type === "product") {
			const product = result.item as ShopifyProduct;
			router.push(`/products/${product.handle}`);
		} else if (result.type === "collection") {
			router.push(`/collections/${(result.item as string).toLowerCase().replace(/\s+/g, "-")}`);
		} else {
			setInputValue(result.item as string);
			setSearchQuery(result.item as string);
		}
		setIsOpen(false);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (inputValue.trim()) {
			router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
			setIsOpen(false);
		}
	};

	return (
		<div className="relative w-full max-w-2xl">
			<form onSubmit={handleSubmit} className="relative">
				<Command className="relative z-50 max-w-2xl overflow-visible bg-transparent">
					<div className="flex items-center border rounded-xl px-3 bg-background dark:bg-neutral-950 border-input">
						<SearchIcon className="h-4 w-4 shrink-0 text-foreground/60" />
						<CommandInput ref={inputRef} value={inputValue} onValueChange={handleInputChange} placeholder="Search products..." className="flex-1 h-11 px-3 text-sm outline-none placeholder:text-muted-foreground bg-transparent border-0 focus-visible:ring-0" />
						{isSearching && <Loader2 className="h-4 w-4 animate-spin text-foreground/60" />}
						<Button type="submit" size="sm" variant="ghost" className="h-7 px-2 text-xs">
							Search
						</Button>
					</div>
				</Command>
			</form>

			{/* Autocomplete dropdown */}
			{isOpen && suggestions.length > 0 && (
				<div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border bg-background shadow-md animate-in fade-in-0 zoom-in-95">
					<div className="max-h-96 overflow-y-auto overscroll-contain">
						{suggestions.map((result, index) => {
							if (result.type === "product") {
								const product = result.item as ShopifyProduct;
								return (
									<Link key={product.id} href={`/products/${product.handle}`} className="flex items-start gap-4 p-4 hover:bg-accent" onClick={() => setIsOpen(false)}>
										{product.images?.edges[0]?.node && (
											<div className="relative h-16 w-16 overflow-hidden rounded-lg border">
												<Image src={product.images.edges[0].node.url} alt={product.images.edges[0].node.altText || product.title} fill className="object-cover" sizes="64px" />
											</div>
										)}
										<div className="flex-1 space-y-1">
											<h4 className="text-sm font-medium leading-none">{product.title}</h4>
											<p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
											<p className="text-sm font-medium text-foreground">{formatPrice(parseFloat(product.priceRange.minVariantPrice.amount))}</p>
										</div>
									</Link>
								);
							}

							if (result.type === "collection") {
								return (
									<button key={`collection-${index}`} className="w-full p-4 text-left hover:bg-accent flex items-center gap-2" onClick={() => handleSelect(result)}>
										<span className="text-sm">Shop {result.item as string}</span>
									</button>
								);
							}

							return (
								<button key={`suggestion-${index}`} className="w-full p-4 text-left hover:bg-accent flex items-center gap-2" onClick={() => handleSelect(result)}>
									<SearchIcon className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">{result.item as string}</span>
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
