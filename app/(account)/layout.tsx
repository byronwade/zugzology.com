"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/lib/config/auth";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
	try {
		// Check NextAuth session
		const session = await auth();

		// Also check custom auth system
		const cookieStore = await cookies();
		const customerAccessToken = await cookieStore.get(AUTH_CONFIG.cookies.customerAccessToken.name);
		const customAuthToken = customerAccessToken?.value;

		console.log("🔍 [AccountLayout] Auth status:", {
			nextAuthSession: !!session,
			customAuthToken: !!customAuthToken,
		});

		// Redirect if not authenticated in either system
		if (!session && !customAuthToken) {
			console.log("❌ [AccountLayout] No authentication found, redirecting to login");
			redirect("/login?redirect=/account");
		}

		return <>{children}</>;
	} catch (error) {
		console.error("❌ [AccountLayout] Error checking authentication:", error);
		redirect("/login?redirect=/account");
	}
}
