import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for dynamic pages
 * Shows a clean loading state while page content is being fetched
 */
export default function PageLoading() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero skeleton */}
			<div className="relative h-[60vh] w-full overflow-hidden bg-muted">
				<Skeleton className="h-full w-full" />
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="container mx-auto px-4">
						<Skeleton className="mx-auto h-12 w-3/4 max-w-2xl" />
						<Skeleton className="mx-auto mt-4 h-6 w-1/2" />
					</div>
				</div>
			</div>

			{/* Content sections skeleton */}
			<div className="container mx-auto px-4 py-12">
				<div className="space-y-12">
					{/* Section 1 */}
					<div>
						<Skeleton className="mx-auto mb-4 h-8 w-1/3" />
						<Skeleton className="mx-auto mb-8 h-4 w-1/2" />
						<div className="grid gap-6 md:grid-cols-3">
							<Skeleton className="h-64 w-full" />
							<Skeleton className="h-64 w-full" />
							<Skeleton className="h-64 w-full" />
						</div>
					</div>

					{/* Section 2 */}
					<div>
						<Skeleton className="mx-auto mb-4 h-8 w-1/3" />
						<Skeleton className="mx-auto mb-8 h-4 w-1/2" />
						<div className="grid gap-6 md:grid-cols-2">
							<Skeleton className="h-96 w-full" />
							<Skeleton className="h-96 w-full" />
						</div>
					</div>

					{/* Section 3 */}
					<div>
						<Skeleton className="mx-auto mb-4 h-8 w-1/3" />
						<div className="grid gap-6 md:grid-cols-4">
							<Skeleton className="h-48 w-full" />
							<Skeleton className="h-48 w-full" />
							<Skeleton className="h-48 w-full" />
							<Skeleton className="h-48 w-full" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
