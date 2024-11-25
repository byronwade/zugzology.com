export const runtime = "edge";

import { shopifyClient } from "@/lib/shopify";
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

			const response = await shopifyClient.request(getTaxonomyQuery, {
				variables: {
					query: queryString,
					first: 250,
				},
			});

			if (!response?.data?.products?.edges?.length) {
				console.log("No products found for query:", queryString);
				return null;
			}

			const products = response.data.products.edges.map((edge: { node: Product }) => edge.node);

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
			const response = await shopifyClient.request(getCollectionQuery, {
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
	async (): Promise<Product[]> => {
		try {
			const response = await shopifyClient.request(getAllProductsQuery, {
				variables: {
					first: 250,
				},
			});

			return response.data?.products?.edges?.map((edge: { node: Product }) => edge.node) || [];
		} catch (error) {
			console.error("Error fetching all products:", error);
			return [];
		}
	},
	["all-products"],
	{ revalidate: 60 * 60 }
);
