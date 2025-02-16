import { cookies } from "next/headers";

export async function POST() {
	try {
		console.log("🔒 [Logout] Starting logout process...");

		// Get the current token
		const cookieStore = await cookies();
		const token = cookieStore.get("customerAccessToken");

		if (token) {
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
						customerAccessToken: token.value,
					},
				}),
			});

			const data = await response.json();
			console.log("✅ [Logout] Shopify token deleted:", data);
		}

		// Return a response that clears our cookie
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Set-Cookie": `customerAccessToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
			},
		});
	} catch (error) {
		console.error("❌ [Logout] Error:", error);
		return Response.json({ message: error instanceof Error ? error.message : "Logout failed" }, { status: 500 });
	}
}
