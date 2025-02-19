import { randomBytes } from "crypto";

export const AUTH_CONFIG = {
	// Shopify Storefront API endpoints
	endpoints: {
		graphql: `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql`,
	},
	// Cookie settings
	cookies: {
		customerAccessToken: {
			name: "customerAccessToken",
			options: {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax" as const,
				path: "/",
			},
		},
	},
};

// Logging helper
export const logAuthEvent = (event: string, details: Record<string, any>) => {
	console.log(`🔐 [Auth] ${event}:`, {
		timestamp: new Date().toISOString(),
		...details,
	});
};
