"use client";

import React, { useCallback } from "react";
import { Sidebar, FilterState } from "@/components/sidebar/sidebar";
import { useRouter, useSearchParams } from "next/navigation";

export default function WithSidebarLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const handleFilterChange = useCallback(
		(filters: FilterState) => {
			const params = new URLSearchParams(searchParams.toString());

			// Update params based on filters
			Object.entries(filters).forEach(([key, value]) => {
				if (Array.isArray(value)) {
					if (value.length > 0) {
						if (key === "priceRange") {
							params.set(key, value[0].toString());
						} else {
							params.set(key, value.join(","));
						}
					} else {
						params.delete(key);
					}
				} else if (value) {
					params.set(key, value.toString());
				} else {
					params.delete(key);
				}
			});

			// Update URL with new filters
			router.replace(`?${params.toString()}`, { scroll: false });
		},
		[router, searchParams]
	);

	return (
		<div className="flex min-h-screen">
			<Sidebar className="w-64 flex-shrink-0 fixed h-full" onFilterChange={handleFilterChange} />
			<main className="flex-1 ml-64">{children}</main>
		</div>
	);
}
