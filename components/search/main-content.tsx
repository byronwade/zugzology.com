"use client";

import { useSearch } from "@/lib/providers/search-provider";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function MainContent({ children }: { children: React.ReactNode }) {
	const { isSearching, setSearchQuery } = useSearch();
	const pathname = usePathname();
	const lastPathname = useRef(pathname);

	// Reset search when navigating to a new page
	useEffect(() => {
		if (pathname !== lastPathname.current) {
			setSearchQuery("");
			lastPathname.current = pathname;
		}
	}, [pathname, setSearchQuery]);

	return (
		<>
			{isSearching ? (
				<div className="container mx-auto">
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{/* Search results will be rendered by the SearchProvider */}</div>
				</div>
			) : (
				children
			)}
		</>
	);
}
