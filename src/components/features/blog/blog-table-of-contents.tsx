"use client";

import { BookOpen, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type TableOfContentsProps = {
	contentHtml: string;
};

type Heading = {
	id: string;
	text: string;
	level: number;
};

export function BlogTableOfContents({ contentHtml }: TableOfContentsProps) {
	const [headings, setHeadings] = useState<Heading[]>([]);
	const [activeId, setActiveId] = useState<string>("");
	const [isExpanded, setIsExpanded] = useState(false);
	const observerRef = useRef<IntersectionObserver | null>(null);
	const processedInitialHash = useRef(false);

	// Parse HTML and extract headings when the component mounts
	useEffect(() => {
		if (!contentHtml) {
			return;
		}

		// Parse and extract headings from the HTML content
		const parser = new DOMParser();
		const doc = parser.parseFromString(contentHtml, "text/html");
		const headingElements = doc.querySelectorAll("h2, h3");

		const extractedHeadings: Heading[] = [];

		headingElements.forEach((element) => {
			// Get or create an ID for the heading
			const text = element.textContent?.trim() || "";
			const id =
				element.id ||
				text
					.toLowerCase()
					.replace(/[^\w\s-]/g, "")
					.replace(/\s+/g, "-");

			if (id && text) {
				extractedHeadings.push({
					id,
					text,
					level: Number.parseInt(element.tagName.substring(1), 10),
				});
			}
		});

		setHeadings(extractedHeadings);

		// Expand the TOC if there's a hash in the URL
		if (window.location.hash) {
			setIsExpanded(true);
		}
	}, [contentHtml]);

	// Custom click handler for anchor links
	const handleHeadingClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
		e.preventDefault();
		setIsExpanded(true);

		// Find target element - try with exact ID first
		let targetElement = document.getElementById(id);

		// If not found with exact ID, try to find the heading by text content in the DOM
		if (!targetElement) {
			// Get all headings in the blog content
			const heading = headings.find((h) => h.id === id);
			if (heading) {
				const contentHeadings = document.querySelectorAll(".blog-content h2, .blog-content h3, .blog-content h4");

				// Find heading with matching text content
				for (let i = 0; i < contentHeadings.length; i++) {
					const element = contentHeadings[i] as HTMLElement;
					if (element.textContent?.trim() === heading.text) {
						// If found but no ID, set the ID
						if (!element.id) {
							element.id = id;
						}
						targetElement = element;
						break;
					}
				}
			}
		}

		// Scroll to the element if found
		if (targetElement) {
			// Calculate position with offset
			const headerOffset = 100;
			const elementPosition = targetElement.getBoundingClientRect().top;
			const offsetPosition = elementPosition + window.scrollY - headerOffset;

			// Scroll to the element
			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});

			// Update URL and active ID
			history.pushState(null, "", `#${id}`);
			setActiveId(id);
		} else {
		}
	};

	// Set up intersection observer to track active headings
	useEffect(() => {
		if (headings.length === 0) {
			return;
		}

		// Check if we need to set an initial active ID from the URL hash
		if (!processedInitialHash.current && window.location.hash) {
			const hash = window.location.hash.substring(1);
			const matchingHeading = headings.find((h) => h.id === hash);
			if (matchingHeading) {
				setActiveId(hash);
				setIsExpanded(true);
			}
			processedInitialHash.current = true;
		}

		// Clean up previous observer
		if (observerRef.current) {
			observerRef.current.disconnect();
		}

		// Create a new observer
		observerRef.current = new IntersectionObserver(
			(entries) => {
				// Only process if user is not actively scrolling
				if (document.documentElement.classList.contains("scrolling")) {
					return;
				}

				// Get all intersecting entries
				const intersectingEntries = entries.filter((entry) => entry.isIntersecting);

				if (intersectingEntries.length > 0) {
					// Find the one closest to the top
					const topEntry = intersectingEntries.reduce((prev, curr) =>
						prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
					);

					const newActiveId = topEntry.target.id;

					// Only update if active ID has changed
					if (newActiveId !== activeId) {
						setActiveId(newActiveId);

						// Update URL without scrolling
						if (!document.documentElement.classList.contains("scrolling")) {
							history.replaceState(null, "", `#${newActiveId}`);
						}
					}
				}
			},
			{ rootMargin: "-80px 0px -70%", threshold: 0.1 }
		);

		// Find and observe all headings in the actual page content
		setTimeout(() => {
			headings.forEach((heading) => {
				// First try to find by ID
				let element = document.getElementById(heading.id);

				// If not found by ID, try to find by text content
				if (!element) {
					const contentHeadings = document.querySelectorAll(".blog-content h2, .blog-content h3, .blog-content h4");

					for (let i = 0; i < contentHeadings.length; i++) {
						const headingElement = contentHeadings[i] as HTMLElement;
						if (headingElement.textContent?.trim() === heading.text) {
							// Set ID if not already set
							if (!headingElement.id) {
								headingElement.id = heading.id;
							}
							element = headingElement;
							break;
						}
					}
				}

				// Observe the element if found
				if (element) {
					observerRef.current?.observe(element);
				}
			});
		}, 500); // Longer delay to ensure DOM is ready

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [headings, activeId]);

	if (headings.length === 0) {
		return null;
	}

	return (
		<div className="blog-table-of-contents" data-orientation="vertical" data-state={isExpanded ? "open" : "closed"}>
			<h3 className="flex" data-orientation="vertical" data-state={isExpanded ? "open" : "closed"}>
				<button
					className="flex flex-1 items-center justify-between text-left font-medium text-sm transition-all hover:no-underline [&[data-state=open]>svg]:rotate-180"
					onClick={() => setIsExpanded(!isExpanded)}
					type="button"
				>
					<div className="flex items-center">
						<BookOpen className="mr-2 h-5 w-5 text-primary" />
						<span className="font-semibold">Table of Contents</span>
					</div>
					<ChevronDown
						className={cn(
							"h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
							isExpanded && "rotate-180"
						)}
					/>
				</button>
			</h3>
			<div
				className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
				data-state={isExpanded ? "open" : "closed"}
			>
				{isExpanded && (
					<div className="px-4 py-3">
						<ul className="space-y-2.5">
							{headings.map((heading) => (
								<li key={heading.id}>
									<a
										className={cn(
											"block text-sm transition-colors duration-200",
											heading.level === 2 ? "pl-0" : "pl-4",
											activeId === heading.id
												? "font-medium text-primary"
												: "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
										)}
										href={`#${heading.id}`}
										onClick={(e) => handleHeadingClick(e, heading.id)}
									>
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
