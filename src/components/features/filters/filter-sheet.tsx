"use client";

import { Filter, X } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type FilterSheetProps = {
	activeCount: number;
	children: React.ReactNode;
	onClear?: () => void;
};

export const FilterSheet = memo(function FilterSheet({ activeCount, children, onClear }: FilterSheetProps) {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline" size="sm" className="relative gap-2">
					<Filter className="h-4 w-4" />
					Filters
					{activeCount > 0 && (
						<span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
							{activeCount}
						</span>
					)}
				</Button>
			</SheetTrigger>
			<SheetContent side="bottom" className="h-[85vh] p-0">
				<div className="flex h-full flex-col">
					<SheetHeader className="border-b px-6 py-4">
						<div className="flex items-center justify-between">
							<div>
								<SheetTitle className="text-left">Filters</SheetTitle>
								<SheetDescription className="text-left">
									{activeCount > 0 ? `${activeCount} active filter${activeCount > 1 ? "s" : ""}` : "Refine your search"}
								</SheetDescription>
							</div>
							{activeCount > 0 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={onClear}
									className="h-8 gap-1 text-destructive hover:text-destructive"
								>
									<X className="h-4 w-4" />
									Clear All
								</Button>
							)}
						</div>
					</SheetHeader>

					<ScrollArea className="flex-1 px-6 py-4">
						<div className="space-y-6">{children}</div>
					</ScrollArea>
				</div>
			</SheetContent>
		</Sheet>
	);
});
