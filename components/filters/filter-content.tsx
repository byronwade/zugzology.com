"use client";

import React, { Suspense } from "react";
import { useFilters } from "./use-filters";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package2, DollarSign, Tags } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const PRODUCT_CATEGORIES = [
	{ label: "Grow Bags", value: "grow-bag" },
	{ label: "Substrates", value: "substrate" },
	{ label: "Tools", value: "tool" },
	{ label: "Spores", value: "spore" },
	{ label: "Liquid Culture", value: "liquid-culture" },
	{ label: "Merch", value: "merch" },
	{ label: "Gift Cards", value: "gift-card" },
] as const;

function FilterContentInner() {
	const { filters, handleFilterChange } = useFilters();

	return (
		<ScrollArea className="h-[calc(100vh-10rem)] pr-4">
			<div className="space-y-8">
				{/* Availability Filter */}
				<div className="space-y-4">
					<div className="flex items-center gap-2 text-sm font-medium">
						<Package2 className="h-4 w-4" />
						<h3>Availability</h3>
					</div>
					<RadioGroup value={filters.availability} onValueChange={(value) => handleFilterChange("availability", value)} className="gap-3">
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="all" id="all" />
							<Label htmlFor="all">All Items</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="in-stock" id="in-stock" />
							<Label htmlFor="in-stock">In Stock</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="out-of-stock" id="out-of-stock" />
							<Label htmlFor="out-of-stock">Pre-Order</Label>
						</div>
					</RadioGroup>
				</div>

				<Separator />

				{/* Price Range Filter */}
				<div className="space-y-4">
					<div className="flex items-center gap-2 text-sm font-medium">
						<DollarSign className="h-4 w-4" />
						<h3>Price Range</h3>
					</div>
					<RadioGroup value={filters.price} onValueChange={(value) => handleFilterChange("price", value)} className="gap-3">
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="all" id="price-all" />
							<Label htmlFor="price-all">All Prices</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="under-25" id="under-25" />
							<Label htmlFor="under-25">Under $25</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="25-50" id="25-50" />
							<Label htmlFor="25-50">$25 to $50</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="50-100" id="50-100" />
							<Label htmlFor="50-100">$50 to $100</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="over-100" id="over-100" />
							<Label htmlFor="over-100">Over $100</Label>
						</div>
					</RadioGroup>
				</div>

				<Separator />

				{/* Categories Filter */}
				<div className="space-y-4">
					<div className="flex items-center gap-2 text-sm font-medium">
						<Tags className="h-4 w-4" />
						<h3>Categories</h3>
					</div>
					<div className="space-y-3">
						{PRODUCT_CATEGORIES.map(({ label, value }) => (
							<label key={value} className="flex items-center space-x-3 text-sm hover:text-foreground">
								<Checkbox checked={filters.category === value} onCheckedChange={(checked) => handleFilterChange("category", checked ? value : null)} />
								<span>{label}</span>
							</label>
						))}
					</div>
				</div>
			</div>
		</ScrollArea>
	);
}

export function FilterContent() {
	return (
		<Suspense fallback={<div>Loading filters...</div>}>
			<FilterContentInner />
		</Suspense>
	);
}
