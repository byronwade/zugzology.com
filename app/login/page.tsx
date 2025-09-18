import { redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { LoginButton } from "@/components/features/auth/next-auth-buttons";
import { getSiteSettings } from "@/lib/actions/shopify";
import { getSession } from "@/lib/actions/session";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import { getEnhancedBreadcrumbSchema, getSearchActionSchema } from "@/lib/seo/enhanced-jsonld";
import Script from "next/script";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = generateSEOMetadata({
	title: "Sign In - Customer Login",
	description: "Sign in to your account to access your order history, track shipments, manage your profile, and get exclusive offers on premium mushroom cultivation supplies.",
	keywords: [
		"customer login",
		"sign in",
		"account access",
		"customer portal",
		"order tracking",
		"profile management",
		"user authentication"
	],
	url: "/login",
	noindex: true, // Login pages shouldn't be indexed for security
	openGraph: {
		type: "website",
	},
});

export default async function LoginPage() {
	// Use the custom session management instead of Next.js auth
	const session = await getSession();

	const siteSettings = await getSiteSettings();
	const storeName = siteSettings?.name || "Zugzology";

	// If already authenticated, redirect to account page
	if (session?.user) {
		redirect("/account");
	}

	// Generate breadcrumbs
	const breadcrumbs = [
		{ name: "Home", url: "/" },
		{ name: "Sign In", url: "/login" },
	];
	
	const breadcrumbSchema = getEnhancedBreadcrumbSchema(breadcrumbs);
	
	// Generate website schema with search action
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
			
			{/* Google Analytics for Login Page */}
			<Script id="login-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'login',
						'page_location': window.location.href
					});
				`}
			</Script>
			
			<div className="container relative flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 lg:min-h-[calc(100vh-var(--header-height))]">
				{/* Breadcrumb Navigation */}
				<nav className="absolute top-4 left-4 z-30" aria-label="Breadcrumb">
					<ol className="flex items-center space-x-2 text-sm">
						<li>
							<Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
						</li>
						<li className="text-gray-400">/</li>
						<li className="text-gray-900 font-medium">Sign In</li>
					</ol>
				</nav>
			<div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
				<div className="absolute inset-0 bg-zinc-900" />
				<div className="relative z-20 flex items-center text-lg font-medium">
					<Link href="/">{storeName}</Link>
				</div>
				<div className="relative z-20 mt-auto">
					<blockquote className="space-y-2">
							<p className="text-lg">Welcome back to {storeName}. Sign in to access your account and explore our premium mushroom growing supplies.</p>
					</blockquote>
				</div>
			</div>
			<div className="p-4 lg:p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
						<p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
					</div>

					<div className="grid gap-4">
						<LoginButton className="w-full" />
							<div className="text-center text-sm text-muted-foreground">
								Don&apos;t have an account?{" "}
							<Link href="/register" className="underline underline-offset-4 hover:text-primary">
								Create one
							</Link>
						</div>
						<div className="text-center text-xs text-muted-foreground">
							By continuing, you agree to our{" "}
							<Link href="/terms" className="underline underline-offset-4 hover:text-primary">
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
								Privacy Policy
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
		</>
	);
}
