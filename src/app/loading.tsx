import Script from "next/script";
import { BestSellersShowcaseSkeleton } from "@/components/ui/skeletons/best-sellers-showcase-skeleton";
import { FeaturedCollectionsSkeleton } from "@/components/ui/skeletons/featured-collections-skeleton";
import { HeroVideoSkeleton } from "@/components/ui/skeletons/hero-video-skeleton";
import { ProductGridSectionSkeleton } from "@/components/ui/skeletons/product-grid-section-skeleton";
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

			<div className="min-h-screen bg-background">
				<div className="space-y-0">
					{/* Video Hero Skeleton */}
					<HeroVideoSkeleton />

					{/* Trending Kits & Supplies */}
					<ProductGridSectionSkeleton productCount={5} />

					{/* Customer Favorites (Best Sellers) */}
					<ProductGridSectionSkeleton productCount={5} />

					{/* Latest Products */}
					<ProductGridSectionSkeleton productCount={5} />

					{/* Featured Collections */}
					<FeaturedCollectionsSkeleton />

					{/* Best Sellers Showcase */}
					<BestSellersShowcaseSkeleton />
				</div>
			</div>
		</>
	);
}
