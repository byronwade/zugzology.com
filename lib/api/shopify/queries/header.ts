import { CACHE_TAGS } from "../cache-config";
import { shopifyFetch } from "../client";
import type { ShopifyCollectionWithPagination } from "../types";

export interface ShopifyHeaderResponse {
	shop: {
		name: string;
		description: string;
		primaryDomain: {
			url: string;
		};
	};
	menu: {
		items: Array<{
			id: string;
			title: string;
			url: string;
			items?: Array<{
				id: string;
				title: string;
				url: string;
			}>;
		}>;
	};
	blogs: {
		edges: Array<{
			node: {
				id: string;
				handle: string;
				title: string;
				articles: {
					edges: Array<{
						node: {
							id: string;
							handle: string;
							title: string;
							publishedAt: string;
						};
					}>;
				};
			};
		}>;
	};
	collections: {
		edges: Array<{
			node: ShopifyCollectionWithPagination;
		}>;
	};
}

export interface HeaderQueryResponse {
	shop: {
		name: string;
		description: string;
		primaryDomain: {
			url: string;
		};
	};
	menu: {
		items: Array<{
			id: string;
			title: string;
			url: string;
			items?: Array<{
				id: string;
				title: string;
				url: string;
			}>;
		}>;
	};
	blogs: {
		edges: Array<{
			node: {
				id: string;
				handle: string;
				title: string;
				articles: {
					edges: Array<{
						node: {
							id: string;
							handle: string;
							title: string;
							publishedAt: string;
						};
					}>;
				};
			};
		}>;
	};
	collections: {
		edges: Array<{
			node: ShopifyCollectionWithPagination;
		}>;
	};
}

export interface HeaderData {
	shop: ShopifyHeaderResponse["shop"] | null;
	menuItems: ShopifyHeaderResponse["menu"]["items"];
	blogs: Array<ShopifyHeaderResponse["blogs"]["edges"][number]["node"]>;
	collections: ShopifyCollectionWithPagination[];
}

export const headerQuery = `
	query getHeaderData {
		shop {
			name
			description
			primaryDomain {
				url
			}
		}
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
		blogs(first: 3, sortKey: UPDATED_AT) {
			edges {
				node {
					id
					handle
					title
					articles(first: 1) {
						edges {
							node {
								id
								handle
								title
								publishedAt
							}
						}
					}
				}
			}
		}
		collections(first: 10) {
			edges {
				node {
					id
					handle
					title
					description
					image {
						url
						altText
						width
						height
					}
				}
			}
		}
	}
`;

export async function getHeaderData(): Promise<HeaderData> {
	try {
		const response = await shopifyFetch<HeaderQueryResponse>({
			query: headerQuery,
			tags: [CACHE_TAGS.MENU],
		});

		if (!response.data) {
			throw new Error("No data returned from header query");
		}

		return {
			shop: response.data.shop,
			menuItems: response.data.menu.items,
			blogs: response.data.blogs.edges.map((edge) => edge.node),
			collections: response.data.collections.edges.map((edge) => edge.node),
		};
	} catch (error) {
		console.error("Error fetching header data:", error);
		return {
			shop: null,
			menuItems: [],
			blogs: [],
			collections: [],
		};
	}
}
