import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { RegisterForm } from "@/components/features/auth/register-form";
import { getSiteSettings } from "@/lib/actions/shopify";
import { getEnhancedBreadcrumbSchema, getSearchActionSchema } from "@/lib/seo/enhanced-jsonld";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";

export const metadata: Metadata = generateSEOMetadata({
	title: "Create Account - Join Our Community",
	description:
		"Create your free account to access exclusive offers, track orders, save favorites, and get expert support for all your mushroom cultivation needs.",
	keywords: [
		"create account",
		"sign up",
		"register",
		"customer registration",
		"new account",
		"join community",
		"exclusive offers",
	],
	url: "/register",
	noindex: true, // Registration pages shouldn't be indexed for security
	openGraph: {
		type: "website",
	},
});

export default async function RegisterPage() {
	const siteSettings = await getSiteSettings();
	const storeName = siteSettings?.name || "Zugzology";

	// Generate breadcrumbs
	const breadcrumbs = [
		{ name: "Home", url: "/" },
		{ name: "Create Account", url: "/register" },
	];

	const breadcrumbSchema = getEnhancedBreadcrumbSchema(breadcrumbs);

	// Generate website schema
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

			{/* Google Analytics for Register Page */}
			<Script id="register-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'register',
						'page_location': window.location.href
					});
				`}
			</Script>

			<Suspense
				fallback={
					<div className="container relative flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
						{/* Breadcrumb Navigation for Loading State */}
						<nav aria-label="Breadcrumb" className="absolute top-4 left-4 z-30">
							<ol className="flex items-center space-x-2 text-sm">
								<li>
									<a className="text-muted-foreground hover:text-foreground" href="/">
										Home
									</a>
								</li>
								<li className="text-muted-foreground/50">/</li>
								<li className="font-medium text-foreground">Create Account</li>
							</ol>
						</nav>

						<div className="animate-pulse space-y-4 p-4 lg:p-8">
							<div className="h-8 w-48 rounded bg-muted" />
							<div className="h-4 w-64 rounded bg-muted" />
							<div className="space-y-2">
								<div className="h-10 rounded bg-muted" />
								<div className="h-10 rounded bg-muted" />
								<div className="h-10 rounded bg-muted" />
							</div>
						</div>
					</div>
				}
			>
				<RegisterForm storeName={storeName} />
			</Suspense>
		</>
	);
}
