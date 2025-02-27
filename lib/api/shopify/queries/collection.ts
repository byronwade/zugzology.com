import { shopifyFetch } from "@/lib/shopify";
import type { ShopifyProduct } from "@/lib/types";

export const collectionQuery = `
	query getCollection($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys!, $reverse: Boolean!) {
		collection(handle: $handle) {
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
			products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
				pageInfo {
					hasNextPage
					hasPreviousPage
					startCursor
					endCursor
				}
				edges {
					cursor
					node {
						id
						handle
						title
						description
						availableForSale
						priceRange {
							minVariantPrice {
								amount
								currencyCode
							}
							maxVariantPrice {
								amount
								currencyCode
							}
						}
						variants(first: 1) {
							nodes {
								id
								title
								availableForSale
								price {
									amount
									currencyCode
								}
								compareAtPrice {
									amount
									currencyCode
								}
							}
						}
						images(first: 1) {
							nodes {
								url
								altText
								width
								height
							}
						}
					}
				}
			}
		}
	}
`;

export interface CollectionQueryResponse {
	collection: {
		id: string;
		handle: string;
		title: string;
		description: string;
		image: {
			url: string;
			altText: string;
			width: number;
			height: number;
		} | null;
		products: {
			pageInfo: {
				hasNextPage: boolean;
				hasPreviousPage: boolean;
				startCursor: string;
				endCursor: string;
			};
			edges: Array<{
				cursor: string;
				node: ShopifyProduct;
			}>;
		};
	};
}

interface ShopifyFetchResponse<T> {
	data: T;
	errors?: Array<{ message: string }>;
}
