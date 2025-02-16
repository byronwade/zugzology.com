"use server";

import { Suspense } from "react";
import { getMenuItems } from "./menu-items";
import { HeaderClient } from "./header-client";
import { getBlogs, getProducts, getAllBlogPosts } from "@/lib/actions/shopify";
import { InitializeSearch } from "@/components/search/initialize-search";
import { cookies } from "next/headers";
import { getCustomer } from "@/lib/services/shopify-customer";

// Fetch data with dynamic behavior and caching
async function getHeaderData() {
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
}

// Check authentication status on the server with caching
async function checkAuth() {
	try {
		const cookieStore = await cookies();
		const customerAccessToken = cookieStore.get("customerAccessToken")?.value;

		if (!customerAccessToken) {
			return false;
		}

		const customer = await getCustomer(customerAccessToken);
		return !!customer;
	} catch (error) {
		if (error instanceof Error && error.message.includes("prerendering")) {
			return false;
		}
		console.error("❌ [Header Server] Auth check error:", error);
		return false;
	}
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

// Server Component for header content
async function HeaderContent() {
	const { menuItems, blogs, products, blogPosts } = await getHeaderData();
	const isAuthenticated = await checkAuth();

	return (
		<>
			<InitializeSearch products={products} blogPosts={blogPosts} />
			<HeaderClient initialMenuItems={menuItems} blogs={blogs} isAuthenticated={isAuthenticated} />
		</>
	);
}

// Main Header Component
export default async function Header() {
	return (
		<div className="sticky top-0 z-50">
			<Suspense fallback={<HeaderLoading />}>
				<HeaderContent />
			</Suspense>
		</div>
	);
}
