import { Metadata } from "next";
import { jsonLdScriptProps } from "react-schemaorg";
import type { WebPage, BreadcrumbList } from "schema-dts";
import { WithContext } from "schema-dts";
import { getSiteSettings } from "@/lib/actions/shopify";

export async function generateMetadata(): Promise<Metadata> {
	const siteSettings = await getSiteSettings();
	const storeName = siteSettings?.name || "Zugzology";
	const storeUrl = siteSettings?.url || "https://zugzology.com";

	const title = `Register - Create Your Account | ${storeName}`;
	const description = `Join ${storeName} to access premium mushroom cultivation supplies, exclusive resources, and expert guidance. Create your account today.`;

	return {
		title,
		description,
		robots: {
			index: false,
			follow: true,
		},
		openGraph: {
			title: `Create Your ${storeName} Account`,
			description: "Join our community of mushroom cultivation enthusiasts. Get access to premium supplies and expert guidance.",
			type: "website",
			images: siteSettings?.images || [
				{
					url: `${storeUrl}/register-og-image.jpg`,
					width: 1200,
					height: 630,
					alt: `Register at ${storeName}`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: `Create Your ${storeName} Account`,
			description: "Join our community of mushroom cultivation enthusiasts. Get access to premium supplies and expert guidance.",
			images: siteSettings?.images?.map((img) => img.url) || [`${storeUrl}/register-twitter-image.jpg`],
		},
	};
}

export default async function RegisterLayout({ children }: { children: React.ReactNode }) {
	const siteSettings = await getSiteSettings();
	const storeName = siteSettings?.name || "Zugzology";
	const storeUrl = siteSettings?.url || "https://zugzology.com";

	// Generate structured data
	const pageStructuredData: WithContext<WebPage> = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: `Register at ${storeName}`,
		description: `Create your account to access premium mushroom cultivation supplies and resources.`,
		url: `${storeUrl}/register`,
		publisher: {
			"@type": "Organization",
			name: storeName,
			logo: {
				"@type": "ImageObject",
				url: `${storeUrl}/logo.png`,
			},
		},
	};

	const breadcrumbStructuredData: WithContext<BreadcrumbList> = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: storeUrl,
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Register",
				item: `${storeUrl}/register`,
			},
		],
	};

	return (
		<>
			<script {...jsonLdScriptProps(pageStructuredData)} />
			<script {...jsonLdScriptProps(breadcrumbStructuredData)} />
			{children}
		</>
	);
}
