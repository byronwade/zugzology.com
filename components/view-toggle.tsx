"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
	view: "grid" | "list";
	onChange: (view: "grid" | "list") => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
	return (
		<div className="flex items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-1 rounded-lg border">
			<Button variant="ghost" size="icon" className={cn("h-8 w-8", view === "grid" && "bg-foreground/5")} onClick={() => onChange("grid")} aria-label="Grid view">
				<LayoutGrid className="h-4 w-4" />
			</Button>
			<Button variant="ghost" size="icon" className={cn("h-8 w-8", view === "list" && "bg-foreground/5")} onClick={() => onChange("list")} aria-label="List view">
				<List className="h-4 w-4" />
			</Button>
		</div>
	);
}
