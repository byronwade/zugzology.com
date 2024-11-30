"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function FilterSidebar() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const handleFilter = (key: string, value: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set(key, value);
		router.push(`${pathname}?${params.toString()}`);
	};

	return (
		<aside className="w-64 flex-shrink-0">
			<div className="sticky top-20 space-y-6">
				<div>
					<h3 className="text-sm font-medium mb-4">Categories</h3>
					{/* Add your filter controls here */}
				</div>

				<div>
					<h3 className="text-sm font-medium mb-4">Price Range</h3>
					{/* Add price range controls */}
				</div>
			</div>
		</aside>
	);
}
