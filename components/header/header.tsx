"use server";

import { Suspense } from "react";
import { getMenuItems } from "./menu-items";
import { HeaderClient } from "./header-client";
import { getBlogs } from "@/lib/actions/shopify";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { AUTH_CONFIG, logAuthEvent } from "@/lib/config/auth";

// Check if we're in prerender mode
function isPrerendering() {
	try {
		// This will throw during prerendering
		headers();
		return false;
	} catch (e) {
		return true;
	}
}

// Fetch data with dynamic behavior and caching
const getHeaderData = unstable_cache(
	async () => {
		try {
			const startTime = performance.now();
			const [menuItems, blogs] = await Promise.all([getMenuItems(), getBlogs()]);

			const duration = performance.now() - startTime;
			if (duration > 100) {
				console.log(`⚡ [Header Data] ${duration.toFixed(2)}ms`, {
					menuItems: menuItems.length,
					blogs: blogs.length,
				});
			}

			return { menuItems, blogs };
		} catch (error) {
			console.error("❌ [Header Data] Error:", error);
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
			console.error("❌ [Header Server] Auth check error:", error);
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
		<>
			<HeaderClient initialMenuItems={headerData.menuItems} blogs={headerData.blogs} isAuthenticated={isAuthenticated} />
		</>
	);
}

// Loading component with skeleton UI
function HeaderLoading() {
	return (
		<div className="w-full h-16 bg-background animate-pulse">
			<div className="max-w-screen-xl mx-auto px-4 h-full flex items-center justify-between">
				<div className="w-32 h-8 bg-muted rounded" />
				<div className="flex-1 mx-4">
					<div className="w-full h-10 bg-muted rounded" />
				</div>
				<div className="flex space-x-2">
					<div className="w-10 h-10 bg-muted rounded" />
					<div className="w-10 h-10 bg-muted rounded" />
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