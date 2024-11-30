"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from "next/navigation";

export interface FilterState {
	categories: string[];
	brands: string[];
	priceRange: number[];
	ratings: string[];
	sortBy: string;
	tags: string[];
}

interface SidebarProps {
	className?: string;
	onFilterChange: (filters: FilterState) => void;
}

const categories = [
	{ id: "Mushrooms", label: "Mushrooms" },
	{ id: "Spores", label: "Spores" },
	{ id: "Equipment", label: "Equipment" },
	{ id: "Supplies", label: "Supplies" },
];

const brands = [
	{ id: "Zugzology", label: "Zugzology" },
	{ id: "Other Brands", label: "Other Brands" },
];

const ratings = [
	{ id: "rating-5", label: "5★ only" },
	{ id: "rating-4", label: "4★ & up" },
	{ id: "rating-3", label: "3★ & up" },
	{ id: "rating-2", label: "2★ & up" },
	{ id: "rating-1", label: "1★ & up" },
];

const sortOptions = [
	{ value: "manual", label: "Featured" },
	{ value: "price-asc", label: "Price: Low to High" },
	{ value: "price-desc", label: "Price: High to Low" },
	{ value: "title-asc", label: "Name: A-Z" },
	{ value: "title-desc", label: "Name: Z-A" },
	{ value: "date-desc", label: "Newest First" },
	{ value: "date-asc", label: "Oldest First" },
];

export function Sidebar({ className, onFilterChange }: SidebarProps) {
	const searchParams = useSearchParams();

	// Initialize filters from URL params with default value for sortBy
	const [filters, setFilters] = React.useState<FilterState>(() => ({
		categories: searchParams.get("categories")?.split(",").filter(Boolean) || [],
		brands: searchParams.get("brands")?.split(",").filter(Boolean) || [],
		priceRange: [Number(searchParams.get("priceRange")) || 0],
		ratings: searchParams.get("ratings")?.split(",").filter(Boolean) || [],
		sortBy: searchParams.get("sortBy") || "manual",
		tags: searchParams.get("tags")?.split(",").filter(Boolean) || [],
	}));

	// Sync filters with URL params
	React.useEffect(() => {
		const newFilters: FilterState = {
			categories: searchParams.get("categories")?.split(",").filter(Boolean) || [],
			brands: searchParams.get("brands")?.split(",").filter(Boolean) || [],
			priceRange: [Number(searchParams.get("priceRange")) || 0],
			ratings: searchParams.get("ratings")?.split(",").filter(Boolean) || [],
			sortBy: searchParams.get("sortBy") || "manual",
			tags: searchParams.get("tags")?.split(",").filter(Boolean) || [],
		};
		setFilters(newFilters);
	}, [searchParams]);

	// Use useEffect to notify parent of filter changes
	React.useEffect(() => {
		onFilterChange(filters);
	}, [filters, onFilterChange]);

	const handleCheckboxChange = React.useCallback((key: keyof FilterState, id: string) => {
		setFilters((prev) => {
			const currentValues = prev[key] as string[];
			const newValues = currentValues.includes(id) ? currentValues.filter((v) => v !== id) : [...currentValues, id];
			return { ...prev, [key]: newValues };
		});
	}, []);

	const handleSliderChange = React.useCallback((value: number[]) => {
		setFilters((prev) => ({ ...prev, priceRange: value }));
	}, []);

	const handleSortChange = React.useCallback((value: string) => {
		setFilters((prev) => ({ ...prev, sortBy: value }));
	}, []);

	return (
		<aside className={`hidden lg:block w-64 fixed top-[105px] bottom-0 left-0 overflow-y-auto border-r bg-background ${className}`}>
			<div className="p-4 h-full">
				<div className="space-y-6">
					{/* Sort By */}
					<div>
						<h3 className="font-semibold mb-2">Sort By</h3>
						<Select value={filters.sortBy} onValueChange={handleSortChange}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								{sortOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Price Range */}
					<div>
						<h3 className="font-semibold mb-2">Price Range</h3>
						<Slider defaultValue={[0]} max={3000} step={1} value={filters.priceRange} onValueChange={handleSliderChange} className="mb-2" />
						<div className="flex justify-between text-sm">
							<span>${filters.priceRange[0]}</span>
							<span>$3000</span>
						</div>
					</div>

					{/* Categories */}
					<div>
						<h3 className="font-semibold mb-2">Categories</h3>
						<div className="space-y-2 max-h-48 overflow-y-auto">
							{categories.map((category) => (
								<div key={category.id} className="flex items-center">
									<Checkbox id={category.id} checked={filters.categories.includes(category.id)} onCheckedChange={() => handleCheckboxChange("categories", category.id)} className="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow" />
									<label htmlFor={category.id} className="ml-2 text-sm">
										{category.label}
									</label>
								</div>
							))}
						</div>
					</div>

					{/* Brands */}
					<div>
						<h3 className="font-semibold mb-2">Brands</h3>
						<div className="space-y-2 max-h-48 overflow-y-auto">
							{brands.map((brand) => (
								<div key={brand.id} className="flex items-center">
									<Checkbox id={brand.id} checked={filters.brands.includes(brand.id)} onCheckedChange={() => handleCheckboxChange("brands", brand.id)} className="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow" />
									<label htmlFor={brand.id} className="ml-2 text-sm">
										{brand.label}
									</label>
								</div>
							))}
						</div>
					</div>

					{/* Customer Rating */}
					<div>
						<h3 className="font-semibold mb-2">Customer Rating</h3>
						{ratings.map((rating) => (
							<div key={rating.id} className="flex items-center">
								<Checkbox id={rating.id} checked={filters.ratings.includes(rating.id)} onCheckedChange={() => handleCheckboxChange("ratings", rating.id)} className="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow" />
								<label htmlFor={rating.id} className="ml-2 text-sm flex items-center gap-1">
									{rating.label}
									<div className="flex">
										{Array.from({ length: parseInt(rating.id.split("-")[1]) }).map((_, i) => (
											<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
										))}
									</div>
								</label>
							</div>
						))}
					</div>
				</div>
			</div>
		</aside>
	);
}
