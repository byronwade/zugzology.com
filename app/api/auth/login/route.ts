import { cookies } from "next/headers";

export async function POST(request: Request) {
	try {
		console.log("🔐 [Login] Starting login process...");

		// Validate required environment variables
		if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) {
			throw new Error("Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN environment variable");
		}
		if (!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
			throw new Error("Missing NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable");
		}

		const { email, password } = await request.json();
		console.log("📧 [Login] Email provided:", email);

		if (!email || !password) {
			console.error("❌ [Login] Missing email or password");
			return Response.json({ message: "Email and password are required" }, { status: 400 });
		}

		// Create access token using Shopify's Storefront API
		const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
		const response = await fetch(`https://${shopDomain}/api/2024-01/graphql`, {
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

		const { data, errors } = await response.json();

		if (errors) {
			console.error("❌ [Login] GraphQL errors:", errors);
			return Response.json({ message: errors[0].message }, { status: 400 });
		}

		const { customerAccessTokenCreate } = data;

		if (customerAccessTokenCreate.customerUserErrors?.length > 0) {
			const error = customerAccessTokenCreate.customerUserErrors[0];
			console.error("❌ [Login] Customer errors:", error);
			return Response.json({ message: error.message }, { status: 400 });
		}

		// Store the access token in a cookie
		const { accessToken, expiresAt } = customerAccessTokenCreate.customerAccessToken;

		console.log("✅ [Login] Login successful");

		return new Response(
			JSON.stringify({
				success: true,
				redirectTo: "/account", // Redirect to your custom admin panel
			}),
			{
				headers: {
					"Content-Type": "application/json",
					"Set-Cookie": `customerAccessToken=${accessToken}; Path=/; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}Expires=${new Date(expiresAt).toUTCString()}; SameSite=Lax`,
				},
			}
		);
	} catch (error) {
		console.error("💥 [Login] Error:", error);
		return Response.json({ message: error instanceof Error ? error.message : "Login failed" }, { status: 500 });
	}
}
