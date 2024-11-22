export function ProductSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
			<div className="space-y-4">
				<div className="aspect-square bg-gray-200 rounded-lg" />
				<div className="grid grid-cols-4 gap-2">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="aspect-square bg-gray-200 rounded-md" />
					))}
				</div>
			</div>
			<div className="space-y-6">
				<div className="h-8 bg-gray-200 rounded w-3/4" />
				<div className="h-6 bg-gray-200 rounded w-1/4" />
				<div className="space-y-4">
					<div className="h-4 bg-gray-200 rounded w-1/3" />
					<div className="grid grid-cols-3 gap-2">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="h-10 bg-gray-200 rounded" />
						))}
					</div>
				</div>
				<div className="h-12 bg-gray-200 rounded" />
				<div className="space-y-3">
					<div className="h-4 bg-gray-200 rounded w-full" />
					<div className="h-4 bg-gray-200 rounded w-full" />
					<div className="h-4 bg-gray-200 rounded w-2/3" />
				</div>
			</div>
		</div>
	);
}
