import { getMainMenu } from "@/lib/actions/shopify";

export async function getMenuItems() {
	const menuItems = await getMainMenu();

	// Transform Shopify URLs to match our route structure
	const transformedItems = menuItems.map((item) => ({
		...item,
		url: transformUrl(item.url),
		items: item.items?.map((subItem) => ({
			...subItem,
			url: transformUrl(subItem.url),
		})),
	}));

	return transformedItems;
}

// Helper to transform Shopify URLs to our route structure
function transformUrl(shopifyUrl: string): string {
	// Remove domain if present
	const url = shopifyUrl.replace(/^https?:\/\/[^\/]+/, "");

	// Special case for "all products" collection
	if (url.includes("/collections/all")) {
		return "/products";
	}

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
		return `/pages/${url.split("/pages/")[1]}`;
	}

	return url;
}
