"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronRight, ArrowUpDown } from "lucide-react";
import { Link } from "@/components/ui/link";

interface ProductsHeaderWrapperProps {
	title: string;
	description?: string;
	count?: {
		total: number;
		filtered?: number;
	};
	defaultSort?: string;
	image?: {
		url: string;
		altText?: string;
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

export function ProductsHeaderWrapper({ title, description, count, defaultSort = "featured", image }: ProductsHeaderWrapperProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentSort = searchParams.get("sort") || defaultSort;

	const handleUpdateFilter = (key: string, value: string) => {
		const params = new URLSearchParams(searchParams.toString());

		if (value === defaultSort) {
			params.delete(key);
		} else {
			params.set(key, value);
		}

		router.push(`?${params.toString()}`);
	};

	// Get the display count based on whether we're showing filtered results
	const displayCount = count?.filtered ?? count?.total ?? 0;
	const showFilteredCount = count?.filtered !== undefined && count.filtered !== count?.total;

	return (
		<header className="w-full bg-background border-b" itemScope itemType="https://schema.org/CollectionPage">
			{/* Navigation */}
			<div className="h-12 border-b bg-muted/40">
				<div className="container h-full px-4">
					<nav className="flex items-center h-full text-sm" aria-label="Breadcrumb">
						<Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
							Collections
						</Link>
						<ChevronRight className="w-3.5 h-3.5 mx-2 text-muted-foreground/50" />
						<span className="text-foreground/80">{title}</span>
					</nav>
				</div>
			</div>

			{/* Header Content */}
			<div className="container px-4 py-12">
				<div className="max-w-4xl space-y-4">
					<h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight pb-1 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80" itemProp="name">
						{title}
					</h1>
					{description && (
						<p className="text-lg text-muted-foreground line-clamp-3" itemProp="description">
							{description}
						</p>
					)}
				</div>
			</div>

			{/* Controls Section */}
			<div className="bg-muted/40 sticky top-[var(--header-height)] z-30">
				<div className="px-4 py-3">
					<div className="flex items-center justify-between">
						<div className="text-sm text-muted-foreground">
							{displayCount.toLocaleString()} {displayCount === 1 ? "product" : "products"}
							{showFilteredCount && count?.total && <span className="ml-1">(filtered from {count.total.toLocaleString()})</span>}
						</div>
						<Select value={currentSort} onValueChange={(value) => handleUpdateFilter("sort", value)}>
							<SelectTrigger className="w-[180px] bg-background">
								<div className="flex items-center gap-2">
									<ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
									<SelectValue placeholder="Sort by" />
								</div>
							</SelectTrigger>
							<SelectContent>
								{sortOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{/* SEO Content */}
			<div className="sr-only" aria-hidden="true">
				<div itemProp="description">{description}</div>
				{count?.total && <meta itemProp="numberOfItems" content={count.total.toString()} />}
				<meta itemProp="url" content={`https://zugzology.com/collections/${title.toLowerCase().replace(/\s+/g, "-")}`} />
				<meta itemProp="dateModified" content={new Date().toISOString()} />
				<div itemProp="offers" itemScope itemType="https://schema.org/AggregateOffer">
					<meta itemProp="offerCount" content={count?.total?.toString() || "0"} />
					<meta itemProp="availability" content="https://schema.org/InStock" />
					<meta itemProp="priceCurrency" content="USD" />
				</div>
				<meta itemProp="keywords" content={`${title}, mushroom growing supplies, cultivation equipment, ${description?.slice(0, 100)}`} />
			</div>
		</header>
	);
}
