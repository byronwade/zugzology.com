import Script from "next/script";
import { getEnhancedOrganizationSchema, getSearchActionSchema } from "@/lib/seo/enhanced-jsonld";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";

// Add metadata for blog loading state
export const metadata = generateSEOMetadata({
	title: "Loading Blog Articles - Mushroom Cultivation Guides",
	description: "Loading expert mushroom cultivation articles and guides. Please wait while we prepare your content.",
	noindex: true, // Don't index loading states
});

export default function BlogLoading() {
	// Generate basic structured data for loading state
	const websiteSchema = getSearchActionSchema();
	const organizationSchema = getEnhancedOrganizationSchema();

	return (
		<>
			{/* JSON-LD Structured Data for Blog Loading State */}
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteSchema),
				}}
				type="application/ld+json"
			/>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(organizationSchema),
				}}
				type="application/ld+json"
			/>

			{/* Google Analytics for Blog Loading State */}
			<Script id="blog-loading-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'blog_loading',
						'page_location': window.location.href,
						'content_category': 'loading_state'
					});
				`}
			</Script>

			<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				{[...new Array(6)].map((_, i) => (
					<div className="animate-pulse" key={i}>
						<div className="mb-4 aspect-video rounded-lg bg-neutral-200 dark:bg-neutral-700" />
						<div className="mb-2 h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
						<div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
					</div>
				))}
			</div>
		</>
	);
}
