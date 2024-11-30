"use client";

import React from "react";
import { SortSelect } from "@/components/ui/sort-select";
import { Grid2X2, List } from "lucide-react";

interface ProductsHeaderProps {
	title: string;
	count?: number;
	onSort?: (value: string) => void;
	onViewChange?: (view: "grid" | "list") => void;
	view?: "grid" | "list";
}

export function ProductsHeader({ title, count, onSort, onViewChange, view = "grid" }: ProductsHeaderProps) {
	return (
		<div className="flex flex-col gap-4 mb-8">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">{title}</h1>
				<div className="flex items-center gap-4">
					{count !== undefined && (
						<p className="text-sm text-gray-500">
							{count} {count === 1 ? "product" : "products"}
						</p>
					)}
					<div className="flex items-center gap-2 border rounded-lg p-1">
						<button onClick={() => onViewChange?.("grid")} className={`p-2 rounded ${view === "grid" ? "bg-gray-100" : ""}`} title="Grid view">
							<Grid2X2 className="w-4 h-4" />
						</button>
						<button onClick={() => onViewChange?.("list")} className={`p-2 rounded ${view === "list" ? "bg-gray-100" : ""}`} title="List view">
							<List className="w-4 h-4" />
						</button>
					</div>
					{onSort && <SortSelect onSort={onSort} />}
				</div>
			</div>
		</div>
	);
}
