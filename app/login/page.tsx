import { Suspense } from "react";
import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { jsonLdScriptProps } from "react-schemaorg";
import type { WebPage, BreadcrumbList } from "schema-dts";
import { WithContext } from "schema-dts";
import { getSiteSettings } from "@/lib/actions/shopify";

export async function generateMetadata(): Promise<Metadata> {
	const siteSettings = await getSiteSettings();
	const storeName = siteSettings?.name || "Zugzology";
	const storeUrl = siteSettings?.url || "https://zugzology.com";

	const title = `Login - Access Your Account | ${storeName}`;
	const description = `Sign in to your ${storeName} account to manage your orders, track shipments, and access exclusive mushroom cultivation resources.`;

	return {
		title,
		description,
		robots: {
			index: false,
			follow: true,
			nocache: true,
			googleBot: {
				index: false,
				follow: true,
			},
		},
		openGraph: {
			title: `Login to Your ${storeName} Account`,
			description: "Access your account to manage orders and track shipments.",
			type: "website",
			images: siteSettings?.images || [
				{
					url: `${storeUrl}/login-og-image.jpg`,
					width: 1200,
					height: 630,
					alt: `${storeName} Login`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: `Login to Your ${storeName} Account`,
			description: "Access your account to manage orders and track shipments.",
			images: siteSettings?.images?.map((img) => img.url) || [`${storeUrl}/login-twitter-image.jpg`],
		},
	};
}

interface LoginPageProps {
	searchParams: {
		error?: string;
		registered?: string;
		callbackUrl?: string;
	};
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const nextSearchParams = await searchParams;
	const siteSettings = await getSiteSettings();
	const storeName = siteSettings?.name || "Zugzology";
	const storeUrl = siteSettings?.url || "https://zugzology.com";

	const params = {
		error: nextSearchParams?.error,
		registered: nextSearchParams?.registered === "true",
		callbackUrl: nextSearchParams?.callbackUrl || "/account",
	};

	// Generate structured data
	const pageStructuredData: WithContext<WebPage> = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: `Login to ${storeName}`,
		description: `Sign in to your ${storeName} account to manage your orders and track shipments.`,
		url: `${storeUrl}/login`,
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
				name: "Login",
				item: `${storeUrl}/login`,
			},
		],
	};

	return (
		<>
			<script {...jsonLdScriptProps(pageStructuredData)} />
			<script {...jsonLdScriptProps(breadcrumbStructuredData)} />
			<Suspense
				fallback={
					<div className="container relative flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
						<div className="animate-pulse space-y-4 p-4 lg:p-8">
							<div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
							<div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded" />
							<div className="space-y-2">
								<div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded" />
								<div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded" />
								<div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded" />
							</div>
						</div>
					</div>
				}
			>
				<LoginForm {...params} storeName={storeName} />
			</Suspense>
		</>
	);
}
