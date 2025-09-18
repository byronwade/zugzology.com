import NextAuth, { type AuthOptions, type Session } from "next-auth";
import type { Account } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Shopify from "./auth/providers/shopify";
import Credentials from "next-auth/providers/credentials";
import { logAuthEvent } from "@/lib/config/auth";

// Ensure environment variables are properly typed
const shopifyConfig = {
	shopId: process.env.SHOPIFY_SHOP_ID,
	// Keep the 'shp_' prefix if present in the client ID
	clientId: process.env.SHOPIFY_CLIENT_ID || "",
	clientSecret: process.env.SHOPIFY_CLIENT_SECRET,
};

const hasShopifyCredentials = Boolean(
	shopifyConfig.shopId && shopifyConfig.clientId && shopifyConfig.clientSecret
);

if (!hasShopifyCredentials) {
	console.warn(
		"[NextAuth] Shopify OAuth credentials are missing. Set SHOPIFY_SHOP_ID, SHOPIFY_CLIENT_ID, and SHOPIFY_CLIENT_SECRET to enable login."
	);
}

const providers = hasShopifyCredentials
	? [
		Shopify({
			shopId: shopifyConfig.shopId,
			clientId: shopifyConfig.clientId,
			clientSecret: shopifyConfig.clientSecret as string,
		}),
	]
	: [
		Credentials({
			id: "shopify",
			name: "Shopify",
			credentials: {},
			authorize: async () => {
				throw new Error(
					"Shopify authentication is not configured. Please set SHOPIFY_SHOP_ID, SHOPIFY_CLIENT_ID, and SHOPIFY_CLIENT_SECRET."
				);
			},
		}),
	];

// Add custom error logging for debugging
const logAuthError = (message: string, error?: unknown) => {
	console.error(`🔐 [NextAuth] ${message}`, error);
};

export const authConfig: AuthOptions = {
	debug: false, // Disable debug mode
	providers,
	callbacks: {
		async session({ session, token }: { session: Session; token: JWT }) {
			try {
				logAuthEvent("[NextAuth] session callback invoked", {
					hasToken: !!token,
					hasSessionUser: !!session?.user,
				});
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
		async jwt({ token, account }: { token: JWT; account?: Account | null }) {
			try {
				logAuthEvent("[NextAuth] jwt callback invoked", {
					hasAccount: !!account,
					hasExistingToken: !!token?.shopifyAccessToken,
				});
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
		async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
			try {
				logAuthEvent("[NextAuth] redirect callback invoked", {
					targetUrl: url,
					baseUrl,
				});
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
				logAuthEvent("[NextAuth] signIn event", {
					userEmail: message?.user?.email,
					provider: message?.account?.provider,
					isNewUser: message?.isNewUser ?? false,
				});
			} catch (error) {
				logAuthError("Error in signIn event", error);
			}
		},
		async signOut(message) {
			try {
				logAuthEvent("[NextAuth] signOut event", {
					hasToken: !!message?.token,
				});
			} catch (error) {
				logAuthError("Error in signOut event", error);
			}
		},
		async session(message) {
			try {
				logAuthEvent("[NextAuth] session event", {
					hasSession: !!message?.session,
					hasToken: !!message?.token,
				});
			} catch (error) {
				logAuthError("Error in session event", error);
			}
		},
	},
};

// Create and export the auth functions
const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
const { GET, POST } = handlers;

// Export the auth functions individually
export { handlers, auth, signIn, signOut, GET, POST };

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
