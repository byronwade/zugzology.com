import { cookies } from "next/headers";
import { AUTH_CONFIG, logAuthEvent } from "@/lib/config/auth";

export async function POST(request: Request) {
	try {
		logAuthEvent("Login attempt started", { timestamp: new Date().toISOString() });

		const { email, password } = await request.json();

		if (!email || !password) {
			logAuthEvent("Login validation failed", { error: "Missing credentials" });
			return Response.json({ message: "Email and password are required" }, { status: 400 });
		}

		// Get customer access token using Storefront API
		const response = await fetch(`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
			},
			body: JSON.stringify({
				query: `
					mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
						customerAccessTokenCreate(input: $input) {
							customerAccessToken {
								accessToken
								expiresAt
							}
							customerUserErrors {
								code
								field
								message
							}
						}
					}
				`,
				variables: {
					input: {
						email,
						password,
					},
				},
			}),
		});

		const data = await response.json();
		logAuthEvent("API response received", { data });

		// Check for GraphQL errors
		if (data.errors) {
			logAuthEvent("GraphQL errors", { errors: data.errors });
			return Response.json({ message: data.errors[0].message }, { status: 401 });
		}

		if (!data.data) {
			logAuthEvent("Invalid API response", { data });
			return Response.json({ message: "Invalid response from authentication service" }, { status: 500 });
		}

		const { customerAccessTokenCreate } = data.data;

		if (customerAccessTokenCreate.customerUserErrors?.length > 0) {
			const error = customerAccessTokenCreate.customerUserErrors[0];
			logAuthEvent("Login failed", {
				error: error.message,
				code: error.code,
				field: error.field,
			});

			// If customer is unidentified, try to verify if they exist using a different query
			if (error.code === "UNIDENTIFIED_CUSTOMER") {
				// Try to get a temporary access token for verification
				const verifyResponse = await fetch(`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
					},
					body: JSON.stringify({
						query: `
							mutation {
								customerAccessTokenCreate(input: { email: "${email}", password: "temp-password" }) {
									customerUserErrors {
										code
										message
									}
								}
							}
						`,
					}),
				});

				const verifyData = await verifyResponse.json();
				logAuthEvent("Customer verification response", { verifyData });

				// If we get UNIDENTIFIED_CUSTOMER again, the account doesn't exist
				// If we get INVALID_CREDENTIALS, the account exists but password is wrong
				const verifyError = verifyData.data?.customerAccessTokenCreate?.customerUserErrors[0];
				if (verifyError?.code === "INVALID_CREDENTIALS") {
					return Response.json({ message: "Account exists but password may be incorrect" }, { status: 401 });
				}
			}

			return Response.json({ message: error.message }, { status: 401 });
		}

		if (!customerAccessTokenCreate.customerAccessToken) {
			logAuthEvent("No access token in response", { data });
			return Response.json({ message: "Failed to create access token" }, { status: 500 });
		}

		const { accessToken, expiresAt } = customerAccessTokenCreate.customerAccessToken;

		// Set the customer access token in cookies
		const cookieStore = await cookies();
		await cookieStore.set(AUTH_CONFIG.cookies.customerAccessToken.name, accessToken, {
			...AUTH_CONFIG.cookies.customerAccessToken.options,
			expires: new Date(expiresAt),
		});

		logAuthEvent("Login successful", {
			email,
			expiresAt,
		});

		return Response.json({
			success: true,
			redirectUrl: "/account",
		});
	} catch (error) {
		logAuthEvent("Login error", {
			error: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
		});
		return Response.json(
			{
				message: "An unexpected error occurred during login",
			},
			{ status: 500 }
		);
	}
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
	return new Response(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}
