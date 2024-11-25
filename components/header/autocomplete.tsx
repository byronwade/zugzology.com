"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";

interface AutocompleteProps {
	onSearch: (query: string) => void;
	onSearchSubmit: (query: string) => void;
}

const mockSuggestions = [
	{ id: 1, term: "mushroom growing kit", category: "Kits" },
	{ id: 2, term: "mushroom substrate", category: "Supplies" },
	{ id: 3, term: "mushroom spores", category: "Spores" },
	{ id: 4, term: "mushroom cultivation book", category: "Books" },
	{ id: 5, term: "mushroom log inoculation tool", category: "Tools" },
	{ id: 6, term: "mushroom supplement", category: "Supplements" },
	{ id: 7, term: "mushroom fruiting chamber", category: "Equipment" },
];

export function Autocomplete({ onSearch, onSearchSubmit }: AutocompleteProps) {
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<typeof mockSuggestions>([]);
	const [isOpen, setIsOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const suggestionRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		if (query.length > 0) {
			const filteredSuggestions = mockSuggestions.filter((item) => item.term.toLowerCase().includes(query.toLowerCase()));
			setSuggestions(filteredSuggestions);
			setIsOpen(filteredSuggestions.length > 0);
			onSearch(query);
		} else {
			setSuggestions([]);
			setIsOpen(false);
		}
	}, [query, onSearch]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onSearchSubmit(query);
		setIsOpen(false);
	};

	return (
		<form onSubmit={handleSubmit} className="relative w-full">
			<div className="relative">
				<Input ref={inputRef} type="text" value={query} onChange={handleInputChange} placeholder="Search Zugzology..." className="w-full pr-10 h-8" onFocus={() => setIsOpen(true)} />
				<button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
					<Search className="h-4 w-4 text-gray-400" />
				</button>
			</div>
			{isOpen && suggestions.length > 0 && (
				<div ref={suggestionRef} className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg h-8">
					{suggestions.map((item) => (
						<Link
							prefetch={true}
							key={item.id}
							href={`/?q=${encodeURIComponent(item.term)}`}
							className="flex items-center px-4 py-2 hover:bg-gray-100"
							onClick={() => {
								setQuery(item.term);
								setIsOpen(false);
								onSearch(item.term);
							}}
						>
							<Search className="h-4 w-4 mr-2 text-gray-400" />
							<span className="flex-grow">{item.term}</span>
							<span className="text-sm text-gray-500">{item.category}</span>
						</Link>
					))}
				</div>
			)}
		</form>
	);
}
