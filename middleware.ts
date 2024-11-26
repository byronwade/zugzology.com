import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const url = request.nextUrl;

	// If the path starts with /pages, redirect to the root
	if (url.pathname.startsWith("/pages/")) {
		return NextResponse.redirect(new URL(url.pathname.replace("/pages/", "/"), url.origin));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/pages/:path*"],
};
