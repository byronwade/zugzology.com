import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import * as React from "react";
import { type ButtonProps, buttonVariants } from "@/components/ui/button";
import { PrefetchLink } from "@/components/ui/prefetch-link";
import { cn } from "@/lib/utils";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
	<nav aria-label="pagination" className={cn("mx-auto flex w-full justify-center", className)} {...props} />
);
Pagination.displayName = "Pagination";

const PaginationContent = ({
	className,
	ref,
	...props
}: React.ComponentProps<"ul"> & { ref?: React.RefObject<HTMLUListElement | null> }) => (
	<ul className={cn("flex flex-row items-center gap-1", className)} ref={ref} {...props} />
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = ({
	className,
	ref,
	...props
}: React.ComponentProps<"li"> & { ref?: React.RefObject<HTMLLIElement | null> }) => (
	<li className={cn("", className)} ref={ref} {...props} />
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
	isActive?: boolean;
} & Pick<ButtonProps, "size"> &
	React.ComponentProps<"a">;

const PaginationLink = ({ className, isActive, size = "icon", href, ...props }: PaginationLinkProps) => (
	<PrefetchLink
		aria-current={isActive ? "page" : undefined}
		className={cn(
			buttonVariants({
				variant: isActive ? "outline" : "ghost",
				size,
			}),
			className
		)}
		href={href || "#"}
		prefetchPriority="high"
		{...props}
	/>
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink aria-label="Go to previous page" className={cn("gap-1 pl-2.5", className)} size="default" {...props}>
		<ChevronLeft className="h-4 w-4" />
		<span>Previous</span>
	</PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink aria-label="Go to next page" className={cn("gap-1 pr-2.5", className)} size="default" {...props}>
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

// PaginationControls wrapper component for easier usage
type PaginationControlsProps = {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	className?: string;
};

export function PaginationControls({ currentPage, totalPages, onPageChange, className }: PaginationControlsProps) {
	if (totalPages <= 1) {
		return null;
	}

	const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
	const showPages = pages.filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1);

	return (
		<Pagination className={className}>
			<PaginationContent>
				{currentPage > 1 && (
					<PaginationItem>
						<PaginationPrevious href="#" onClick={() => onPageChange(currentPage - 1)} />
					</PaginationItem>
				)}

				{showPages.map((page, index) => {
					const showEllipsis = index > 0 && showPages[index - 1] !== page - 1;
					return (
						<React.Fragment key={page}>
							{showEllipsis && (
								<PaginationItem>
									<PaginationEllipsis />
								</PaginationItem>
							)}
							<PaginationItem>
								<PaginationLink href="#" isActive={page === currentPage} onClick={() => onPageChange(page)}>
									{page}
								</PaginationLink>
							</PaginationItem>
						</React.Fragment>
					);
				})}

				{currentPage < totalPages && (
					<PaginationItem>
						<PaginationNext href="#" onClick={() => onPageChange(currentPage + 1)} />
					</PaginationItem>
				)}
			</PaginationContent>
		</Pagination>
	);
}

// SSR-friendly pagination component
type PaginationControlsSSRProps = {
	currentPage: number;
	totalPages: number;
	basePath: string;
	className?: string;
};

export function PaginationControlsSSR({ currentPage, totalPages, basePath, className }: PaginationControlsSSRProps) {
	if (totalPages <= 1) {
		return null;
	}

	const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
	const showPages = pages.filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1);

	return (
		<Pagination className={className}>
			<PaginationContent>
				{currentPage > 1 && (
					<PaginationItem>
						<PaginationPrevious href={`${basePath}?page=${currentPage - 1}`} />
					</PaginationItem>
				)}

				{showPages.map((page, index) => {
					const showEllipsis = index > 0 && showPages[index - 1] !== page - 1;
					return (
						<React.Fragment key={page}>
							{showEllipsis && (
								<PaginationItem>
									<PaginationEllipsis />
								</PaginationItem>
							)}
							<PaginationItem>
								<PaginationLink
									href={page === 1 ? basePath : `${basePath}?page=${page}`}
									isActive={page === currentPage}
								>
									{page}
								</PaginationLink>
							</PaginationItem>
						</React.Fragment>
					);
				})}

				{currentPage < totalPages && (
					<PaginationItem>
						<PaginationNext href={`${basePath}?page=${currentPage + 1}`} />
					</PaginationItem>
				)}
			</PaginationContent>
		</Pagination>
	);
}

export {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
};
