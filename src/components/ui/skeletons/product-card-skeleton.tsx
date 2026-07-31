import type { ProductCardView } from "@/components/features/products/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ProductCardSkeletonProps = {
	view?: ProductCardView;
};

/**
 * Same three-column class table as ProductCard, for the same reason: the
 * "responsive" row is the "list" row below sm and the "grid" row at sm and up,
 * so one skeleton can stand in for one card instead of callers rendering a
 * hidden copy of each. Keep the rows in step with CARD_CLASSES — a fallback
 * that does not match its content is a layout shift.
 */
const SKELETON_CLASSES: Record<ProductCardView, Record<string, string>> = {
	grid: {
		root: "flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm",
		wishlist: "top-2 right-2",
		imageLink: "w-full",
		imageBox: "aspect-square w-full",
		info: "mt-4 flex-1 px-4 pb-4",
		title: "h-12 w-full",
		cta: "h-12 sm:h-11",
	},
	list: {
		root: "flex flex-row gap-4 border-b py-4 last:border-b-0",
		wishlist: "top-0 right-0",
		imageLink: "w-28 sm:w-32",
		imageBox: "aspect-square h-28 w-28 rounded-lg sm:h-32 sm:w-32",
		info: "min-w-0 flex-1 py-1",
		title: "h-6 w-3/4",
		cta: "h-10",
	},
	responsive: {
		root: "flex flex-row gap-4 py-4 sm:flex-col sm:gap-0 sm:overflow-hidden sm:rounded-xl sm:border sm:bg-card sm:py-0 sm:shadow-sm",
		wishlist: "top-0 right-0 sm:top-2 sm:right-2",
		imageLink: "w-28 sm:w-full",
		imageBox: "aspect-square h-28 w-28 rounded-lg sm:h-auto sm:w-full sm:rounded-none",
		info: "min-w-0 flex-1 py-1 sm:mt-4 sm:px-4 sm:py-0 sm:pb-4",
		title: "h-6 w-3/4 sm:h-12 sm:w-full",
		cta: "h-10 sm:h-11",
	},
};

export function ProductCardSkeleton({ view = "grid" }: ProductCardSkeletonProps) {
	const styles = SKELETON_CLASSES[view];

	return (
		<div className={cn("group relative h-full", styles.root)}>
			{/* Wishlist Button Skeleton */}
			<Skeleton className={cn("absolute z-[1] h-10 w-10 rounded-md", styles.wishlist)} />

			{/* Product Image */}
			<div className={cn("block shrink-0", styles.imageLink)}>
				<div className={cn("relative overflow-hidden bg-muted transition-all duration-300", styles.imageBox)}>
					<Skeleton className="h-full w-full" />
				</div>
			</div>

			{/* Product Info */}
			<div className={cn("flex flex-col", styles.info)}>
				{/* Vendor */}
				<Skeleton className="mb-1 h-3 w-20" />

				{/* Title */}
				<Skeleton className={cn("mb-3", styles.title)} />

				{/* Reviews */}
				<div className="mt-1 flex items-center gap-2">
					<div className="flex items-center gap-1">
						{new Array(5).fill(0).map((_, i) => (
							<Skeleton className="h-4 w-4 rounded-full" key={i} />
						))}
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

				{/* Recent Purchases Badge — grid-only, as in the card itself */}
				<div className={cn("mt-3", view === "list" && "hidden", view === "responsive" && "hidden sm:block")}>
					<Skeleton className="h-7 w-32 rounded-full" />
				</div>

				{/* Add to Cart Button */}
				<div className="mt-4">
					<Skeleton className={cn("w-full rounded-lg", styles.cta)} />
				</div>
			</div>
		</div>
	);
}
