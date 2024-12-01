"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { FilterContent } from "./filter-content";
import { useFilters } from "./use-filters";

interface FilterSheetProps {
	trigger?: React.ReactNode;
	side?: "left" | "right";
}

export function FilterSheet({ side = "left", trigger }: FilterSheetProps) {
	const { filters, hasActiveFilters, handleFilterChange, clearFilters } = useFilters();

	return (
		<Sheet>
			<SheetTrigger asChild>
				{trigger || (
					<Button variant="outline" size="icon" className="h-8 w-8">
						<Menu className="h-4 w-4" />
						{hasActiveFilters && (
							<span className="absolute -top-1 -right-1 flex h-3 w-3">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
								<span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
							</span>
						)}
					</Button>
				)}
			</SheetTrigger>
			<SheetContent side={side} className="w-full sm:max-w-md p-0 border-l dark:border-neutral-800 dark:bg-neutral-950">
				<SheetHeader className="px-4 py-3 border-b dark:border-neutral-800">
					<div className="flex items-center justify-between">
						<SheetTitle>Filters</SheetTitle>
						{hasActiveFilters && (
							<Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
								Clear All
							</Button>
						)}
					</div>
				</SheetHeader>
				<div className="p-4">
					<FilterContent filters={filters} onFilterChange={handleFilterChange} />
				</div>
			</SheetContent>
		</Sheet>
	);
}
