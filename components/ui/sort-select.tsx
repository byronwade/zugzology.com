"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SortSelectProps {
	value?: string;
	onValueChange: (value: string) => void;
}

export function SortSelect({ value, onValueChange }: SortSelectProps) {
	return (
		<Select value={value} onValueChange={onValueChange}>
			<SelectTrigger className="w-[100px] sm:w-[180px] text-sm sm:text-base">
				<SelectValue placeholder="Sort by" />
			</SelectTrigger>
			<SelectContent className="min-w-[120px] sm:min-w-[180px]">
				<SelectItem value="featured">Featured</SelectItem>
				<SelectItem value="price-asc">Price: Low to High</SelectItem>
				<SelectItem value="price-desc">Price: High to Low</SelectItem>
				<SelectItem value="name-asc">Name: A to Z</SelectItem>
				<SelectItem value="name-desc">Name: Z to A</SelectItem>
			</SelectContent>
		</Select>
	);
} 