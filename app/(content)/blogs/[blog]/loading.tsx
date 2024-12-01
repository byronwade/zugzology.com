export default function BlogLoading() {
	return (
		<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
			{[...Array(6)].map((_, i) => (
				<div key={i} className="animate-pulse">
					<div className="aspect-video bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-4" />
					<div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2" />
					<div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
				</div>
			))}
		</div>
	);
}
