import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = ["/account"];

// Auth-related constants - must match the ones in AUTH_CONFIG
const AUTH_COOKIE_NAMES = {
	accessToken: "accessToken",
	customerAccessToken: "customerAccessToken",
	idToken: "idToken",
};

// Helper function to check authentication
function isUserAuthenticated(request: NextRequest): boolean {
	const customerAccessToken = request.cookies.get(AUTH_COOKIE_NAMES.customerAccessToken);
	const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.accessToken);
	const idToken = request.cookies.get(AUTH_COOKIE_NAMES.idToken);
	return !!customerAccessToken && !!accessToken && !!idToken;
}

// Helper function to add security headers
function addSecurityHeaders(response: NextResponse): void {
	response.headers.set("X-DNS-Prefetch-Control", "on");
	response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
	// X-Frame-Options removed - using CSP frame-ancestors in next.config.ts instead
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("X-XSS-Protection", "1; mode=block");
	response.headers.set("Referrer-Policy", "origin-when-cross-origin");
	response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
	// Note: Content-Security-Policy is fully configured in next.config.ts
	// including frame-ancestors for iframe embedding from byronwade.com
}

// Helper function to handle protected routes
function handleProtectedRoute(request: NextRequest, pathname: string, isAuthenticated: boolean): NextResponse {
	if (isAuthenticated) {
		return NextResponse.next();
	}

	const url = new URL("/login", request.url);
	url.searchParams.set("callbackUrl", pathname);
	const response = NextResponse.redirect(url);
	response.headers.set("x-proxy-cache", "no-cache");
	return response;
}

// Helper function to handle auth routes
function handleAuthRoute(request: NextRequest, isAuthenticated: boolean): NextResponse {
	if (!isAuthenticated) {
		return NextResponse.next();
	}

	const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
	const redirectUrl =
		callbackUrl && protectedRoutes.some((route) => callbackUrl.startsWith(route))
			? new URL(callbackUrl, request.url)
			: new URL("/account", request.url);

	const response = NextResponse.redirect(redirectUrl);
	response.headers.set("x-proxy-cache", "no-cache");
	return response;
}

export function proxy(request: NextRequest): NextResponse {
	const { pathname } = request.nextUrl;
	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
	const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
	const isAuthenticated = isUserAuthenticated(request);

	let response: NextResponse;

	if (isProtectedRoute) {
		response = handleProtectedRoute(request, pathname, isAuthenticated);
	} else if (isAuthRoute) {
		response = handleAuthRoute(request, isAuthenticated);
	} else {
		response = NextResponse.next();
	}

	addSecurityHeaders(response);
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
