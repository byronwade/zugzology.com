"use client";

import React, { memo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Filter, X, Brain, Target, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";

interface AIProductsHeaderProps {
	title: string;
	description?: string;
	defaultSort?: string;
	className?: string;
	image?: {
		url: string;
		altText?: string;
		width?: number;
		height?: number;
	};
	filters?: Record<string, string>;
	onUpdateFilter?: (key: string, value: string) => void;
	count?: number;
	initialSort?: string;
	// AI-specific props
	aiMetadata?: {
		aiFiltered: boolean;
		strategy: string;
		contextualBoosts: string[];
		relatedProducts: string[];
	};
	showAIInsights?: boolean;
}

const aiSortOptions = [
	{ value: "recommended", label: "🧠 AI Recommended", icon: Brain },
	{ value: "featured", label: "Featured", icon: undefined },
	{ value: "price-asc", label: "Price: Low to High", icon: undefined },
	{ value: "price-desc", label: "Price: High to Low", icon: undefined },
	{ value: "title-asc", label: "Name: A to Z", icon: undefined },
	{ value: "title-desc", label: "Name: Z to A", icon: undefined },
	{ value: "newest", label: "Newest", icon: undefined },
] as const;

// AI Strategy descriptions for tooltips
const strategyDescriptions: Record<string, string> = {
	'ai-personalized': 'Products ranked by your preferences and behavior patterns',
	'search-optimized': 'Results tailored to your search intent and related products',
	'collection-contextual': 'Smart product ordering based on collection context and user interests',
	'cross-sell': 'Products that complement your current selections',
	'standard-price-asc': 'Standard price sorting (low to high)',
	'standard-price-desc': 'Standard price sorting (high to low)',
	'standard-title-asc': 'Standard alphabetical sorting (A to Z)',
	'standard-title-desc': 'Standard alphabetical sorting (Z to A)',
	'standard-newest': 'Standard date sorting (newest first)',
	'fallback': 'Default product ordering'
};

// Inner component that uses useSearchParams
const AIProductsHeaderInner = memo(function AIProductsHeaderInner({
	title,
	description,
	defaultSort = "recommended",
	className,
	image,
	filters,
	onUpdateFilter,
	count,
	initialSort,
	aiMetadata,
	showAIInsights = true,
}: AIProductsHeaderProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentSort = searchParams.get("sort") || initialSort || defaultSort;

	// Handle sort change with stable reference
	const handleUpdateSort = useCallback(
		(value: string) => {
			const params = new URLSearchParams(searchParams.toString());
			if (value === "recommended") {
				params.delete("sort");
			} else {
				params.set("sort", value);
			}
			router.push(`?${params.toString()}`);
		},
		[searchParams, router]
	);

	// Handle filter removal with stable reference
	const handleRemoveFilter = useCallback(
		(key: string) => {
			if (onUpdateFilter) {
				onUpdateFilter(key, "");
			}
		},
		[onUpdateFilter]
	);

	// Handle clear all filters with stable reference
	const handleClearAllFilters = useCallback(() => {
		if (filters && onUpdateFilter) {
			Object.keys(filters).forEach((key) => {
				onUpdateFilter(key, "");
			});
		}
	}, [filters, onUpdateFilter]);

	// Check if any filters are active
	const hasActiveFilters = filters && Object.values(filters).some((value) => value !== "");

	// Check if description actually has content
	const hasDescription = description && description.trim().length > 0;

	// Get AI strategy info
	const isAIActive = aiMetadata?.aiFiltered && (currentSort === "recommended" || currentSort === "featured");
	const strategyDescription = aiMetadata?.strategy ? strategyDescriptions[aiMetadata.strategy] : undefined;

	return (
		<TooltipProvider>
			<div className={cn("w-full border-b border-border/60 p-4 mb-8", className)}>
				{/* Title, Description and Sort */}
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div className="flex items-center gap-4 flex-1 min-w-0">
						{image?.url && (
							<div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
								<Image src={image.url} alt={image.altText || title} fill className="object-cover" sizes="64px" priority />
							</div>
						)}
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">{title}</h1>
								{isAIActive && showAIInsights && (
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full">
												<Brain className="h-3 w-3 text-blue-600" />
												<span className="text-xs font-medium text-blue-700">AI</span>
											</div>
										</TooltipTrigger>
										<TooltipContent className="max-w-xs">
											<p className="text-xs">{strategyDescription}</p>
										</TooltipContent>
									</Tooltip>
								)}
							</div>
							{hasDescription && <p className="text-muted-foreground mt-1 line-clamp-3 max-w-[500px]">{description}</p>}
						</div>
					</div>

					{/* Sort Dropdown */}
					<div className="flex-shrink-0">
						<Select value={currentSort} onValueChange={handleUpdateSort}>
							<SelectTrigger className="w-full md:w-[200px] bg-background">
								<div className="flex items-center gap-2">
									<ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
									<SelectValue placeholder="Sort by" />
								</div>
							</SelectTrigger>
							<SelectContent>
								{aiSortOptions.map((option) => {
									const Icon = option.icon;
									return (
										<SelectItem key={option.value} value={option.value}>
											<div className="flex items-center gap-2">
												{Icon && <Icon className="h-3.5 w-3.5" />}
												{option.label}
											</div>
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* AI Insights Bar */}
				{isAIActive && showAIInsights && aiMetadata && (
					<div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Sparkles className="h-4 w-4 text-blue-600" />
								<div className="flex items-center gap-2 text-sm">
									<span className="font-medium text-blue-900">AI-Powered Results</span>
									<span className="text-blue-700">•</span>
									<span className="text-blue-700 capitalize">{aiMetadata.strategy.replace(/-/g, ' ')}</span>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{aiMetadata.contextualBoosts.length > 0 && (
									<Tooltip>
										<TooltipTrigger asChild>
											<Badge variant="secondary" className="text-xs">
												<TrendingUp className="h-3 w-3 mr-1" />
												{aiMetadata.contextualBoosts.length} boost{aiMetadata.contextualBoosts.length !== 1 ? 's' : ''}
											</Badge>
										</TooltipTrigger>
										<TooltipContent>
											<div className="text-xs">
												<p className="font-medium mb-1">Active boosts:</p>
												<ul className="list-disc list-inside space-y-1">
													{aiMetadata.contextualBoosts.map((boost, index) => (
														<li key={index}>{boost}</li>
													))}
												</ul>
											</div>
										</TooltipContent>
									</Tooltip>
								)}
								{aiMetadata.relatedProducts.length > 0 && (
									<Tooltip>
										<TooltipTrigger asChild>
											<Badge variant="outline" className="text-xs">
												<Target className="h-3 w-3 mr-1" />
												{aiMetadata.relatedProducts.length} related
											</Badge>
										</TooltipTrigger>
										<TooltipContent>
											<p className="text-xs">Found {aiMetadata.relatedProducts.length} contextually related products</p>
										</TooltipContent>
									</Tooltip>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Active Filters */}
				{hasActiveFilters && (
					<div className="flex flex-wrap gap-2 items-center mt-4">
						<div className="flex items-center">
							<Filter className="h-4 w-4 mr-2 text-muted-foreground" />
							<span className="text-sm font-medium">Filters:</span>
						</div>
						{filters &&
							Object.entries(filters).map(([key, value]) => {
								if (!value) return null;
								return (
									<Badge key={key} variant="secondary" className="flex items-center gap-1 py-1 px-2">
										<span className="text-xs">
											{key}: {Array.isArray(value) ? value.join(', ') : value}
										</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-4 w-4 p-0 ml-1 hover:bg-transparent hover:text-destructive"
											onClick={() => handleRemoveFilter(key)}
										>
											<X className="h-3 w-3" />
											<span className="sr-only">Remove {key} filter</span>
										</Button>
									</Badge>
								);
							})}
						{onUpdateFilter && (
							<Button
								variant="ghost"
								size="sm"
								className="text-xs h-7 px-2 hover:bg-secondary"
								onClick={handleClearAllFilters}
							>
								Clear All
							</Button>
						)}
					</div>
				)}
			</div>
		</TooltipProvider>
	);
});

// Wrapper component with Suspense boundary
export const AIProductsHeader = memo(function AIProductsHeader(props: AIProductsHeaderProps) {
	return (
		<Suspense
			fallback={
				<div className={cn("w-full border-b border-border/60 p-4 mb-8", props.className)}>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div className="flex items-center gap-4 flex-1 min-w-0">
							{props.image?.url && (
								<div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
									<div className="w-full h-full bg-muted animate-pulse" />
								</div>
							)}
							<div className="flex-1 min-w-0">
								<h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">{props.title}</h1>
								{props.description && (
									<p className="text-muted-foreground mt-1 line-clamp-3 max-w-[500px]">{props.description}</p>
								)}
							</div>
						</div>
						<div className="flex-shrink-0">
							<div className="w-[200px] h-10 bg-muted rounded-md animate-pulse" />
						</div>
					</div>
				</div>
			}
		>
			<AIProductsHeaderInner {...props} />
		</Suspense>
	);
});

AIProductsHeader.displayName = "AIProductsHeader";