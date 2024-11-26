"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
	onSearch: (value: string) => void;
	onSort: (value: string) => void;
	onFilterClick: () => void;
	sortOptions?: {
		label: string;
		value: string;
	}[];
}

export function FilterBar({
	onSearch,
	onSort,
	onFilterClick,
	sortOptions = [
		{ label: "Latest", value: "latest" },
		{ label: "Price: Low to High", value: "price-asc" },
		{ label: "Price: High to Low", value: "price-desc" },
		{ label: "Name: A to Z", value: "title-asc" },
		{ label: "Name: Z to A", value: "title-desc" },
	],
}: FilterBarProps) {
	return (
		<div className="flex items-center gap-4 p-4 bg-background border rounded-lg">
			<Input placeholder="Search products..." className="max-w-xs" onChange={(e) => onSearch(e.target.value)} />
			<Select onValueChange={onSort}>
				<SelectTrigger className="max-w-[200px]">
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
			<Button variant="outline" size="icon" className="ml-auto lg:hidden" onClick={onFilterClick}>
				<SlidersHorizontal className="h-4 w-4" />
			</Button>
		</div>
	);
} 