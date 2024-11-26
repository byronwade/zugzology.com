export const runtime = "edge";

import { shopifyStorefront, type ShopifyResponse } from "@/lib/shopify";
import type { ShopifyMenu } from "@/lib/types/shopify";
import { unstable_cache } from "@/lib/unstable-cache";

export const getMainMenuQuery = `#graphql
  query GetMainMenu {
    menu(handle: "main-menu") {
      id
      items {
        id
        title
        url
        type
        items {
          id
          title
          url
          type
        }
      }
    }
  }
`;

type MainMenuResponse = {
	menu: ShopifyMenu | null;
};

const transformMenuUrl = (url: string): string => {
	// Remove domain if present
	const cleanUrl = url.replace(/^https?:\/\/[^\/]+/, "");

	// Map Shopify URLs to local routes
	const urlMap: Record<string, string> = {
		"/collections/all": "/products",
		"/collections/zugzbars": "/collections/zugzbars",
		"/blogs/myceliums-gambit": "/myceliums-gambit",
		// Add more mappings as needed
	};

	return urlMap[cleanUrl] || cleanUrl;
};

const getMainMenuUncached = async () => {
	try {
		const response: ShopifyResponse<MainMenuResponse> = await shopifyStorefront.query<MainMenuResponse>(getMainMenuQuery);

		if (!response.data?.menu) {
			console.log("No menu found");
			return null;
		}

		// Transform URLs in the menu items
		const transformedMenu = {
			...response.data.menu,
			items: response.data.menu.items.map((item) => ({
				...item,
				url: transformMenuUrl(item.url),
				items: item.items?.map((subItem) => ({
					...subItem,
					url: transformMenuUrl(subItem.url),
				})),
			})),
		};

		return transformedMenu;
	} catch (error) {
		console.error("Error fetching main menu:", error);
		throw error;
	}
};

export const getMainMenu = unstable_cache(
	getMainMenuUncached,
	["main-menu"],
	{ revalidate: 60 * 60 } // Revalidate every hour
);
