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

// Validate required environment variables
if (!shopifyConfig.shopId || !shopifyConfig.clientId || !shopifyConfig.clientSecret) {
	throw new Error("Missing required environment variables for Shopify authentication. Check SHOPIFY_SHOP_ID, SHOPIFY_CLIENT_ID, and SHOPIFY_CLIENT_SECRET are set.");
}

// Add custom error logging for debugging
const logAuthError = (message: string, error?: unknown) => {
	console.error(`🔐 [NextAuth] ${message}`, error);
};

export const authConfig: NextAuthConfig = {
	debug: false, // Disable debug mode
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
				}

				// Add ID token if available
				if (token?.idToken) {
					session.idToken = token.idToken as string;
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
				}

				// Save the ID token if available
				if (account?.id_token) {
					token.idToken = account.id_token;
				}

				return token;
			} catch (error) {
				logAuthError("Error in JWT callback", error);
				return token;
			}
		},
		async redirect({ url, baseUrl }) {
			try {
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
				// Silent sign in
			} catch (error) {
				logAuthError("Error in signIn event", error);
			}
		},
		async signOut(message) {
			try {
				// Silent sign out
			} catch (error) {
				logAuthError("Error in signOut event", error);
			}
		},
		async session(message) {
			try {
				// Silent session update
			} catch (error) {
				logAuthError("Error in session event", error);
			}
		},
	},
};

// Create and export the auth functions
const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Export the auth functions individually
export { handlers, auth, signIn, signOut };

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
