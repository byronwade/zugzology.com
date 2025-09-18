import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/lib/config/auth";
import { getSession } from "@/lib/actions/session";

export const dynamic = 'force-dynamic';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
	try {
		// Use the custom session management instead of Next.js auth
		const session = await getSession();

		// Also check custom auth system
		const cookieStore = await cookies();
		const customerAccessToken = await cookieStore.get(AUTH_CONFIG.cookies.customerAccessToken.name);
		const customAuthToken = customerAccessToken?.value;

		console.log("🔍 [AccountLayout] Auth status:", {
			sessionUser: !!session?.user,
			customAuthToken: !!customAuthToken,
		});

		// Redirect if not authenticated in either system
		if (!session?.user && !customAuthToken) {
			console.log("❌ [AccountLayout] No authentication found, redirecting to login");
			redirect("/login?redirect=/account");
		}

		return <>{children}</>;
	} catch (error) {
		console.error("❌ [AccountLayout] Error checking authentication:", error);
		redirect("/login?redirect=/account");
	}
}
