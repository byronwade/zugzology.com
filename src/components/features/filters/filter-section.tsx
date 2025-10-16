"use client";

import { ChevronDown } from "lucide-react";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type FilterSectionProps = {
	title: string;
	options: string[];
	selectedValues: string[];
	onToggle: (value: string) => void;
	defaultOpen?: boolean;
	maxHeight?: number;
	enableScroll?: boolean;
};

export const FilterSection = memo(function FilterSection({
	title,
	options,
	selectedValues,
	onToggle,
	defaultOpen = true,
	maxHeight = 200,
	enableScroll = true,
}: FilterSectionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	if (options.length === 0) {
		return null;
	}

	const displayOptions = options.slice(0, 50); // Limit to first 50 options
	const hasMore = options.length > 50;

	return (
		<Collapsible onOpenChange={setIsOpen} open={isOpen}>
			<CollapsibleTrigger asChild>
				<Button
					className="flex w-full items-center justify-between px-0 py-3 font-semibold text-base text-foreground hover:bg-transparent"
					variant="ghost"
				>
					<span className="flex items-center gap-2.5">
						{title}
						{selectedValues.length > 0 && (
							<span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 font-bold text-primary-foreground text-xs">
								{selectedValues.length}
							</span>
						)}
					</span>
					<ChevronDown
						className={cn(
							"h-4 w-4 text-muted-foreground transition-transform duration-200",
							isOpen && "rotate-180 text-foreground"
						)}
					/>
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="mt-2">
				<div
					className={cn(enableScroll ? "pr-2" : "")}
					style={enableScroll ? { maxHeight, overflowY: "auto", WebkitOverflowScrolling: "touch" } : undefined}
				>
					<div className="space-y-1">
						{displayOptions.map((option) => {
							const isChecked = selectedValues.includes(option);
							const id = `filter-${title}-${option}`.replace(/\s+/g, "-").toLowerCase();

							return (
								<label
									className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-muted/50 active:bg-muted"
									htmlFor={id}
									key={option}
								>
									<Checkbox
										checked={isChecked}
										className="h-5 w-5 shrink-0 rounded-md data-[state=checked]:border-primary data-[state=checked]:bg-primary"
										id={id}
										onCheckedChange={() => onToggle(option)}
									/>
									<span className="flex-1 text-foreground text-sm leading-snug">{option}</span>
								</label>
							);
						})}
						{hasMore && (
							<p className="px-2.5 pt-3 text-muted-foreground text-xs">Showing first 50 of {options.length} options</p>
						)}
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
});
