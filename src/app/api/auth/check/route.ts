import { cookies } from "next/headers";
import { AUTH_CONFIG, logAuthEvent } from "@/lib/config/auth";
import { createErrorResponse, getCustomerAccessToken, verifyAuthentication } from "@/lib/server/api-utils";

export async function GET() {
	try {
		// Use our utility to verify authentication
		const isAuthenticated = await verifyAuthentication();

		// Get additional token values for the response
		const cookieStore = await cookies();
		const csrfToken = await cookieStore.get(AUTH_CONFIG.cookies.csrfToken.name);

		// Log auth check event
		logAuthEvent("Authentication check", {
			isAuthenticated,
			hasCsrfToken: !!csrfToken,
		});

		if (!isAuthenticated) {
			return Response.json({
				authenticated: false,
				message: "User not authenticated",
			});
		}

		// Get the customer token to verify with Shopify
		const customerAccessToken = await getCustomerAccessToken();

		if (!customerAccessToken) {
			return Response.json({
				authenticated: false,
				message: "Missing authentication token",
			});
		}

		// Verify the customer token with Shopify
		const response = await fetch(`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
			},
			body: JSON.stringify({
				query: `
					query {
						customer(customerAccessToken: "${customerAccessToken}") {
							id
							email
							firstName
							lastName
						}
					}
				`,
			}),
		});

		const data = await response.json();

		// Check for errors in the API response
		if (data.errors) {
			logAuthEvent("Auth check API error", {
				errors: data.errors,
			});

			// Clear cookies on token failure
			await cookieStore.delete(AUTH_CONFIG.cookies.customerAccessToken.name);
			await cookieStore.delete(AUTH_CONFIG.cookies.accessToken.name);
			await cookieStore.delete(AUTH_CONFIG.cookies.idToken.name);
			await cookieStore.delete(AUTH_CONFIG.cookies.csrfToken.name);

			return Response.json({
				authenticated: false,
				message: "Invalid authentication token",
			});
		}

		// Check if customer exists in response
		if (!data.data?.customer) {
			logAuthEvent("Auth check failed - No customer data", {
				response: data,
			});

			// Clear cookies if token is valid but returns no customer
			await cookieStore.delete(AUTH_CONFIG.cookies.customerAccessToken.name);
			await cookieStore.delete(AUTH_CONFIG.cookies.accessToken.name);
			await cookieStore.delete(AUTH_CONFIG.cookies.idToken.name);
			await cookieStore.delete(AUTH_CONFIG.cookies.csrfToken.name);

			return Response.json({
				authenticated: false,
				message: "Customer not found",
			});
		}

		// Successful authentication
		logAuthEvent("Auth check successful", {
			customerId: data.data.customer.id,
			email: data.data.customer.email,
		});

		return Response.json({
			authenticated: true,
			user: {
				id: data.data.customer.id,
				email: data.data.customer.email,
				firstName: data.data.customer.firstName,
				lastName: data.data.customer.lastName,
			},
			csrfToken: csrfToken?.value,
		});
	} catch (error) {
		logAuthEvent("Auth check error", {
			error: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
		});

		return createErrorResponse("Authentication check failed", 500);
	}
}
