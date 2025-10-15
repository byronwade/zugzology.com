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

	// Create response object
	let response: NextResponse;

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

			response = NextResponse.redirect(url);
			response.headers.set("x-middleware-cache", "no-cache");
		} else {
			response = NextResponse.next();
		}
	}
	// Handle auth routes (login/register)
	else if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
		if (isAuthenticated) {
			// If user is already logged in, redirect to account
			// But only if they're not being redirected from a protected route
			const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
			if (callbackUrl && protectedRoutes.some((route) => callbackUrl.startsWith(route))) {
				response = NextResponse.redirect(new URL(callbackUrl, request.url));
			} else {
				response = NextResponse.redirect(new URL("/account", request.url));
			}
			response.headers.set("x-middleware-cache", "no-cache");
		} else {
			response = NextResponse.next();
		}
	} else {
		response = NextResponse.next();
	}

	// Add security headers to all responses
	response.headers.set("X-DNS-Prefetch-Control", "on");
	response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
	response.headers.set("X-Frame-Options", "SAMEORIGIN");
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("X-XSS-Protection", "1; mode=block");
	response.headers.set("Referrer-Policy", "origin-when-cross-origin");
	response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

	// Content Security Policy (basic - customize as needed)
	response.headers.set(
		"Content-Security-Policy",
		"default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.shopify.com https://*.googletagmanager.com https://*.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://cdn.shopify.com https://*.shopify.com https://*.google-analytics.com; frame-src 'self' https://*.shopify.com;"
	);

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
