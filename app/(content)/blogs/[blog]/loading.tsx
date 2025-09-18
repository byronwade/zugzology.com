import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import { getSearchActionSchema, getEnhancedOrganizationSchema } from "@/lib/seo/enhanced-jsonld";
import Script from "next/script";

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
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteSchema),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(organizationSchema),
				}}
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
				{[...Array(6)].map((_, i) => (
					<div key={i} className="animate-pulse">
						<div className="aspect-video bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-4" />
						<div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2" />
						<div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
					</div>
				))}
			</div>
		</>
	);
}
