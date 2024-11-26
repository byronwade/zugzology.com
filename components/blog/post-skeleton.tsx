export function PostSkeleton() {
	return (
		<div className="max-w-3xl mx-auto animate-pulse">
			<div className="h-96 bg-gray-200 rounded-lg mb-8" />
			<div className="h-12 bg-gray-200 rounded w-3/4 mb-4" />
			<div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
			<div className="space-y-4">
				<div className="h-4 bg-gray-200 rounded w-full" />
				<div className="h-4 bg-gray-200 rounded w-5/6" />
				<div className="h-4 bg-gray-200 rounded w-4/6" />
			</div>
		</div>
	);
}
