export function ProductsSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			{Array.from({ length: 6 }).map((_, i) => (
				<div key={i} className="animate-pulse">
					<div className="h-64 bg-gray-200 rounded-lg mb-4" />
					<div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
					<div className="h-4 bg-gray-200 rounded w-1/2" />
				</div>
			))}
		</div>
	);
}
