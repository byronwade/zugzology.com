// Helper function to get GraphQL API URL
export function getStorefrontApiUrl(): string {
	return `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql`;
}

// Helper function to get public access token headers
export function getPublicTokenHeaders(): HeadersInit {
	return {
		"Content-Type": "application/json",
		"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_PUBLIC_ACCESS_TOKEN!,
	};
}

// Common GraphQL fragments
export const PRODUCT_FRAGMENT = `#graphql
  fragment ProductFragment on Product {
    id
    title
    description
    handle
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
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
    variants(first: 1) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
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

// Helper function to make GraphQL requests
export async function shopifyFetch<T>({ query, variables = {}, cache = "force-cache" }: { query: string; variables?: Record<string, unknown>; cache?: RequestCache }): Promise<{ data: T }> {
	try {
		const result = await fetch(getStorefrontApiUrl(), {
			method: "POST",
			headers: getPublicTokenHeaders(),
			body: JSON.stringify({ query, variables }),
			cache,
		});

		if (!result.ok) {
			throw new Error(`Failed to fetch from Shopify: ${result.statusText}`);
		}

		return await result.json();
	} catch (error) {
		console.error("Error fetching from Shopify:", error);
		throw error;
	}
}
