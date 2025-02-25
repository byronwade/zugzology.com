import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = ["/account"];

// Auth-related constants - must match the ones in AUTH_CONFIG
const AUTH_COOKIE_NAMES = {
	accessToken: "accessToken",
	customerAccessToken: "customerAccessToken",
	idToken: "idToken"
};

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if the route is protected
	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

	// Get all authentication tokens - all must be present for valid auth
	const customerAccessToken = request.cookies.get(AUTH_COOKIE_NAMES.customerAccessToken);
	const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.accessToken);
	const idToken = request.cookies.get(AUTH_COOKIE_NAMES.idToken);
	
	// Determine if the user is authenticated
	const isAuthenticated = !!customerAccessToken && !!accessToken && !!idToken;

	// Handle protected routes
	if (isProtectedRoute) {
		if (!isAuthenticated) {
			// Store the original URL to redirect back after login
			const url = new URL("/login", request.url);
			url.searchParams.set("callbackUrl", pathname);
			
			// No console.log in Edge - use headers for debugging if needed
			const response = NextResponse.redirect(url);
			response.headers.set("x-middleware-cache", "no-cache");
			return response;
		}
	}

	// Handle auth routes (login/register)
	if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
		if (isAuthenticated) {
			// If user is already logged in, redirect to account
			// But only if they're not being redirected from a protected route
			const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
			if (callbackUrl && protectedRoutes.some((route) => callbackUrl.startsWith(route))) {
				const response = NextResponse.redirect(new URL(callbackUrl, request.url));
				response.headers.set("x-middleware-cache", "no-cache");
				return response;
			}
			
			const response = NextResponse.redirect(new URL("/account", request.url));
			response.headers.set("x-middleware-cache", "no-cache");
			return response;
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/account/:path*", "/login", "/register"],
};
