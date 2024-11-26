export const runtime = "edge";

import { shopifyStorefront } from "@/lib/shopify";
import { unstable_cache } from "next/cache";
import type { Product, Collection } from "@/lib/types/shopify";
import { getTaxonomyQuery, getCollectionQuery, getAllProductsQuery } from "@/lib/queries/taxonomy";

interface TaxonomyData {
	id: string;
	name: string;
	handle: string;
	description?: string;
	products: Product[];
}

interface ProductsResponse {
	data: {
		products: {
			edges: Array<{
				node: Product;
			}>;
		};
	};
}

interface CollectionResponse {
	data: {
		collection: Collection;
	};
}

export const getTaxonomyData = unstable_cache(
	async (type: string, value: string): Promise<TaxonomyData | null> => {
		try {
			const decodedValue = decodeURIComponent(value);

			let queryString = "";
			switch (type) {
				case "vendors":
					queryString = `vendor:'${decodedValue}'`;
					break;
				case "types":
					queryString = `product_type:'${decodedValue}'`;
					break;
				case "tags":
					queryString = `tag:'${decodedValue}'`;
					break;
				case "colors":
					queryString = `variant:color:'${decodedValue}'`;
					break;
				case "locations":
					queryString = `tag:'${decodedValue}'`;
					break;
				case "medicinal":
					queryString = `tag:'${decodedValue}'`;
					break;
				case "psychedelic":
					queryString = `tag:'${decodedValue}'`;
					break;
				default:
					return null;
			}

			console.log("Query string:", queryString);

			const response = await shopifyStorefront.query<ProductsResponse>(getTaxonomyQuery, {
				variables: {
					query: queryString,
					first: 250,
				},
			});

			if (!response?.data?.products?.edges?.length) {
				console.log("No products found for query:", queryString);
				return null;
			}

			const products = response.data.products.edges.map((edge) => edge.node);

			return {
				id: value,
				name: decodedValue
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" "),
				handle: value,
				products,
			};
		} catch (error) {
			console.error("Error fetching taxonomy:", error);
			return null;
		}
	},
	["taxonomy"],
	{ revalidate: 60 * 60 * 2 }
);

export const getCollectionData = unstable_cache(
	async (handle: string): Promise<Collection | null> => {
		try {
			const response = await shopifyStorefront.query<CollectionResponse>(getCollectionQuery, {
				variables: {
					handle,
					first: 250,
				},
			});

			return response.data?.collection || null;
		} catch (error) {
			console.error("Error fetching collection:", error);
			return null;
		}
	},
	["collection"],
	{ revalidate: 60 * 60 }
);

export const getAllProducts = unstable_cache(
	async () => {
		const query = `#graphql
			query GetAllProducts {
				products(first: 250, sortKey: CREATED_AT, reverse: true) {
					edges {
						node {
							id
							title
							handle
							description
							priceRange {
								minVariantPrice {
									amount
									currencyCode
								}
							}
							variants(first: 1) {
								edges {
									node {
										id
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
							images(first: 1) {
								edges {
									node {
										url
										altText
										width
										height
									}
								}
							}
							availableForSale
							tags
							vendor
							productType
						}
					}
				}
			}
		`;

		try {
			console.log("Fetching all products...");
			const response = await shopifyStorefront.query(query);

			if (!response?.products?.edges) {
				console.error("Invalid response structure:", response);
				throw new Error("No data returned from Shopify");
			}

			const products = response.products.edges.map(({ node: product }) => {
				console.log("Processing product:", {
					title: product.title,
					priceRange: product.priceRange,
					variants: product.variants?.edges?.[0]?.node,
				});

				const variant = product.variants?.edges?.[0]?.node;
				const price = {
					amount: variant?.price?.amount || product.priceRange?.minVariantPrice?.amount || "0",
					currencyCode: variant?.price?.currencyCode || product.priceRange?.minVariantPrice?.currencyCode || "USD",
				};

				return {
					id: product.id,
					title: product.title,
					handle: product.handle,
					description: product.description,
					price,
					compareAtPrice: variant?.compareAtPrice
						? {
								amount: variant.compareAtPrice.amount,
								currencyCode: variant.compareAtPrice.currencyCode || "USD",
						  }
						: null,
					image: product.images?.edges?.[0]?.node || null,
					availableForSale: product.availableForSale || false,
					tags: product.tags || [],
					vendor: product.vendor || "",
					productType: product.productType || "",
				};
			});

			console.log("Transformed products sample:", products[0]);
			console.log(`Found ${products.length} products`);
			return products;
		} catch (error) {
			console.error("Error fetching all products:", error);
			throw error;
		}
	},
	["all-products"],
	{
		revalidate: 60,
		tags: ["products"],
	}
);

export const getCollections = unstable_cache(
	async () => {
		const query = `#graphql
			query GetCollections {
				collections(first: 100) {
					edges {
						node {
							id
							title
							handle
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

		try {
			const response = await shopifyStorefront.query(query);

			if (!response?.collections?.edges) {
				throw new Error("No collections data returned from Shopify");
			}

			return response.collections.edges.map(({ node }) => ({
				id: node.id,
				title: node.title,
				handle: node.handle,
				description: node.description,
				image: node.image,
			}));
		} catch (error) {
			console.error("Error fetching collections:", error);
			throw error;
		}
	},
	["all-collections"],
	{
		revalidate: 60,
		tags: ["collections"],
	}
);

export const getMenu = unstable_cache(
	async (handle = "main-menu") => {
		const query = `#graphql
			query GetMenu($handle: String!) {
				menu(handle: $handle) {
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
			const response = await shopifyStorefront.query(query, {
				variables: { handle },
			});

			if (!response?.menu) {
				throw new Error("No menu data returned from Shopify");
			}

			return response.menu;
		} catch (error) {
			console.error("Error fetching menu:", error);
			throw error;
		}
	},
	["menu"],
	{
		revalidate: 60,
		tags: ["menu"],
	}
);
