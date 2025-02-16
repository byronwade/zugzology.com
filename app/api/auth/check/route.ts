import { cookies } from "next/headers";
import { getCustomer } from "@/lib/services/shopify-customer";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
	try {
		// Force dynamic response
		headers();

		const cookieStore = await cookies();
		const customerAccessToken = cookieStore.get("customerAccessToken")?.value;

		if (!customerAccessToken) {
			console.log("ℹ️ [Auth Check] No token found");
			return new NextResponse(JSON.stringify({ isAuthenticated: false }), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store, must-revalidate",
					Pragma: "no-cache",
				},
			});
		}

		console.log("🔍 [Auth Check] Verifying token...");
		const customer = await getCustomer(customerAccessToken);
		const isAuthenticated = !!customer;
		console.log("✅ [Auth Check] Auth state:", isAuthenticated);

		return new NextResponse(JSON.stringify({ isAuthenticated }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store, must-revalidate",
				Pragma: "no-cache",
			},
		});
	} catch (error) {
		console.error("❌ [Auth Check] Error:", error);
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
