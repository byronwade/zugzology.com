"use server";

import { shopifyClient } from "@/lib/shopify/client";
import type { Product } from "@/lib/types/api";

export async function searchProducts(query: string): Promise<Product[]> {
	const response = await shopifyClient.query<{ products: { edges: Array<{ node: Product }> } }>(
		/* GraphQL */ `
			query SearchProducts($query: String!) {
				products(query: $query, first: 20) {
					edges {
						node {
							id
							title
							handle
							# ... rest of product fields
						}
					}
				}
			}
		`,
		{ query }
	);

	return response.data?.products.edges.map((edge) => edge.node) ?? [];
}
