import { cookies } from "next/headers";

export async function POST(request: Request) {
	try {
		console.log("🔐 [Register] Starting registration process...");

		// Validate required environment variables
		if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) {
			throw new Error("Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN environment variable");
		}
		if (!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
			throw new Error("Missing NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable");
		}

		const { firstName, lastName, email, password } = await request.json();

		if (!email || !firstName || !lastName || !password) {
			return Response.json({ message: "All fields are required" }, { status: 400 });
		}

		console.log("📧 [Register] Creating customer:", { email, firstName, lastName });

		// Create customer using Shopify Storefront API
		const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
		const response = await fetch(`https://${shopDomain}/api/2024-01/graphql`, {
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

		const { data, errors } = await response.json();

		if (errors) {
			console.error("❌ [Register] GraphQL errors:", errors);
			return Response.json({ message: errors[0].message }, { status: 400 });
		}

		const { customerCreate } = data;

		if (customerCreate.customerUserErrors?.length > 0) {
			const error = customerCreate.customerUserErrors[0];
			console.error("❌ [Register] Customer creation error:", error);
			return Response.json({ message: error.message }, { status: 400 });
		}

		console.log("✅ [Register] Customer created successfully:", customerCreate.customer);

		// Immediately create an access token for the new customer
		const loginResponse = await fetch(`https://${shopDomain}/api/2024-01/graphql`, {
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

		const loginData = await loginResponse.json();

		if (loginData.errors || loginData.data?.customerAccessTokenCreate?.customerUserErrors?.length > 0) {
			console.error("❌ [Register] Failed to create access token:", loginData);
			return Response.json({ message: "Account created but unable to log in automatically" }, { status: 400 });
		}

		const { accessToken, expiresAt } = loginData.data.customerAccessTokenCreate.customerAccessToken;

		// Return success with the token in a cookie
		return new Response(JSON.stringify({ success: true, customer: customerCreate.customer }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Set-Cookie": `customerAccessToken=${accessToken}; Path=/; HttpOnly; Expires=${new Date(expiresAt).toUTCString()}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
			},
		});
	} catch (error) {
		console.error("❌ [Register] Error:", error);
		return Response.json(
			{
				message: error instanceof Error ? error.message : "Registration failed",
			},
			{ status: 500 }
		);
	}
}
