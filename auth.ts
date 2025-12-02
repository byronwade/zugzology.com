import type { Account } from "next-auth";
import NextAuth, { type AuthOptions, type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { logAuthEvent } from "@/lib/config/auth";
import Shopify from "./src/auth/providers/shopify";

// Ensure environment variables are properly typed
const shopifyConfig = {
	shopId: process.env.SHOPIFY_SHOP_ID,
	// Keep the 'shp_' prefix if present in the client ID
	clientId: process.env.SHOPIFY_CLIENT_ID || "",
	clientSecret: process.env.SHOPIFY_CLIENT_SECRET,
};

const hasShopifyCredentials = Boolean(shopifyConfig.shopId && shopifyConfig.clientId && shopifyConfig.clientSecret);

// Credentials will fall back to error provider if not configured

const providers = hasShopifyCredentials
	? [
			Shopify({
				shopId: shopifyConfig.shopId as string,
				clientId: shopifyConfig.clientId,
				clientSecret: shopifyConfig.clientSecret as string,
			}),
		]
	: [
			Credentials({
				id: "shopify",
				name: "Shopify",
				credentials: {},
				authorize: () => {
					throw new Error(
						"Shopify authentication is not configured. Please set SHOPIFY_SHOP_ID, SHOPIFY_CLIENT_ID, and SHOPIFY_CLIENT_SECRET."
					);
				},
			}),
		];

// Add custom error logging for debugging - noop in production
// biome-ignore lint/suspicious/noEmptyBlockStatements: intentional noop
const logAuthError = (_message: string, _error?: unknown) => {};

export const authConfig: AuthOptions = {
	debug: false, // Disable debug mode
	providers,
	callbacks: {
		// biome-ignore lint/suspicious/useAwait: NextAuth requires async callbacks
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
		// biome-ignore lint/suspicious/useAwait: NextAuth requires async callbacks
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
		// biome-ignore lint/suspicious/useAwait: NextAuth requires async callbacks
		async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
			try {
				logAuthEvent("[NextAuth] redirect callback invoked", {
					targetUrl: url,
					baseUrl,
				});
				// Ensure we always redirect to a valid URL
				if (url.startsWith(baseUrl)) {
					return url;
				}
				if (url.startsWith("/")) {
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
		signIn(message) {
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
		signOut(message) {
			try {
				logAuthEvent("[NextAuth] signOut event", {
					hasToken: !!message?.token,
				});
			} catch (error) {
				logAuthError("Error in signOut event", error);
			}
		},
		session(message) {
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
const { GET, POST } = handlers || { GET: undefined, POST: undefined };

// Export the auth functions individually
export { handlers, auth, signIn, signOut, GET, POST };

// Extend the Session type to include Shopify access token and ID token
declare module "next-auth" {
	// biome-ignore lint/nursery/noShadow: Module augmentation requires same name
	type Session = {
		shopifyAccessToken?: string;
		idToken?: string;
	};
}

// Extend JWT to include Shopify access token and ID token
declare module "next-auth" {
	// biome-ignore lint/nursery/noShadow: Module augmentation requires same name
	type JWT = {
		shopifyAccessToken?: string;
		idToken?: string;
	};
}
