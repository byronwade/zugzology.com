import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCustomer } from "@/lib/services/shopify-customer";
import AccountInfo from "./account-info";
import OrderHistory from "./order-history";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/lib/config/auth";
import { getSession } from "@/lib/actions/session";
import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import { getEnhancedBreadcrumbSchema, getEnhancedPersonSchema } from "@/lib/seo/enhanced-jsonld";
import Script from "next/script";
import { UniversalBreadcrumb, BreadcrumbConfigs } from "@/components/navigation/universal-breadcrumb";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = generateSEOMetadata({
  title: "My Account - Account Dashboard",
  description: "Manage your account information, view order history, track shipments, and update your preferences. Secure customer portal for mushroom cultivation supplies.",
  keywords: [
    "account dashboard",
    "customer account",
    "order history",
    "account settings",
    "customer portal",
    "profile management",
    "order tracking"
  ],
  url: "/account",
  noindex: true, // Account pages shouldn't be indexed for privacy
  openGraph: {
    type: "website",
  },
});

export default async function AccountPage() {
	// Use the custom session management instead of Next.js auth
	const session = await getSession();

	// Also check custom auth system
	const cookieStore = await cookies();
	const customerAccessToken = await cookieStore.get(AUTH_CONFIG.cookies.customerAccessToken.name);
	const customAuthToken = customerAccessToken?.value;

	console.log("🔍 [Account] Auth status:", {
		sessionUser: !!session?.user,
		customAuthToken: !!customAuthToken,
	});

	// Immediately redirect if not authenticated in either system
	if (!session?.user && !customAuthToken) {
		console.log("❌ [Account] No authentication found, redirecting to login");
		redirect("/login?redirect=/account");
	}

	try {
		console.log("🔍 [Account] Fetching customer data...");

		// Try to get customer data using session token first
		let customer = null;
		let tokenUsed = "";

		if (session?.user?.accessToken) {
			console.log("🔍 [Account] Trying session token...");
			tokenUsed = "session";
			customer = await getCustomer(session.user.accessToken);
		}

		// If that fails, try the custom auth token
		if (!customer && customAuthToken) {
			console.log("🔍 [Account] Trying custom auth token...");
			tokenUsed = "custom";
			customer = await getCustomer(customAuthToken);
		}

		// If no customer data is returned from either method, show error
		if (!customer) {
			console.log("❌ [Account] No customer data returned from either auth system");
			throw new Error("Failed to fetch customer data");
		}

		console.log("✅ [Account] Customer data fetched using " + tokenUsed + " token:", customer.email);

		// Generate breadcrumbs
		const breadcrumbs = [
			{ name: "Home", url: "/" },
			{ name: "My Account", url: "/account" },
		];
		
		const breadcrumbSchema = getEnhancedBreadcrumbSchema(breadcrumbs);
		
		// Generate customer schema
		const customerSchema = getEnhancedPersonSchema({
			name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer',
			email: customer.email,
		});

		// Render the account page with customer data
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
						__html: JSON.stringify(customerSchema),
					}}
				/>
				
				{/* Google Analytics for Account View */}
				<Script id="account-analytics" strategy="afterInteractive">
					{`
						window.dataLayer = window.dataLayer || [];
						window.dataLayer.push({
							'event': 'page_view',
							'page_type': 'account_dashboard',
							'page_location': window.location.href,
							'user_id': '${customer.id}',
							'customer_type': 'returning'
						});
					`}
				</Script>
				
				<div className="min-h-screen bg-muted/50">
					{/* Breadcrumb Navigation */}
					<div className="pt-4 px-4">
						<UniversalBreadcrumb items={BreadcrumbConfigs.account()} />
					</div>
					
					<div className="flex flex-col lg:flex-row w-full gap-8 p-4 pb-16">
						{/* Account Info Sidebar */}
						<div className="w-full lg:w-1/3">
							<AccountInfo customer={customer} />
						</div>

						{/* Order History */}
						<div className="w-full lg:w-2/3">
							<OrderHistory orders={customer.orders.edges.map(({ node }) => node)} />
						</div>
					</div>
				</div>
			</>
		);
	} catch (error) {
		console.error("❌ [Account] Failed to fetch account data:", error);

		// Generate basic breadcrumbs for error state
		const errorBreadcrumbs = [
			{ name: "Home", url: "/" },
			{ name: "My Account", url: "/account" },
		];
		
		const errorBreadcrumbSchema = getEnhancedBreadcrumbSchema(errorBreadcrumbs);

		// If we couldn't get customer data, show simplified account page with session info
		return (
			<>
				{/* JSON-LD Structured Data for Error State */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(errorBreadcrumbSchema),
					}}
				/>
				
				{/* Google Analytics for Account Error */}
				<Script id="account-error-analytics" strategy="afterInteractive">
					{`
						window.dataLayer = window.dataLayer || [];
						window.dataLayer.push({
							'event': 'page_view',
							'page_type': 'account_error',
							'page_location': window.location.href,
							'error_type': 'customer_data_fetch_failed'
						});
					`}
				</Script>
				
				<div className="min-h-screen bg-muted/50 p-8">
					{/* Breadcrumb Navigation */}
					<div className="mb-8">
						<UniversalBreadcrumb items={BreadcrumbConfigs.account()} />
					</div>
					
					<div className="max-w-4xl mx-auto">
						<h1 className="text-3xl font-bold mb-6">Your Account</h1>

						<div className="bg-white rounded-lg shadow p-6 mb-6">
							<h2 className="text-xl font-semibold mb-4">Account Information</h2>
							<p className="mb-2">
								<strong>Email:</strong> {session?.user?.accessToken ? "Authenticated" : "Not provided"}
							</p>
								<p className="text-sm text-muted-foreground mt-4">We&apos;re having trouble loading your detailed account information.</p>
						</div>

						<Button variant="outline" onClick={() => redirect("/")}>
							Return to Home
						</Button>
					</div>
				</div>
			</>
		);
	}
}
