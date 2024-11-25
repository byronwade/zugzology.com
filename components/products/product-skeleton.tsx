export function ProductSkeleton() {
	return (
		<div className="grid md:grid-cols-2 gap-8">
			<div className="relative aspect-square bg-gray-200 rounded-lg animate-pulse" />
			<div className="space-y-4">
				<div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
				<div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
				<div className="space-y-2">
					<div className="h-4 bg-gray-200 rounded animate-pulse" />
					<div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
					<div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
				</div>
			</div>
		</div>
	);
}
