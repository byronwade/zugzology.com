import { cookies } from "next/headers";
import { getCustomer } from "@/lib/services/shopify-customer";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { AUTH_CONFIG, logAuthEvent } from "@/lib/config/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
	try {
		// Force dynamic response
		headers();

		const cookieStore = await cookies();
		const customerAccessToken = cookieStore.get(AUTH_CONFIG.cookies.customerAccessToken.name)?.value;
		const accessToken = cookieStore.get(AUTH_CONFIG.cookies.accessToken.name)?.value;
		const idToken = cookieStore.get(AUTH_CONFIG.cookies.idToken.name)?.value;

		if (!customerAccessToken || !accessToken || !idToken) {
			logAuthEvent("Auth check failed", {
				hasCustomerToken: !!customerAccessToken,
				hasAccessToken: !!accessToken,
				hasIdToken: !!idToken,
			});
			return new NextResponse(JSON.stringify({ isAuthenticated: false }), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store, must-revalidate",
					Pragma: "no-cache",
				},
			});
		}

		logAuthEvent("Verifying customer token", { timestamp: new Date().toISOString() });
		const customer = await getCustomer(customerAccessToken);
		const isAuthenticated = !!customer;

		logAuthEvent("Auth check completed", {
			isAuthenticated,
			customerId: customer?.id,
			email: customer?.email,
		});

		return new NextResponse(JSON.stringify({ isAuthenticated, customer }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store, must-revalidate",
				Pragma: "no-cache",
			},
		});
	} catch (error) {
		logAuthEvent("Auth check error", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return new NextResponse(JSON.stringify({ isAuthenticated: false }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store, must-revalidate",
				Pragma: "no-cache",
			},
		});
	}
}
