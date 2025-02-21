import type { ShopifyProduct, ShopifyCollection } from "../../types";

export interface ShopifyFetchParams<T> {
	query: string;
	variables?: Record<string, any>;
	tags?: string[];
	next?: {
		tags: string[];
	};
}

export interface ShopifyResponse<T> {
	data: T;
}

export interface ProductResponse {
	product: ShopifyProduct | null;
}

export interface CollectionResponse {
	collection: ShopifyCollection | null;
}

export interface HeaderQueryResponse {
	shop: {
		name: string;
		description: string;
	};
	menu: {
		items: Array<{
			title: string;
			url: string;
		}>;
	};
	blogs: {
		edges: Array<{
			node: {
				title: string;
				handle: string;
			};
		}>;
	};
	products: {
		edges: Array<{
			node: ShopifyProduct;
		}>;
	};
	collections: {
		edges: Array<{
			node: ShopifyCollection;
		}>;
	};
}

export interface HeaderData {
	shop: {
		name: string;
		description: string;
	} | null;
	menuItems: Array<{
		title: string;
		url: string;
	}>;
	blogs: Array<{
		title: string;
		handle: string;
	}>;
	products: ShopifyProduct[];
	collections: ShopifyCollection[];
}
