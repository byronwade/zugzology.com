import React from "react";

export function MyceliumsGambitSkeleton() {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: 6 }).map((_, i) => (
				<div key={i} className="animate-pulse">
					<div className="h-48 bg-gray-200 rounded-lg mb-4" />
					<div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
					<div className="h-4 bg-gray-200 rounded w-1/2" />
				</div>
			))}
		</div>
	);
}
