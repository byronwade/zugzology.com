import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ProductCardSkeletonProps = {
	view?: "grid" | "list";
};

export function ProductCardSkeleton({ view = "grid" }: ProductCardSkeletonProps) {
	return (
		<div
			className={cn(
				"group relative h-full",
				view === "grid"
					? "flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-300 dark:border-neutral-900 dark:bg-black"
					: "flex flex-row gap-4 border-foreground/10 border-b py-4 last:border-b-0"
			)}
		>
			{/* Wishlist Button Skeleton */}
			<Skeleton
				className={cn("absolute z-[1] h-10 w-10 rounded-md", view === "grid" ? "top-2 right-2" : "top-0 right-0")}
			/>

			{/* Product Image */}
			<div className={cn("block shrink-0", view === "grid" ? "w-full" : "w-28 sm:w-32")}>
				<div
					className={cn(
						"relative overflow-hidden bg-muted transition-all duration-300",
						view === "grid" ? "aspect-square w-full" : "aspect-square h-28 w-28 rounded-lg sm:h-32 sm:w-32"
					)}
				>
					<Skeleton className="h-full w-full" />
				</div>
			</div>

			{/* Product Info */}
			<div className={cn("flex flex-col", view === "grid" ? "mt-4 flex-1 px-4 pb-4" : "min-w-0 flex-1 py-1")}>
				{/* Vendor */}
				<Skeleton className="mb-1 h-3 w-20" />

				{/* Title */}
				<Skeleton className={cn("mb-3", view === "grid" ? "h-12 w-full" : "h-6 w-3/4")} />

				{/* Reviews */}
				<div className="mt-1 flex items-center gap-2">
					<div className="flex items-center gap-1">
						<Skeleton className="h-4 w-4 rounded-full" />
						<Skeleton className="h-4 w-4 rounded-full" />
						<Skeleton className="h-4 w-4 rounded-full" />
						<Skeleton className="h-4 w-4 rounded-full" />
						<Skeleton className="h-4 w-4 rounded-full" />
					</div>
					<Skeleton className="h-3 w-8" />
				</div>

				{/* Price Section */}
				<div className="mt-auto">
					<div className="flex items-baseline gap-2">
						<Skeleton className="h-7 w-20" />
					</div>
				</div>

				{/* Stock and Shipping Info */}
				<div className="mt-3 space-y-1">
					{/* Stock Status */}
					<div className="flex items-center gap-1.5">
						<Skeleton className="h-2 w-2 rounded-full" />
						<Skeleton className="h-3 w-16" />
					</div>

					{/* Shipping Info */}
					<div className="flex items-center gap-1.5">
						<Skeleton className="h-3 w-3" />
						<Skeleton className="h-3 w-24" />
					</div>
				</div>

				{/* Recent Purchases Badge */}
				{view === "grid" && (
					<div className="mt-3">
						<Skeleton className="h-7 w-32 rounded-full" />
					</div>
				)}

				{/* Add to Cart Button */}
				<div className="mt-4">
					<Skeleton className={cn("w-full rounded-lg", view === "grid" ? "h-12 sm:h-11" : "h-10")} />
				</div>
			</div>
		</div>
	);
}
