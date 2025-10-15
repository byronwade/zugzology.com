"use client";

import { ChevronDown } from "lucide-react";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type FilterSectionProps = {
	title: string;
	options: string[];
	selectedValues: string[];
	onToggle: (value: string) => void;
	defaultOpen?: boolean;
	maxHeight?: number;
};

export const FilterSection = memo(function FilterSection({
	title,
	options,
	selectedValues,
	onToggle,
	defaultOpen = true,
	maxHeight = 200,
}: FilterSectionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	if (options.length === 0) {
		return null;
	}

	const displayOptions = options.slice(0, 50); // Limit to first 50 options
	const hasMore = options.length > 50;

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<CollapsibleTrigger asChild>
				<Button
					variant="ghost"
					className="flex w-full items-center justify-between px-0 py-2 font-medium text-sm hover:bg-transparent"
				>
					<span className="flex items-center gap-2">
						{title}
						{selectedValues.length > 0 && (
							<span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
								{selectedValues.length}
							</span>
						)}
					</span>
					<ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="mt-2 space-y-2">
				<ScrollArea className="pr-4" style={{ maxHeight }}>
					<div className="space-y-3">
						{displayOptions.map((option) => {
							const isChecked = selectedValues.includes(option);
							const id = `filter-${title}-${option}`.replace(/\s+/g, "-").toLowerCase();

							return (
								<div className="flex items-center space-x-2" key={option}>
									<Checkbox
										id={id}
										checked={isChecked}
										onCheckedChange={() => onToggle(option)}
										className="h-4 w-4 flex-shrink-0"
									/>
									<Label
										htmlFor={id}
										className="flex-1 cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										{option}
									</Label>
								</div>
							);
						})}
						{hasMore && (
							<p className="pt-2 text-muted-foreground text-xs">
								Showing first 50 of {options.length} options
							</p>
						)}
					</div>
				</ScrollArea>
			</CollapsibleContent>
		</Collapsible>
	);
});
