"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Star } from "lucide-react";

export interface FilterOptions {
	categories: string[];
	brands: string[];
	priceRange: [number, number];
	ratings: number[];
}

interface FilterSidebarProps {
	categories: string[];
	brands: string[];
	onFilterChange?: (filters: FilterOptions) => void;
}

export function FilterSidebar({ categories, brands, onFilterChange }: FilterSidebarProps) {
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
	const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

	// Update filters whenever any selection changes
	useEffect(() => {
		onFilterChange?.({
			categories: selectedCategories,
			brands: selectedBrands,
			priceRange,
			ratings: selectedRatings,
		});
	}, [selectedCategories, selectedBrands, priceRange, selectedRatings, onFilterChange]);

	const handleCategoryChange = (category: string, checked: boolean) => {
		setSelectedCategories((prev) => (checked ? [...prev, category] : prev.filter((c) => c !== category)));
	};

	const handleBrandChange = (brand: string, checked: boolean) => {
		setSelectedBrands((prev) => (checked ? [...prev, brand] : prev.filter((b) => b !== brand)));
	};

	const handleRatingChange = (rating: number, checked: boolean) => {
		setSelectedRatings((prev) => (checked ? [...prev, rating] : prev.filter((r) => r !== rating)));
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-semibold mb-2">Categories</h3>
				<div className="space-y-2 max-h-48 overflow-y-auto">
					{categories.map((category) => (
						<div key={category} className="flex items-center">
							<Checkbox id={category} onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)} />
							<label htmlFor={category} className="ml-2 text-sm">
								{category}
							</label>
						</div>
					))}
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-2">Brands</h3>
				<div className="space-y-2 max-h-48 overflow-y-auto">
					{brands.map((brand) => (
						<div key={brand} className="flex items-center">
							<Checkbox id={brand} onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)} />
							<label htmlFor={brand} className="ml-2 text-sm">
								{brand}
							</label>
						</div>
					))}
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-2">Price Range</h3>
				<Slider min={0} max={3000} step={10} value={priceRange} onValueChange={(value) => setPriceRange(value as [number, number])} className="mb-2" />
				<div className="flex justify-between text-sm">
					<span>${priceRange[0]}</span>
					<span>${priceRange[1]}</span>
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-2">Customer Rating</h3>
				{[4, 3, 2, 1].map((rating) => (
					<div key={rating} className="flex items-center">
						<Checkbox id={`rating-${rating}`} onCheckedChange={(checked) => handleRatingChange(rating, checked as boolean)} />
						<label htmlFor={`rating-${rating}`} className="ml-2 text-sm flex items-center">
							{rating}+ <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 ml-1" />
						</label>
					</div>
				))}
			</div>
		</div>
	);
}
