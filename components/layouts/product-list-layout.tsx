"use client";

import * as React from "react";
import { useState } from "react";
import { FilterSidebar } from "@/components/products/filter-sidebar";
import { FilterBar } from "@/components/products/filter-bar";
import { Button } from "@/components/ui/button";
import { Grid2x2, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";

interface ProductListLayoutProps {
	children: React.ReactElement;
	filters: {
		categories: string[];
		brands: string[];
	};
	header?: {
		title: string;
		description?: string;
	};
}

export function ProductListLayout({ children, filters, header }: ProductListLayoutProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("grid");

	// Clone children and pass viewMode prop
	const childWithProps = React.cloneElement(children, { viewMode });

	return (
		<div className={cn("min-h-screen w-full bg-background")}>
			<div className="flex-1 flex relative">
				{/* Sidebar */}
				<aside className="hidden lg:block w-64 fixed top-[65px] bottom-0 left-0 overflow-y-auto border-r bg-background">
					<div className="p-4 h-full">
						<FilterSidebar categories={filters.categories} brands={filters.brands} />
					</div>
				</aside>

				{/* Main Content */}
				<main className="flex-1 lg:ml-64 w-full">
					<div className="px-4 lg:px-6">
						{/* Header */}
						{header && (
							<div className="py-6">
								<h1 className="text-3xl font-bold tracking-tight">{header.title}</h1>
								{header.description && <p className="mt-2 text-muted-foreground">{header.description}</p>}
							</div>
						)}

						{/* View Controls */}
						<div className="py-4 border-b sticky top-[65px] z-40 bg-background">
							<div className="flex items-center justify-end gap-2">
								<Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("grid")} className="h-8 w-8">
									<Grid2x2 className="h-4 w-4" />
								</Button>
								<Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("list")} className="h-8 w-8">
									<List className="h-4 w-4" />
								</Button>
							</div>

							{/* Mobile Filter Bar */}
							<div className="lg:hidden mt-4">
								<FilterBar categories={filters.categories} brands={filters.brands} />
							</div>
						</div>

						{/* Content Area */}
						<div className="py-4">{childWithProps}</div>
					</div>
				</main>
			</div>
		</div>
	);
}
