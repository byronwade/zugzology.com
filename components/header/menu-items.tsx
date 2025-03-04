"use server";

import { cache } from "react";

interface MenuItem {
	id: string;
	title: string;
	url: string;
	items?: MenuItem[];
}

// Transform Shopify URLs to local URLs
function transformShopifyUrl(shopifyUrl: string): string {
	if (!shopifyUrl) return "/";

	// Remove domain part if it exists
	let url = shopifyUrl.replace(/^https?:\/\/[^\/]+/, "");

	// Transform collection URLs
	url = url.replace(/\/collections\/([^\/]+)/, "/collections/$1");

	// Transform product URLs
	url = url.replace(/\/products\/([^\/]+)/, "/products/$1");

	// Transform blog URLs
	url = url.replace(/\/blogs\/([^\/]+)/, "/blogs/$1");

	// Transform article URLs
	url = url.replace(/\/blogs\/([^\/]+)\/([^\/]+)/, "/blogs/$1/$2");

	// Transform page URLs
	url = url.replace(/\/pages\/([^\/]+)/, "/$1");

	// Default to homepage if empty
	if (!url || url === "/") {
		return "/";
	}

	return url;
}

interface ShopifyMenuItem {
	id: string;
	title: string;
	url: string;
	items?: ShopifyMenuItem[];
}

interface MainMenuResponse {
	menu?: {
		items: ShopifyMenuItem[];
	};
}

// Get menu items with caching
export const getMenuItems = cache(async (): Promise<MenuItem[]> => {
	try {
		// For now, return a static menu structure
		return [
			{
				id: "home",
				title: "Home",
				url: "/",
			},
			{
				id: "shop",
				title: "Shop",
				url: "/collections/all-products",
				items: [
					{
						id: "all-products",
						title: "All Products",
						url: "/collections/all-products",
					},
					{
						id: "new-arrivals",
						title: "New Arrivals",
						url: "/collections/new-arrivals",
					},
					{
						id: "best-sellers",
						title: "Best Sellers",
						url: "/collections/best-sellers",
					},
				],
			},
			{
				id: "learn",
				title: "Learn",
				url: "/blogs",
				items: [
					{
						id: "guides",
						title: "Guides",
						url: "/blogs/guides",
					},
					{
						id: "tutorials",
						title: "Tutorials",
						url: "/blogs/tutorials",
					},
				],
			},
			{
				id: "about",
				title: "About",
				url: "/about",
			},
			{
				id: "contact",
				title: "Contact",
				url: "/contact",
			},
		];
	} catch (error) {
		console.error("Failed to fetch menu items:", error);
		return [];
	}
}); 