import { Suspense } from "react";
import type { PageLayout, PageSection, PageTheme, PageWithSections } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SectionRenderer } from "./section-renderer";

type PageRendererProps = {
	page: PageWithSections;
	sections: PageSection[];
	layout: string;
	theme: string;
};

/**
 * Server Component that orchestrates page rendering
 * Handles layout variants and section rendering with Suspense boundaries
 */
export function PageRenderer({ page, sections, layout, theme }: PageRendererProps) {
	const pageLayout = layout as PageLayout;
	const pageTheme = theme as PageTheme;

	// Layout container classes
	const containerClasses = cn(
		"min-h-screen",
		// Layout variants
		pageLayout === "full-width" && "w-full",
		pageLayout === "contained" && "container mx-auto px-4",
		pageLayout === "split" && "mx-auto max-w-7xl px-4",
		// Theme variants
		pageTheme === "default" && "bg-background text-foreground",
		pageTheme === "dark" && "bg-slate-900 text-white",
		pageTheme === "accent" && "bg-primary/5"
	);

	// If no sections, render the page body as simple content
	if (!sections || sections.length === 0) {
		return (
			<div className={containerClasses}>
				<article className="prose prose-lg dark:prose-invert mx-auto py-12">
					<h1>{page.title}</h1>
					{page.body && <div dangerouslySetInnerHTML={{ __html: page.body }} />}
				</article>
			</div>
		);
	}

	// Render with dynamic sections
	return (
		<div className={containerClasses}>
			{sections.map((section, index) => (
				<Suspense fallback={<SectionSkeleton type={section.type} />} key={`${section.id}-${section.type}-${index}`}>
					<SectionRenderer layout={pageLayout} section={section} theme={pageTheme} />
				</Suspense>
			))}
		</div>
	);
}

/**
 * Simple skeleton loader for sections
 */
function SectionSkeleton({ type }: { type: string }) {
	return (
		<div className="animate-pulse py-12">
			<div className="container mx-auto px-4">
				{type === "hero" && (
					<div className="flex min-h-[60vh] items-center justify-center">
						<div className="w-full max-w-4xl space-y-4">
							<div className="h-12 w-3/4 rounded bg-muted" />
							<div className="h-6 w-1/2 rounded bg-muted" />
						</div>
					</div>
				)}
				{type === "products" && (
					<div className="grid gap-6 md:grid-cols-3">
						<div className="h-64 rounded bg-muted" />
						<div className="h-64 rounded bg-muted" />
						<div className="h-64 rounded bg-muted" />
					</div>
				)}
				{(type === "content" || type === "cta") && (
					<div className="mx-auto max-w-2xl space-y-4">
						<div className="h-8 w-1/2 rounded bg-muted" />
						<div className="h-4 w-full rounded bg-muted" />
						<div className="h-4 w-3/4 rounded bg-muted" />
					</div>
				)}
			</div>
		</div>
	);
}
