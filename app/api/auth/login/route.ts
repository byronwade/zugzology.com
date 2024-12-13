import { cookies } from "next/headers";
import { customerLogin } from "@/lib/services/shopify-customer";

export async function POST(request: Request) {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return Response.json({ message: "Email and password are required" }, { status: 400 });
		}

		const { accessToken, expiresAt } = await customerLogin(email, password);

		// Set the access token in an HTTP-only cookie
		const cookieStore = await cookies();
		await cookieStore.set({
			name: "customerAccessToken",
			value: accessToken,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			expires: new Date(expiresAt),
			path: "/",
		});

		return Response.json({ success: true });
	} catch (error) {
		console.error("Login error:", error);
		return Response.json({ message: error instanceof Error ? error.message : "Login failed" }, { status: 401 });
	}
}
