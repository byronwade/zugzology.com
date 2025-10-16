import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Test Page | Zugzology",
	description: "Test page to verify dynamic pages routing works",
};

/**
 * Static test page to verify the pages route is working
 * Access at: /pages/test
 */
export default function TestPage() {
	return (
		<div className="min-h-screen bg-background py-16">
			<div className="container mx-auto px-4">
				<div className="mx-auto max-w-4xl">
					<div className="mb-8 rounded-lg border border-green-500/20 bg-green-50 p-6 dark:bg-green-950/20">
						<h1 className="mb-4 font-bold text-3xl text-green-700 dark:text-green-400">✅ Pages Route Working!</h1>
						<p className="text-green-700/80 dark:text-green-400/80">
							If you can see this message, the dynamic pages route is functioning correctly.
						</p>
					</div>

					<div className="space-y-6">
						<section className="rounded-lg border bg-card p-6">
							<h2 className="mb-4 font-semibold text-xl">Next Steps</h2>
							<ol className="space-y-3 text-muted-foreground">
								<li className="flex gap-3">
									<span className="font-semibold text-foreground">1.</span>
									<span>
										Check if you have pages in Shopify: Visit{" "}
										<code className="rounded bg-muted px-2 py-1 text-sm">/api/debug/pages</code>
									</span>
								</li>
								<li className="flex gap-3">
									<span className="font-semibold text-foreground">2.</span>
									<span>
										If you see pages listed, create metaobject definitions in Shopify Admin following the setup guide in{" "}
										<code className="rounded bg-muted px-2 py-1 text-sm">docs/SHOPIFY_PAGE_BUILDER_SETUP.md</code>
									</span>
								</li>
								<li className="flex gap-3">
									<span className="font-semibold text-foreground">3.</span>
									<span>
										Configure page metafields (custom.sections, custom.layout, custom.theme) for each page you want to
										render with sections
									</span>
								</li>
								<li className="flex gap-3">
									<span className="font-semibold text-foreground">4.</span>
									<span>
										Pages without section metafields will render as simple HTML content from the page body field
									</span>
								</li>
							</ol>
						</section>

						<section className="rounded-lg border bg-card p-6">
							<h2 className="mb-4 font-semibold text-xl">Debug Tools</h2>
							<div className="space-y-3">
								<div>
									<a
										className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground transition hover:bg-primary/90"
										href="/api/debug/pages"
										rel="noopener noreferrer"
										target="_blank"
									>
										View All Pages Data
									</a>
									<p className="mt-2 text-muted-foreground text-sm">Returns JSON with all pages from Shopify API</p>
								</div>
								<div>
									<a
										className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-secondary-foreground transition hover:bg-secondary/90"
										href="/api/debug/pages?handle=privacy"
										rel="noopener noreferrer"
										target="_blank"
									>
										Test Privacy Page Data
									</a>
									<p className="mt-2 text-muted-foreground text-sm">
										Returns JSON with page data and parsed sections for the privacy page
									</p>
								</div>
							</div>
						</section>

						<section className="rounded-lg border bg-card p-6">
							<h2 className="mb-4 font-semibold text-xl">Available Section Types</h2>
							<div className="grid gap-4 md:grid-cols-2">
								<div className="rounded border bg-muted/50 p-4">
									<h3 className="mb-2 font-semibold text-sm">Hero Section</h3>
									<p className="text-muted-foreground text-xs">
										Full-width hero with heading, subheading, CTA, and background image. 3 layout variants.
									</p>
								</div>
								<div className="rounded border bg-muted/50 p-4">
									<h3 className="mb-2 font-semibold text-sm">Content Block</h3>
									<p className="text-muted-foreground text-xs">
										Rich text content with optional image. 4 image positions supported.
									</p>
								</div>
								<div className="rounded border bg-muted/50 p-4">
									<h3 className="mb-2 font-semibold text-sm">Product Carousel</h3>
									<p className="text-muted-foreground text-xs">
										Showcase products in responsive grid. Integrates with existing ProductCard component.
									</p>
								</div>
								<div className="rounded border bg-muted/50 p-4">
									<h3 className="mb-2 font-semibold text-sm">CTA Banner</h3>
									<p className="text-muted-foreground text-xs">
										Eye-catching call-to-action with 3 theme variants and 3 sizes.
									</p>
								</div>
								<div className="rounded border bg-muted/50 p-4">
									<h3 className="mb-2 font-semibold text-sm">Feature Grid</h3>
									<p className="text-muted-foreground text-xs">
										Display features with icons or images. Supports 2-4 columns.
									</p>
								</div>
							</div>
						</section>

						<section className="rounded-lg border border-blue-500/20 bg-blue-50 p-6 dark:bg-blue-950/20">
							<h2 className="mb-4 font-semibold text-blue-700 text-xl dark:text-blue-400">Documentation</h2>
							<p className="text-blue-700/80 dark:text-blue-400/80">
								For complete setup instructions, see:{" "}
								<code className="rounded bg-blue-900/10 px-2 py-1 text-sm dark:bg-blue-100/10">
									docs/SHOPIFY_PAGE_BUILDER_SETUP.md
								</code>
							</p>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
