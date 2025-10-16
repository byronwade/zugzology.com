import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "./product-card-skeleton";

type ProductGridSectionSkeletonProps = {
	productCount?: number;
	showCta?: boolean;
};

export function ProductGridSectionSkeleton({ productCount = 5, showCta = true }: ProductGridSectionSkeletonProps) {
	return (
		<section className="bg-background">
			<div className="container mx-auto px-4 py-8 sm:py-12">
				<div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
					<div className="space-y-2">
						<Skeleton className="h-9 w-64 sm:h-10 md:h-12" />
						<Skeleton className="h-5 w-full max-w-2xl sm:h-6" />
					</div>
					{showCta && <Skeleton className="h-10 w-40 rounded-lg" />}
				</div>

				{/* Mobile: List view */}
				<div className="flex flex-col gap-0 sm:hidden">
					{[...new Array(productCount)].map((_, i) => (
						<ProductCardSkeleton key={i} view="list" />
					))}
				</div>

				{/* Desktop: Grid view */}
				<div className="hidden gap-6 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{[...new Array(productCount)].map((_, i) => (
						<div className="group relative" key={i}>
							<ProductCardSkeleton view="grid" />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
