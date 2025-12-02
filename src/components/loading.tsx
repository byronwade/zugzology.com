import { Skeleton } from "@/components/ui/skeleton";

export function Loading() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="space-y-4">
				<Skeleton className="h-12 w-3/4" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-5/6" />
				<Skeleton className="h-64 w-full" />
			</div>
		</div>
	);
}

export function HomeLoading() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="space-y-12">
				<Skeleton className="h-96 w-full" />
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<div className="space-y-3" key={i}>
							<Skeleton className="aspect-square w-full" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
