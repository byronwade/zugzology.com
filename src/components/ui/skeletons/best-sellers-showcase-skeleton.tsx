import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "./product-card-skeleton";

export function BestSellersShowcaseSkeleton() {
	return (
		<section className="relative w-full overflow-hidden bg-muted/50 py-16">
			{/* Background Pattern */}
			<div className="absolute inset-0 z-0 opacity-5">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					}}
				/>
			</div>

			<div className="container relative z-10 mx-auto px-4 md:px-6">
				<div className="mb-12 flex flex-col items-center text-center">
					<div className="mb-4 flex items-center gap-2">
						<Skeleton className="h-6 w-6" />
						<Skeleton className="h-6 w-24 rounded-full" />
					</div>
					<Skeleton className="mx-auto mb-4 h-10 w-48" />
					<Skeleton className="mx-auto h-6 w-full max-w-2xl" />
				</div>

				<div className="relative">
					{/* Mobile: List view */}
					<div className="flex flex-col gap-0 sm:hidden">
						{[...new Array(5)].map((_, i) => (
							<div className="relative" key={i}>
								<Skeleton className="absolute top-2 left-4 z-20 h-5 w-8 rounded-sm" />
								<ProductCardSkeleton view="list" />
							</div>
						))}
					</div>

					{/* Desktop: Grid view */}
					<div className="hidden gap-6 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
						{[...new Array(5)].map((_, i) => (
							<div className="group relative" key={i}>
								<div className="hover:-translate-y-1 relative overflow-hidden rounded-lg border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl">
									{/* Best Seller Badge - Top Right */}
									<div className="absolute top-3 right-3 z-20">
										<Skeleton className="h-6 w-28 rounded-md" />
									</div>

									{/* Product Card */}
									<ProductCardSkeleton view="grid" />

									{/* Rating Section - Below Product Card */}
									<div className="flex items-center justify-between gap-2 border-border border-t bg-muted/30 px-4 py-3">
										<div className="flex items-center gap-1">
											{[...new Array(5)].map((_, starIndex) => (
												<Skeleton className="h-4 w-4 rounded-full" key={starIndex} />
											))}
											<Skeleton className="ml-1 h-3 w-8" />
										</div>
										<Skeleton className="h-6 w-20 rounded-full" />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="mt-12 text-center">
					<Skeleton className="mx-auto h-12 w-56 rounded-lg" />
				</div>
			</div>
		</section>
	);
}
