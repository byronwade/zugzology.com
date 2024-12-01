"use client";

import { useSearch } from "@/lib/providers/search-provider";
import { SearchOverlay } from "./search-overlay";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function MainContent({ children }: { children: React.ReactNode }) {
	const { isSearching, setSearchQuery } = useSearch();
	const pathname = usePathname();
	const lastPathname = useRef(pathname);

	// Close search only when pathname actually changes
	useEffect(() => {
		if (pathname !== lastPathname.current) {
			setSearchQuery("");
			lastPathname.current = pathname;
		}
	}, [pathname, setSearchQuery]);

	return <main className="flex-1">{isSearching ? <SearchOverlay /> : children}</main>;
}
