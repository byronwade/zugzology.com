"use server";

import { Suspense } from "react";
import { getMenuItems } from "./menu-items";
import { HeaderClient } from "./header-client";
import { getBlogs, getProducts, getAllBlogPosts } from "@/lib/actions/shopify";
import { InitializeSearch } from "@/components/search/initialize-search";
import { cookies } from "next/headers";
import { getCustomer } from "@/lib/services/shopify-customer";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";

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
		"use cache";

		try {
			const startTime = performance.now();
			const [menuItems, blogs, products, blogPosts] = await Promise.all([getMenuItems(), getBlogs(), getProducts(), getAllBlogPosts()]);

			const duration = performance.now() - startTime;
			if (duration > 100) {
				console.log(`⚡ [Header Data] ${duration.toFixed(2)}ms`, {
					menuItems: menuItems.length,
					blogs: blogs.length,
					products: products.length,
					blogPosts: blogPosts.length,
				});
			}

			return { menuItems, blogs, products, blogPosts };
		} catch (error) {
			console.error("❌ [Header Data] Error:", error);
			return { menuItems: [], blogs: [], products: [], blogPosts: [] };
		}
	},
	["header-data"],
	{
		revalidate: 60, // Revalidate every minute
		tags: ["header"],
	}
);

// Get customer token outside of cache
async function getCustomerToken() {
	// Skip cookie check during prerendering
	if (isPrerendering()) {
		return null;
	}

	try {
		const cookieStore = await cookies();
		return cookieStore.get("customerAccessToken")?.value;
	} catch (error) {
		if (error instanceof Error && error.message.includes("prerendering")) {
			return null;
		}
		console.error("❌ [Header Server] Cookie error:", error);
		return null;
	}
}

// Check authentication status with the token
const checkAuth = unstable_cache(
	async (customerAccessToken: string | null | undefined) => {
		"use cache";

		if (!customerAccessToken) {
			return false;
		}

		try {
			const customer = await getCustomer(customerAccessToken);
			return !!customer;
		} catch (error) {
			if (error instanceof Error && error.message.includes("prerendering")) {
				return false;
			}
			console.error("❌ [Header Server] Auth check error:", error);
			return false;
		}
	},
	["auth-check"],
	{
		revalidate: 60, // Revalidate every minute
		tags: ["auth"],
	}
);

// Server Component for header content
async function HeaderContent() {
	// Get data in parallel
	const [headerData, customerAccessToken] = await Promise.all([getHeaderData(), getCustomerToken()]);

	// Only check auth if we have a token
	const isAuthenticated = customerAccessToken ? await checkAuth(customerAccessToken) : false;

	return (
		<>
			<InitializeSearch products={headerData.products} blogPosts={headerData.blogPosts} />
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
