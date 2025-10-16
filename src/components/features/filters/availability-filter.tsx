"use client";

import { memo } from "react";
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
		<RadioGroup onValueChange={onChange} value={value}>
			<div className="space-y-1">
				{availabilityOptions.map((option) => (
					<label
						className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-muted/50 active:bg-muted"
						htmlFor={`availability-${option.value}`}
						key={option.value}
					>
						<RadioGroupItem className="h-5 w-5 shrink-0" id={`availability-${option.value}`} value={option.value} />
						<span className="flex-1 text-foreground text-sm leading-snug">{option.label}</span>
					</label>
				))}
			</div>
		</RadioGroup>
	);
});
