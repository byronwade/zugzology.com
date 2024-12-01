// At the top of the file, add these constants
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = "2024-01"; // Using latest Shopify API version

// Add these type definitions at the top of the file
interface ShopifyFetchOptions {
	query: string;
	variables?: Record<string, unknown>;
	cache?: RequestCache;
}

// Helper function to get GraphQL API URL
export function getStorefrontApiUrl(): string {
	if (!domain) {
		throw new Error("Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN environment variable");
	}
	return `https://${domain}/api/${apiVersion}/graphql`;
}

// Helper function to get public access token headers
export function getPublicTokenHeaders(): HeadersInit {
	if (!storefrontAccessToken) {
		throw new Error("Missing NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable");
	}

	return {
		"Content-Type": "application/json",
		"X-Shopify-Storefront-Access-Token": storefrontAccessToken,
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
export async function shopifyFetch<T>({ query, variables, cache }: ShopifyFetchOptions): Promise<{ data: T }> {
	try {
		if (!domain || !storefrontAccessToken) {
			console.error("Missing required environment variables:", {
				domain: !!domain,
				token: !!storefrontAccessToken,
			});
			throw new Error("Shopify environment variables are not properly configured");
		}

		const url = `https://${domain}/api/${apiVersion}/graphql.json`;
		console.log("Attempting fetch to:", url); // Debug log

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": storefrontAccessToken,
			},
			body: JSON.stringify({
				query,
				variables,
			}),
			cache: cache ?? "force-cache",
		});

		if (!response.ok) {
			throw new Error(`Shopify API responded with status ${response.status}`);
		}

		const json = await response.json();

		// Check for GraphQL errors
		if (json.errors) {
			throw new Error(`Shopify GraphQL Error: ${JSON.stringify(json.errors, null, 2)}`);
		}

		return json;
	} catch (error) {
		console.error("Shopify Fetch Error:", error);
		throw error;
	}
}
