"use client";

import React from "react";
import { Grid2X2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SortOption } from "@/lib/hooks/use-product-filters";

interface ProductsHeaderProps {
	title: string;
	description?: string;
	count?: number;
	onViewChange?: (view: "grid" | "list") => void;
	view?: "grid" | "list";
	filters: {
		sort: SortOption;
	};
	onUpdateFilter: (key: string, value: string) => void;
}

const sortOptions = [
	{ value: "featured", label: "Featured" },
	{ value: "price-asc", label: "Price: Low to High" },
	{ value: "price-desc", label: "Price: High to Low" },
	{ value: "title-asc", label: "Name: A to Z" },
	{ value: "title-desc", label: "Name: Z to A" },
	{ value: "newest", label: "Newest" },
] as const;

export function ProductsHeader({ title, description, count, onViewChange, view = "grid", filters, onUpdateFilter }: ProductsHeaderProps) {
	return (
		<section className="sticky top-[98px] md:top-[104px] bg-background z-10 border-b py-2 px-4">
			<div className="flex items-center justify-between gap-4">
				<div className="flex-1 min-w-0">
					<h1 className="text-xl font-semibold text-foreground truncate">{title}</h1>
					{description && <p className="text-sm text-muted-foreground truncate hidden sm:block">{description}</p>}
				</div>
				<div className="flex items-center gap-2">
					<p className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">{count !== undefined ? `${count} ${count === 1 ? "product" : "products"}` : ""}</p>

					{/* Sort Select */}
					<Select value={filters.sort} onValueChange={(value) => onUpdateFilter("sort", value)}>
						<SelectTrigger className="w-[180px]">
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

					{/* View Toggle */}
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

