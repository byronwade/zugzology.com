import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import { getEnhancedBreadcrumbSchema, getSearchActionSchema } from "@/lib/seo/enhanced-jsonld";
import Script from "next/script";
import Link from "next/link";
import WishlistContent from "./wishlist-content";

export const metadata: Metadata = generateSEOMetadata({
	title: "My Wishlist - Saved Products",
	description: "View and manage your saved mushroom cultivation products. Add items to cart or save for later. Keep track of your favorite growing supplies and equipment.",
	keywords: [
		"wishlist",
		"saved products",
		"favorite items",
		"product favorites",
		"saved supplies",
		"mushroom supplies wishlist",
		"cultivation equipment favorites",
		"growing supplies saved"
	],
	url: "/wishlist",
	noindex: true, // Wishlist pages are personal and shouldn't be indexed
	openGraph: {
		type: "website",
	},
});

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
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteSchema),
				}}
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
				<nav className="px-4 pt-4" aria-label="Breadcrumb">
					<ol className="flex items-center space-x-2 text-sm text-gray-600">
						<li>
							<Link href="/" className="hover:text-gray-900">Home</Link>
						</li>
						<li className="text-gray-400">/</li>
						<li className="text-gray-900 font-medium">My Wishlist</li>
					</ol>
				</nav>
				
				<WishlistContent />
			</div>
		</>
	);
}
