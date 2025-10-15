"use server";

import { cache } from "react";
import { transformShopifyUrl } from "@/components/utils/transform-shopify-url";
import { getAllCollections } from "@/lib/api/shopify/actions";
import { getMenuRobust } from "@/lib/api/shopify/menu-fetcher";
import { getStoreConfigSafe } from "@/lib/config/store-config";
import { loadStoreConfiguration } from "@/lib/config/store-data-loader";
import type { ShopifyMenuItem } from "@/lib/types";

type MenuItem = {
	id: string;
	title: string;
	url: string;
	items?: MenuItem[];
};

type MainMenuResponse = {
	menu?: {
		items: ShopifyMenuItem[];
	};
};

function mapMenuItems(items: ShopifyMenuItem[] = []): MenuItem[] {
	return items.map((item) => ({
		id: item.id,
		title: item.title,
		url: transformShopifyUrl(item.url),
		items: item.items && item.items.length > 0 ? mapMenuItems(item.items) : undefined,
	}));
}

// Basic fallback menu
const BASIC_FALLBACK_MENU: MenuItem[] = [
	{ id: "home", title: "Home", url: "/" },
	{ id: "shop", title: "Shop", url: "/collections/all" },
	{ id: "about", title: "About", url: "/pages/about" },
	{ id: "contact", title: "Contact", url: "/pages/contact" },
];

// Build dynamic fallback menu from actual collections
async function buildDynamicFallbackMenu(): Promise<MenuItem[]> {
	try {
		const collections = await getAllCollections();

		if (!collections || collections.length === 0) {
			return BASIC_FALLBACK_MENU;
		}

		// Take first 6 collections for the submenu
		const collectionItems = collections.slice(0, 6).map((collection) => ({
			id: `collection-${collection.id}`,
			title: collection.title,
			url: `/collections/${collection.handle}`,
		}));

		return [
			{ id: "home", title: "Home", url: "/" },
			{
				id: "collections",
				title: "Collections",
				url: "/collections/all",
				items: collectionItems,
			},
			{ id: "shop-all", title: "Shop All", url: "/collections/all" },
			{ id: "blogs", title: "Blog", url: "/blogs" },
		];
	} catch (error) {
		console.error("Error building dynamic fallback menu:", error);
		return BASIC_FALLBACK_MENU;
	}
}

// Get menu items with caching
export const getMenuItems = cache(async (): Promise<MenuItem[]> => {
	try {
		await loadStoreConfiguration();
		const config = getStoreConfigSafe();
		const mainMenuHandle = config.navigation?.mainMenu || "main-menu";

		console.log(`[Menu Items] Starting menu fetch for handle: ${mainMenuHandle}`);

		const menuItems = await getMenuRobust(mainMenuHandle);

		// If we have menu items from Shopify, use them
		if (menuItems && menuItems.length > 0) {
			const mapped = mapMenuItems(menuItems);
			console.log(`[Menu Items] ✅ Using ${mapped.length} Shopify menu items`);
			return mapped;
		}

		// Otherwise, build a dynamic fallback menu from collections
		console.log("[Menu Items] ⚠️ No Shopify menu items, building dynamic fallback");
		const fallbackMenu = await buildDynamicFallbackMenu();
		console.log(`[Menu Items] 🔄 Built fallback menu with ${fallbackMenu.length} items`);
		return fallbackMenu;
	} catch (error) {
		console.error("[Menu Items] 🔥 Critical error in getMenuItems:", error);
		console.log("[Menu Items] 🆘 Returning basic fallback menu");
		return BASIC_FALLBACK_MENU;
	}
});
