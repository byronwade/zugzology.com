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
						tags
						vendor
						productType
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
						compareAtPriceRange {
							minVariantPrice {
								amount
								currencyCode
							}
						}
						variants(first: 1) {
							nodes {
								id
								title
								availableForSale
								quantityAvailable
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
						images(first: 3) {
							nodes {
								url
								altText
								width
								height
							}
						}
						featuredImage {
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
`;

export type CollectionQueryResponse = {
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
};

type ShopifyFetchResponse<T> = {
	data: T;
	errors?: Array<{ message: string }>;
};
