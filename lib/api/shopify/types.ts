import type { ShopifyProduct } from "@/lib/types";

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

export interface ProductsPageInfo {
	hasNextPage: boolean;
	endCursor: string;
}

export interface CollectionProductsConnection {
	edges: Array<{
		cursor: string;
		node: ShopifyProduct;
	}>;
	pageInfo: {
		hasNextPage: boolean;
		hasPreviousPage: boolean;
		startCursor: string;
		endCursor: string;
	};
	totalCount?: number;
}

export interface ShopifyCollectionWithPagination {
	id: string;
	handle: string;
	title: string;
	description: string | null;
	image?: {
		url: string;
		altText: string | null;
		width: number;
		height: number;
	} | null;
	products: CollectionProductsConnection;
}

export interface CollectionResponse {
	collection: ShopifyCollectionWithPagination | null;
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
			node: ShopifyCollectionWithPagination;
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
	collections: ShopifyCollectionWithPagination[];
}
