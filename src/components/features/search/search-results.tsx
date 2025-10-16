"use client";

import { Search, ShoppingBag, SlidersHorizontal, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/features/products/product-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/components/ui/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { ShopifyProduct } from "@/lib/types";

export type SearchResultsProps = {
	products: ShopifyProduct[];
	searchParams?: {
		q?: string;
		sort?: string;
		inStock?: string;
		priceRange?: string;
		productType?: string;
		vendor?: string;
	};
};

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
			if (product.productType) {
				options.productTypes.add(product.productType);
			}
			if (product.vendor) {
				options.vendors.add(product.vendor);
			}
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
				const price = Number.parseFloat(product.priceRange.minVariantPrice.amount);
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
					(a, b) =>
						Number.parseFloat(a.priceRange.minVariantPrice.amount) -
						Number.parseFloat(b.priceRange.minVariantPrice.amount)
				);
				break;
			case "price-desc":
				results.sort(
					(a, b) =>
						Number.parseFloat(b.priceRange.minVariantPrice.amount) -
						Number.parseFloat(a.priceRange.minVariantPrice.amount)
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
		<div className="mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
			{/* Search header */}
			<div className="mb-8">
				<h1 className="mb-2 font-bold text-3xl">{query ? `Search results for "${query}"` : "All Products"}</h1>
				<p className="text-muted-foreground">
					{searchResults.length} {searchResults.length === 1 ? "result" : "results"}
				</p>
			</div>

			{/* Filters and sorting */}
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-4">
					{/* Mobile filter button */}
					<Sheet>
						<SheetTrigger asChild>
							<Button className="lg:hidden" size="sm" variant="outline">
								<SlidersHorizontal className="mr-2 h-4 w-4" />
								Filters
							</Button>
						</SheetTrigger>
						<SheetContent className="w-[300px] sm:w-[400px]" side="left">
							<SheetHeader>
								<SheetTitle>Filters</SheetTitle>
							</SheetHeader>
							<ScrollArea className="h-[calc(100vh-8rem)] pr-4">
								<div className="space-y-6 py-4">
									<FilterSection filterOptions={filterOptions} filters={filters} onFilterChange={handleFilterChange} />
								</div>
							</ScrollArea>
						</SheetContent>
					</Sheet>

					{/* Desktop filters */}
					<div className="hidden items-center gap-4 lg:flex">
						<Select onValueChange={(value) => setSortBy(value as SortOption)} value={sortBy}>
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

			<div className="grid gap-8 lg:grid-cols-[220px_1fr]">
				{/* Desktop filter sidebar */}
				<div className="hidden lg:block">
					<FilterSection filterOptions={filterOptions} filters={filters} onFilterChange={handleFilterChange} />
				</div>

				{/* Search results grid */}
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{searchResults.map((product) => (
						<ProductCard key={product.id} product={product} view="grid" />
					))}
					{searchResults.length === 0 && (
						<div className="col-span-full py-16">
							<div className="mx-auto max-w-2xl rounded-xl bg-muted/50 p-8 text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background">
									<Search className="h-8 w-8 text-primary" />
								</div>
								<h2 className="mb-3 font-bold text-2xl">No results found</h2>
								<p className="mb-6 text-muted-foreground">
									We couldn&apos;t find any products matching your search criteria.
								</p>

								<div className="mb-8 space-y-4">
									<div>
										<h3 className="mb-2 font-medium text-lg">Search Tips:</h3>
										<ul className="mx-auto max-w-md list-disc space-y-1 pl-8 text-left text-muted-foreground text-sm">
											<li>Check the spelling of your search terms</li>
											<li>Try using more general keywords</li>
											<li>Search for related terms or alternative product names</li>
											<li>Try adjusting your filters</li>
										</ul>
									</div>
								</div>

								<div className="flex flex-col justify-center gap-4 sm:flex-row">
									<Button asChild className="gap-2" size="lg">
										<Link href="/products">
											<ShoppingBag className="h-5 w-5" />
											Browse All Products
										</Link>
									</Button>
									<Button asChild className="gap-2" size="lg" variant="outline">
										<Link href="/collections/best-sellers">
											<Star className="h-5 w-5" />
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
							checked={filters.inStock}
							id="in-stock"
							onCheckedChange={(checked) => onFilterChange("inStock", checked)}
						/>
						<label
							className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							htmlFor="in-stock"
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
						<div className="flex items-center space-x-2" key={range}>
							<Checkbox
								checked={filters.priceRange.includes(range)}
								id={range}
								onCheckedChange={(_checked) => onFilterChange("priceRange", range)}
							/>
							<label
								className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								htmlFor={range}
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
								<div className="flex items-center space-x-2" key={type}>
									<Checkbox
										checked={filters.productTypes.includes(type)}
										id={type}
										onCheckedChange={(_checked) => onFilterChange("productTypes", type)}
									/>
									<label
										className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										htmlFor={type}
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
							<div className="flex items-center space-x-2" key={vendor}>
								<Checkbox
									checked={filters.vendors.includes(vendor)}
									id={vendor}
									onCheckedChange={(_checked) => onFilterChange("vendors", vendor)}
								/>
								<label
									className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									htmlFor={vendor}
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
