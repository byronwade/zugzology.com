"use server";

import { Suspense } from "react";
import { getMenuItems } from "./menu-items";
import { HeaderClient } from "./header-client";
import { getBlogs } from "@/lib/actions/shopify";

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

// Fetch header data with proper caching
async function getHeaderData() {
	try {
		const startTime = performance.now();

		// Parallel fetch with static caching
		const [menuItems, blogs] = await Promise.all([
			getMenuItems().catch((error) => {
				console.error("❌ [Header] Menu fetch error:", error);
				return [];
			}),
			getBlogs().catch((error) => {
				console.error("❌ [Header] Blogs fetch error:", error);
				return [];
			}),
		]);

		const duration = performance.now() - startTime;
		if (duration > 100) {
			console.log(`🔄 [Header] Data fetched in ${duration.toFixed(2)}ms`);
		}

		return { menuItems, blogs };
	} catch (error) {
		console.error(
			"❌ [Header] Error fetching data:",
			error instanceof Error
				? {
						message: error.message,
						stack: error.stack?.split("\n").slice(0, 3),
				  }
				: "Unknown error"
		);
		return { menuItems: [], blogs: [] };
	}
}

export default async function Header() {
	const { menuItems, blogs } = await getHeaderData();

	return (
		<div className="sticky top-0 z-50">
			<Suspense fallback={<HeaderLoading />}>
				<HeaderClient initialMenuItems={menuItems} blogs={blogs} />
			</Suspense>
		</div>
	);
}
