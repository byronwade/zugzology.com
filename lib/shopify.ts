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

// Helper function to format data size
function formatDataSize(data: any): string {
	const size = JSON.stringify(data).length / 1024;
	return `${size.toFixed(2)}KB`;
}

// Helper function to make GraphQL requests with better error handling and caching
export async function shopifyFetch<T>({ query, variables, cache = "force-cache", isAdminApi = false, isCustomerAccount = false }: ShopifyFetchOptions): Promise<{ data: T }> {
	try {
		if (!domain) {
			console.error("Missing required environment variables");
			throw new Error("Shopify environment variables are not properly configured");
		}

		// Validate required variables
		if (variables) {
			for (const [key, value] of Object.entries(variables)) {
				if (value === undefined || value === null) {
					throw new Error(`Required variable "${key}" is missing or invalid`);
				}
			}
		}

		let url;
		if (isCustomerAccount) {
			url = getCustomerAccountApiUrl();
		} else if (isAdminApi) {
			url = getAdminApiUrl();
		} else {
			url = getStorefrontApiUrl();
		}

		const apiType = isCustomerAccount ? "Customer Account" : isAdminApi ? "Admin" : "Storefront";
		const startTime = performance.now();

		// Determine caching strategy based on request type
		const cacheStrategy = isCustomerAccount ? "no-store" : cache;

		// Use unstable_cache for server-side caching with revalidation
		const response = await fetch(url, {
			method: "POST",
			headers: getHeaders(isAdminApi, isCustomerAccount),
			body: JSON.stringify({
				query,
				variables,
			}),
			cache: cacheStrategy,
			next: {
				// Use dynamic revalidation based on request type
				revalidate: isCustomerAccount ? 0 : cache === "force-cache" ? 3600 : 60,
			},
		});

		if (!response.ok) {
			const text = await response.text();
			console.error(`❌ [${apiType} API] HTTP Error:`, {
				status: response.status,
				statusText: response.statusText,
				body: text,
				url,
				variables,
			});
			throw new Error(`Shopify API responded with status ${response.status}: ${text}`);
		}

		const json = await response.json();
		const duration = performance.now() - startTime;

		// Enhanced error logging
		if (json.errors) {
			const errors = json.errors.map((e: any) => e.message);
			console.error(`❌ [${apiType} API] GraphQL Errors:`, {
				errors,
				query: query.slice(0, 200) + "...",
				variables,
			});
			throw new Error(`Shopify GraphQL Error: ${errors.join(", ")}`);
		}

		// Log performance metrics for slow queries
		if (duration > 100) {
			console.log(`⚡ [${apiType} API] ${duration.toFixed(2)}ms | Size: ${formatDataSize(json.data)} | Cache: ${cacheStrategy}`);
		}

		return json;
	} catch (error) {
		if (error instanceof Error) {
			console.error("❌ [Shopify API] Error:", {
				message: error.message,
				stack: error.stack?.split("\n").slice(0, 3),
				query: query.slice(0, 200) + "...",
				variables,
			});
		} else {
			console.error("❌ [Shopify API] Unknown error:", error);
		}
		throw error;
	}
}
