import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const code = url.searchParams.get("code");
		const state = url.searchParams.get("state");
		const error = url.searchParams.get("error");
		const errorDescription = url.searchParams.get("error_description");

		const cookieStore = await cookies();
		const storedState = await cookieStore.get("auth_state");
		const codeVerifier = await cookieStore.get("pkce_verifier");
		const tempCredentials = await cookieStore.get("temp_credentials");

		// Clear sensitive cookies
		await cookieStore.delete("auth_state");
		await cookieStore.delete("pkce_verifier");
		await cookieStore.delete("temp_credentials");

		if (error) {
			console.error("❌ [Auth] OAuth error:", error, errorDescription);
			return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=${encodeURIComponent(errorDescription || "Authentication failed")}`);
		}

		if (!code || !state) {
			console.error("❌ [Auth] Missing code or state");
			return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=Invalid response`);
		}

		if (!storedState || state !== storedState.value) {
			console.error("❌ [Auth] State mismatch");
			return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=Invalid state`);
		}

		if (!codeVerifier) {
			console.error("❌ [Auth] Missing code verifier");
			return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=Invalid request`);
		}

		if (!tempCredentials) {
			console.error("❌ [Auth] Missing temporary credentials");
			return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=Session expired`);
		}

		// Exchange code for tokens using form data
		const formData = new URLSearchParams();
		formData.append("grant_type", "authorization_code");
		formData.append("client_id", process.env.SHOPIFY_CLIENT_ID as string);
		formData.append("code_verifier", codeVerifier.value);
		formData.append("code", code);
		formData.append("redirect_uri", `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`);

		console.log("🔄 [Auth] Token request data:", Object.fromEntries(formData));

		const tokenResponse = await fetch(`https://shopify.com/authentication/${process.env.SHOPIFY_SHOP_ID}/oauth/token`, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: formData.toString(),
		});

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			console.error("❌ [Auth] Token exchange failed:", errorText);
			return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=Authentication failed: ${encodeURIComponent(errorText)}`);
		}

		const tokens = await tokenResponse.json();
		const { access_token, id_token } = tokens;

		// Store the tokens in cookies
		await cookieStore.set({
			name: "access_token",
			value: access_token,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
		});

		await cookieStore.set({
			name: "id_token",
			value: id_token,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
		});

		// Now use the credentials to get a customer access token
		const { email, password } = JSON.parse(tempCredentials.value);
		const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
		const storefront = new URL(`https://${shopDomain}/api/2024-01/graphql`);

		const customerResponse = await fetch(storefront.toString(), {
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

		const customerData = await customerResponse.json();
		const { customerAccessTokenCreate } = customerData.data;

		if (customerAccessTokenCreate.customerUserErrors?.length > 0) {
			console.error("❌ [Auth] Customer errors:", customerAccessTokenCreate.customerUserErrors);
			return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=${encodeURIComponent(customerAccessTokenCreate.customerUserErrors[0].message)}`);
		}

		const { accessToken, expiresAt } = customerAccessTokenCreate.customerAccessToken;

		// Set the customer access token in cookies
		await cookieStore.set({
			name: "customerAccessToken",
			value: accessToken,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			expires: new Date(expiresAt),
			path: "/",
		});

		console.log("✅ [Auth] Authentication successful!");
		return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/account`);
	} catch (error) {
		console.error("❌ [Auth] Callback error:", error);
		return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=${encodeURIComponent(error instanceof Error ? error.message : "Authentication failed")}`);
	}
}
