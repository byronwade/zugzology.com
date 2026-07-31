/**
 * Mock.shop — public Storefront GraphQL demo catalog.
 * Used automatically when live Shopify credentials are missing or unreachable.
 * @see https://mock.shop
 */
export const MOCK_SHOP_ENDPOINT = "https://mock.shop/api/2024-01/graphql.json";
export const MOCK_SHOP_HOST = "mock.shop";

export type StorefrontMode = "live" | "demo" | "down";

export type StorefrontStatus = {
	available: boolean;
	mode: StorefrontMode;
	reason?: "missing_credentials" | "connection_failed" | "using_demo";
};

/** Force demo catalog even if live Shopify credentials exist. */
export function isMockShopForced(): boolean {
	return process.env.NEXT_PUBLIC_USE_MOCK_SHOP === "true" || process.env.USE_MOCK_SHOP === "true";
}
