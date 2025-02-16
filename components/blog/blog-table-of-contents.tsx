"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableOfContentsProps {
	contentHtml: string;
}

interface Heading {
	id: string;
	text: string;
	level: number;
}

export function BlogTableOfContents({ contentHtml }: TableOfContentsProps) {
	const [headings, setHeadings] = useState<Heading[]>([]);
	const [activeId, setActiveId] = useState<string>("");
	const [isExpanded, setIsExpanded] = useState(false);

	useEffect(() => {
		// Create a temporary div to parse HTML content
		const div = document.createElement("div");
		div.innerHTML = contentHtml;

		// Extract headings (h2 and h3)
		const headingElements = div.querySelectorAll("h2, h3");
		const extractedHeadings: Heading[] = Array.from(headingElements).map((heading) => {
			const text = heading.textContent || "";
			const id = heading.id || text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

			// Find and update the actual heading in the content
			const contentHeadings = document.querySelectorAll(`h${heading.tagName[1]}`);
			const matchingHeading = Array.from(contentHeadings).find((h) => h.textContent === text);
			if (matchingHeading && !matchingHeading.id) {
				matchingHeading.id = id;
			}

			return {
				id,
				text,
				level: parseInt(heading.tagName[1]),
			};
		});

		setHeadings(extractedHeadings);
	}, [contentHtml]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
						// Update URL hash without scrolling
						history.replaceState(null, "", `#${entry.target.id}`);
					}
				});
			},
			{ rootMargin: "-100px 0px -66%" }
		);

		headings.forEach((heading) => {
			const element = document.getElementById(heading.id);
			if (element) {
				observer.observe(element);
			}
		});

		return () => observer.disconnect();
	}, [headings]);

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
		e.preventDefault();
		const element = document.getElementById(id);
		if (element) {
			const yOffset = -100; // Adjust based on your header height
			const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
			window.scrollTo({ top: y, behavior: "smooth" });
			// Update URL hash after scrolling
			history.pushState(null, "", `#${id}`);
		}
	};

	if (headings.length === 0) return null;

	return (
		<div data-orientation="vertical" data-state={isExpanded ? "open" : "closed"}>
			<h3 data-orientation="vertical" data-state={isExpanded ? "open" : "closed"} className="flex">
				<button type="button" onClick={() => setIsExpanded(!isExpanded)} className="flex flex-1 items-center justify-between text-sm font-medium transition-all text-left [&[data-state=open]>svg]:rotate-180 px-4 py-2 hover:no-underline">
					<div className="flex items-center">
						<BookOpen className="h-5 w-5 mr-2 text-primary" />
						<span className="font-semibold">Table of Contents</span>
					</div>
					<ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
				</button>
			</h3>
			<div data-state={isExpanded ? "open" : "closed"} className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
				{isExpanded && (
					<div className="px-4 py-3">
						<ul className="space-y-2.5">
							{headings.map((heading) => (
								<li key={heading.id}>
									<a href={`#${heading.id}`} className={cn("block text-sm transition-colors duration-200", heading.level === 2 ? "pl-0" : "pl-4", activeId === heading.id ? "text-purple-600 dark:text-purple-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300")} onClick={(e) => handleClick(e, heading.id)}>
										{heading.text}
									</a>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}
