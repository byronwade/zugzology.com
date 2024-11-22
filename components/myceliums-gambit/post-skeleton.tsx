export function PostSkeleton() {
	return (
		<div className="max-w-3xl mx-auto animate-pulse">
			<div className="aspect-[21/9] bg-gray-200 rounded-lg mb-8" />
			<div className="space-y-4">
				<div className="h-12 bg-gray-200 rounded w-3/4" />
				<div className="h-4 bg-gray-200 rounded w-1/4" />
				<div className="space-y-3 mt-8">
					<div className="h-4 bg-gray-200 rounded w-full" />
					<div className="h-4 bg-gray-200 rounded w-full" />
					<div className="h-4 bg-gray-200 rounded w-2/3" />
				</div>
			</div>
		</div>
	);
}
