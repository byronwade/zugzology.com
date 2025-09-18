"use client";

import { useMemo, useState } from "react";
import { ShopifyProduct } from "@/lib/types";
import { ProductCard } from "@/components/features/products/product-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Search, ShoppingBag, Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from '@/components/ui/link';

export interface SearchResultsProps {
	products: ShopifyProduct[];
	searchParams?: {
		q?: string;
		sort?: string;
		inStock?: string;
		priceRange?: string;
		productType?: string;
		vendor?: string;
	};
}

type SortOption = "relevance" | "price-asc" | "price-desc" | "title-asc" | "title-desc";

export function SearchResults({ products, searchParams }: SearchResultsProps) {
	const query = searchParams?.q || "";
	const [sortBy, setSortBy] = useState<SortOption>((searchParams?.sort as SortOption) || "relevance");
	const [filters, setFilters] = useState({
		inStock: searchParams?.inStock === "true",
		priceRange: (searchParams?.priceRange?.split(",") || []) as string[],
		productTypes: (searchParams?.productType?.split(",") || []) as string[],
		vendors: (searchParams?.vendor?.split(",") || []) as string[],
	});

	// Extract all available filter options
	const filterOptions = useMemo(() => {
		const options = {
			productTypes: new Set<string>(),
			vendors: new Set<string>(),
			priceRanges: ["Under $25", "$25 to $50", "$50 to $100", "$100 to $200", "Over $200"],
		};

		products.forEach((product) => {
			if (product.productType) options.productTypes.add(product.productType);
			if (product.vendor) options.vendors.add(product.vendor);
		});

		return {
			...options,
			productTypes: Array.from(options.productTypes),
			vendors: Array.from(options.vendors),
		};
	}, [products]);

	// Calculate search scores and filter products
	const searchResults = useMemo(() => {
		let results = [...products];

		// Filter by search query
		if (query) {
			const searchTerms = query.toLowerCase().split(/\s+/);
			results = results.filter((product) => {
				const searchableText = [
					product.title,
					product.description,
					product.productType,
					product.vendor,
					...(product.tags || []),
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();

				return searchTerms.every((term) => searchableText.includes(term));
			});
		}

		// Apply filters
		if (filters.inStock) {
			results = results.filter((product) => product.availableForSale);
		}

		if (filters.productTypes.length > 0) {
			results = results.filter((product) => filters.productTypes.includes(product.productType || ""));
		}

		if (filters.vendors.length > 0) {
			results = results.filter((product) => filters.vendors.includes(product.vendor || ""));
		}

		if (filters.priceRange.length > 0) {
			results = results.filter((product) => {
				const price = parseFloat(product.priceRange.minVariantPrice.amount);
				return filters.priceRange.some((range) => {
					switch (range) {
						case "Under $25":
							return price < 25;
						case "$25 to $50":
							return price >= 25 && price < 50;
						case "$50 to $100":
							return price >= 50 && price < 100;
						case "$100 to $200":
							return price >= 100 && price < 200;
						case "Over $200":
							return price >= 200;
						default:
							return true;
					}
				});
			});
		}

		// Apply sorting
		switch (sortBy) {
			case "price-asc":
				results.sort(
					(a, b) => parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount)
				);
				break;
			case "price-desc":
				results.sort(
					(a, b) => parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount)
				);
				break;
			case "title-asc":
				results.sort((a, b) => a.title.localeCompare(b.title));
				break;
			case "title-desc":
				results.sort((a, b) => b.title.localeCompare(a.title));
				break;
			// "relevance" is default, no additional sorting needed
		}

		return results;
	}, [products, query, filters, sortBy]);

	const handleFilterChange = (type: keyof typeof filters, value: any) => {
		setFilters((prev) => {
			if (type === "inStock") {
				return { ...prev, [type]: value };
			}

			const currentValues = prev[type as keyof typeof prev] as string[];
			const newValues = currentValues.includes(value)
				? currentValues.filter((v) => v !== value)
				: [...currentValues, value];

			return { ...prev, [type]: newValues };
		});
	};

	return (
		<div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{/* Search header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">{query ? `Search results for "${query}"` : "All Products"}</h1>
				<p className="text-muted-foreground">
					{searchResults.length} {searchResults.length === 1 ? "result" : "results"}
				</p>
			</div>

			{/* Filters and sorting */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-4">
					{/* Mobile filter button */}
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="sm" className="lg:hidden">
								<SlidersHorizontal className="h-4 w-4 mr-2" />
								Filters
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-[300px] sm:w-[400px]">
							<SheetHeader>
								<SheetTitle>Filters</SheetTitle>
							</SheetHeader>
							<ScrollArea className="h-[calc(100vh-8rem)] pr-4">
								<div className="space-y-6 py-4">
									<FilterSection filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} />
								</div>
							</ScrollArea>
						</SheetContent>
					</Sheet>

					{/* Desktop filters */}
					<div className="hidden lg:flex items-center gap-4">
						<Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="relevance">Relevance</SelectItem>
								<SelectItem value="price-asc">Price: Low to High</SelectItem>
								<SelectItem value="price-desc">Price: High to Low</SelectItem>
								<SelectItem value="title-asc">Name: A to Z</SelectItem>
								<SelectItem value="title-desc">Name: Z to A</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			<div className="grid lg:grid-cols-[220px_1fr] gap-8">
				{/* Desktop filter sidebar */}
				<div className="hidden lg:block">
					<FilterSection filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} />
				</div>

				{/* Search results grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{searchResults.map((product) => (
						<ProductCard key={product.id} product={product} view="grid" />
					))}
					{searchResults.length === 0 && (
						<div className="col-span-full py-16">
							<div className="max-w-2xl mx-auto text-center bg-accent/30 rounded-xl p-8">
								<div className="bg-background rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
									<Search className="w-8 h-8 text-primary" />
								</div>
								<h2 className="text-2xl font-bold mb-3">No results found</h2>
									<p className="text-muted-foreground mb-6">
										We couldn&apos;t find any products matching your search criteria.
									</p>

								<div className="space-y-4 mb-8">
									<div>
										<h3 className="font-medium text-lg mb-2">Search Tips:</h3>
										<ul className="text-sm text-muted-foreground space-y-1 mx-auto max-w-md text-left list-disc pl-8">
											<li>Check the spelling of your search terms</li>
											<li>Try using more general keywords</li>
											<li>Search for related terms or alternative product names</li>
											<li>Try adjusting your filters</li>
										</ul>
									</div>
								</div>

								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Button asChild size="lg" className="gap-2">
										<Link href="/products">
											<ShoppingBag className="w-5 h-5" />
											Browse All Products
										</Link>
									</Button>
									<Button asChild variant="outline" size="lg" className="gap-2">
										<Link href="/collections/best-sellers">
											<Star className="w-5 h-5" />
											Best Sellers
										</Link>
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// Filter section component
function FilterSection({
	filters,
	filterOptions,
	onFilterChange,
}: {
	filters: {
		inStock: boolean;
		priceRange: string[];
		productTypes: string[];
		vendors: string[];
	};
	filterOptions: {
		productTypes: string[];
		vendors: string[];
		priceRanges: string[];
	};
	onFilterChange: (type: "inStock" | "priceRange" | "productTypes" | "vendors", value: any) => void;
}) {
	return (
		<div className="space-y-6">
			{/* In Stock filter */}
			<div className="space-y-4">
				<h3 className="font-medium">Availability</h3>
				<div className="space-y-2">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="in-stock"
							checked={filters.inStock}
							onCheckedChange={(checked) => onFilterChange("inStock", checked)}
						/>
						<label
							htmlFor="in-stock"
							className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							In stock only
						</label>
					</div>
				</div>
			</div>

			<Separator />

			{/* Price Range filter */}
			<div className="space-y-4">
				<h3 className="font-medium">Price Range</h3>
				<div className="space-y-2">
					{filterOptions.priceRanges.map((range) => (
						<div key={range} className="flex items-center space-x-2">
							<Checkbox
								id={range}
								checked={filters.priceRange.includes(range)}
								onCheckedChange={(checked) => onFilterChange("priceRange", range)}
							/>
							<label
								htmlFor={range}
								className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								{range}
							</label>
						</div>
					))}
				</div>
			</div>

			<Separator />

			{/* Product Type filter */}
			{filterOptions.productTypes.length > 0 && (
				<>
					<div className="space-y-4">
						<h3 className="font-medium">Product Type</h3>
						<div className="space-y-2">
							{filterOptions.productTypes.map((type) => (
								<div key={type} className="flex items-center space-x-2">
									<Checkbox
										id={type}
										checked={filters.productTypes.includes(type)}
										onCheckedChange={(checked) => onFilterChange("productTypes", type)}
									/>
									<label
										htmlFor={type}
										className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										{type}
									</label>
								</div>
							))}
						</div>
					</div>

					<Separator />
				</>
			)}

			{/* Vendor filter */}
			{filterOptions.vendors.length > 0 && (
				<div className="space-y-4">
					<h3 className="font-medium">Brand</h3>
					<div className="space-y-2">
						{filterOptions.vendors.map((vendor) => (
							<div key={vendor} className="flex items-center space-x-2">
								<Checkbox
									id={vendor}
									checked={filters.vendors.includes(vendor)}
									onCheckedChange={(checked) => onFilterChange("vendors", vendor)}
								/>
								<label
									htmlFor={vendor}
									className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{vendor}
								</label>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
