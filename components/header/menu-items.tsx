import { getMainMenu } from "@/lib/actions/shopify";

// Default menu items in case the API fails
const DEFAULT_MENU_ITEMS = [
	{
		id: "home",
		title: "Home",
		url: "/",
	},
	{
		id: "products",
		title: "All Products",
		url: "/products",
	},
];

export async function getMenuItems() {
	try {
		const menuItems = await getMainMenu();

		// If no menu items returned, use defaults
		if (!menuItems || menuItems.length === 0) {
			console.warn("No menu items returned from Shopify, using defaults");
			return DEFAULT_MENU_ITEMS;
		}

		// Transform Shopify URLs to match our route structure
		return menuItems.map((item) => ({
			...item,
			url: item.url,
			items: item.items?.map((subItem) => ({
				...subItem,
				url: subItem.url,
			})),
		}));
	} catch (error) {
		console.error("Failed to fetch menu items:", error);
		return DEFAULT_MENU_ITEMS;
	}
}
