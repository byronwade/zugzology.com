"use server";

import type { PageMetaobject, PageSection, PageWithSections } from "@/lib/types";
import { shopifyFetch } from "./client";
import { GET_ALL_PAGES, GET_PAGE_BY_HANDLE } from "./queries/page";

/**
 * Parse metaobject fields into typed section settings
 */
function parseMetaobjectToSection(metaobject: PageMetaobject, priority: number): PageSection | null {
	if (!(metaobject?.type && metaobject.fields)) {
		return null;
	}

	// Extract section type from metaobject type (e.g., "hero_section" -> "hero")
	const sectionType = metaobject.type.replace("_section", "").toLowerCase();

	// Convert fields array to settings object
	const settings: Record<string, unknown> = {};

	for (const field of metaobject.fields) {
		const { key, value, reference, references } = field;

		// Handle different field types
		if (references?.nodes && references.nodes.length > 0) {
			// List of references (e.g., products, images)
			settings[key] = references.nodes;
		} else if (reference) {
			// Single reference
			settings[key] = reference;
		} else {
			// Parse JSON if it's a complex value, otherwise use as-is
			try {
				settings[key] = value ? JSON.parse(value) : value;
			} catch {
				settings[key] = value;
			}
		}
	}

	return {
		id: metaobject.id,
		type: sectionType as PageSection["type"],
		priority,
		settings,
	};
}

/**
 * Parse page metafields to extract sections, layout, and theme
 */
function parsePageMetafields(metafields?: PageWithSections["metafields"]): {
	sections: PageSection[];
	layout: string;
	theme: string;
} {
	const sections: PageSection[] = [];
	let layout = "contained";
	let theme = "default";

	if (!metafields) {
		return { sections, layout, theme };
	}

	for (const metafield of metafields) {
		// Skip null or undefined metafields
		if (!metafield) {
			continue;
		}

		switch (metafield.key) {
			case "sections":
				// Sections is a list of metaobject references
				if (metafield.references?.nodes) {
					for (let i = 0; i < metafield.references.nodes.length; i++) {
						const section = parseMetaobjectToSection(metafield.references.nodes[i], i + 1);
						if (section) {
							sections.push(section);
						}
					}
				}
				break;
			case "layout":
				layout = metafield.value || "contained";
				break;
			case "theme":
				theme = metafield.value || "default";
				break;
		}
	}

	// Sort sections by priority
	sections.sort((a, b) => a.priority - b.priority);

	return { sections, layout, theme };
}

/**
 * Get a single page by handle with all sections
 * Cached with 5 minute revalidation
 */
export async function getPageByHandle(handle: string): Promise<{
	page: PageWithSections | null;
	sections: PageSection[];
	layout: string;
	theme: string;
}> {
	try {
		const { data } = await shopifyFetch<{ page: PageWithSections }>({
			query: GET_PAGE_BY_HANDLE,
			variables: { handle },
			tags: [`page:${handle}`],
			next: { revalidate: 300 }, // 5 minutes
		});

		if (!data.page) {
			return {
				page: null,
				sections: [],
				layout: "contained",
				theme: "default",
			};
		}

		const { sections, layout, theme } = parsePageMetafields(data.page.metafields);

		return {
			page: data.page,
			sections,
			layout,
			theme,
		};
	} catch (_error) {
		return {
			page: null,
			sections: [],
			layout: "contained",
			theme: "default",
		};
	}
}

/**
 * Get all pages for static params generation
 * Returns basic page info
 */
export async function getAllPages(): Promise<
	Array<{
		handle: string;
		title: string;
		updatedAt: string;
	}>
> {
	try {
		const pages: Array<{ handle: string; title: string; updatedAt: string }> = [];
		let hasNextPage = true;
		let cursor: string | null = null;

		// Fetch all pages using pagination
		while (hasNextPage) {
			const { data } = await shopifyFetch<{
				pages: {
					pageInfo: { hasNextPage: boolean; endCursor: string };
					nodes: Array<{ handle: string; title: string; updatedAt: string }>;
				};
			}>({
				query: GET_ALL_PAGES,
				variables: {
					first: 100,
					after: cursor,
				},
				tags: ["pages"],
				next: { revalidate: 600 }, // 10 minutes
			});

			if (data.pages?.nodes) {
				pages.push(...data.pages.nodes);
			}

			hasNextPage = data.pages?.pageInfo?.hasNextPage;
			cursor = data.pages?.pageInfo?.endCursor || null;
		}

		return pages;
	} catch (_error) {
		return [];
	}
}

/**
 * Get page handles for the top N most important pages for ISR
 * Returns array of handles to prerender
 */
export async function getTopPageHandles(limit = 100): Promise<string[]> {
	try {
		const allPages = await getAllPages();

		// Sort by most recently updated (assuming these are more important)
		const sortedPages = allPages.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

		return sortedPages.slice(0, limit).map((page) => page.handle);
	} catch (_error) {
		return [];
	}
}
