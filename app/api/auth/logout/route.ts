import { cookies } from "next/headers";
import { AUTH_CONFIG, logAuthEvent } from "@/lib/config/auth";
import { verifyAuthentication, createErrorResponse } from "@/lib/server/api-utils";

export async function POST() {
	try {
		logAuthEvent("Logout initiated", { timestamp: new Date().toISOString() });

		// Verify that the user is authenticated
		const isAuthenticated = await verifyAuthentication();
		if (!isAuthenticated) {
			return createErrorResponse("Not authenticated", 401);
		}

		const cookieStore = await cookies();
		const customerAccessToken = await cookieStore.get(AUTH_CONFIG.cookies.customerAccessToken.name);

		// Only perform Shopify logout if we have a token
		if (customerAccessToken?.value) {
			try {
				// Attempt to revoke the token on Shopify's end
				const response = await fetch(`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql`, {
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

				if (data.data?.customerAccessTokenDelete?.deletedAccessToken) {
					logAuthEvent("Shopify token successfully revoked", {
						token: customerAccessToken.value.substring(0, 6) + "...", // Log just a snippet for security
					});
				} else if (data.errors || data.data?.customerAccessTokenDelete?.userErrors?.length) {
					// Log errors but continue with cookie removal
					logAuthEvent("Error revoking Shopify token", {
						errors: data.errors || data.data?.customerAccessTokenDelete?.userErrors,
					});
				}
			} catch (shopifyError) {
				// Log error but continue with cookie removal
				logAuthEvent("Failed to revoke Shopify token", {
					error: shopifyError instanceof Error ? shopifyError.message : "Unknown error",
				});
			}
		}

		// Clear all auth cookies regardless of Shopify API call success
		await cookieStore.delete(AUTH_CONFIG.cookies.customerAccessToken.name);
		await cookieStore.delete(AUTH_CONFIG.cookies.accessToken.name);
		await cookieStore.delete(AUTH_CONFIG.cookies.idToken.name);
		await cookieStore.delete(AUTH_CONFIG.cookies.csrfToken.name);

		// Also clear any cart/checkout related cookies if they exist
		const allCookies = await cookieStore.getAll();
		const cartCookies = allCookies.filter((cookie) => cookie.name.includes("cart") || cookie.name.includes("checkout"));

		for (const cookie of cartCookies) {
			await cookieStore.delete(cookie.name);
		}

		logAuthEvent("Logout completed", {
			clearedCookies: [AUTH_CONFIG.cookies.customerAccessToken.name, AUTH_CONFIG.cookies.accessToken.name, AUTH_CONFIG.cookies.idToken.name, AUTH_CONFIG.cookies.csrfToken.name, ...cartCookies.map((c) => c.name)],
		});

		return Response.json({
			success: true,
			loggedOut: true,
			message: "Logged out successfully",
		});
	} catch (error) {
		logAuthEvent("Logout error", {
			error: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
		});

		return createErrorResponse("An error occurred during logout", 500);
	}
}
