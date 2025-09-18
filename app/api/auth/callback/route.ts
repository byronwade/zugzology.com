import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_CONFIG, logAuthEvent } from "@/lib/config/auth";

// Dynamic rendering handled by dynamicIO experimental feature

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const code = url.searchParams.get("code");
		const state = url.searchParams.get("state");
		const error = url.searchParams.get("error");
		const errorDescription = url.searchParams.get("error_description");

		logAuthEvent("Callback received", {
			code: code ? "present" : "missing",
			state: state ? "present" : "missing",
			error,
			errorDescription,
		});

		const cookieStore = await cookies();
		const storedState = await cookieStore.get("auth_state");
		const codeVerifier = await cookieStore.get("pkce_verifier");
		const tempCredentials = await cookieStore.get("temp_credentials");

		// Clear sensitive cookies
		await cookieStore.delete({
			name: "auth_state",
			path: "/",
		});
		await cookieStore.delete({
			name: "pkce_verifier",
			path: "/",
		});
		await cookieStore.delete({
			name: "temp_credentials",
			path: "/",
		});

		if (error) {
			logAuthEvent("OAuth error", { error, errorDescription });
			return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=${encodeURIComponent(errorDescription || "Authentication failed")}`);
		}

		if (!code || !state) {
			logAuthEvent("Missing parameters", { code: !!code, state: !!state });
			return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=Invalid response`);
		}

		if (!storedState || state !== storedState.value) {
			logAuthEvent("State mismatch", {
				receivedState: state,
				storedStateExists: !!storedState,
			});
			return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=Invalid state`);
		}

		if (!codeVerifier) {
			logAuthEvent("Missing code verifier", { timestamp: new Date().toISOString() });
			return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=Invalid request`);
		}

		if (!tempCredentials) {
			logAuthEvent("Missing temporary credentials", { timestamp: new Date().toISOString() });
			return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=Session expired`);
		}

		// Exchange code for tokens using form data
		const formData = new URLSearchParams();
		formData.append("grant_type", "authorization_code");
		formData.append("client_id", AUTH_CONFIG.oauth.clientId);
		formData.append("code_verifier", codeVerifier.value);
		formData.append("code", code);
		formData.append("redirect_uri", AUTH_CONFIG.oauth.redirectUri);

		logAuthEvent("Token exchange started", {
			grantType: "authorization_code",
			redirectUri: AUTH_CONFIG.oauth.redirectUri,
		});

		const tokenResponse = await fetch(AUTH_CONFIG.endpoints.token, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: formData.toString(),
		});

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			logAuthEvent("Token exchange failed", {
				status: tokenResponse.status,
				error: errorText,
			});
			return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=Authentication failed: ${encodeURIComponent(errorText)}`);
		}

		const tokens = await tokenResponse.json();
		const { access_token, id_token } = tokens;

		logAuthEvent("Tokens received", {
			hasAccessToken: !!access_token,
			hasIdToken: !!id_token,
		});

		// Store the tokens in cookies
		await cookieStore.set(AUTH_CONFIG.cookies.accessToken.name, access_token, {
			...AUTH_CONFIG.cookies.accessToken.options,
			// Set expiry based on token expiry or default to 1 hour
			maxAge: tokens.expires_in || 3600,
		});

		await cookieStore.set(AUTH_CONFIG.cookies.idToken.name, id_token, {
			...AUTH_CONFIG.cookies.idToken.options,
			// ID tokens typically have longer expiry
			maxAge: 24 * 60 * 60, // 24 hours
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
			const error = customerAccessTokenCreate.customerUserErrors[0];
			logAuthEvent("Customer token creation failed", {
				error: error.message,
				code: error.code,
			});
			return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=${encodeURIComponent(error.message)}`);
		}

		const { accessToken, expiresAt } = customerAccessTokenCreate.customerAccessToken;

		// Set the customer access token in cookies
		await cookieStore.set(AUTH_CONFIG.cookies.customerAccessToken.name, accessToken, {
			...AUTH_CONFIG.cookies.customerAccessToken.options,
			expires: new Date(expiresAt),
		});

		logAuthEvent("Authentication successful", {
			email,
			expiresAt,
		});

		return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/account`);
	} catch (error) {
		logAuthEvent("Callback error", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=${encodeURIComponent(error instanceof Error ? error.message : "Authentication failed")}`);
	}
}
