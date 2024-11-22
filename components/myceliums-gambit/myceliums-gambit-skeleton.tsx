import React from "react";

export function MyceliumsGambitSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			{[...Array(6)].map((_, i) => (
				<div key={i} className="border rounded-lg overflow-hidden animate-pulse">
					<div className="aspect-[16/9] bg-gray-200" />
					<div className="p-4 space-y-3">
						<div className="h-6 bg-gray-200 rounded w-3/4" />
						<div className="h-4 bg-gray-200 rounded w-1/2" />
						<div className="h-4 bg-gray-200 rounded w-full" />
						<div className="h-4 bg-gray-200 rounded w-full" />
					</div>
				</div>
			))}
		</div>
	);
}
