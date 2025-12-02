"use server";

import { unstable_cache } from "next/cache";
import { cookies, headers } from "next/headers";
import { Suspense } from "react";
import { getAllBlogPosts } from "@/lib/actions/shopify";
import { AUTH_CONFIG, logAuthEvent } from "@/lib/config/auth";
import { HeaderClient } from "./header-client";
import { getMenuItems } from "./menu-items";

// Check if we're in prerender mode
function isPrerendering() {
	try {
		// This will throw during prerendering
		headers();
		return false;
	} catch (_e) {
		return true;
	}
}

// Fetch data with dynamic behavior and caching
const getHeaderData = unstable_cache(
	async () => {
		try {
			const startTime = performance.now();
			const [menuItems, blogs] = await Promise.all([getMenuItems(), getAllBlogPosts()]);

			const duration = performance.now() - startTime;
			if (duration > 100) {
			}

			return { menuItems, blogs };
		} catch (_error) {
			return { menuItems: [], blogs: [] };
		}
	},
	["header-data"],
	{
		revalidate: 60, // Revalidate every minute
		tags: ["header"],
	}
);

// Check authentication status from cookies
const checkAuthStatus = unstable_cache(
	async () => {
		// Skip auth check during prerendering
		if (isPrerendering()) {
			return false;
		}

		try {
			const cookieStore = await cookies();
			const customerAccessToken = await cookieStore.get(AUTH_CONFIG.cookies.customerAccessToken.name);
			const sessionToken = await cookieStore.get(AUTH_CONFIG.cookies.accessToken.name);
			const idToken = await cookieStore.get(AUTH_CONFIG.cookies.idToken.name);

			// Log auth check for server component
			logAuthEvent("Header server auth check", {
				hasCustomerToken: !!customerAccessToken,
				hasSessionToken: !!sessionToken,
				hasIdToken: !!idToken,
			});

			// Basic check - all tokens must exist
			return !!customerAccessToken && !!sessionToken && !!idToken;
		} catch (error) {
			if (error instanceof Error && error.message.includes("prerendering")) {
				return false;
			}
			return false;
		}
	},
	["auth-status"],
	{
		revalidate: 60, // Revalidate every minute
		tags: ["auth"],
	}
);

// Server Component for header content
async function HeaderContent() {
	// Get data in parallel
	const [headerData, isAuthenticated] = await Promise.all([getHeaderData(), checkAuthStatus()]);

	return (
		<HeaderClient blogs={headerData.blogs} initialMenuItems={headerData.menuItems} isAuthenticated={isAuthenticated} />
	);
}

// Loading component with skeleton UI
function HeaderLoading() {
	return (
		<div className="safe-area-top h-16 w-full animate-pulse bg-background">
			<div className="mx-auto flex h-full max-w-screen-xl items-center justify-between px-4">
				<div className="h-8 w-32 rounded bg-muted" />
				<div className="mx-4 flex-1">
					<div className="h-10 w-full rounded bg-muted" />
				</div>
				<div className="flex space-x-2">
					<div className="h-10 w-10 rounded bg-muted" />
					<div className="h-10 w-10 rounded bg-muted" />
				</div>
			</div>
		</div>
	);
}

// Main Header Component with stable cache key
export default async function Header() {
	return (
		<div className="sticky top-0 z-50">
			<Suspense fallback={<HeaderLoading />}>
				<HeaderContent />
			</Suspense>
		</div>
	);
}
