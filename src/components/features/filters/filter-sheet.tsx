"use client";

import { Filter, X } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

type FilterSheetProps = {
	activeCount: number;
	children: React.ReactNode;
	onClear?: () => void;
};

export const FilterSheet = memo(function FilterSheet({ activeCount, children, onClear }: FilterSheetProps) {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					className="relative gap-2 border-border/40 font-medium text-xs shadow-sm transition-all hover:shadow"
					size="sm"
					variant="outline"
				>
					<Filter className="h-4 w-4" />
					<span className="xs:inline hidden">Filters</span>
					{activeCount > 0 && (
						<span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 font-bold text-primary-foreground text-xs shadow-sm">
							{activeCount}
						</span>
					)}
				</Button>
			</SheetTrigger>
			<SheetContent
				className="!p-0 rounded-t-2xl border-t [&>button]:hidden"
				side="bottom"
				style={{
					height: "min(90vh, 90dvh)",
					maxHeight: "min(90vh, 90dvh)",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* Fixed Header */}
				<SheetHeader className="relative shrink-0 border-border/40 border-b bg-gradient-to-b from-background to-muted/20 px-4 py-4 sm:px-6 sm:py-5">
					<div className="flex items-center justify-between gap-3">
						<div className="flex min-w-0 flex-1 items-center gap-3">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
								<Filter className="h-5 w-5 text-primary" />
							</div>
							<div className="min-w-0 flex-1">
								<SheetTitle className="truncate text-left font-semibold text-base sm:text-lg">
									Filter Products
								</SheetTitle>
								<SheetDescription className="truncate text-left text-muted-foreground text-xs sm:text-sm">
									{activeCount > 0
										? `${activeCount} active filter${activeCount > 1 ? "s" : ""}`
										: "Refine your product search"}
								</SheetDescription>
							</div>
						</div>
						<div className="flex shrink-0 items-center gap-2">
							{activeCount > 0 && (
								<Button
									className="h-9 gap-1.5 border-destructive/20 bg-destructive/5 font-medium text-destructive text-xs hover:border-destructive/30 hover:bg-destructive/10"
									onClick={onClear}
									size="sm"
									variant="outline"
								>
									<X className="h-3.5 w-3.5" />
									<span className="xs:inline hidden">Clear</span>
								</Button>
							)}
							<SheetClose asChild>
								<Button className="h-9 w-9 rounded-full p-0" size="sm" variant="ghost">
									<X className="h-4 w-4" />
									<span className="sr-only">Close</span>
								</Button>
							</SheetClose>
						</div>
					</div>
				</SheetHeader>

				{/* Scrollable Content */}
				<div
					className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6"
					style={{
						WebkitOverflowScrolling: "touch",
						minHeight: 0,
					}}
				>
					<div className="space-y-5 pb-6 sm:space-y-6 sm:pb-8">{children}</div>
				</div>
			</SheetContent>
		</Sheet>
	);
});
