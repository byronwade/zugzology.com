import { Skeleton } from "@/components/ui/skeleton";

export function BlogCardSkeleton() {
	return (
		<div className="group block overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-300">
			<div className="flex flex-col md:flex-row">
				{/* Content Section - Left */}
				<div className="flex w-full flex-col justify-center p-6 md:w-2/3">
					<div className="space-y-4">
						{/* Author and Meta Info */}
						<div className="flex items-center gap-2">
							<Skeleton className="h-6 w-6 rounded-full" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-4 rounded-full" />
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-4 w-4 rounded-full" />
							<Skeleton className="h-4 w-20" />
						</div>

						{/* Title */}
						<div className="space-y-2">
							<Skeleton className="h-7 w-full md:h-8" />
							<Skeleton className="h-7 w-3/4 md:h-8" />
						</div>

						{/* Excerpt */}
						<div className="space-y-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-2/3" />
						</div>

						{/* Category Badge */}
						<Skeleton className="h-5 w-24 rounded-full" />
					</div>
				</div>

				{/* Image Section - Right */}
				<div className="w-full md:w-1/3">
					<div className="relative aspect-square overflow-hidden md:aspect-auto md:h-full">
						<Skeleton className="h-full w-full" />
					</div>
				</div>
			</div>
		</div>
	);
}
