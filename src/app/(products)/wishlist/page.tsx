import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { UniversalBreadcrumb } from "@/components/layout/universal-breadcrumb";
import { ProgressiveSectionsManager } from "@/components/features/products/sections/progressive-sections-manager";
import { getEnhancedBreadcrumbSchema, getSearchActionSchema } from "@/lib/seo/enhanced-jsonld";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import type { ShopifyProduct } from "@/lib/types";
import WishlistContent from "./wishlist-content";

export const metadata: Metadata = generateSEOMetadata({
	title: "My Wishlist - Saved Products",
	description:
		"View and manage your saved mushroom cultivation products. Add items to cart or save for later. Keep track of your favorite growing supplies and equipment.",
	keywords: [
		"wishlist",
		"saved products",
		"favorite items",
		"product favorites",
		"saved supplies",
		"mushroom supplies wishlist",
		"cultivation equipment favorites",
		"growing supplies saved",
	],
	url: "/wishlist",
	noindex: true, // Wishlist pages are personal and shouldn't be indexed
	openGraph: {
		type: "website",
	},
});

// Create a placeholder product for general recommendations
// Using static date to avoid prerendering issues
const placeholderProduct: ShopifyProduct = {
	id: "wishlist-general",
	handle: "wishlist-general",
	title: "Wishlist Recommendations",
	description: "",
	descriptionHtml: "",
	productType: "",
	vendor: "",
	tags: [],
	publishedAt: "2024-01-01T00:00:00Z",
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
	availableForSale: true,
	totalInventory: 0,
	options: [],
	variants: {
		nodes: [],
	},
	images: {
		nodes: [],
	},
	priceRange: {
		minVariantPrice: {
			amount: "0",
			currencyCode: "USD",
		},
		maxVariantPrice: {
			amount: "0",
			currencyCode: "USD",
		},
	},
	compareAtPriceRange: {
		minVariantPrice: {
			amount: "0",
			currencyCode: "USD",
		},
		maxVariantPrice: {
			amount: "0",
			currencyCode: "USD",
		},
	},
	seo: {
		title: "",
		description: "",
	},
	featuredImage: null,
	collections: {
		nodes: [],
	},
} as ShopifyProduct;

export default function WishlistPage() {
	// Generate structured data
	const breadcrumbs = [
		{ name: "Home", url: "/" },
		{ name: "My Wishlist", url: "/wishlist" },
	];

	const breadcrumbSchema = getEnhancedBreadcrumbSchema(breadcrumbs);
	const websiteSchema = getSearchActionSchema();

	return (
		<>
			{/* JSON-LD Structured Data */}
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
				type="application/ld+json"
			/>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteSchema),
				}}
				type="application/ld+json"
			/>

			{/* Google Analytics for Wishlist */}
			<Script id="wishlist-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'wishlist',
						'page_location': window.location.href,
						'content_category': 'user_account'
					});
				`}
			</Script>

			<div className="w-full">
				{/* Breadcrumb Navigation */}
				<UniversalBreadcrumb items={breadcrumbs} />

				<WishlistContent />

				{/* Product Recommendations Sections */}
				<div className="border-t bg-muted/20">
					<div className="container mx-auto px-4 py-16">
						<Suspense
							fallback={
								<div className="py-12">
									<div className="mx-auto mb-4 h-8 w-48 animate-pulse rounded bg-muted" />
									<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
										{Array.from({ length: 5 }).map((_, i) => (
											<div className="space-y-3" key={i}>
												<div className="aspect-square animate-pulse rounded-xl bg-muted" />
												<div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
												<div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
											</div>
										))}
									</div>
								</div>
							}
						>
							<ProgressiveSectionsManager product={placeholderProduct} relatedProducts={[]} />
						</Suspense>
					</div>
				</div>
			</div>
		</>
	);
}
