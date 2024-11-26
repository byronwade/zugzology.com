import { shopifyStorefront } from "@/lib/shopify";

export async function getMenu() {
	const query = `#graphql
    query GetMenu {
      menu(handle: "main-menu") {
        id
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
  `;

	try {
		const response = await shopifyStorefront.query<MenuResponse>(query, { tags: ["menu"] });
		return response.menu;
	} catch (error) {
		console.error("Error fetching menu:", error);
		return null;
	}
}
