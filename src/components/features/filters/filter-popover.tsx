"use client";

import { memo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterPopoverProps = {
	trigger: React.ReactNode;
	children: React.ReactNode;
	activeCount?: number;
	align?: "start" | "center" | "end";
};

export const FilterPopover = memo(function FilterPopover({
	trigger,
	children,
	activeCount = 0,
	align = "start",
}: FilterPopoverProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"relative h-9 gap-2 border-border/60 hover:border-border hover:bg-muted/50",
						activeCount > 0 && "border-primary/50 bg-primary/5"
					)}
				>
					{trigger}
					{activeCount > 0 && (
						<span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
							{activeCount}
						</span>
					)}
					<ChevronDown className="h-3.5 w-3.5 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align={align} className="w-80 p-4">
				{children}
			</PopoverContent>
		</Popover>
	);
});
