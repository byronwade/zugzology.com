import { cookies } from "next/headers";
import { AUTH_CONFIG, logAuthEvent } from "@/lib/config/auth";

export async function POST() {
	try {
		logAuthEvent("Logout started", { timestamp: new Date().toISOString() });

		// Get the current tokens
		const cookieStore = await cookies();
		const customerAccessToken = cookieStore.get(AUTH_CONFIG.cookies.customerAccessToken.name);
		const accessToken = cookieStore.get(AUTH_CONFIG.cookies.accessToken.name);
		const idToken = cookieStore.get(AUTH_CONFIG.cookies.idToken.name);

		if (customerAccessToken) {
			// Call Shopify's customer token delete mutation
			const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
			const response = await fetch(`https://${shopDomain}/api/2024-01/graphql`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
				},
				body: JSON.stringify({
					query: `
						mutation customerAccessTokenDelete($customerAccessToken: String!) {
							customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
								deletedAccessToken
								deletedCustomerAccessTokenId
								userErrors {
									field
									message
								}
							}
						}
					`,
					variables: {
						customerAccessToken: customerAccessToken.value,
					},
				}),
			});

			const data = await response.json();
			logAuthEvent("Shopify token deleted", { success: !!data.data?.customerAccessTokenDelete?.deletedAccessToken });
		}

		// Clear all auth cookies
		await cookieStore.delete({
			name: AUTH_CONFIG.cookies.customerAccessToken.name,
			path: "/",
		});
		await cookieStore.delete({
			name: AUTH_CONFIG.cookies.accessToken.name,
			path: "/",
		});
		await cookieStore.delete({
			name: AUTH_CONFIG.cookies.idToken.name,
			path: "/",
		});

		logAuthEvent("Logout successful", {
			clearedTokens: {
				customerAccessToken: !!customerAccessToken,
				accessToken: !!accessToken,
				idToken: !!idToken,
			},
		});

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		logAuthEvent("Logout error", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json({ message: error instanceof Error ? error.message : "Logout failed" }, { status: 500 });
	}
}
