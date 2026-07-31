import { cache } from "react";

import { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN } from "@/lib/constants";

export type ShopifyConnectionReason = "missing_credentials" | "connection_failed";

export type ShopifyConnectionStatus = {
	available: boolean;
	reason?: ShopifyConnectionReason;
};

const HEALTH_QUERY = `
	query ShopifyHealth {
		shop {
			name
		}
	}
`;

/**
 * Lightweight Shopify connectivity probe (cached per request + short ISR).
 * Used for site-wide degraded-mode banner and to avoid false 404s during outages.
 */
export const getShopifyConnectionStatus = cache(async (): Promise<ShopifyConnectionStatus> => {
	if (!(SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_ACCESS_TOKEN)) {
		return { available: false, reason: "missing_credentials" };
	}

	try {
		const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
			},
			body: JSON.stringify({ query: HEALTH_QUERY }),
			next: {
				revalidate: 60,
				tags: ["shopify-health"],
			},
			signal: AbortSignal.timeout(8000),
		});

		if (!response.ok) {
			return { available: false, reason: "connection_failed" };
		}

		const json = (await response.json()) as {
			data?: { shop?: { name?: string } };
			errors?: Array<{ message: string }>;
		};

		if (json.errors?.length || !json.data?.shop?.name) {
			return { available: false, reason: "connection_failed" };
		}

		return { available: true };
	} catch {
		return { available: false, reason: "connection_failed" };
	}
});
