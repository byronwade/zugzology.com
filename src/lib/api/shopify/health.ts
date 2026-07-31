import { cache } from "react";

import { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN } from "@/lib/constants";
import { isMockShopForced, MOCK_SHOP_ENDPOINT, type StorefrontStatus } from "./demo-mode";

export type ShopifyConnectionReason = "missing_credentials" | "connection_failed" | "using_demo";

export type ShopifyConnectionStatus = StorefrontStatus;

const HEALTH_QUERY = `
	query ShopifyHealth {
		shop {
			name
		}
	}
`;

async function probeEndpoint(endpoint: string, headers: Record<string, string> = {}): Promise<boolean> {
	try {
		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...headers,
			},
			body: JSON.stringify({ query: HEALTH_QUERY }),
			next: {
				revalidate: 300,
				tags: ["shopify-health"],
			},
			signal: AbortSignal.timeout(1500),
		});

		if (!response.ok) {
			return false;
		}

		const json = (await response.json()) as {
			data?: { shop?: { name?: string } };
			errors?: Array<{ message: string }>;
		};

		return Boolean(!json.errors?.length && json.data?.shop?.name);
	} catch {
		return false;
	}
}

/**
 * Probe live Shopify first, then Mock.shop demo catalog.
 * `mode: "demo"` means the site can still browse sample products.
 */
export const getShopifyConnectionStatus = cache(async (): Promise<ShopifyConnectionStatus> => {
	const forceMock = isMockShopForced();
	const hasCredentials = Boolean(SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_ACCESS_TOKEN);

	if (hasCredentials && !forceMock) {
		const liveOk = await probeEndpoint(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`, {
			"X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
		});
		if (liveOk) {
			return { available: true, mode: "live" };
		}
	}

	const demoOk = await probeEndpoint(MOCK_SHOP_ENDPOINT);
	if (demoOk) {
		return {
			available: true,
			mode: "demo",
			reason: hasCredentials ? "using_demo" : "missing_credentials",
		};
	}

	return {
		available: false,
		mode: "down",
		reason: hasCredentials ? "connection_failed" : "missing_credentials",
	};
});
