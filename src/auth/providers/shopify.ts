import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

export type ShopifyProfile = {
	id: string;
	sub?: string;
	name?: string;
	given_name?: string;
	family_name?: string;
	firstName?: string;
	lastName?: string;
	displayName?: string;
	email?: string;
	picture?: string;
	avatarUrl?: string;
};

export default function Shopify<P extends ShopifyProfile>(
	options: OAuthUserConfig<P> & { shopId: string }
): OAuthConfig<P> {
	const { shopId } = options;
	const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

	if (!storeDomain) {
	}

	if (!options.clientId) {
		throw new Error("Missing clientId for Shopify provider");
	}

	// Ensure client ID has shp_ prefix but don't add it twice
	const clientId = options.clientId.startsWith("shp_") ? options.clientId : `shp_${options.clientId}`;

	// Get the redirect URI - ensure it matches exactly what's configured in Shopify
	const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/shopify`;

	return {
		id: "shopify",
		name: "Shopify",
		type: "oauth",
		// Remove wellKnown and explicitly set all URLs
		authorization: {
			url: `https://shopify.com/authentication/${shopId}/oauth/authorize`,
			params: {
				scope: "openid email customer-account-api:full",
				response_type: "code",
				client_id: clientId,
				redirect_uri: redirectUri,
			},
		},
		token: {
			url: `https://shopify.com/authentication/${shopId}/oauth/token`,
		},
		userinfo: {
			url: `https://shopify.com/authentication/${shopId}/oauth/userinfo`,
		},
		// Use PKCE and state for security
		checks: ["pkce", "state"],

		profile(profile) {
			// Extract user information from the profile
			return {
				id: profile.sub || profile.id,
				name:
					profile.name ||
					profile.displayName ||
					`${profile.given_name || profile.firstName || ""} ${profile.family_name || profile.lastName || ""}`.trim(),
				email: profile.email,
				image: profile.picture || profile.avatarUrl,
			};
		},
		style: {
			logo: "/shopify.svg",
			bg: "#95BF47",
			text: "#ffffff",
		},
	};
}
