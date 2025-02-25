"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { getCustomer } from "@/lib/services/shopify-customer";
import AccountInfo from "./account-info";
import OrderHistory from "./order-history";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/lib/config/auth";

export default async function AccountPage() {
	// Check NextAuth session
	const session = await auth();

	// Also check custom auth system
	const cookieStore = await cookies();
	const customerAccessToken = await cookieStore.get(AUTH_CONFIG.cookies.customerAccessToken.name);
	const customAuthToken = customerAccessToken?.value;

	console.log("🔍 [Account] Auth status:", {
		nextAuthSession: !!session,
		customAuthToken: !!customAuthToken,
	});

	// Immediately redirect if not authenticated in either system
	if (!session && !customAuthToken) {
		console.log("❌ [Account] No authentication found, redirecting to login");
		redirect("/login?redirect=/account");
	}

	try {
		console.log("🔍 [Account] Fetching customer data...");

		// Try to get customer data using NextAuth token first
		let customer = null;
		let tokenUsed = "";

		if (session?.shopifyAccessToken) {
			console.log("🔍 [Account] Trying NextAuth token...");
			tokenUsed = "nextauth";
			customer = await getCustomer(session.shopifyAccessToken);
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

		// Render the account page with customer data
		return (
			<div className="min-h-screen bg-muted/50">
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
		);
	} catch (error) {
		console.error("❌ [Account] Failed to fetch account data:", error);

		// If we couldn't get customer data, show simplified account page with session info
		return (
			<div className="min-h-screen bg-muted/50 p-8">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-3xl font-bold mb-6">Your Account</h1>

					<div className="bg-white rounded-lg shadow p-6 mb-6">
						<h2 className="text-xl font-semibold mb-4">Account Information</h2>
						<p className="mb-2">
							<strong>Name:</strong> {session?.user?.name || "Not provided"}
						</p>
						<p className="mb-2">
							<strong>Email:</strong> {session?.user?.email || "Not provided"}
						</p>
						<p className="text-sm text-muted-foreground mt-4">We're having trouble loading your detailed account information.</p>
					</div>

					<Button variant="outline" onClick={() => redirect("/")}>
						Return to Home
					</Button>
				</div>
			</div>
		);
	}
}
