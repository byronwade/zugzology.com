"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_CONFIG } from "@/lib/config/auth";
import { clearSession, getSession } from "@/lib/actions/session";
import { getCustomer } from "@/lib/services/shopify-customer";
import type { ShopifyCustomer } from "@/lib/types";

interface RequireCustomerOptions {
	redirectTo?: string;
}

interface CustomerSessionResult {
	customer: ShopifyCustomer;
	token: string;
}

const DEFAULT_REDIRECT = "/login";

/**
 * Ensures a valid Shopify customer session exists for the current request.
 * Redirects to the login page when no usable customer access token is present.
 */
export async function requireCustomerSession(
	requestedPath: string,
	options: RequireCustomerOptions = {}
): Promise<CustomerSessionResult> {
	const redirectTarget = options.redirectTo ?? DEFAULT_REDIRECT;
	const delimiter = redirectTarget.includes("?") ? "&" : "?";
	const loginUrl = `${redirectTarget}${delimiter}redirect=${encodeURIComponent(requestedPath)}`;

	const cookieStore = await cookies();
	const cookieToken = cookieStore.get(AUTH_CONFIG.cookies.customerAccessToken.name)?.value;

	// Fall back to the session helper which reads the same cookies but keeps parity with the rest of the app.
	const session = await getSession();
	const sessionToken = session?.user?.customerAccessToken;

	const customerAccessToken = cookieToken ?? sessionToken;

	if (!customerAccessToken) {
		redirect(loginUrl);
	}

	try {
		const customer = await getCustomer(customerAccessToken);

		if (!customer) {
			await safeClearSession();
			redirect(loginUrl);
		}

		return {
			customer,
			token: customerAccessToken,
		};
	} catch (error) {
		console.error("❌ [CustomerSession] Failed to resolve customer session", error);
		await safeClearSession();
		redirect(loginUrl);
	}
}

async function safeClearSession() {
	try {
		await clearSession();
	} catch (error) {
		console.warn("⚠️ [CustomerSession] Unable to clear session", error);
	}
}
