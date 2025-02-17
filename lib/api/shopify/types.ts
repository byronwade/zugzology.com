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
