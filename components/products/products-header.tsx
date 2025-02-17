"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SortOption } from "@/lib/hooks/use-product-filters";

interface ProductsHeaderProps {
	title: string;
	description?: string;
	count?: number;
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

export function ProductsHeader({ title, description, count, filters, onUpdateFilter }: ProductsHeaderProps) {
	return (
		<section className="sticky top-[var(--header-height)] bg-background z-10 border-b py-2 px-4">
			<div className="flex items-center justify-between gap-4">
				<div className="flex-1 min-w-0">
					<h1 className="text-xl font-semibold text-foreground truncate">{title}</h1>
					{description && <p className="text-sm text-muted-foreground truncate hidden sm:block">{description}</p>}
				</div>
				<div className="flex items-center gap-2">
					<p className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">{count !== undefined ? `${count} ${count === 1 ? "product" : "products"}` : ""}</p>

					{/* Sort Select */}
					<Select value={filters.sort} onValueChange={(value) => onUpdateFilter("sort", value)}>
						<SelectTrigger className="w-[100px] sm:w-[180px] text-sm sm:text-base">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent className="min-w-[120px] sm:min-w-[180px]">
							{sortOptions.map((option) => (
								<SelectItem key={option.value} value={option.value} className="text-sm sm:text-base">
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</section>
	);
}

