"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, SlidersHorizontal } from "lucide-react";
import { FilterSidebar } from "./filter-sidebar";
import type { FilterOptions } from "./filter-sidebar";

interface FilterBarProps {
	categories: string[];
	brands: string[];
	onFilterChange?: (filters: FilterOptions) => void;
}

export function FilterBar({ categories, brands, onFilterChange }: FilterBarProps) {
	return (
		<div className="sticky top-[64px] z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-14 items-center px-4 gap-4">
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="outline" size="sm" className="flex items-center gap-2">
							<Filter className="h-4 w-4" />
							<span>Filters</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-[300px] sm:w-[400px]">
						<FilterSidebar categories={categories} brands={brands} onFilterChange={onFilterChange} />
					</SheetContent>
				</Sheet>

				{/* Active Filters Pills */}
				<div className="flex items-center gap-2 overflow-x-auto">
					<Button variant="secondary" size="sm" className="flex items-center gap-2">
						<SlidersHorizontal className="h-3 w-3" />
						<span>Price: $0 - $3000</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
