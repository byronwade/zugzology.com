"use client";

import { DollarSign, Filter, Package, ShoppingBag, Tag, X } from "lucide-react";
import { memo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useProductFiltering } from "@/hooks/use-product-filtering";
import type { ShopifyProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AvailabilityFilter } from "./availability-filter";
import { FilterPopover } from "./filter-popover";
import { FilterSection } from "./filter-section";
import { FilterSheet } from "./filter-sheet";
import { PriceRangeFilter } from "./price-range-filter";

type ProductFiltersProps = {
	products: ShopifyProduct[];
	className?: string;
	showCollections?: boolean;
};

// Inner component that uses hooks
const ProductFiltersInner = memo(function ProductFiltersInner({
	products,
	className,
	showCollections = false,
}: ProductFiltersProps) {
	const {
		filters,
		filterOptions,
		defaultFilters,
		activeFilterCount,
		updatePriceRange,
		updateAvailability,
		toggleArrayFilter,
		clearFilters,
		clearFilter,
	} = useProductFiltering(products);

	// Check if price filter is active
	const isPriceActive =
		filters.priceRange.min !== defaultFilters.priceRange.min ||
		filters.priceRange.max !== defaultFilters.priceRange.max;

	// Desktop filter buttons
	const desktopFilters = (
		<div className="hidden items-center gap-2 md:flex">
			{/* Price Filter */}
			{filterOptions.priceRange.min < filterOptions.priceRange.max && (
				<FilterPopover
					activeCount={isPriceActive ? 1 : 0}
					trigger={
						<>
							<DollarSign className="h-4 w-4" />
							Price
						</>
					}
				>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="font-semibold text-sm">Price Range</h4>
							{isPriceActive && (
								<Button
									className="h-7 px-2 text-xs hover:text-destructive"
									onClick={() => updatePriceRange(defaultFilters.priceRange.min, defaultFilters.priceRange.max)}
									size="sm"
									variant="ghost"
								>
									Reset
								</Button>
							)}
						</div>
						<PriceRangeFilter
							currentMax={filters.priceRange.max}
							currentMin={filters.priceRange.min}
							max={filterOptions.priceRange.max}
							min={filterOptions.priceRange.min}
							onRangeChange={updatePriceRange}
						/>
					</div>
				</FilterPopover>
			)}

			{/* Availability Filter */}
			<FilterPopover
				activeCount={filters.availability !== "all" ? 1 : 0}
				trigger={
					<>
						<Package className="h-4 w-4" />
						Availability
					</>
				}
			>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="font-semibold text-sm">Availability</h4>
						{filters.availability !== "all" && (
							<Button
								className="h-7 px-2 text-xs hover:text-destructive"
								onClick={() => updateAvailability("all")}
								size="sm"
								variant="ghost"
							>
								Reset
							</Button>
						)}
					</div>
					<AvailabilityFilter onChange={updateAvailability} value={filters.availability} />
				</div>
			</FilterPopover>

			{/* Product Type Filter */}
			{filterOptions.productTypes.length > 0 && (
				<FilterPopover
					activeCount={filters.productTypes.length}
					trigger={
						<>
							<ShoppingBag className="h-4 w-4" />
							Type
						</>
					}
				>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="font-semibold text-sm">Product Type</h4>
							{filters.productTypes.length > 0 && (
								<Button
									className="h-7 px-2 text-xs hover:text-destructive"
									onClick={() => clearFilter("productTypes")}
									size="sm"
									variant="ghost"
								>
									Clear
								</Button>
							)}
						</div>
						<FilterSection
							defaultOpen={true}
							maxHeight={250}
							onToggle={(value) => toggleArrayFilter("productTypes", value)}
							options={filterOptions.productTypes}
							selectedValues={filters.productTypes}
							title=""
						/>
					</div>
				</FilterPopover>
			)}

			{/* Vendor Filter */}
			{filterOptions.vendors.length > 1 && (
				<FilterPopover
					activeCount={filters.vendors.length}
					trigger={
						<>
							<Tag className="h-4 w-4" />
							Brand
						</>
					}
				>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="font-semibold text-sm">Brand</h4>
							{filters.vendors.length > 0 && (
								<Button
									className="h-7 px-2 text-xs hover:text-destructive"
									onClick={() => clearFilter("vendors")}
									size="sm"
									variant="ghost"
								>
									Clear
								</Button>
							)}
						</div>
						<FilterSection
							defaultOpen={true}
							maxHeight={250}
							onToggle={(value) => toggleArrayFilter("vendors", value)}
							options={filterOptions.vendors}
							selectedValues={filters.vendors}
							title=""
						/>
					</div>
				</FilterPopover>
			)}

			{/* Collections Filter (for wishlist) */}
			{showCollections && filterOptions.collections.length > 0 && (
				<FilterPopover
					activeCount={filters.collections.length}
					trigger={
						<>
							<Package className="h-4 w-4" />
							Collection
						</>
					}
				>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="font-semibold text-sm">Collections</h4>
							{filters.collections.length > 0 && (
								<Button
									className="h-7 px-2 text-xs hover:text-destructive"
									onClick={() => clearFilter("collections")}
									size="sm"
									variant="ghost"
								>
									Clear
								</Button>
							)}
						</div>
						<FilterSection
							defaultOpen={true}
							maxHeight={250}
							onToggle={(value) => toggleArrayFilter("collections", value)}
							options={filterOptions.collections}
							selectedValues={filters.collections}
							title=""
						/>
					</div>
				</FilterPopover>
			)}

			{/* Clear All Button */}
			{activeFilterCount > 0 && (
				<Button
					className="gap-1.5 border-destructive/20 bg-destructive/5 font-medium text-destructive text-xs hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
					onClick={clearFilters}
					size="sm"
					variant="outline"
				>
					<X className="h-3.5 w-3.5" />
					Clear ({activeFilterCount})
				</Button>
			)}
		</div>
	);

	// Mobile filter sheet
	const mobileFilters = (
		<div className="md:hidden">
			<FilterSheet activeCount={activeFilterCount} onClear={clearFilters}>
				{/* Price Range */}
				{filterOptions.priceRange.min < filterOptions.priceRange.max && (
					<div className="space-y-3">
						<h3 className="font-semibold text-base text-foreground">Price Range</h3>
						<PriceRangeFilter
							currentMax={filters.priceRange.max}
							currentMin={filters.priceRange.min}
							max={filterOptions.priceRange.max}
							min={filterOptions.priceRange.min}
							onRangeChange={updatePriceRange}
						/>
					</div>
				)}

				{/* Availability */}
				<div className="space-y-3">
					<h3 className="font-semibold text-base text-foreground">Availability</h3>
					<AvailabilityFilter onChange={updateAvailability} value={filters.availability} />
				</div>

				{/* Product Type */}
				{filterOptions.productTypes.length > 0 && (
					<div className="space-y-1">
						<FilterSection
							enableScroll={false}
							onToggle={(value) => toggleArrayFilter("productTypes", value)}
							options={filterOptions.productTypes}
							selectedValues={filters.productTypes}
							title="Product Type"
						/>
					</div>
				)}

				{/* Vendors */}
				{filterOptions.vendors.length > 1 && (
					<div className="space-y-1">
						<FilterSection
							enableScroll={false}
							onToggle={(value) => toggleArrayFilter("vendors", value)}
							options={filterOptions.vendors}
							selectedValues={filters.vendors}
							title="Brand"
						/>
					</div>
				)}

				{/* Tags */}
				{filterOptions.tags.length > 0 && (
					<div className="space-y-1">
						<FilterSection
							enableScroll={false}
							onToggle={(value) => toggleArrayFilter("tags", value)}
							options={filterOptions.tags}
							selectedValues={filters.tags}
							title="Tags"
						/>
					</div>
				)}

				{/* Collections (for wishlist) */}
				{showCollections && filterOptions.collections.length > 0 && (
					<div className="space-y-1">
						<FilterSection
							enableScroll={false}
							onToggle={(value) => toggleArrayFilter("collections", value)}
							options={filterOptions.collections}
							selectedValues={filters.collections}
							title="Collections"
						/>
					</div>
				)}
			</FilterSheet>
		</div>
	);

	// Active filters display with modern badges
	const activeFiltersBadges = activeFilterCount > 0 && (
		<div className="flex flex-wrap gap-2">
			{isPriceActive && (
				<div className="group inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 ring-1 ring-primary/20 transition-all hover:bg-primary/15 hover:ring-primary/30">
					<DollarSign className="h-3 w-3 text-primary" />
					<span className="font-medium text-primary text-xs">
						${filters.priceRange.min} - ${filters.priceRange.max}
					</span>
					<button
						className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-primary/60 transition-colors hover:bg-primary/20 hover:text-primary"
						onClick={() => updatePriceRange(defaultFilters.priceRange.min, defaultFilters.priceRange.max)}
						type="button"
					>
						<X className="h-3 w-3" />
					</button>
				</div>
			)}
			{filters.availability !== "all" && (
				<div className="group inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 ring-1 ring-primary/20 transition-all hover:bg-primary/15 hover:ring-primary/30">
					<Package className="h-3 w-3 text-primary" />
					<span className="font-medium text-primary text-xs capitalize">{filters.availability.replace("-", " ")}</span>
					<button
						className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-primary/60 transition-colors hover:bg-primary/20 hover:text-primary"
						onClick={() => updateAvailability("all")}
						type="button"
					>
						<X className="h-3 w-3" />
					</button>
				</div>
			)}
			{filters.productTypes.map((type) => (
				<div
					className="group inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 ring-1 ring-primary/20 transition-all hover:bg-primary/15 hover:ring-primary/30"
					key={type}
				>
					<ShoppingBag className="h-3 w-3 text-primary" />
					<span className="font-medium text-primary text-xs">{type}</span>
					<button
						className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-primary/60 transition-colors hover:bg-primary/20 hover:text-primary"
						onClick={() => toggleArrayFilter("productTypes", type)}
						type="button"
					>
						<X className="h-3 w-3" />
					</button>
				</div>
			))}
			{filters.vendors.map((vendor) => (
				<div
					className="group inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 ring-1 ring-primary/20 transition-all hover:bg-primary/15 hover:ring-primary/30"
					key={vendor}
				>
					<Tag className="h-3 w-3 text-primary" />
					<span className="font-medium text-primary text-xs">{vendor}</span>
					<button
						className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-primary/60 transition-colors hover:bg-primary/20 hover:text-primary"
						onClick={() => toggleArrayFilter("vendors", vendor)}
						type="button"
					>
						<X className="h-3 w-3" />
					</button>
				</div>
			))}
			{filters.tags.map((tag) => (
				<div
					className="group inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 ring-1 ring-primary/20 transition-all hover:bg-primary/15 hover:ring-primary/30"
					key={tag}
				>
					<Tag className="h-3 w-3 text-primary" />
					<span className="font-medium text-primary text-xs">{tag}</span>
					<button
						className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-primary/60 transition-colors hover:bg-primary/20 hover:text-primary"
						onClick={() => toggleArrayFilter("tags", tag)}
						type="button"
					>
						<X className="h-3 w-3" />
					</button>
				</div>
			))}
			{showCollections &&
				filters.collections.map((collection) => (
					<div
						className="group inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 ring-1 ring-primary/20 transition-all hover:bg-primary/15 hover:ring-primary/30"
						key={collection}
					>
						<Package className="h-3 w-3 text-primary" />
						<span className="font-medium text-primary text-xs">{collection}</span>
						<button
							className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-primary/60 transition-colors hover:bg-primary/20 hover:text-primary"
							onClick={() => toggleArrayFilter("collections", collection)}
							type="button"
						>
							<X className="h-3 w-3" />
						</button>
					</div>
				))}
		</div>
	);

	return (
		<div className={cn("bg-background", className)}>
			<div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
				{/* Filter Header */}
				<div className="mb-3 flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
							<Filter className="h-4 w-4 text-primary" />
						</div>
						<div className="flex items-center gap-2">
							<h2 className="font-semibold text-foreground text-sm sm:text-base">Filter Products</h2>
							{activeFilterCount > 0 && (
								<div className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-primary px-2 font-bold text-primary-foreground text-xs shadow-sm">
									{activeFilterCount}
								</div>
							)}
						</div>
					</div>
					<div className="flex items-center gap-2">
						{desktopFilters}
						{mobileFilters}
					</div>
				</div>

				{/* Active Filters */}
				{activeFiltersBadges && <div className="flex flex-wrap gap-2 pt-4">{activeFiltersBadges}</div>}
			</div>
		</div>
	);
});

// Wrapper with Suspense
export const ProductFilters = memo(function ProductFilters(props: ProductFiltersProps) {
	return (
		<Suspense
			fallback={
				<div className="border-border/60 border-b bg-background py-4">
					<div className="container mx-auto flex items-center justify-between px-4">
						<div className="h-5 w-32 animate-pulse rounded bg-muted" />
						<div className="flex gap-2">
							<div className="h-9 w-24 animate-pulse rounded bg-muted" />
							<div className="h-9 w-24 animate-pulse rounded bg-muted" />
						</div>
					</div>
				</div>
			}
		>
			<ProductFiltersInner {...props} />
		</Suspense>
	);
});
