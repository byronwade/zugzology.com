"use client";

import React, { memo, useCallback, Suspense } from "react";
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
	initialSort?: string;
}

const sortOptions = [
	{ value: "featured", label: "Featured" },
	{ value: "price-asc", label: "Price: Low to High" },
	{ value: "price-desc", label: "Price: High to Low" },
	{ value: "title-asc", label: "Name: A to Z" },
	{ value: "title-desc", label: "Name: Z to A" },
	{ value: "newest", label: "Newest" },
] as const;

// Inner component that uses useSearchParams
const ProductsHeaderInner = memo(function ProductsHeaderInner({
	title,
	description,
	defaultSort = "featured",
	className,
	image,
	filters,
	onUpdateFilter,
	count,
	initialSort,
}: ProductsHeaderProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentSort = searchParams.get("sort") || initialSort || defaultSort;

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

	// Check if we should hide the count (for special collections)
	const shouldHideCount = title === "Today's Sale" || title === "Best Sellers" || title === "Todays Sale";

	// Check if description actually has content
	const hasDescription = description && description.trim().length > 0;

	return (
		<div className={cn("w-full border-b border-border/60 p-4 mb-8", className)}>
			{/* Title, Description and Sort */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div className="flex items-center gap-4 flex-1 min-w-0">
					{image?.url && (
						<div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
							<Image src={image.url} alt={image.altText || title} fill className="object-cover" sizes="64px" priority />
						</div>
					)}
					<div className="flex-1 min-w-0">
						<h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">{title}</h1>
						{hasDescription && <p className="text-muted-foreground mt-1 line-clamp-3 max-w-[500px]">{description}</p>}
					</div>
				</div>

				{/* Sort Dropdown */}
				<div className="flex-shrink-0">
					<Select value={currentSort} onValueChange={handleUpdateSort}>
						<SelectTrigger className="w-full md:w-[180px] bg-background">
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

			{/* Active Filters */}
			{hasActiveFilters && (
				<div className="flex flex-wrap gap-2 items-center mt-4">
					<div className="flex items-center">
						<Filter className="h-4 w-4 mr-2 text-muted-foreground" />
						<span className="text-sm font-medium">Filters:</span>
					</div>
					{filters &&
						Object.entries(filters).map(([key, value]) => {
							if (!value) return null;
							return (
								<Badge key={key} variant="secondary" className="flex items-center gap-1 py-1 px-2">
									<span className="text-xs">
										{key}: {value}
									</span>
									<Button
										variant="ghost"
										size="icon"
										className="h-4 w-4 p-0 ml-1 hover:bg-transparent hover:text-destructive"
										onClick={() => handleRemoveFilter(key)}
									>
										<X className="h-3 w-3" />
										<span className="sr-only">Remove {key} filter</span>
									</Button>
								</Badge>
							);
						})}
					{onUpdateFilter && (
						<Button
							variant="ghost"
							size="sm"
							className="text-xs h-7 px-2 hover:bg-secondary"
							onClick={handleClearAllFilters}
						>
							Clear All
						</Button>
					)}
				</div>
			)}
		</div>
	);
});

// Wrapper component with Suspense boundary
export const ProductsHeader = memo(function ProductsHeader(props: ProductsHeaderProps) {
	return (
		<Suspense
			fallback={
				<div className={cn("w-full border-b border-border/60 p-4 mb-8", props.className)}>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div className="flex items-center gap-4 flex-1 min-w-0">
							{props.image?.url && (
								<div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
									<div className="w-full h-full bg-muted animate-pulse" />
								</div>
							)}
							<div className="flex-1 min-w-0">
								<h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">{props.title}</h1>
								{props.description && (
									<p className="text-muted-foreground mt-1 line-clamp-3 max-w-[500px]">{props.description}</p>
								)}
							</div>
						</div>
						<div className="flex-shrink-0">
							<div className="w-[180px] h-10 bg-muted rounded-md animate-pulse" />
						</div>
					</div>
				</div>
			}
		>
			<ProductsHeaderInner {...props} />
		</Suspense>
	);
});

ProductsHeader.displayName = "ProductsHeader";
