// Helper function to get GraphQL API URL
export function getStorefrontApiUrl(): string {
	return `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql`;
}

// Helper function to get public access token headers
export function getPublicTokenHeaders(): HeadersInit {
	const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
	if (!token) {
		throw new Error("Missing Shopify Storefront Access Token");
	}

	return {
		"Content-Type": "application/json",
		"X-Shopify-Storefront-Access-Token": token,
	};
}

// Common GraphQL fragments
export const PRODUCT_FRAGMENT = `#graphql
  fragment ProductFragment on Product {
    id
    title
    handle
    description
    availableForSale
    variants(first: 1) {
      edges {
        node {
          id
          title
          availableForSale
          quantityAvailable
          price {
            amount
            currencyCode
          }
        }
      }
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

export const COLLECTION_FRAGMENT = `#graphql
  fragment CollectionFragment on Collection {
    id
    title
    description
    handle
    image {
      url
      altText
      width
      height
    }
  }
`;

// Helper function to make GraphQL requests with better error handling
export async function shopifyFetch<T>({ query, variables = {}, cache = "force-cache" }: { query: string; variables?: Record<string, unknown>; cache?: RequestCache }): Promise<{ data: T }> {
	try {
		console.log("Shopify API Request:", {
			url: getStorefrontApiUrl(),
			variables,
			query: query.slice(0, 100) + "...", // Log first 100 chars of query
		});

		const response = await fetch(getStorefrontApiUrl(), {
			method: "POST",
			headers: getPublicTokenHeaders(),
			body: JSON.stringify({ query, variables }),
			cache,
		});

		const json = await response.json();
		console.log("Shopify API Raw Response:", json);

		if (json.errors) {
			const errorMessage = json.errors.map((e: any) => e.message).join(", ");
			console.error("Shopify GraphQL Errors:", errorMessage);
			if (errorMessage.includes("Not Found")) {
				return { data: {} as T };
			}
			throw new Error(errorMessage);
		}

		return { data: json.data || ({} as T) };
	} catch (error) {
		console.error("Shopify API Error:", error);
		throw error;
	}
}
