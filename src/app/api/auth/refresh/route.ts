import { cookies } from "next/headers";

export async function POST() {
	try {
		const cookieStore = await cookies();
		const refreshToken = cookieStore.get("customerRefreshToken");

		if (!refreshToken) {
			return Response.json({ message: "No refresh token found" }, { status: 401 });
		}

		// Exchange refresh token for new access token
		const response = await fetch(`https://shopify.com/authentication/${process.env.SHOPIFY_SHOP_ID}/oauth/token`, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				grant_type: "refresh_token",
				client_id: process.env.SHOPIFY_CLIENT_ID as string,
				refresh_token: refreshToken.value,
			}),
		});

		if (!response.ok) {
			// If refresh token is invalid, clear all auth cookies
			await cookieStore.delete({ name: "customerAccessToken", path: "/" });
			await cookieStore.delete({ name: "customerRefreshToken", path: "/" });
			return Response.json({ message: "Invalid refresh token" }, { status: 401 });
		}

		const { access_token, expires_in, refresh_token } = await response.json();

		// Set new tokens in cookies
		await cookieStore.set({
			name: "customerAccessToken",
			value: access_token,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			expires: new Date(Date.now() + expires_in * 1000),
			path: "/",
		});

		if (refresh_token) {
			await cookieStore.set({
				name: "customerRefreshToken",
				value: refresh_token,
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
				path: "/",
			});
		}

		return Response.json({ success: true });
	} catch (error) {
		return Response.json({ message: error instanceof Error ? error.message : "Token refresh failed" }, { status: 500 });
	}
}
