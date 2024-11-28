"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

const categories = [
	{ id: "Mushrooms", label: "Mushrooms" },
	{ id: "Spores", label: "Spores" },
	{ id: "Equipment", label: "Equipment" },
	{ id: "Supplies", label: "Supplies" },
];

const brands = [
	{ id: "Zugzology", label: "Zugzology" },
	{ id: "Other Brands", label: "Other Brands" },
];

const ratings = [
	{ id: "rating-4", label: "4+" },
	{ id: "rating-3", label: "3+" },
	{ id: "rating-2", label: "2+" },
	{ id: "rating-1", label: "1+" },
];

export function Sidebar() {
	const [priceRange, setPriceRange] = React.useState([0]);

	return (
		<aside className="hidden lg:block w-64 fixed top-[105px] bottom-0 left-0 overflow-y-auto border-r bg-background">
			<div className="p-4 h-full">
				<div className="space-y-6">
					{/* Categories */}
					<div>
						<h3 className="font-semibold mb-2">Categories</h3>
						<div className="space-y-2 max-h-48 overflow-y-auto">
							{categories.map((category) => (
								<div key={category.id} className="flex items-center">
									<Checkbox id={category.id} className="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
									<label htmlFor={category.id} className="ml-2 text-sm">
										{category.label}
									</label>
								</div>
							))}
						</div>
					</div>

					{/* Brands */}
					<div>
						<h3 className="font-semibold mb-2">Brands</h3>
						<div className="space-y-2 max-h-48 overflow-y-auto">
							{brands.map((brand) => (
								<div key={brand.id} className="flex items-center">
									<Checkbox id={brand.id} className="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
									<label htmlFor={brand.id} className="ml-2 text-sm">
										{brand.label}
									</label>
								</div>
							))}
						</div>
					</div>

					{/* Price Range */}
					<div>
						<h3 className="font-semibold mb-2">Price Range</h3>
						<Slider defaultValue={[0]} max={3000} step={1} value={priceRange} onValueChange={setPriceRange} className="mb-2" />
						<div className="flex justify-between text-sm">
							<span>${priceRange[0]}</span>
							<span>$3000</span>
						</div>
					</div>

					{/* Customer Rating */}
					<div>
						<h3 className="font-semibold mb-2">Customer Rating</h3>
						{ratings.map((rating) => (
							<div key={rating.id} className="flex items-center">
								<Checkbox id={rating.id} className="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
								<label htmlFor={rating.id} className="ml-2 text-sm flex items-center">
									{rating.label}
									<Star className="w-4 h-4 fill-yellow-400 text-yellow-400 ml-1" />
								</label>
							</div>
						))}
					</div>
				</div>
			</div>
		</aside>
	);
}
