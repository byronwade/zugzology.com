export function ProductsSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			{[...Array(6)].map((_, i) => (
				<div key={i} className="border p-4 space-y-4 animate-pulse">
					<div className="aspect-square bg-gray-200" />
					<div className="h-4 bg-gray-200 rounded w-3/4" />
					<div className="h-4 bg-gray-200 rounded w-1/4" />
				</div>
			))}
		</div>
	);
}
