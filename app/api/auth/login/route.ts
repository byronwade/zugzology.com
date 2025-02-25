import { cookies } from "next/headers";
import { AUTH_CONFIG, logAuthEvent, generateCsrfToken } from "@/lib/config/auth";
import { createErrorResponse, parseRequestBody } from "@/lib/server/api-utils";

interface LoginCredentials {
	email: string;
	password: string;
}

export async function POST(request: Request) {
	try {
		logAuthEvent("Login attempt started", {
			timestamp: new Date().toISOString(),
			origin: request.headers.get("origin"),
			referer: request.headers.get("referer"),
		});

		// Parse request body
		const credentials = await parseRequestBody<LoginCredentials>(request);

		if (!credentials) {
			return createErrorResponse("Invalid request body", 400);
		}

		const { email, password } = credentials;

		if (!email || !password) {
			logAuthEvent("Login validation failed", { error: "Missing credentials" });
			return createErrorResponse("Email and password are required", 400);
		}

		// DEBUG: Log sanitized credentials (email only partially shown for privacy)
		const emailParts = email.split("@");
		const sanitizedEmail = emailParts[0].substring(0, 2) + "***@" + emailParts[1];
		logAuthEvent("Attempting login with credentials", {
			email: sanitizedEmail,
			passwordLength: password.length,
			storeUrl: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
			hasAccessToken: !!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
		});

		// Get customer access token using Storefront API
		const loginMutation = `
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
		`;

		// Create the login request
		const response = await fetch(`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
			},
			body: JSON.stringify({
				query: loginMutation,
				variables: {
					input: {
						email,
						password,
					},
				},
			}),
		});

		// DEBUG: Log response status
		logAuthEvent("Shopify API response status", {
			status: response.status,
			statusText: response.statusText,
			headers: Object.fromEntries([...response.headers.entries()].filter(([key]) => !key.includes("set-cookie"))), // Don't log cookies for security
		});

		const data = await response.json();
		logAuthEvent("API response received", {
			success: !data.errors,
			hasData: !!data.data,
			hasCustomerAccessTokenCreate: data.data && !!data.data.customerAccessTokenCreate,
			hasErrors: !!data.errors,
			hasUserErrors: data.data?.customerAccessTokenCreate?.customerUserErrors?.length > 0,
		});

		// Check for GraphQL errors
		if (data.errors) {
			logAuthEvent("GraphQL errors", { errors: data.errors });

			// Return 401 with detailed error message
			return createErrorResponse(`Authentication error: ${data.errors[0].message}`, 401);
		}

		if (!data.data) {
			logAuthEvent("Invalid API response", { data });
			return createErrorResponse("Invalid response from authentication service", 500);
		}

		const { customerAccessTokenCreate } = data.data;

		// Check for customer user errors
		if (customerAccessTokenCreate.customerUserErrors?.length > 0) {
			const error = customerAccessTokenCreate.customerUserErrors[0];
			logAuthEvent("Login failed", {
				error: error.message,
				code: error.code,
				field: error.field,
			});

			// DEBUG: Handle specific error codes with more detail
			switch (error.code) {
				case "UNIDENTIFIED_CUSTOMER":
					// First check if the customer exists by seeing if they can start a password reset
					try {
						const checkCustomerMutation = `
							mutation customerRecover($email: String!) {
								customerRecover(email: $email) {
									customerUserErrors {
										code
										message
									}
								}
							}
						`;

						const checkResponse = await fetch(`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql`, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
							},
							body: JSON.stringify({
								query: checkCustomerMutation,
								variables: {
									email,
								},
							}),
						});

						const checkData = await checkResponse.json();
						logAuthEvent("Customer existence check", {
							checkData,
							emailExists: !checkData.errors && !checkData.data?.customerRecover?.customerUserErrors?.length,
						});

						if (!checkData.errors && !checkData.data?.customerRecover?.customerUserErrors?.length) {
							// Email exists but password is wrong
							return createErrorResponse("Email exists but password is incorrect. Try resetting your password.", 401);
						}
					} catch (checkError) {
						logAuthEvent("Error checking customer existence", { error: checkError });
					}

					return createErrorResponse("No account found with this email address. Please check your email or sign up for a new account.", 401);

				case "INVALID_CREDENTIALS":
					return createErrorResponse("Invalid credentials. Please check your email and password.", 401);

				default:
					return createErrorResponse(error.message, 401);
			}
		}

		if (!customerAccessTokenCreate.customerAccessToken) {
			logAuthEvent("No access token in response", { data });
			return createErrorResponse("Failed to create access token", 500);
		}

		const { accessToken, expiresAt } = customerAccessTokenCreate.customerAccessToken;

		// Set the customer access token in cookies
		const cookieStore = await cookies();

		// Set the main customer token from Shopify
		await cookieStore.set(AUTH_CONFIG.cookies.customerAccessToken.name, accessToken, {
			...AUTH_CONFIG.cookies.customerAccessToken.options,
			expires: new Date(expiresAt),
		});

		// Generate CSRF token for additional security
		const csrfToken = generateCsrfToken();
		await cookieStore.set(AUTH_CONFIG.cookies.csrfToken.name, csrfToken, AUTH_CONFIG.cookies.csrfToken.options);

		// Set session identifier token
		await cookieStore.set(AUTH_CONFIG.cookies.accessToken.name, `session_${Date.now()}`, AUTH_CONFIG.cookies.accessToken.options);

		// Set user identity token (not revealing actual data but marking signed in state)
		await cookieStore.set(AUTH_CONFIG.cookies.idToken.name, `user_${Date.now()}`, AUTH_CONFIG.cookies.idToken.options);

		logAuthEvent("Login successful", {
			email: sanitizedEmail,
			expiresAt,
			tokenLength: accessToken.length,
			cookiesSet: [AUTH_CONFIG.cookies.customerAccessToken.name, AUTH_CONFIG.cookies.csrfToken.name, AUTH_CONFIG.cookies.accessToken.name, AUTH_CONFIG.cookies.idToken.name],
		});

		return Response.json({
			success: true,
			redirectUrl: "/account",
			csrfToken, // Send CSRF token to client
		});
	} catch (error) {
		logAuthEvent("Login error", {
			error: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
		});

		return createErrorResponse("An unexpected error occurred during login", 500);
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
