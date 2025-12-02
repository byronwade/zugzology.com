import type { Metadata } from "next";
import Script from "next/script";
import { getEnhancedBreadcrumbSchema } from "@/lib/seo/enhanced-jsonld";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import CartContent from "./cart-content";

export const metadata: Metadata = generateSEOMetadata({
	title: "Shopping Cart - Review Your Items",
	description:
		"Review your mushroom cultivation supplies before checkout. Free shipping on orders over $75. Secure checkout with 30-day returns guaranteed.",
	keywords: [
		"shopping cart",
		"checkout",
		"mushroom supplies cart",
		"review order",
		"secure checkout",
		"free shipping",
		"cart items",
	],
	url: "/cart",
	noindex: true, // Cart pages shouldn't be indexed
	openGraph: {
		type: "website",
	},
});

export default function CartPage() {
	// Generate cart breadcrumbs
	const breadcrumbs = [
		{ name: "Home", url: "/" },
		{ name: "Shopping Cart", url: "/cart" },
	];

	const breadcrumbSchema = getEnhancedBreadcrumbSchema(breadcrumbs);

	return (
		<>
			{/* JSON-LD Structured Data */}
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
				type="application/ld+json"
			/>

			{/* Google Analytics for Cart View */}
			<Script id="cart-analytics" strategy="afterInteractive">
				{`
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            'event': 'page_view',
            'page_type': 'cart',
            'page_location': window.location.href
          });
        `}
			</Script>

			<CartContent />
		</>
	);
}
