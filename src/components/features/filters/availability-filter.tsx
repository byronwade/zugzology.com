"use client";

import { memo } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FilterState } from "@/lib/utils/filter-utils";

type AvailabilityFilterProps = {
	value: FilterState["availability"];
	onChange: (value: FilterState["availability"]) => void;
};

const availabilityOptions = [
	{ value: "all" as const, label: "All Products" },
	{ value: "in-stock" as const, label: "In Stock" },
	{ value: "out-of-stock" as const, label: "Out of Stock" },
];

export const AvailabilityFilter = memo(function AvailabilityFilter({ value, onChange }: AvailabilityFilterProps) {
	return (
		<div className="space-y-3">
			<RadioGroup value={value} onValueChange={onChange}>
				{availabilityOptions.map((option) => (
					<div className="flex items-center space-x-2" key={option.value}>
						<RadioGroupItem value={option.value} id={`availability-${option.value}`} className="h-4 w-4" />
						<Label
							htmlFor={`availability-${option.value}`}
							className="cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{option.label}
						</Label>
					</div>
				))}
			</RadioGroup>
		</div>
	);
});
