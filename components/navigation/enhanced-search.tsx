"use client";

import { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Tag, Clock, TrendingUp, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export interface SearchResult {
	id: string;
	title: string;
	type: "product" | "article" | "collection";
	category?: string;
	image?: string;
}

interface EnhancedSearchProps {
	isOpen: boolean;
	onClose: () => void;
	initialResults?: SearchResult[];
}

export function EnhancedSearch({ isOpen, onClose, initialResults = [] }: EnhancedSearchProps) {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [recentSearches, setRecentSearches] = useState<string[]>([]);

	// Load recent searches from localStorage on mount
	useEffect(() => {
		const saved = localStorage.getItem("recentSearches");
		if (saved) {
			setRecentSearches(JSON.parse(saved));
		}
	}, []);

	// Save search to recent searches
	const saveToRecent = (searchTerm: string) => {
		const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
		setRecentSearches(updated);
		localStorage.setItem("recentSearches", JSON.stringify(updated));
	};

	const handleSelect = (value: string) => {
		saveToRecent(value);
		router.push(`/search?q=${encodeURIComponent(value)}`);
		onClose();
	};

	return (
		<Command className="rounded-lg border shadow-md">
			<CommandInput placeholder="Search products and articles..." value={query} onValueChange={setQuery} />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>

				{/* Recent Searches */}
				{recentSearches.length > 0 && !query && (
					<CommandGroup heading="Recent Searches">
						{recentSearches.map((search) => (
							<CommandItem key={search} value={search} onSelect={handleSelect} className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								{search}
							</CommandItem>
						))}
					</CommandGroup>
				)}

				{/* Trending Searches - Could be populated from analytics */}
				{!query && (
					<CommandGroup heading="Trending">
						<CommandItem value="new-arrivals" onSelect={handleSelect}>
							<div className="flex items-center gap-2">
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
								<span>New Arrivals</span>
								<Badge variant="secondary" className="ml-auto">
									Popular
								</Badge>
							</div>
						</CommandItem>
					</CommandGroup>
				)}

				{/* Search Results */}
				{query && (
					<ScrollArea className="h-[300px]">
						<CommandGroup heading="Products">
							{initialResults
								.filter((result) => result.type === "product")
								.map((result) => (
									<CommandItem key={result.id} value={result.title} onSelect={handleSelect} className="flex items-center gap-2">
										{result.image && (
											<div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
												<img src={result.image} alt={result.title} className="h-6 w-6 object-cover" />
											</div>
										)}
										<div className="flex flex-col">
											<span>{result.title}</span>
											{result.category && <span className="text-xs text-muted-foreground">in {result.category}</span>}
										</div>
										{result.type === "product" && <Tag className="h-4 w-4 ml-auto text-muted-foreground" />}
									</CommandItem>
								))}
						</CommandGroup>

						<CommandGroup heading="Collections">
							{initialResults
								.filter((result) => result.type === "collection")
								.map((result) => (
									<CommandItem key={result.id} value={result.title} onSelect={handleSelect}>
										<Star className="h-4 w-4 mr-2 text-muted-foreground" />
										{result.title}
									</CommandItem>
								))}
						</CommandGroup>
					</ScrollArea>
				)}
			</CommandList>
		</Command>
	);
}
