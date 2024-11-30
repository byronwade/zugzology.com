export default function ProductsLoading() {
	return (
		<div className="w-full px-4 py-8">
			<div className="animate-pulse">
				<div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{[...Array(8)].map((_, i) => (
						<div key={i} className="space-y-4">
							<div className="aspect-square bg-gray-200 rounded-lg" />
							<div className="h-4 bg-gray-200 rounded w-3/4" />
							<div className="h-4 bg-gray-200 rounded w-1/2" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
