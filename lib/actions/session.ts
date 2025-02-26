"use server";

import { cookies } from "next/headers";

interface User {
	accessToken: string;
	customerAccessToken: string;
	idToken: string;
}

interface Session {
	user: User | null;
	expires: string | null;
}

class SessionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "SessionError";
	}
}

export async function getSession(): Promise<Session> {
	try {
		const cookieStore = await cookies();

		// Get all authentication tokens
		const customerAccessToken = cookieStore.get("customerAccessToken")?.value;
		const accessToken = cookieStore.get("accessToken")?.value;
		const idToken = cookieStore.get("idToken")?.value;

		// Check if user is authenticated
		const isAuthenticated = !!customerAccessToken && !!accessToken && !!idToken;

		if (!isAuthenticated) {
			return {
				user: null,
				expires: null,
			};
		}

		return {
			user: {
				accessToken,
				customerAccessToken,
				idToken,
			},
			expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
		};
	} catch (error) {
		console.error("[Session Error] Failed to get session:", error);
		throw new SessionError("Failed to get session");
	}
}

export async function setSession(session: { accessToken: string; customerAccessToken: string; idToken: string }): Promise<void> {
	try {
		const cookieStore = await cookies();
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax" as const,
			maxAge: 24 * 60 * 60, // 24 hours
			path: "/",
		};

		cookieStore.set("accessToken", session.accessToken, cookieOptions);
		cookieStore.set("customerAccessToken", session.customerAccessToken, cookieOptions);
		cookieStore.set("idToken", session.idToken, cookieOptions);
	} catch (error) {
		console.error("[Session Error] Failed to set session:", error);
		throw new SessionError("Failed to set session");
	}
}

export async function clearSession(): Promise<void> {
	try {
		const cookieStore = await cookies();
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax" as const,
			maxAge: 0, // Expire immediately
			path: "/",
		};

		cookieStore.set("accessToken", "", cookieOptions);
		cookieStore.set("customerAccessToken", "", cookieOptions);
		cookieStore.set("idToken", "", cookieOptions);
	} catch (error) {
		console.error("[Session Error] Failed to clear session:", error);
		throw new SessionError("Failed to clear session");
	}
}
