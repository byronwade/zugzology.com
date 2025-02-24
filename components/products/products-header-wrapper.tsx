"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";

interface ProductsHeaderWrapperProps {
	title: string;
	description?: string;
	className?: string;
	defaultSort?: string;
}

const sortOptions = [
	{ value: "featured", label: "Featured" },
	{ value: "price-asc", label: "Price: Low to High" },
	{ value: "price-desc", label: "Price: High to Low" },
	{ value: "title-asc", label: "Name: A to Z" },
	{ value: "title-desc", label: "Name: Z to A" },
	{ value: "newest", label: "Newest" },
] as const;

export function ProductsHeaderWrapper({ title, description, className, defaultSort = "featured" }: ProductsHeaderWrapperProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentSort = searchParams.get("sort") || defaultSort;

	const handleUpdateSort = (value: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value === defaultSort) {
			params.delete("sort");
		} else {
			params.set("sort", value);
		}
		router.push(`?${params.toString()}`);
	};

	return (
		<div className={cn("w-full border-b p-4 mb-8", className)}>
			<div className="flex flex-col space-y-2 mb-4">
				<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
				{description && <p className="text-muted-foreground">{description}</p>}
			</div>

			<div className="flex items-center justify-between mt-6">
				<div className="flex-1" />
				<Select value={currentSort} onValueChange={handleUpdateSort}>
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
	);
}
