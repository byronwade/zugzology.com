"use client";

import { ArrowUpDown, Filter, X } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { memo, Suspense, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ProductsHeaderProps = {
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
};

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
	const _shouldHideCount = title === "Today's Sale" || title === "Best Sellers" || title === "Todays Sale";

	// Check if description actually has content
	const hasDescription = description && description.trim().length > 0;

	return (
		<div className={cn("mb-8 w-full border-b border-border bg-muted/30", className)}>
			<div className="container mx-auto px-4 py-3">
				{/* Title, Description and Sort */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex min-w-0 flex-1 items-center gap-4">
					{image?.url && (
						<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border">
							<Image alt={image.altText || title} className="object-cover" fill priority sizes="64px" src={image.url} />
						</div>
					)}
					<div className="min-w-0 flex-1">
						<h1 className="truncate font-bold text-2xl tracking-tight text-foreground md:text-3xl">{title}</h1>
						{hasDescription && <p className="mt-1 line-clamp-3 max-w-[500px] text-muted-foreground">{description}</p>}
					</div>
				</div>

				{/* Sort Dropdown */}
				<div className="flex-shrink-0">
					<Select onValueChange={handleUpdateSort} value={currentSort}>
						<SelectTrigger className="w-full bg-background md:w-[180px]">
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
					<div className="mt-4 flex flex-wrap items-center gap-2">
						<div className="flex items-center">
							<Filter className="mr-2 h-4 w-4 text-muted-foreground" />
							<span className="font-medium text-sm">Filters:</span>
						</div>
						{filters &&
							Object.entries(filters).map(([key, value]) => {
								if (!value) {
									return null;
								}
								return (
									<Badge className="flex items-center gap-1 px-2 py-1" key={key} variant="secondary">
										<span className="text-xs">
											{key}: {value}
										</span>
										<Button
											className="ml-1 h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
											onClick={() => handleRemoveFilter(key)}
											size="icon"
											variant="ghost"
										>
											<X className="h-3 w-3" />
											<span className="sr-only">Remove {key} filter</span>
										</Button>
									</Badge>
								);
							})}
						{onUpdateFilter && (
							<Button
								className="h-7 px-2 text-xs hover:bg-secondary"
								onClick={handleClearAllFilters}
								size="sm"
								variant="ghost"
							>
								Clear All
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	);
});

// Wrapper component with Suspense boundary
export const ProductsHeader = memo(function ProductsHeader(props: ProductsHeaderProps) {
	return (
		<Suspense
			fallback={
				<div className={cn("mb-8 w-full border-b border-border bg-muted/30", props.className)}>
					<div className="container mx-auto px-4 py-3">
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div className="flex min-w-0 flex-1 items-center gap-4">
								{props.image?.url && (
									<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border">
										<div className="h-full w-full animate-pulse bg-muted" />
									</div>
								)}
								<div className="min-w-0 flex-1">
									<h1 className="truncate font-bold text-2xl tracking-tight text-foreground md:text-3xl">{props.title}</h1>
									{props.description && (
										<p className="mt-1 line-clamp-3 max-w-[500px] text-muted-foreground">{props.description}</p>
									)}
								</div>
							</div>
							<div className="flex-shrink-0">
								<div className="h-10 w-[180px] animate-pulse rounded-md bg-muted" />
							</div>
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
