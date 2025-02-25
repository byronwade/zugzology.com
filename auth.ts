import NextAuth from "next-auth";
import Shopify from "./auth/providers/shopify";
import { NextAuthConfig } from "next-auth";

// Ensure environment variables are properly typed
const shopifyConfig = {
	shopId: process.env.SHOPIFY_SHOP_ID,
	// Keep the 'shp_' prefix if present in the client ID
	clientId: process.env.SHOPIFY_CLIENT_ID || "",
	clientSecret: process.env.SHOPIFY_CLIENT_SECRET,
};

// Log configuration for debugging
console.log("🔐 [NextAuth] Shopify Auth Config:", {
	shopId: shopifyConfig.shopId,
	clientId: shopifyConfig.clientId?.substring(0, 10) + "...", // Only log part of the client ID for security
	hasSecret: !!shopifyConfig.clientSecret,
	nextAuthUrl: process.env.NEXTAUTH_URL,
	environment: process.env.NODE_ENV,
});

// Validate required environment variables
if (!shopifyConfig.shopId || !shopifyConfig.clientId || !shopifyConfig.clientSecret) {
	throw new Error("Missing required environment variables for Shopify authentication. Check SHOPIFY_SHOP_ID, SHOPIFY_CLIENT_ID, and SHOPIFY_CLIENT_SECRET are set.");
}

// Add custom error logging for debugging
const logAuthError = (message: string, error?: unknown) => {
	console.error(`🔐 [NextAuth] ${message}`, error);
};

export const authConfig: NextAuthConfig = {
	debug: true, // Enable debug mode to help troubleshoot
	providers: [
		Shopify({
			shopId: shopifyConfig.shopId,
			clientId: shopifyConfig.clientId,
			clientSecret: shopifyConfig.clientSecret as string,
		}),
	],
	callbacks: {
		async session({ session, token }) {
			try {
				// Add the shopify access token to the session
				if (token?.shopifyAccessToken) {
					session.shopifyAccessToken = token.shopifyAccessToken as string;
					console.log("🔐 [NextAuth] Added Shopify access token to session");
				} else {
					console.log("⚠️ [NextAuth] No Shopify access token in token object");
				}

				// Add ID token if available
				if (token?.idToken) {
					session.idToken = token.idToken as string;
					console.log("🔐 [NextAuth] Added ID token to session");
				}

				return session;
			} catch (error) {
				logAuthError("Error in session callback", error);
				return session;
			}
		},
		async jwt({ token, account }) {
			try {
				// Save the access token from the initial sign-in
				if (account?.access_token) {
					token.shopifyAccessToken = account.access_token;
					console.log("🔐 [NextAuth] Saved Shopify access token to JWT");
				} else if (token.shopifyAccessToken) {
					console.log("🔐 [NextAuth] Using existing Shopify access token from JWT");
				} else {
					console.log("⚠️ [NextAuth] No access token available for JWT");
				}

				// Save the ID token if available
				if (account?.id_token) {
					token.idToken = account.id_token;
					console.log("🔐 [NextAuth] Saved ID token to JWT");
				}

				return token;
			} catch (error) {
				logAuthError("Error in JWT callback", error);
				return token;
			}
		},
		async redirect({ url, baseUrl }) {
			try {
				console.log("🔐 [NextAuth] Redirect callback", { url, baseUrl });
				// Ensure we always redirect to a valid URL
				if (url.startsWith(baseUrl)) {
					return url;
				} else if (url.startsWith("/")) {
					return `${baseUrl}${url}`;
				}
				return baseUrl;
			} catch (error) {
				logAuthError("Error in redirect callback", error);
				return baseUrl;
			}
		},
	},
	pages: {
		signIn: "/login",
		error: "/error",
	},
	events: {
		async signIn(message) {
			try {
				console.log("🔐 [NextAuth] User signed in", {
					user: message.user.email,
					account: message.account?.provider,
					timestamp: new Date().toISOString(),
				});
			} catch (error) {
				logAuthError("Error in signIn event", error);
			}
		},
		async signOut(message) {
			try {
				console.log("🔐 [NextAuth] User signed out", {
					timestamp: new Date().toISOString(),
				});
			} catch (error) {
				logAuthError("Error in signOut event", error);
			}
		},
		async session(message) {
			try {
				console.log("🔐 [NextAuth] Session updated", {
					timestamp: new Date().toISOString(),
				});
			} catch (error) {
				logAuthError("Error in session event", error);
			}
		},
	},
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Extend the Session type to include Shopify access token and ID token
declare module "next-auth" {
	interface Session {
		shopifyAccessToken?: string;
		idToken?: string;
	}
}

// Extend JWT to include Shopify access token and ID token
declare module "next-auth" {
	interface JWT {
		shopifyAccessToken?: string;
		idToken?: string;
	}
}
