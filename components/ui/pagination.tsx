"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

interface PaginationControlsProps {
	currentPage: number;
	totalPages: number;
	onPageChange?: (page: number) => void;
	baseUrl?: string;
	searchParamName?: string;
	pathname?: string;
	searchParamsString?: string;
}

// Memoize the PaginationControls component to prevent unnecessary re-renders
export const PaginationControls = React.memo(function PaginationControls({
	currentPage,
	totalPages,
	onPageChange,
	baseUrl,
	searchParamName = "page",
	pathname: propPathname,
	searchParamsString,
}: PaginationControlsProps) {
	// Use provided pathname and searchParams if available, otherwise use hooks
	const hookPathname = usePathname();
	const hookSearchParams = useSearchParams();

	const pathname = propPathname || hookPathname;
	const searchParamsValue = React.useMemo(() => (searchParamsString ? searchParamsString : hookSearchParams.toString()), [hookSearchParams, searchParamsString]);

	// Removed console.log for performance

	// Handle page change with client-side navigation if onPageChange is provided
	// Memoize the handler to prevent unnecessary re-renders
	const handlePageChange = React.useCallback(
		(page: number) => {
			if (onPageChange) {
				// Removed console.log for performance
				onPageChange(page);
			}
		},
		[onPageChange]
	);

	// Create URL for a specific page
	// Memoize the function to prevent unnecessary re-renders
	const createPageUrl = React.useCallback(
		(page: number) => {
			const params = new URLSearchParams(searchParamsValue);
			params.set(searchParamName, page.toString());
			const url = `${baseUrl || pathname}?${params.toString()}`;
			// Removed console.log for performance
			return url;
		},
		[baseUrl, pathname, searchParamName, searchParamsValue]
	);

	// Calculate page range to display
	// Memoize the calculation to prevent unnecessary re-renders
	const pageRange = React.useMemo(() => {
		const maxPagesToShow = 5;

		if (totalPages <= maxPagesToShow) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		// Always show first and last page
		let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
		let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

		// Adjust if we're near the end
		if (endPage - startPage + 1 < maxPagesToShow) {
			startPage = Math.max(1, endPage - maxPagesToShow + 1);
		}

		const pages = [];

		// Add first page if not included
		if (startPage > 1) {
			pages.push(1);
			if (startPage > 2) pages.push("ellipsis");
		}

		// Add middle pages
		for (let i = startPage; i <= endPage; i++) {
			pages.push(i);
		}

		// Add last page if not included
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) pages.push("ellipsis");
			pages.push(totalPages);
		}

		return pages;
	}, [currentPage, totalPages]);

	// Don't render pagination if there's only one page
	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="flex items-center justify-center mt-12 mb-8 space-x-2">
			{/* Previous page button */}
			{onPageChange ? (
				<Button
					variant="outline"
					size="icon"
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage <= 1}
					aria-label="Previous page"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
			) : (
				<Button variant="outline" size="icon" asChild disabled={currentPage <= 1} aria-label="Previous page">
					{currentPage > 1 ? (
						<Link href={createPageUrl(currentPage - 1)} scroll={true} prefetch={false}>
							<ChevronLeft className="h-4 w-4" />
						</Link>
					) : (
						<span>
							<ChevronLeft className="h-4 w-4" />
						</span>
					)}
				</Button>
			)}

			{/* Page numbers */}
			<div className="flex items-center space-x-2">
				{pageRange.map((page, i) =>
					page === "ellipsis" ? (
						<span key={`ellipsis-${i}`} className="px-2">
							...
						</span>
					) : onPageChange ? (
						<Button
							key={`page-${page}`}
							variant={currentPage === page ? "default" : "outline"}
							size="sm"
							onClick={() => handlePageChange(page as number)}
							aria-label={`Page ${page}`}
							aria-current={currentPage === page ? "page" : undefined}
						>
							{page}
						</Button>
					) : (
						<Button
							key={`page-${page}`}
							variant={currentPage === page ? "default" : "outline"}
							size="sm"
							asChild
							aria-label={`Page ${page}`}
							aria-current={currentPage === page ? "page" : undefined}
						>
							<Link href={createPageUrl(page as number)} scroll={true} prefetch={false}>
								{page}
							</Link>
						</Button>
					)
				)}
			</div>

			{/* Next page button */}
			{onPageChange ? (
				<Button
					variant="outline"
					size="icon"
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
					aria-label="Next page"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			) : (
				<Button variant="outline" size="icon" asChild disabled={currentPage >= totalPages} aria-label="Next page">
					{currentPage < totalPages ? (
						<Link href={createPageUrl(currentPage + 1)} scroll={true} prefetch={false}>
							<ChevronRight className="h-4 w-4" />
						</Link>
					) : (
						<span>
							<ChevronRight className="h-4 w-4" />
						</span>
					)}
				</Button>
			)}
		</div>
	);
});

// Server-side compatible pagination component
export function PaginationControlsSSR(props: Omit<PaginationControlsProps, "pathname" | "searchParamsString">) {
	return <PaginationControls {...props} />;
}

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => <nav role="navigation" aria-label="pagination" className={cn("mx-auto flex w-full justify-center", className)} {...props} />;
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(({ className, ...props }, ref) => <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ className, ...props }, ref) => <li ref={ref} className={cn("", className)} {...props} />);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
	isActive?: boolean;
} & Pick<ButtonProps, "size"> &
	React.ComponentProps<"a">;

const PaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => (
	<a
		aria-current={isActive ? "page" : undefined}
		className={cn(
			buttonVariants({
				variant: isActive ? "outline" : "ghost",
				size,
			}),
			className
		)}
		{...props}
	/>
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink aria-label="Go to previous page" size="default" className={cn("gap-1 pl-2.5", className)} {...props}>
		<ChevronLeft className="h-4 w-4" />
		<span>Previous</span>
	</PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink aria-label="Go to next page" size="default" className={cn("gap-1 pr-2.5", className)} {...props}>
		<span>Next</span>
		<ChevronRight className="h-4 w-4" />
	</PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
	<span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
		<MoreHorizontal className="h-4 w-4" />
		<span className="sr-only">More pages</span>
	</span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export { Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis };
