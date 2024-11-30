"use client";

import React from "react";

interface SortSelectProps {
	onSort: (value: string) => void;
}

export function SortSelect({ onSort }: SortSelectProps) {
	return (
		<div className="flex items-center gap-2">
			<label htmlFor="sort" className="text-sm">
				Sort by:
			</label>
			<select id="sort" className="rounded-md border border-gray-300 py-1 pl-3 pr-10 text-sm" defaultValue="featured" onChange={(e) => onSort(e.target.value)}>
				<option value="featured">Featured</option>
				<option value="newest">Newest</option>
				<option value="price-asc">Price: Low to High</option>
				<option value="price-desc">Price: High to Low</option>
			</select>
		</div>
	);
}
