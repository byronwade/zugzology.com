import Script from "next/script";
import { Skeleton } from "@/components/ui/skeleton";
import { getEnhancedOrganizationSchema, getSearchActionSchema } from "@/lib/seo/enhanced-jsonld";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";

// Add metadata for loading state
export const metadata = generateSEOMetadata({
	title: "Loading - Zugzology Premium Mushroom Growing Supplies",
	description:
		"Loading premium mushroom cultivation supplies and equipment. Please wait while we prepare your content.",
	noindex: true, // Don't index loading states
});

export default function HomeLoading() {
	// Generate basic structured data for loading state
	const websiteSchema = getSearchActionSchema();
	const organizationSchema = getEnhancedOrganizationSchema();
	return (
		<>
			{/* JSON-LD Structured Data for Loading State */}
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

			{/* Google Analytics for Loading State */}
			<Script id="loading-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'loading',
						'page_location': window.location.href,
						'content_category': 'loading_state'
					});
				`}
			</Script>

			<div className="min-h-screen">
				{/* Hero Section Skeleton */}
				<div className="w-full bg-gray-100 dark:bg-gray-900">
					<div className="container mx-auto px-4 py-12">
						<div className="flex flex-col items-center justify-center text-center">
							<Skeleton className="mb-4 h-10 w-3/4 md:w-1/2" />
							<Skeleton className="mb-2 h-6 w-5/6 md:w-2/3" />
							<Skeleton className="mb-8 h-6 w-4/6 md:w-1/2" />
							<div className="flex justify-center gap-4">
								<Skeleton className="h-10 w-32" />
								<Skeleton className="h-10 w-32" />
							</div>
						</div>
					</div>
				</div>

				{/* Featured Collections Skeleton */}
				<div className="container mx-auto px-4 py-12">
					<Skeleton className="mx-auto mb-8 h-8 w-64" />
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div className="group" key={i}>
								<div className="relative overflow-hidden rounded-lg">
									<Skeleton className="h-64 w-full" />
								</div>
								<div className="mt-2">
									<Skeleton className="h-5 w-32" />
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Best Sellers Skeleton */}
				<div className="container mx-auto px-4 py-12">
					<div className="mb-6 flex items-center justify-between md:mb-8">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-6 w-24" />
					</div>
					<div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
						{Array.from({ length: 4 }).map((_, i) => (
							<div className="group" key={i}>
								<Skeleton className="mb-3 h-64 w-full rounded-lg" />
								<Skeleton className="mb-2 h-5 w-full max-w-[180px]" />
								<Skeleton className="h-4 w-16" />
							</div>
						))}
					</div>
				</div>

				{/* Latest Products Skeleton */}
				<div className="container mx-auto px-4 py-12">
					<div className="mb-6 flex items-center justify-between md:mb-8">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-6 w-24" />
					</div>
					<div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
						{Array.from({ length: 4 }).map((_, i) => (
							<div className="group" key={i}>
								<Skeleton className="mb-3 h-64 w-full rounded-lg" />
								<Skeleton className="mb-2 h-5 w-full max-w-[180px]" />
								<Skeleton className="h-4 w-16" />
							</div>
						))}
					</div>
				</div>

				{/* Expert Resources Skeleton */}
				<div className="bg-gray-50 dark:bg-gray-900">
					<div className="container mx-auto px-4 py-12">
						<Skeleton className="mx-auto mb-8 h-8 w-80" />
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<div className="group" key={i}>
									<Skeleton className="mb-3 h-48 w-full rounded-lg" />
									<Skeleton className="mb-2 h-5 w-48" />
									<Skeleton className="h-4 w-full" />
								</div>
							))}
						</div>
					</div>
				</div>

				{/* FAQ Skeleton */}
				<div className="container mx-auto px-4 py-12">
					<Skeleton className="mx-auto mb-8 h-8 w-48" />
					<div className="mx-auto max-w-3xl">
						{Array.from({ length: 4 }).map((_, i) => (
							<div className="mb-4" key={i}>
								<Skeleton className="mb-2 h-6 w-full" />
								<Skeleton className="h-16 w-full" />
							</div>
						))}
					</div>
				</div>

				{/* Newsletter Skeleton */}
				<div className="bg-primary text-white">
					<div className="container mx-auto px-4 py-12 text-center">
						<Skeleton className="mx-auto mb-4 h-8 w-64 bg-white/20" />
						<Skeleton className="mx-auto mb-6 h-5 w-full max-w-md bg-white/20" />
						<div className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
							<Skeleton className="h-12 flex-grow bg-white/20" />
							<Skeleton className="h-12 w-32 bg-white/20" />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
