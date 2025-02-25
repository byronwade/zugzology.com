"use server";

import { shopifyFetch } from "@/lib/shopify";

interface MenuItem {
	id: string;
	title: string;
	url: string;
	items?: MenuItem[];
}

// Default menu items in case the API fails
const DEFAULT_MENU_ITEMS: MenuItem[] = [
	{
		id: "home",
		title: "Home",
		url: "/",
	},
	{
		id: "products",
		title: "All Products",
		url: "/collections/all",
	},
];

// Helper to transform Shopify URLs
function transformShopifyUrl(shopifyUrl: string): string {
	if (!shopifyUrl) return "/";

	// Remove domain if present
	const url = shopifyUrl.replace(/^https?:\/\/[^\/]+/, "");

	// Transform collection URLs
	if (url.includes("/collections/")) {
		return `/collections/${url.split("/collections/")[1]}`;
	}

	// Transform product URLs
	if (url.includes("/products/")) {
		return `/products/${url.split("/products/")[1]}`;
	}

	// Transform pages
	if (url.includes("/pages/")) {
		return `/${url.split("/pages/")[1]}`;
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

export async function getMenuItems(): Promise<MenuItem[]> {
	try {
		const startTime = performance.now();
		const { data } = await shopifyFetch<MainMenuResponse>({
			query: `
				query GetMainMenu {
					menu(handle: "main-menu") {
						items {
							id
							title
							url
							items {
								id
								title
								url
							}
						}
					}
				}
			`,
			variables: {},
			tags: ["main-menu"],
		});

		if (!data?.menu?.items?.length) {
			console.warn("No menu items returned from Shopify, using defaults");
			return DEFAULT_MENU_ITEMS;
		}

		// Transform and cache the menu items
		const transformedItems = data.menu.items.map(
			(item: ShopifyMenuItem): MenuItem => ({
				id: item.id,
				title: item.title,
				url: transformShopifyUrl(item.url),
				items: item.items?.map(
					(subItem: ShopifyMenuItem): MenuItem => ({
						id: subItem.id,
						title: subItem.title,
						url: transformShopifyUrl(subItem.url),
					})
				),
			})
		);

		const duration = performance.now() - startTime;
		if (duration > 100) {
			console.log(`⚡ [Menu] Fetched in ${duration.toFixed(2)}ms`);
		}

		return transformedItems;
	} catch (error) {
		console.error(
			"Failed to fetch main menu:",
			error instanceof Error
				? {
						message: error.message,
						stack: error.stack?.split("\n").slice(0, 3),
				  }
				: "Unknown error"
		);
		return DEFAULT_MENU_ITEMS;
	}
}
