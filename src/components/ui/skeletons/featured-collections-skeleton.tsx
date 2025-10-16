import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedCollectionsSkeleton() {
	return (
		<section className="w-full bg-background">
			<div className="container mx-auto px-4 py-12 sm:py-16">
				{/* Section Header */}
				<div className="mb-12 text-center">
					<Skeleton className="mx-auto mb-4 h-10 w-64" />
					<Skeleton className="mx-auto h-6 w-full max-w-2xl" />
				</div>

				{/* Collections Grid */}
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{[...new Array(4)].map((_, i) => (
						<div
							className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
							key={i}
						>
							{/* Collection Image */}
							<div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
								<Skeleton className="h-full w-full" />
								{/* Subtle Gradient Overlay */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

								{/* Product Count Badge */}
								<div className="absolute top-3 right-3 z-10">
									<div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/90 px-3 py-1.5 backdrop-blur-sm dark:bg-black/90">
										<Skeleton className="h-3.5 w-3.5" />
										<Skeleton className="h-3 w-4" />
									</div>
								</div>
							</div>

							{/* Collection Info */}
							<div className="p-5">
								<Skeleton className="mb-2 h-6 w-3/4" />
								<div className="mb-4 space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-5/6" />
								</div>

								{/* Shop Now Link */}
								<div className="flex items-center gap-2">
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 w-4" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
