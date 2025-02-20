import { shopifyFetch } from "@/lib/shopify";
import type { ShopifyProduct, ShopifyCollection } from "@/lib/types";

export const collectionQuery = `
	query getCollection($handle: String!, $cursor: String) {
		collection(handle: $handle) {
			id
			handle
			title
			description
			seo {
				title
				description
			}
			products(first: 250, after: $cursor) {
				pageInfo {
					hasNextPage
					endCursor
				}
				totalCount
				edges {
					cursor
					node {
						id
						handle
						title
						description
						availableForSale
						featuredImage {
							id
							url
							altText
							width
							height
						}
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
						variants(first: 250) {
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
		seo: {
			title: string;
			description: string;
		};
		products: {
			pageInfo: {
				hasNextPage: boolean;
				endCursor: string;
			};
			totalCount: number;
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

export async function getCollection(handle: string): Promise<ShopifyCollection> {
	try {
		let allProducts: ShopifyProduct[] = [];
		let hasNextPage = true;
		let cursor: string | null = null;
		let collectionData: CollectionQueryResponse["collection"] | null = null;
		let totalCount = 0;

		// Fetch products recursively until we have all of them
		while (hasNextPage) {
			const response: ShopifyFetchResponse<CollectionQueryResponse> = await shopifyFetch<CollectionQueryResponse>({
				query: collectionQuery,
				variables: {
					handle,
					cursor,
				},
			});

			if (!response?.data?.collection) {
				throw new Error("No collection found");
			}

			collectionData = response.data.collection;
			if (collectionData) {
				// Only set totalCount on first fetch
				if (!cursor) {
					totalCount = collectionData.products.totalCount;
				}

				const newProducts = collectionData.products.edges.map((edge) => edge.node);
				allProducts = [...allProducts, ...newProducts];

				hasNextPage = collectionData.products.pageInfo.hasNextPage;
				cursor = collectionData.products.pageInfo.endCursor;
			}

			// Break if we've fetched all products or reached a reasonable limit
			if (!hasNextPage || allProducts.length >= 1000) {
				break;
			}
		}

		if (!collectionData) {
			throw new Error("No collection data found");
		}

		return {
			id: collectionData.id,
			handle: collectionData.handle,
			title: collectionData.title,
			description: collectionData.description,
			products: {
				nodes: allProducts,
				totalCount: totalCount,
			},
		};
	} catch (error) {
		console.error("Error fetching collection:", error);
		throw error;
	}
}
