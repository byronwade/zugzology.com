import Script from "next/script";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogCardSkeleton } from "@/components/ui/skeletons/blog-card-skeleton";
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
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteSchema),
				}}
				type="application/ld+json"
			/>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
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

			<div className="min-h-screen w-full bg-background">
				<div className="container mx-auto px-4 py-12">
					{/* Breadcrumb Skeleton */}
					<div className="mb-4 hidden md:block">
						<Skeleton className="h-5 w-64" />
					</div>

					{/* Hero Section Skeleton */}
					<section className="w-full py-12">
						<div className="w-full">
							<div className="mb-16 text-center">
								<Skeleton className="mx-auto mb-6 h-14 w-3/4 max-w-2xl md:h-16 lg:h-20" />
								<Skeleton className="mx-auto h-6 w-full max-w-3xl md:h-7" />
								<Skeleton className="mx-auto mt-2 h-6 w-5/6 max-w-3xl md:h-7" />
							</div>
						</div>
					</section>

					{/* Featured Posts Section Skeleton */}
					<section className="mb-16 w-full">
						<div className="w-full">
							<div className="mb-10 flex items-center justify-between">
								<Skeleton className="h-9 w-56" />
							</div>
							<div className="grid gap-8 md:grid-cols-3">
								{[...new Array(3)].map((_, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: Loading skeleton - static placeholder
									<div className="group block overflow-hidden rounded-xl bg-card shadow-sm" key={i}>
										<div className="flex h-full flex-col">
											{/* Image */}
											<div className="relative aspect-[16/9] overflow-hidden">
												<Skeleton className="h-full w-full" />
												<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
												<div className="absolute bottom-0 p-4">
													<Skeleton className="h-5 w-20 rounded-full" />
												</div>
											</div>
											{/* Content */}
											<div className="flex flex-grow flex-col p-5">
												<div className="space-y-2">
													<Skeleton className="h-6 w-full" />
													<Skeleton className="h-6 w-3/4" />
												</div>
												<div className="mt-2 mb-4 space-y-2">
													<Skeleton className="h-4 w-full" />
													<Skeleton className="h-4 w-full" />
													<Skeleton className="h-4 w-2/3" />
												</div>
												<div className="mt-auto border-neutral-200 border-t pt-2 dark:border-neutral-700">
													<Skeleton className="h-4 w-48" />
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</section>

					{/* All Posts Section Skeleton */}
					<section className="mb-16 w-full">
						<div className="w-full">
							<div className="mb-10 flex items-center justify-between">
								<div className="space-y-2">
									<Skeleton className="h-9 w-40" />
									<Skeleton className="h-5 w-64" />
								</div>
							</div>

							<div className="space-y-8">
								{[...new Array(6)].map((_, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: Loading skeleton - static placeholder
									<BlogCardSkeleton key={i} />
								))}
							</div>
						</div>
					</section>

					{/* Featured Products Section Skeleton */}
					<section className="my-16 w-full bg-muted/50">
						<div className="container mx-auto px-4 py-12">
							<div className="mb-10 text-center">
								<Skeleton className="mx-auto mb-3 h-9 w-64" />
								<Skeleton className="mx-auto h-5 w-full max-w-2xl" />
							</div>
							<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
								{[...new Array(4)].map((_, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: Loading skeleton - static placeholder
									<div className="overflow-hidden rounded-lg bg-card shadow-sm" key={i}>
										<div className="relative aspect-square">
											<Skeleton className="h-full w-full" />
										</div>
										<div className="space-y-2 p-4">
											<Skeleton className="h-5 w-full" />
											<Skeleton className="h-4 w-20" />
										</div>
									</div>
								))}
							</div>
							<div className="mt-10 text-center">
								<Skeleton className="mx-auto h-10 w-40 rounded-full" />
							</div>
						</div>
					</section>
				</div>
			</div>
		</>
	);
}
