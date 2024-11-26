"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [query, setQuery] = React.useState(searchParams.get("q") ?? "");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (query) {
			router.push(`/search?q=${encodeURIComponent(query)}`);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setQuery(value);
		if (value.length > 2) {
			router.push(`/search?q=${encodeURIComponent(value)}`);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="relative w-full">
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input placeholder="Search products..." className="w-full pl-10 pr-4" value={query} onChange={handleChange} />
		</form>
	);
}
