import type { ShopifyProduct } from "@/lib/types";

export interface ShopifyFetchParams<T> {
	query: string;
	variables?: Record<string, any>;
	tags?: string[];
	cache?: RequestCache;
	next?: {
		tags?: string[];
		revalidate?: number;
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
	productsCount: number;
}

export interface CollectionResponse {
	collection: ShopifyCollectionWithPagination | null;
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
	shop: {
		name: string;
		description: string;
		primaryDomain?: {
			url: string;
		};
	} | null;
	menuItems: Array<{
		id: string;
		title: string;
		url: string;
		items?: Array<{
			id: string;
			title: string;
			url: string;
		}>;
	}>;
	blogs: Array<{
		id: string;
		handle: string;
		title: string;
		articles?: {
			edges: Array<{
				node: {
					id: string;
					handle: string;
					title: string;
					publishedAt: string;
				};
			}>;
		};
	}>;
	collections: ShopifyCollectionWithPagination[];
}
