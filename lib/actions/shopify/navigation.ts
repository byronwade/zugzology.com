import { shopifyFetch } from "@/lib/shopify";

export async function getNavigationMenu() {
	const query = `#graphql
    query GetNavigationMenus {
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
      blogs(first: 100) {
        edges {
          node {
            id
            handle
            title
          }
        }
      }
      collections(first: 100) {
        edges {
          node {
            id
            handle
            title
            updatedAt
            products(first: 1) {
              edges {
                node {
                  updatedAt
                }
              }
            }
          }
        }
      }
    }
  `;

	const { status, body } = await shopifyFetch(query);

	if (status === 200) {
		return {
			menu: body.data.menu,
			blogs: body.data.blogs.edges.map((edge: any) => edge.node),
			collections: body.data.collections.edges.map((edge: any) => edge.node),
		};
	}

	return {
		menu: null,
		blogs: [],
		collections: [],
	};
}
