"use server";

import { cache } from "react";
import { getMenu } from "@/lib/api/shopify/actions";
import { loadStoreConfiguration } from "@/lib/config/store-data-loader";
import { getStoreConfigSafe } from "@/lib/config/store-config";
import type { ShopifyMenuItem } from "@/lib/types";
import { transformShopifyUrl } from "@/components/utils/transform-shopify-url";

interface MenuItem {
	id: string;
	title: string;
	url: string;
	items?: MenuItem[];
}

interface MainMenuResponse {
	menu?: {
		items: ShopifyMenuItem[];
	};
}

function mapMenuItems(items: ShopifyMenuItem[] = []): MenuItem[] {
	return items.map((item) => ({
		id: item.id,
		title: item.title,
		url: transformShopifyUrl(item.url),
		items: item.items && item.items.length > 0 ? mapMenuItems(item.items) : undefined,
	}));
}

const FALLBACK_MENU: MenuItem[] = [
	{ id: "home", title: "Home", url: "/" },
	{ id: "shop", title: "Shop", url: "/collections/all" },
	{ id: "about", title: "About", url: "/pages/about" },
	{ id: "contact", title: "Contact", url: "/pages/contact" },
];

// Get menu items with caching
export const getMenuItems = cache(async (): Promise<MenuItem[]> => {
	try {
		await loadStoreConfiguration();
		const config = getStoreConfigSafe();
		const mainMenuHandle = config.navigation?.mainMenu || "main-menu";
		const menuItems = await getMenu(mainMenuHandle);
		const mapped = mapMenuItems(menuItems);
		return mapped.length ? mapped : FALLBACK_MENU;
	} catch (error) {
		console.error("Failed to fetch menu items:", error);
		return FALLBACK_MENU;
	}
}); 
