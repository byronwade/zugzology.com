// Constants for API access
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const customerAccountToken = process.env.SHOPIFY_CUSTOMER_ACCOUNT_TOKEN;
const apiVersion = "2024-01";

// Type definitions
interface ShopifyFetchOptions {
	query: string;
	variables?: Record<string, unknown>;
	cache?: RequestCache;
	isAdminApi?: boolean;
	isCustomerAccount?: boolean;
}

interface ShopifyFetchParams {
	query: string;
	variables?: Record<string, unknown>;
	headers?: Record<string, string>;
}

interface ShopifyResponse<T> {
	data: T;
	errors?: Array<{ message: string }>;
}

// Helper function to get GraphQL API URL
export function getStorefrontApiUrl(): string {
	if (!domain) {
		throw new Error("Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN environment variable");
	}
	return `https://${domain}/api/${apiVersion}/graphql`;
}

// Helper function to get Admin API URL
export function getAdminApiUrl(): string {
	if (!domain) {
		throw new Error("Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN environment variable");
	}
	return `https://${domain}/admin/api/${apiVersion}/graphql.json`;
}

// Helper function to get Customer Account API URL
export function getCustomerAccountApiUrl(): string {
	if (!domain) {
		throw new Error("Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN environment variable");
	}
	return `https://${domain}/account/customer/api/${apiVersion}/graphql`;
}

// Helper function to get headers based on API type
function getHeaders(isAdminApi: boolean, isCustomerAccount: boolean): HeadersInit {
	if (isCustomerAccount) {
		if (!customerAccountToken) {
			throw new Error("Missing SHOPIFY_CUSTOMER_ACCOUNT_TOKEN environment variable");
		}
		return {
			"Content-Type": "application/json",
			"X-Shopify-Customer-Access-Token": customerAccountToken,
		};
	}

	if (isAdminApi) {
		if (!adminAccessToken) {
			throw new Error("Missing SHOPIFY_ADMIN_ACCESS_TOKEN environment variable");
		}
		return {
			"Content-Type": "application/json",
			"X-Shopify-Access-Token": adminAccessToken,
		};
	}

	if (!storefrontAccessToken) {
		throw new Error("Missing NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable");
	}
	return {
		"Content-Type": "application/json",
		"X-Shopify-Storefront-Access-Token": storefrontAccessToken,
	};
}

// Helper function to format data size
function formatDataSize(data: any): string {
	const size = JSON.stringify(data).length / 1024;
	return `${size.toFixed(2)}KB`;
}

// Helper function to make GraphQL requests with better error handling and caching
export async function shopifyFetch<T>({ query, variables = {}, headers = {} }: ShopifyFetchParams): Promise<ShopifyResponse<T>> {
	try {
		const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
				...headers,
			},
			body: JSON.stringify({
				query,
				variables,
			}),
		});

		const json = await response.json();

		if (json.errors) {
			console.error("❌ [Shopify API] GraphQL Errors:", {
				errors: json.errors,
				query,
				variables,
			});
			throw new Error(`Shopify GraphQL Error: ${json.errors.map((e: any) => e.message).join(", ")}`);
		}

		return json as ShopifyResponse<T>;
	} catch (error) {
		console.error("❌ [Shopify API] Fetch error:", error);
		throw error;
	}
}
