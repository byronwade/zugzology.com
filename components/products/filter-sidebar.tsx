"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface FilterSidebarProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onPriceChange?: (value: [number, number]) => void;
	onInStockChange?: (checked: boolean) => void;
	onClearFilters?: () => void;
	minPrice?: number;
	maxPrice?: number;
	inStock?: boolean;
}

export function FilterSidebar({ open, onOpenChange, onPriceChange, onInStockChange, onClearFilters, minPrice = 0, maxPrice = 1000, inStock = false }: FilterSidebarProps) {
	return (
		<>
			{/* Mobile Filter Sheet */}
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="w-[300px]">
					<SheetHeader>
						<SheetTitle>Filters</SheetTitle>
					</SheetHeader>
					<div className="py-6">
						<FilterContent onPriceChange={onPriceChange} onInStockChange={onInStockChange} onClearFilters={onClearFilters} minPrice={minPrice} maxPrice={maxPrice} inStock={inStock} />
					</div>
				</SheetContent>
			</Sheet>

			{/* Desktop Filter Sidebar */}
			<div className="hidden lg:block w-[300px] flex-shrink-0">
				<div className="sticky top-8">
					<div className="bg-background border rounded-lg p-6">
						<h3 className="font-semibold mb-4">Filters</h3>
						<FilterContent onPriceChange={onPriceChange} onInStockChange={onInStockChange} onClearFilters={onClearFilters} minPrice={minPrice} maxPrice={maxPrice} inStock={inStock} />
					</div>
				</div>
			</div>
		</>
	);
}

function FilterContent({ onPriceChange, onInStockChange, onClearFilters, minPrice, maxPrice, inStock }: Omit<FilterSidebarProps, "open" | "onOpenChange">) {
	return (
		<ScrollArea className="h-full">
			<div className="space-y-6">
				<div>
					<h4 className="text-sm font-medium mb-4">Price Range</h4>
					<Slider defaultValue={[minPrice, maxPrice]} max={1000} step={1} onValueChange={onPriceChange} />
					<div className="flex items-center justify-between mt-2">
						<span className="text-sm text-muted-foreground">${minPrice}</span>
						<span className="text-sm text-muted-foreground">${maxPrice}</span>
					</div>
				</div>
				<div>
					<h4 className="text-sm font-medium mb-4">Availability</h4>
					<div className="flex items-center space-x-2">
						<Switch id="in-stock" checked={inStock} onCheckedChange={onInStockChange} />
						<label htmlFor="in-stock" className="text-sm font-medium">
							In Stock Only
						</label>
					</div>
				</div>
				<Button variant="outline" className="w-full" onClick={onClearFilters}>
					Clear Filters
				</Button>
			</div>
		</ScrollArea>
	);
} 