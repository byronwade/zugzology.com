import { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN } from "@/lib/constants";
import { isMockShopForced, MOCK_SHOP_ENDPOINT } from "./demo-mode";
import type { ShopifyFetchParams } from "./types";

const DEFAULT_TIMEOUT_MS = 2500;
const MAX_RETRIES = 1;

type GraphqlPayload = {
	data?: unknown;
	errors?: Array<{ message: string }>;
};

type GraphqlRequest = {
	endpoint: string;
	headers: Record<string, string>;
	query: string;
	variables?: Record<string, unknown>;
	next?: ShopifyFetchParams<unknown>["next"];
	tags?: string[];
	allowPartialData?: boolean;
};

async function postGraphql(request: GraphqlRequest): Promise<GraphqlPayload> {
	const response = await fetch(request.endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...request.headers,
		},
		body: JSON.stringify({ query: request.query, variables: request.variables }),
		next: {
			...request.next,
			tags: [...(request.next?.tags || []), ...(request.tags || [])],
			revalidate: request.next?.revalidate ?? 300,
		},
		signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	return (await response.json()) as GraphqlPayload;
}

function isRetryable(message: string): boolean {
	return (
		message.includes("ECONNRESET") ||
		message.includes("ETIMEDOUT") ||
		message.includes("SocketError") ||
		message.includes("fetch failed") ||
		message.includes("HTTP 429") ||
		message.includes("HTTP 5")
	);
}

function resolveGraphqlData(json: GraphqlPayload, allowPartialData: boolean | undefined): unknown {
	if (!json.errors?.length) {
		return json.data ?? {};
	}

	// Mock.shop may reject niche fields; keep usable partial data when present.
	if (allowPartialData && json.data && typeof json.data === "object") {
		return json.data;
	}

	throw new Error(`Shopify API Errors: ${json.errors.map((error) => error.message).join(", ")}`);
}

async function fetchWithRetries(request: GraphqlRequest): Promise<{ data: unknown }> {
	let lastError: Error | null = null;

	for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
		try {
			const json = await postGraphql(request);
			return { data: resolveGraphqlData(json, request.allowPartialData) };
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			if (!isRetryable(lastError.message) || attempt > MAX_RETRIES) {
				throw lastError;
			}
			await new Promise((resolve) => setTimeout(resolve, 150));
		}
	}

	throw lastError || new Error("Failed to fetch from Shopify");
}

async function fetchFromMockShop<T>({ query, variables, tags, next }: ShopifyFetchParams<T>): Promise<{ data: T }> {
	const result = await fetchWithRetries({
		endpoint: MOCK_SHOP_ENDPOINT,
		headers: {},
		query,
		variables,
		next,
		tags,
		allowPartialData: true,
	});
	return { data: result.data as T };
}

async function fetchFromLiveShopify<T>({ query, variables, tags, next }: ShopifyFetchParams<T>): Promise<{ data: T }> {
	const result = await fetchWithRetries({
		endpoint: `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
		headers: {
			"X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
		},
		query,
		variables,
		next,
		tags,
	});
	return { data: result.data as T };
}

/**
 * Shopify Storefront GraphQL fetch.
 * Falls back to Mock.shop demo catalog when live Shopify is missing or unreachable.
 */
export async function shopifyFetch<T>({ query, variables, tags, next }: ShopifyFetchParams<T>): Promise<{ data: T }> {
	const hasLiveCredentials = Boolean(SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_ACCESS_TOKEN);
	const forceMock = isMockShopForced();

	if (hasLiveCredentials && !forceMock) {
		try {
			return await fetchFromLiveShopify<T>({ query, variables, tags, next });
		} catch {
			// Live store failed — serve Mock.shop demo data instead of empty pages
		}
	}

	try {
		return await fetchFromMockShop<T>({ query, variables, tags, next });
	} catch {
		// Absolute last resort so callers can soft-fail
		return { data: {} as T };
	}
}
