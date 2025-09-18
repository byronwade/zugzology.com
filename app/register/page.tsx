import { Suspense } from "react";
import { RegisterForm } from "@/components/features/auth/register-form";
import { getSiteSettings } from "@/lib/actions/shopify";
import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import { getEnhancedBreadcrumbSchema, getSearchActionSchema } from "@/lib/seo/enhanced-jsonld";
import Script from "next/script";

export const metadata: Metadata = generateSEOMetadata({
	title: "Create Account - Join Our Community",
	description: "Create your free account to access exclusive offers, track orders, save favorites, and get expert support for all your mushroom cultivation needs.",
	keywords: [
		"create account",
		"sign up",
		"register",
		"customer registration",
		"new account",
		"join community",
		"exclusive offers"
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
						<nav className="absolute top-4 left-4 z-30" aria-label="Breadcrumb">
							<ol className="flex items-center space-x-2 text-sm">
								<li>
									<a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
								</li>
								<li className="text-gray-400">/</li>
								<li className="text-gray-900 font-medium">Create Account</li>
							</ol>
						</nav>
						
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
				<RegisterForm storeName={storeName} />
			</Suspense>
		</>
	);
}
