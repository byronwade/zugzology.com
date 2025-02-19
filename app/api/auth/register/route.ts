import { cookies } from "next/headers";
import { AUTH_CONFIG, logAuthEvent } from "@/lib/config/auth";

export async function POST(request: Request) {
	try {
		logAuthEvent("Registration started", { timestamp: new Date().toISOString() });

		const { firstName, lastName, email, password } = await request.json();

		if (!email || !firstName || !lastName || !password) {
			logAuthEvent("Registration validation failed", { error: "Missing required fields" });
			return Response.json({ message: "All fields are required" }, { status: 400 });
		}

		// Log the request for debugging
		logAuthEvent("Registration request", {
			email,
			firstName,
			lastName,
			hasPassword: !!password,
		});

		// Create customer using Storefront API
		const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
		const response = await fetch(`https://${shopDomain}/api/2024-01/graphql`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
				Accept: "application/json",
			},
			body: JSON.stringify({
				query: `
					mutation customerCreate($input: CustomerCreateInput!) {
						customerCreate(input: $input) {
							customer {
								id
								firstName
								lastName
								email
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
						firstName,
						lastName,
						email,
						password,
						acceptsMarketing: true,
					},
				},
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			logAuthEvent("API request failed", {
				status: response.status,
				statusText: response.statusText,
				error: errorText,
				headers: Object.fromEntries(response.headers.entries()),
			});
			return Response.json({ message: "Registration failed" }, { status: response.status });
		}

		const data = await response.json();

		// Log the full response for debugging
		logAuthEvent("API response received", { data });

		if (!data.data) {
			logAuthEvent("Invalid API response", { data });
			return Response.json({ message: "Invalid response from registration service" }, { status: 500 });
		}

		const { customerCreate } = data.data;

		if (customerCreate.customerUserErrors?.length > 0) {
			const error = customerCreate.customerUserErrors[0];
			logAuthEvent("Customer creation error", {
				error: error.message,
				code: error.code,
				field: error.field,
				allErrors: customerCreate.customerUserErrors,
			});
			return Response.json({ message: error.message }, { status: 400 });
		}

		if (!customerCreate.customer) {
			logAuthEvent("No customer in response", { data });
			return Response.json({ message: "Failed to create customer" }, { status: 500 });
		}

		// Log successful customer creation
		logAuthEvent("Customer created", {
			customerId: customerCreate.customer.id,
			email: customerCreate.customer.email,
		});

		// Now get a customer access token
		const tokenResponse = await fetch(`https://${shopDomain}/api/2024-01/graphql`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
				Accept: "application/json",
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

		const tokenData = await tokenResponse.json();

		// Log token response for debugging
		logAuthEvent("Token response received", { tokenData });

		if (tokenData.data?.customerAccessTokenCreate?.customerUserErrors?.length > 0) {
			const error = tokenData.data.customerAccessTokenCreate.customerUserErrors[0];
			logAuthEvent("Token creation error", {
				error: error.message,
				code: error.code,
				field: error.field,
				allErrors: tokenData.data.customerAccessTokenCreate.customerUserErrors,
			});
			return Response.json({ message: error.message }, { status: 400 });
		}

		const { accessToken, expiresAt } = tokenData.data.customerAccessTokenCreate.customerAccessToken;

		// Set the customer access token in cookies
		const cookieStore = await cookies();
		await cookieStore.set(AUTH_CONFIG.cookies.customerAccessToken.name, accessToken, {
			...AUTH_CONFIG.cookies.customerAccessToken.options,
			expires: new Date(expiresAt),
		});

		logAuthEvent("Registration successful", {
			customerId: customerCreate.customer.id,
			email: customerCreate.customer.email,
			tokenExpiresAt: expiresAt,
		});

		return Response.json({
			success: true,
			customer: customerCreate.customer,
			redirectUrl: "/account",
		});
	} catch (error) {
		logAuthEvent("Registration error", {
			error: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
			type: error instanceof Error ? error.constructor.name : typeof error,
		});
		return Response.json(
			{
				message: "An unexpected error occurred during registration",
			},
			{ status: 500 }
		);
	}
}
