import { Skeleton } from "@/components/ui/skeleton";

export function HeroModernSkeleton() {
	return (
		<section className="relative min-h-[90vh] overflow-hidden bg-background">
			{/* Subtle gradient background */}
			<div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background" />

			{/* Animated gradient orb - subtle and minimal */}
			<div
				className="absolute top-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/5 blur-3xl"
				style={{ animationDuration: "8s" }}
			/>

			<div className="container relative z-10 mx-auto px-4">
				<div className="flex min-h-[90vh] items-center">
					<div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
						{/* Left Content - Ultra Minimal */}
						<div className="space-y-8">
							{/* Small badge */}
							<Skeleton className="h-9 w-56 rounded-full" />

							{/* Massive, bold headline */}
							<div className="space-y-4">
								<div className="space-y-3">
									<Skeleton className="h-12 w-32 sm:h-16 md:h-20 lg:h-24 xl:h-28" />
									<Skeleton className="h-12 w-48 sm:h-16 md:h-20 lg:h-24 xl:h-28" />
									<Skeleton className="h-12 w-56 sm:h-16 md:h-20 lg:h-24 xl:h-28" />
								</div>

								<div className="space-y-2">
									<Skeleton className="h-5 w-full max-w-lg sm:h-6 md:h-7" />
									<Skeleton className="h-5 w-3/4 max-w-lg sm:h-6 md:h-7" />
								</div>
							</div>

							{/* Clean CTAs */}
							<div className="flex flex-wrap gap-4">
								<Skeleton className="h-12 w-36 rounded-lg" />
								<Skeleton className="h-12 w-40 rounded-lg" />
							</div>

							{/* Minimal stats - clean and simple */}
							<div className="grid grid-cols-3 gap-4 pt-8 sm:gap-6 lg:gap-8">
								<div className="space-y-1">
									<Skeleton className="h-8 w-16 sm:h-10" />
									<Skeleton className="h-3 w-12 sm:h-4" />
								</div>
								<div className="space-y-1">
									<Skeleton className="h-8 w-16 sm:h-10" />
									<Skeleton className="h-3 w-12 sm:h-4" />
								</div>
								<div className="space-y-1">
									<Skeleton className="h-8 w-16 sm:h-10" />
									<Skeleton className="h-3 w-12 sm:h-4" />
								</div>
							</div>
						</div>

						{/* Right Content - Featured Product Image (minimal) */}
						<div className="relative hidden lg:block">
							<div className="relative aspect-square overflow-hidden rounded-3xl border bg-muted/50">
								{/* Product Image Skeleton */}
								<Skeleton className="h-full w-full" />

								{/* Minimal overlay with product info */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent">
									<div className="absolute right-0 bottom-0 left-0 p-8">
										<div className="space-y-2">
											<Skeleton className="h-6 w-20 rounded-full" />
											<Skeleton className="h-7 w-48" />
											<Skeleton className="h-4 w-32" />
										</div>
									</div>
								</div>
							</div>

							{/* Floating badge - minimal decoration */}
							<div className="-top-4 -right-4 absolute rounded-2xl border bg-background p-4 shadow-lg">
								<div className="text-center">
									<Skeleton className="mx-auto mb-1 h-7 w-12" />
									<Skeleton className="h-3 w-20" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
