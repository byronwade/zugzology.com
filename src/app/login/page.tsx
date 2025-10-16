import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Script from "next/script";
import { LoginButton } from "@/components/features/auth/next-auth-buttons";
import { Link } from "@/components/ui/link";
import { getSession } from "@/lib/actions/session";
import { getSiteSettings } from "@/lib/actions/shopify";
import { getEnhancedBreadcrumbSchema, getSearchActionSchema } from "@/lib/seo/enhanced-jsonld";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";

export const metadata: Metadata = generateSEOMetadata({
	title: "Sign In - Customer Login",
	description:
		"Sign in to your account to access your order history, track shipments, manage your profile, and get exclusive offers on premium mushroom cultivation supplies.",
	keywords: [
		"customer login",
		"sign in",
		"account access",
		"customer portal",
		"order tracking",
		"profile management",
		"user authentication",
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

			<div className="flex min-h-screen flex-col pt-[var(--header-height)] lg:flex-row">
				{/* Left Side - Branding & Info */}
				<div className="relative flex flex-1 flex-col justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 lg:p-16">
					<div>
						{/* Breadcrumb */}
						<nav aria-label="Breadcrumb" className="mb-12">
							<ol className="flex items-center space-x-2 text-sm">
								<li>
									<Link className="text-muted-foreground hover:text-foreground" href="/">
										Home
									</Link>
								</li>
								<li className="text-muted-foreground/50">/</li>
								<li className="font-medium text-foreground">Sign In</li>
							</ol>
						</nav>

						<div className="space-y-6">
							<h1 className="font-bold text-4xl tracking-tight md:text-5xl lg:text-6xl">
								Welcome Back to
								<br />
								<span className="text-primary">{storeName}</span>
							</h1>
							<p className="max-w-md text-lg text-muted-foreground">
								Sign in to access your account, track orders, and explore premium mushroom cultivation supplies.
							</p>
						</div>
					</div>

					{/* Features List */}
					<div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
						<div className="space-y-2">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<svg
									className="h-5 w-5 text-primary"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									viewBox="0 0 24 24"
								>
									<path
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
							<h3 className="font-semibold text-foreground">Secure Access</h3>
							<p className="text-muted-foreground text-sm">Enterprise-grade security with Shopify authentication</p>
						</div>
						<div className="space-y-2">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<svg
									className="h-5 w-5 text-primary"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									viewBox="0 0 24 24"
								>
									<path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</div>
							<h3 className="font-semibold text-foreground">Order Tracking</h3>
							<p className="text-muted-foreground text-sm">Track your orders and manage your account easily</p>
						</div>
					</div>
				</div>

				{/* Right Side - Login Form */}
				<div className="flex flex-1 items-center justify-center bg-background p-8 lg:p-16">
					<div className="w-full max-w-md space-y-8">
						<div className="space-y-2">
							<h2 className="font-semibold text-2xl tracking-tight">Sign in to your account</h2>
							<p className="text-muted-foreground text-sm">Enter your credentials to access your account</p>
						</div>

						<div className="space-y-4">
							<LoginButton className="w-full" />

							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-background px-2 text-muted-foreground">New to {storeName}?</span>
								</div>
							</div>

							<Link
								className="flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm hover:bg-accent hover:text-accent-foreground"
								href="/register"
							>
								Create an account
							</Link>
						</div>

						<p className="text-center text-muted-foreground text-xs">
							By continuing, you agree to our{" "}
							<Link className="underline underline-offset-4 hover:text-primary" href="/terms">
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link className="underline underline-offset-4 hover:text-primary" href="/privacy">
								Privacy Policy
							</Link>
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
