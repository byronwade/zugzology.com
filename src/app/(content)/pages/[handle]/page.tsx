import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/features/pages/page-renderer";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { getPageByHandle } from "@/lib/api/shopify/page-actions";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";

export type PageProps = {
	params: { handle: string };
};

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	try {
		const { handle } = await params;
		const { page } = await getPageByHandle(handle);

		if (!page) {
			return {
				title: "Page Not Found | Zugzology",
				description: "The requested page could not be found.",
				robots: { index: false, follow: true },
			};
		}

		const title = page.seo?.title || page.title;
		const description = page.seo?.description || page.bodySummary || `Learn more about ${page.title}`;

		return generateSEOMetadata({
			title,
			description,
			url: `/pages/${handle}`,
			openGraph: {
				type: "website",
				siteName: "Zugzology",
			},
		});
	} catch (_error) {
		return {
			title: "Zugzology",
			description: "Premium mushroom cultivation supplies",
		};
	}
}

/**
 * Generate static params for ISR
 * Prebuilds the top 100 most recently updated pages
 *
 * DISABLED: Causing 404 prerendering issues with cacheComponents
 */
// export async function generateStaticParams(): Promise<Array<{ handle: string }>> {
// 	try {
// 		const pages = await getAllPages();

// 		// Sort by most recently updated and take top 100
// 		const sortedPages = pages
// 			.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
// 			.slice(0, 100);

// 		return sortedPages.map((page) => ({
// 			handle: page.handle,
// 		}));
// 	} catch (error) {
// 		console.error("[generateStaticParams] Error:", error);
// 		return [];
// 	}
// }

/**
 * Error fallback component
 */
function PageError() {
	return (
		<div className="flex min-h-[50vh] w-full items-center justify-center">
			<div className="text-center">
				<h2 className="mb-2 font-semibold text-xl">Something went wrong</h2>
				<p className="text-muted-foreground">Unable to load page content</p>
				<a className="mt-4 inline-block text-primary hover:underline" href="/">
					Return to Home
				</a>
			</div>
		</div>
	);
}

/**
 * Dynamic page route component
 * Renders pages configured in Shopify with dynamic sections
 */
export default async function DynamicPage({ params }: PageProps) {
	try {
		const { handle } = await params;
		const { page, sections, layout, theme } = await getPageByHandle(handle);

		if (!page) {
			notFound();
		}

		// Generate structured data for the page
		const structuredData = {
			"@context": "https://schema.org",
			"@type": "WebPage",
			"@id": `https://zugzology.com/pages/${handle}`,
			url: `https://zugzology.com/pages/${handle}`,
			name: page.title,
			description: page.bodySummary || page.body.substring(0, 160),
			inLanguage: "en-US",
			datePublished: page.createdAt,
			dateModified: page.updatedAt,
			publisher: {
				"@type": "Organization",
				name: "Zugzology",
				url: "https://zugzology.com",
			},
			breadcrumb: {
				"@type": "BreadcrumbList",
				"@id": `https://zugzology.com/pages/${handle}#breadcrumb`,
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Home",
						item: "https://zugzology.com",
					},
					{
						"@type": "ListItem",
						position: 2,
						name: page.title,
						item: `https://zugzology.com/pages/${handle}`,
					},
				],
			},
		};

		return (
			<ErrorBoundary fallback={<PageError />}>
				{/* JSON-LD Structured Data */}
				<script
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData),
					}}
					type="application/ld+json"
				/>

				{/* Render the page with dynamic sections */}
				<PageRenderer layout={layout} page={page} sections={sections} theme={theme} />
			</ErrorBoundary>
		);
	} catch (_error) {
		return <PageError />;
	}
}
