"use client";

import React from "react";
import { Grid2X2, List, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SortSelect } from "@/components/ui/sort-select";
import { FilterContent } from "@/components/filters/filter-content";
import { useFilters } from "@/components/filters/use-filters";

interface ProductsHeaderProps {
	title: string;
	description?: string;
	count?: number;
	onViewChange?: (view: "grid" | "list") => void;
	view?: "grid" | "list";
}

export function ProductsHeader({ title, description, count, onViewChange, view = "grid" }: ProductsHeaderProps) {
	const { filters, hasActiveFilters, handleFilterChange, clearFilters } = useFilters();

	return (
		<section className="sticky top-[98px] md:top-[106px] bg-background z-10 border-b py-2 px-4">
			<div className="flex items-center justify-between gap-4">
				<div className="flex-1 min-w-0">
					<h1 className="text-xl font-semibold text-foreground truncate">{title}</h1>
					{description && <p className="text-sm text-muted-foreground truncate hidden sm:block">{description}</p>}
				</div>
				<div className="flex items-center gap-2">
					<p className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">{count !== undefined ? `${count} ${count === 1 ? "product" : "products"}` : ""}</p>
					<SortSelect value={filters.sort} onValueChange={(value) => handleFilterChange("sort", value)} />
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="sm" className="relative">
								<SlidersHorizontal className="h-4 w-4" />
								<span className="sr-only">Filters</span>
								{hasActiveFilters && (
									<span className="absolute -top-1 -right-1 flex h-3 w-3">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
										<span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
									</span>
								)}
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-full sm:max-w-md">
							<SheetHeader className="border-b pb-4 mb-4">
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-2">
										<SheetTitle>Filters</SheetTitle>
										{hasActiveFilters && (
											<Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
												Clear All
											</Button>
										)}
									</div>
								</div>
							</SheetHeader>
							<FilterContent />
						</SheetContent>
					</Sheet>
					<div className="flex items-center border rounded-md overflow-hidden">
						<Button onClick={() => onViewChange?.("grid")} variant={view === "grid" ? "default" : "ghost"} size="icon" className={cn("h-8 w-8", view === "grid" && "bg-primary text-primary-foreground")} title="Grid view">
							<Grid2X2 className="h-4 w-4" />
						</Button>
						<Button onClick={() => onViewChange?.("list")} variant={view === "list" ? "default" : "ghost"} size="icon" className={cn("h-8 w-8", view === "list" && "bg-primary text-primary-foreground")} title="List view">
							<List className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}

