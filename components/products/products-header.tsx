"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SortOption } from "@/lib/hooks/use-product-filters";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePromo } from "@/lib/providers/promo-provider";

interface ProductsHeaderProps {
	title: string;
	description?: string;
	count?: number;
	filters: {
		sort: SortOption;
	};
	onUpdateFilter: (key: string, value: string) => void;
	image?: {
		url: string;
		altText?: string;
		width?: number;
		height?: number;
	};
}

const sortOptions = [
	{ value: "featured", label: "Featured" },
	{ value: "price-asc", label: "Price: Low to High" },
	{ value: "price-desc", label: "Price: High to Low" },
	{ value: "title-asc", label: "Name: A to Z" },
	{ value: "title-desc", label: "Name: Z to A" },
	{ value: "newest", label: "Newest" },
] as const;

export function ProductsHeader({ title, description, count, filters, onUpdateFilter }: ProductsHeaderProps) {
	const [isScrolled, setIsScrolled] = React.useState(false);
	const { showPromo } = usePromo();

	React.useEffect(() => {
		const handleScroll = () => {
			const scrolled = window.scrollY > 50;
			setIsScrolled(scrolled);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<TooltipProvider>
			<section className={cn("sticky z-40 transition-all duration-200", showPromo ? "top-[calc(var(--header-height)+32px)]" : "top-[var(--header-height)]")}>
				{/* Hidden full description for SEO */}
				{description && (
					<div className="sr-only" aria-hidden="false">
						<h1>{title}</h1>
						<p>{description}</p>
					</div>
				)}

				{/* Main Header */}
				<div className={cn("relative bg-background border-b transition-all duration-200", isScrolled ? "h-[60px]" : "h-[84px]")}>
					<div className="relative h-full mx-auto px-4">
						<div className="h-full flex items-center">
							<div className="flex items-center justify-between w-full gap-4">
								<div className="flex-1 min-w-0">
									<div className="flex flex-col gap-0.5">
										<div className="flex items-baseline gap-3">
											<h1 className={cn("font-medium tracking-tight truncate transition-all duration-200", isScrolled ? "text-base sm:text-lg" : "text-lg sm:text-xl")} aria-hidden="true">
												{title}
											</h1>
											{count !== undefined && (
												<span className={cn("text-muted-foreground font-normal transition-all duration-200", isScrolled ? "text-xs" : "text-sm")}>
													{count} {count === 1 ? "product" : "products"}
												</span>
											)}
										</div>
										{/* Description */}
										{description && !isScrolled && (
											<p className="text-xs text-muted-foreground max-w-2xl line-clamp-1" aria-hidden="true">
												{description}
											</p>
										)}
									</div>
								</div>

								<div className="flex items-center gap-3">
									<Select value={filters.sort} onValueChange={(value) => onUpdateFilter("sort", value)}>
										<SelectTrigger className={cn("text-sm bg-background ring-1 ring-border hover:ring-2 hover:ring-ring transition-all duration-200", isScrolled ? "h-8 w-[120px] sm:w-[140px]" : "h-9 w-[130px] sm:w-[160px]")}>
											<SelectValue placeholder="Sort by" />
										</SelectTrigger>
										<SelectContent>
											{sortOptions.map((option) => (
												<SelectItem key={option.value} value={option.value} className="text-sm">
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</TooltipProvider>
	);
}

