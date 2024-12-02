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

// Helper function to make GraphQL requests with better error handling
export async function shopifyFetch<T>({ query, variables, cache, isAdminApi = false, isCustomerAccount = false }: ShopifyFetchOptions): Promise<{ data: T }> {
	try {
		if (!domain) {
			console.error("Missing required environment variables");
			throw new Error("Shopify environment variables are not properly configured");
		}

		let url;
		if (isCustomerAccount) {
			url = getCustomerAccountApiUrl();
		} else if (isAdminApi) {
			url = getAdminApiUrl();
		} else {
			url = getStorefrontApiUrl();
		}

		console.log(`Attempting fetch to ${isCustomerAccount ? "Customer Account" : isAdminApi ? "Admin" : "Storefront"} API:`, url);
		console.log("Request headers:", getHeaders(isAdminApi, isCustomerAccount));
		console.log("Request variables:", variables);

		const response = await fetch(url, {
			method: "POST",
			headers: getHeaders(isAdminApi, isCustomerAccount),
			body: JSON.stringify({
				query,
				variables,
			}),
			cache: cache ?? "no-store", // Default to no-store for customer operations
		});

		if (!response.ok) {
			const text = await response.text();
			console.error("Shopify API Error Response:", {
				status: response.status,
				statusText: response.statusText,
				body: text,
			});
			throw new Error(`Shopify API responded with status ${response.status}: ${text}`);
		}

		const json = await response.json();
		console.log("Shopify API Response:", JSON.stringify(json, null, 2));

		// Check for GraphQL errors
		if (json.errors) {
			console.error("Shopify GraphQL Errors:", json.errors);
			const errorMessage = json.errors.map((e: any) => e.message).join(", ");
			throw new Error(`Shopify GraphQL Error: ${errorMessage}`);
		}

		// Check for user errors in the response data
		const userErrors = json.data?.customerAccountCreate?.customerUserErrors || json.data?.customerAccessTokenCreate?.customerUserErrors || json.data?.customerUpdate?.customerUserErrors;

		if (userErrors?.length > 0) {
			console.error("Shopify User Errors:", userErrors);
			throw new Error(userErrors[0].message);
		}

		return json;
	} catch (error) {
		console.error("Shopify Fetch Error:", {
			error,
			stack: error instanceof Error ? error.stack : undefined,
			query,
			variables: JSON.stringify(variables, null, 2),
		});
		throw error;
	}
}
