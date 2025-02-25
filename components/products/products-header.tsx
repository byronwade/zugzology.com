"use client";

import React, { memo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface ProductsHeaderProps {
	title: string;
	description?: string;
	defaultSort?: string;
	className?: string;
	image?: {
		url: string;
		altText?: string;
		width?: number;
		height?: number;
	};
	filters?: Record<string, string>;
	onUpdateFilter?: (key: string, value: string) => void;
	count?: number;
}

const sortOptions = [
	{ value: "featured", label: "Featured" },
	{ value: "price-asc", label: "Price: Low to High" },
	{ value: "price-desc", label: "Price: High to Low" },
	{ value: "title-asc", label: "Name: A to Z" },
	{ value: "title-desc", label: "Name: Z to A" },
	{ value: "newest", label: "Newest" },
] as const;

export const ProductsHeader = memo(function ProductsHeader({ title, description, defaultSort = "featured", className, image, filters, onUpdateFilter, count }: ProductsHeaderProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentSort = searchParams.get("sort") || defaultSort;

	// Handle sort change with stable reference
	const handleUpdateSort = useCallback(
		(value: string) => {
			const params = new URLSearchParams(searchParams.toString());
			if (value === defaultSort) {
				params.delete("sort");
			} else {
				params.set("sort", value);
			}
			router.push(`?${params.toString()}`);
		},
		[searchParams, defaultSort, router]
	);

	// Handle filter removal with stable reference
	const handleRemoveFilter = useCallback(
		(key: string) => {
			if (onUpdateFilter) {
				onUpdateFilter(key, "");
			}
		},
		[onUpdateFilter]
	);

	// Handle clear all filters with stable reference
	const handleClearAllFilters = useCallback(() => {
		if (filters && onUpdateFilter) {
			Object.keys(filters).forEach((key) => {
				onUpdateFilter(key, "");
			});
		}
	}, [filters, onUpdateFilter]);

	// Check if any filters are active
	const hasActiveFilters = filters && Object.values(filters).some((value) => value !== "");

	return (
		<div className={cn("w-full border-b p-4 mb-8", className)}>
			<div className="flex flex-col space-y-2 mb-4">
				{/* Title and Image */}
				<div className="flex items-center gap-4">
					{image?.url && (
						<div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-neutral-800">
							<Image src={image.url} alt={image.altText || title} fill className="object-cover" sizes="64px" />
						</div>
					)}
					<div>
						<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
						{description && <p className="text-muted-foreground">{description}</p>}
					</div>
				</div>

				{/* Active Filters */}
				{hasActiveFilters && (
					<div className="flex flex-wrap gap-2 mt-2">
						<div className="flex items-center">
							<Filter className="h-4 w-4 mr-2 text-muted-foreground" />
							<span className="text-sm font-medium">Active Filters:</span>
						</div>
						{filters &&
							Object.entries(filters).map(([key, value]) => {
								if (!value) return null;
								return (
									<Badge key={key} variant="secondary" className="flex items-center gap-1">
										<span>
											{key}: {value}
										</span>
										<Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-transparent" onClick={() => handleRemoveFilter(key)}>
											<X className="h-3 w-3" />
											<span className="sr-only">Remove {key} filter</span>
										</Button>
									</Badge>
								);
							})}
						{onUpdateFilter && (
							<Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleClearAllFilters}>
								Clear All
							</Button>
						)}
					</div>
				)}
			</div>

			{/* Sort and Filter Controls */}
			<div className="flex items-center justify-between mt-6">
				{/* Product Count */}
				<div className="text-sm text-muted-foreground">{typeof count === "number" && `${count} product${count !== 1 ? "s" : ""}`}</div>

				{/* Sort Dropdown */}
				<Select value={currentSort} onValueChange={handleUpdateSort}>
					<SelectTrigger className="w-[180px] bg-background">
						<div className="flex items-center gap-2">
							<ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
							<SelectValue placeholder="Sort by" />
						</div>
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
		</div>
	);
});

ProductsHeader.displayName = "ProductsHeader";
