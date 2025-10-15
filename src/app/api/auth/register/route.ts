import { cookies } from "next/headers";
import { AUTH_CONFIG, generateCsrfToken, logAuthEvent } from "@/lib/config/auth";
import { createErrorResponse, parseRequestBody } from "@/lib/server/api-utils";

type RegisterData = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
};

export async function POST(request: Request) {
	try {
		logAuthEvent("Registration started", { timestamp: new Date().toISOString() });

		// Parse request body
		const registerData = await parseRequestBody<RegisterData>(request);

		if (!registerData) {
			return createErrorResponse("Invalid request body", 400);
		}

		const { firstName, lastName, email, password } = registerData;

		if (!(email && firstName && lastName && password)) {
			logAuthEvent("Registration validation failed", { error: "Missing required fields" });
			return createErrorResponse("All fields are required", 400);
		}

		// Log the request for debugging
		logAuthEvent("Registration request", {
			email,
			firstName,
			lastName,
			hasPassword: !!password,
		});

		// First check if customer already exists
		const checkResponse = await fetch(`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql`, {
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

		const checkData = await checkResponse.json();
		logAuthEvent("Customer existence check", { data: checkData });

		const checkError = checkData.data?.customerAccessTokenCreate?.customerUserErrors[0];

		// If error code is INVALID_CREDENTIALS, customer exists
		if (checkError?.code === "INVALID_CREDENTIALS") {
			logAuthEvent("Registration failed - Account exists", { email });
			return Response.json(
				{
					message: "An account with this email already exists",
					exists: true,
				},
				{ status: 400 }
			);
		}

		// Create customer in Shopify
		const response = await fetch(`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
			},
			body: JSON.stringify({
				query: `
					mutation customerCreate($input: CustomerCreateInput!) {
						customerCreate(input: $input) {
							customer {
								id
								email
								firstName
								lastName
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
						firstName,
						lastName,
						acceptsMarketing: true,
					},
				},
			}),
		});

		const data = await response.json();
		logAuthEvent("Registration response", {
			success: !data.errors,
			hasCustomer: !!data.data?.customerCreate?.customer,
		});

		// Check for GraphQL errors
		if (data.errors) {
			logAuthEvent("GraphQL errors", { errors: data.errors });
			return createErrorResponse(data.errors[0].message, 500);
		}

		if (!data.data) {
			logAuthEvent("Invalid API response", { data });
			return createErrorResponse("Invalid response from registration service", 500);
		}

		const { customerCreate } = data.data;

		if (customerCreate.customerUserErrors?.length > 0) {
			const error = customerCreate.customerUserErrors[0];
			logAuthEvent("Registration failed", {
				error: error.message,
				code: error.code,
				field: error.field,
			});

			// Check if it's a duplicate email error
			if (error.code === "CUSTOMER_ALREADY_EXISTS" || error.message.toLowerCase().includes("already exists")) {
				return Response.json(
					{
						message: "An account with this email already exists",
						exists: true,
					},
					{ status: 400 }
				);
			}

			return Response.json({ message: error.message, field: error.field }, { status: 400 });
		}

		// Account created, now create access token
		const tokenResponse = await fetch(`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql`, {
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

		const tokenData = await tokenResponse.json();
		logAuthEvent("Token creation response", { success: !tokenData.errors });

		if (tokenData.errors) {
			logAuthEvent("Token creation GraphQL errors", { errors: tokenData.errors });
			// Still send success but without auto login
			return Response.json({
				success: true,
				message: "Account created successfully. Please log in.",
				autoLogin: false,
			});
		}

		const { customerAccessTokenCreate } = tokenData.data;

		if (customerAccessTokenCreate.customerUserErrors?.length > 0) {
			const error = customerAccessTokenCreate.customerUserErrors[0];
			logAuthEvent("Token creation failed", {
				error: error.message,
				code: error.code,
				field: error.field,
			});
			// Still send success but without auto login
			return Response.json({
				success: true,
				message: "Account created successfully. Please log in.",
				autoLogin: false,
			});
		}

		if (!customerAccessTokenCreate.customerAccessToken) {
			logAuthEvent("No access token in response", { tokenData });
			// Still send success but without auto login
			return Response.json({
				success: true,
				message: "Account created successfully. Please log in.",
				autoLogin: false,
			});
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
		await cookieStore.set(
			AUTH_CONFIG.cookies.accessToken.name,
			`session_${Date.now()}`,
			AUTH_CONFIG.cookies.accessToken.options
		);

		// Set user identity token (not revealing actual data but marking signed in state)
		await cookieStore.set(AUTH_CONFIG.cookies.idToken.name, `user_${Date.now()}`, AUTH_CONFIG.cookies.idToken.options);

		logAuthEvent("Registration and login successful", {
			customerId: customerCreate.customer?.id,
			email,
		});

		return Response.json({
			success: true,
			autoLogin: true,
			redirectUrl: "/account",
			csrfToken, // Send CSRF token to client
		});
	} catch (error) {
		logAuthEvent("Registration error", {
			error: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
		});

		return createErrorResponse("An unexpected error occurred during registration", 500);
	}
}
