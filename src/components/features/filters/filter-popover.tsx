"use client";

import { ChevronDown } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
					className={cn(
						"relative h-9 gap-2 border-border/40 font-medium text-xs shadow-sm transition-all hover:border-border hover:bg-muted/70 hover:shadow",
						activeCount > 0 &&
							"border-primary/30 bg-primary/5 hover:border-primary/40 hover:bg-primary/10 hover:shadow-primary/10"
					)}
					variant="outline"
				>
					<span className="flex items-center gap-2">{trigger}</span>
					{activeCount > 0 && (
						<span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 font-bold text-primary-foreground text-xs shadow-sm">
							{activeCount}
						</span>
					)}
					<ChevronDown
						className={cn(
							"h-3.5 w-3.5 transition-transform",
							activeCount > 0 ? "text-primary/70" : "text-muted-foreground/50"
						)}
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent align={align} className="w-80 rounded-xl border-border/40 p-0 shadow-xl">
				<div className="p-4">{children}</div>
			</PopoverContent>
		</Popover>
	);
});
