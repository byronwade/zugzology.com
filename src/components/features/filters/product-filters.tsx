"use client";

import { DollarSign, Filter, Package, ShoppingBag, Tag, X } from "lucide-react";
import { memo, Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
					trigger={
						<>
							<DollarSign className="h-4 w-4" />
							Price
						</>
					}
					activeCount={isPriceActive ? 1 : 0}
				>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="font-semibold text-sm">Price Range</h4>
							{isPriceActive && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => updatePriceRange(defaultFilters.priceRange.min, defaultFilters.priceRange.max)}
									className="h-7 px-2 text-xs hover:text-destructive"
								>
									Reset
								</Button>
							)}
						</div>
						<PriceRangeFilter
							min={filterOptions.priceRange.min}
							max={filterOptions.priceRange.max}
							currentMin={filters.priceRange.min}
							currentMax={filters.priceRange.max}
							onRangeChange={updatePriceRange}
						/>
					</div>
				</FilterPopover>
			)}

			{/* Availability Filter */}
			<FilterPopover
				trigger={
					<>
						<Package className="h-4 w-4" />
						Availability
					</>
				}
				activeCount={filters.availability !== "all" ? 1 : 0}
			>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="font-semibold text-sm">Availability</h4>
						{filters.availability !== "all" && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => updateAvailability("all")}
								className="h-7 px-2 text-xs hover:text-destructive"
							>
								Reset
							</Button>
						)}
					</div>
					<AvailabilityFilter value={filters.availability} onChange={updateAvailability} />
				</div>
			</FilterPopover>

			{/* Product Type Filter */}
			{filterOptions.productTypes.length > 0 && (
				<FilterPopover
					trigger={
						<>
							<ShoppingBag className="h-4 w-4" />
							Type
						</>
					}
					activeCount={filters.productTypes.length}
				>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="font-semibold text-sm">Product Type</h4>
							{filters.productTypes.length > 0 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => clearFilter("productTypes")}
									className="h-7 px-2 text-xs hover:text-destructive"
								>
									Clear
								</Button>
							)}
						</div>
						<FilterSection
							title=""
							options={filterOptions.productTypes}
							selectedValues={filters.productTypes}
							onToggle={(value) => toggleArrayFilter("productTypes", value)}
							defaultOpen={true}
							maxHeight={250}
						/>
					</div>
				</FilterPopover>
			)}

			{/* Vendor Filter */}
			{filterOptions.vendors.length > 1 && (
				<FilterPopover
					trigger={
						<>
							<Tag className="h-4 w-4" />
							Brand
						</>
					}
					activeCount={filters.vendors.length}
				>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="font-semibold text-sm">Brand</h4>
							{filters.vendors.length > 0 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => clearFilter("vendors")}
									className="h-7 px-2 text-xs hover:text-destructive"
								>
									Clear
								</Button>
							)}
						</div>
						<FilterSection
							title=""
							options={filterOptions.vendors}
							selectedValues={filters.vendors}
							onToggle={(value) => toggleArrayFilter("vendors", value)}
							defaultOpen={true}
							maxHeight={250}
						/>
					</div>
				</FilterPopover>
			)}

			{/* Collections Filter (for wishlist) */}
			{showCollections && filterOptions.collections.length > 0 && (
				<FilterPopover
					trigger={
						<>
							<Package className="h-4 w-4" />
							Collection
						</>
					}
					activeCount={filters.collections.length}
				>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="font-semibold text-sm">Collections</h4>
							{filters.collections.length > 0 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => clearFilter("collections")}
									className="h-7 px-2 text-xs hover:text-destructive"
								>
									Clear
								</Button>
							)}
						</div>
						<FilterSection
							title=""
							options={filterOptions.collections}
							selectedValues={filters.collections}
							onToggle={(value) => toggleArrayFilter("collections", value)}
							defaultOpen={true}
							maxHeight={250}
						/>
					</div>
				</FilterPopover>
			)}

			{/* Clear All Button */}
			{activeFilterCount > 0 && (
				<Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-destructive hover:text-destructive">
					<X className="h-4 w-4" />
					Clear All ({activeFilterCount})
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
					<>
						<div>
							<h3 className="mb-3 font-semibold text-base">Price Range</h3>
							<PriceRangeFilter
								min={filterOptions.priceRange.min}
								max={filterOptions.priceRange.max}
								currentMin={filters.priceRange.min}
								currentMax={filters.priceRange.max}
								onRangeChange={updatePriceRange}
							/>
						</div>
						<Separator />
					</>
				)}

				{/* Availability */}
				<div>
					<h3 className="mb-3 font-semibold text-base">Availability</h3>
					<AvailabilityFilter value={filters.availability} onChange={updateAvailability} />
				</div>

				{/* Product Type */}
				{filterOptions.productTypes.length > 0 && (
					<>
						<Separator />
						<FilterSection
							title="Product Type"
							options={filterOptions.productTypes}
							selectedValues={filters.productTypes}
							onToggle={(value) => toggleArrayFilter("productTypes", value)}
						/>
					</>
				)}

				{/* Vendors */}
				{filterOptions.vendors.length > 1 && (
					<>
						<Separator />
						<FilterSection
							title="Brand"
							options={filterOptions.vendors}
							selectedValues={filters.vendors}
							onToggle={(value) => toggleArrayFilter("vendors", value)}
						/>
					</>
				)}

				{/* Tags */}
				{filterOptions.tags.length > 0 && (
					<>
						<Separator />
						<FilterSection
							title="Tags"
							options={filterOptions.tags}
							selectedValues={filters.tags}
							onToggle={(value) => toggleArrayFilter("tags", value)}
						/>
					</>
				)}

				{/* Collections (for wishlist) */}
				{showCollections && filterOptions.collections.length > 0 && (
					<>
						<Separator />
						<FilterSection
							title="Collections"
							options={filterOptions.collections}
							selectedValues={filters.collections}
							onToggle={(value) => toggleArrayFilter("collections", value)}
						/>
					</>
				)}
			</FilterSheet>
		</div>
	);

	// Active filters display
	const activeFiltersBadges = activeFilterCount > 0 && (
		<div className="flex flex-wrap gap-2">
			{isPriceActive && (
				<Badge variant="secondary" className="gap-1 px-2 py-1">
					<span className="text-xs">
						${filters.priceRange.min} - ${filters.priceRange.max}
					</span>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => updatePriceRange(defaultFilters.priceRange.min, defaultFilters.priceRange.max)}
						className="ml-1 h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
					>
						<X className="h-3 w-3" />
					</Button>
				</Badge>
			)}
			{filters.availability !== "all" && (
				<Badge variant="secondary" className="gap-1 px-2 py-1">
					<span className="text-xs capitalize">{filters.availability.replace("-", " ")}</span>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => updateAvailability("all")}
						className="ml-1 h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
					>
						<X className="h-3 w-3" />
					</Button>
				</Badge>
			)}
			{filters.productTypes.map((type) => (
				<Badge key={type} variant="secondary" className="gap-1 px-2 py-1">
					<span className="text-xs">{type}</span>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => toggleArrayFilter("productTypes", type)}
						className="ml-1 h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
					>
						<X className="h-3 w-3" />
					</Button>
				</Badge>
			))}
			{filters.vendors.map((vendor) => (
				<Badge key={vendor} variant="secondary" className="gap-1 px-2 py-1">
					<span className="text-xs">{vendor}</span>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => toggleArrayFilter("vendors", vendor)}
						className="ml-1 h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
					>
						<X className="h-3 w-3" />
					</Button>
				</Badge>
			))}
			{filters.tags.map((tag) => (
				<Badge key={tag} variant="secondary" className="gap-1 px-2 py-1">
					<span className="text-xs">{tag}</span>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => toggleArrayFilter("tags", tag)}
						className="ml-1 h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
					>
						<X className="h-3 w-3" />
					</Button>
				</Badge>
			))}
			{showCollections &&
				filters.collections.map((collection) => (
					<Badge key={collection} variant="secondary" className="gap-1 px-2 py-1">
						<span className="text-xs">{collection}</span>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => toggleArrayFilter("collections", collection)}
							className="ml-1 h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
						>
							<X className="h-3 w-3" />
						</Button>
					</Badge>
				))}
		</div>
	);

	return (
		<div className={cn("space-y-4 border-border/60 border-b bg-background pb-4", className)}>
			<div className="container mx-auto flex items-center justify-between gap-4 px-4">
				<div className="flex items-center gap-2">
					<Filter className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium text-sm">Refine Results</span>
					{activeFilterCount > 0 && (
						<Badge variant="secondary" className="h-5 px-1.5 text-xs">
							{activeFilterCount}
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-2">
					{desktopFilters}
					{mobileFilters}
				</div>
			</div>
			{activeFiltersBadges && <div className="container mx-auto px-4">{activeFiltersBadges}</div>}
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
