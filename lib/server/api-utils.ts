import { cookies } from "next/headers";
import { AUTH_CONFIG, logAuthEvent } from "@/lib/config/auth";
import { NextRequest } from "next/server";

/**
 * Verifies that a valid CSRF token is present in the request
 * This helps prevent Cross-Site Request Forgery attacks
 */
export async function verifyCsrfToken(request: NextRequest | Request): Promise<boolean> {
	try {
		// First get the token from cookies
		const cookieStore = await cookies();
		const csrfCookie = await cookieStore.get(AUTH_CONFIG.cookies.csrfToken.name);

		if (!csrfCookie?.value) {
			logAuthEvent("CSRF verification failed", { error: "No CSRF token in cookies" });
			return false;
		}

		// Then get the token from the request header
		const csrfHeader = request.headers.get("X-CSRF-Token");

		if (!csrfHeader) {
			logAuthEvent("CSRF verification failed", { error: "No CSRF token in headers" });
			return false;
		}

		// Compare the two tokens
		const isValid = csrfCookie.value === csrfHeader;

		if (!isValid) {
			logAuthEvent("CSRF verification failed", {
				error: "CSRF token mismatch",
				cookieToken: csrfCookie.value.substring(0, 10) + "...",
				headerToken: csrfHeader.substring(0, 10) + "...",
			});
		}

		return isValid;
	} catch (error) {
		logAuthEvent("CSRF verification error", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return false;
	}
}

/**
 * Verifies that the user is authenticated
 */
export async function verifyAuthentication(): Promise<boolean> {
	try {
		const cookieStore = await cookies();
		const customerAccessToken = await cookieStore.get(AUTH_CONFIG.cookies.customerAccessToken.name);
		const sessionToken = await cookieStore.get(AUTH_CONFIG.cookies.accessToken.name);
		const idToken = await cookieStore.get(AUTH_CONFIG.cookies.idToken.name);

		// Basic check - all tokens must exist
		return !!customerAccessToken && !!sessionToken && !!idToken;
	} catch (error) {
		logAuthEvent("Authentication verification error", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return false;
	}
}

/**
 * Extracts the customer access token from cookies
 */
export async function getCustomerAccessToken(): Promise<string | null> {
	try {
		const cookieStore = await cookies();
		const token = await cookieStore.get(AUTH_CONFIG.cookies.customerAccessToken.name);
		return token?.value || null;
	} catch (error) {
		logAuthEvent("Error getting customer access token", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return null;
	}
}

/**
 * Standard JSON error response for API routes
 */
export function createErrorResponse(message: string, status = 400): Response {
	return Response.json({ success: false, message }, { status });
}

/**
 * Helper function to parse JSON body with error handling
 */
export async function parseRequestBody<T>(request: Request): Promise<T | null> {
	try {
		return (await request.json()) as T;
	} catch (error) {
		return null;
	}
}
