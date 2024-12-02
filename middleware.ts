import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add any paths that should be protected by authentication
const protectedPaths: string[] = [];

// Add paths that should be accessible only to non-authenticated users
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
	const customerAccessToken = request.cookies.get("customerAccessToken");
	const { pathname } = request.nextUrl;

	// Check if the path is protected and user is not authenticated
	if (protectedPaths.some((path) => pathname.startsWith(path)) && !customerAccessToken) {
		const url = new URL("/login", request.url);
		url.searchParams.set("from", pathname);
		return NextResponse.redirect(url);
	}

	// Check if the path is for non-authenticated users and user is authenticated
	if (authPaths.some((path) => pathname.startsWith(path)) && customerAccessToken) {
		return NextResponse.redirect(new URL("/account", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|$).*)",
	],
};
