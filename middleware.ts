import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = ["/account"];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if the route is protected
	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

	// Get the token
	const token = request.cookies.get("customerAccessToken");

	// Handle protected routes
	if (isProtectedRoute) {
		if (!token) {
			// Store the original URL to redirect back after login
			const url = new URL("/login", request.url);
			url.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(url);
		}
	}

	// Handle auth routes (login/register)
	if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
		if (token) {
			// If user is already logged in, redirect to account
			// But only if they're not being redirected from a protected route
			const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
			if (callbackUrl && protectedRoutes.some((route) => callbackUrl.startsWith(route))) {
				return NextResponse.redirect(new URL(callbackUrl, request.url));
			}
			return NextResponse.redirect(new URL("/account", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/account/:path*", "/login", "/register"],
};
