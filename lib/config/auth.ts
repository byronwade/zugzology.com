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
				maxAge: 30 * 24 * 60 * 60, // 30 days in seconds (Shopify default)
			},
		},
		accessToken: {
			name: "accessToken",
			options: {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax" as const,
				path: "/",
				maxAge: 60 * 60, // 1 hour in seconds
			},
		},
		idToken: {
			name: "idToken",
			options: {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax" as const,
				path: "/",
				maxAge: 60 * 60, // 1 hour in seconds
			},
		},
		csrfToken: {
			name: "csrfToken",
			options: {
				httpOnly: false, // Needs to be accessible from JS
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax" as const,
				path: "/",
				maxAge: 60 * 60, // 1 hour in seconds
			},
		},
	},
	// Session settings
	session: {
		maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
	},
};

// Generate a random string for use as CSRF token using Web Crypto API
export function generateCsrfToken(): string {
	// Use a clientside-compatible approach for generating random tokens
	let array = new Uint8Array(32);

	if (typeof crypto !== "undefined") {
		// Browser or modern Node.js
		array = crypto.getRandomValues(array);
	} else {
		// Fallback for older environments or SSR without crypto
		for (let i = 0; i < array.length; i++) {
			array[i] = Math.floor(Math.random() * 256);
		}
	}

	// Convert to hex string
	return Array.from(array)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

// Generate a base64 encoded token
export function generateToken(data: Record<string, any>, expiresIn = "1h"): string {
	// In a real implementation, sign this with a secret key
	// For now, just encode the data with expiration
	const payload = {
		...data,
		exp: Math.floor(Date.now() / 1000) + (expiresIn === "1h" ? 3600 : 86400 * 30),
	};

	// Use btoa for base64 encoding which is available in browser environments
	return typeof btoa !== "undefined" ? btoa(JSON.stringify(payload)) : Buffer.from(JSON.stringify(payload)).toString("base64");
}

// Parse a token
export function parseToken(token: string): any {
	try {
		// Use atob for base64 decoding which is available in browser environments
		const decoded = typeof atob !== "undefined" ? atob(token) : Buffer.from(token, "base64").toString();

		return JSON.parse(decoded);
	} catch (error) {
		return null;
	}
}

// Logging helper
export function logAuthEvent(event: string, details: Record<string, any> = {}) {
	console.log(`🔐 [Auth] ${event}:`, {
		timestamp: new Date().toISOString(),
		...details,
	});
}
