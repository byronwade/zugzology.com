/**
 * Store Data Loader
 *
 * Fetches store configuration from Shopify Storefront API,
 * with automatic Mock.shop fallback when the live store is unavailable.
 */

import { cache } from "react";

import { shopifyFetch } from "@/lib/api/shopify/client";

import { getDefaultStoreConfig, getStoreConfig, type StoreConfig, setStoreConfig } from "./store-config";

/** Fields supported by both live Shopify and Mock.shop */
const SHOP_QUERY = `
  query getShop {
    shop {
      name
      description
      primaryDomain {
        url
        host
      }
    }
  }
`;

/**
 * Load store configuration from Shopify / Mock.shop
 */
export const loadStoreConfiguration = cache(async (): Promise<StoreConfig> => {
	try {
		const { data } = await shopifyFetch<{
			shop?: {
				name?: string;
				description?: string;
				primaryDomain?: { url?: string; host?: string };
			};
		}>({
			query: SHOP_QUERY,
			tags: ["store-config"],
			next: { revalidate: 3600 },
		});

		const shop = data?.shop;
		const defaults = getDefaultStoreConfig() as StoreConfig;

		if (!shop?.name) {
			setStoreConfig(defaults);
			return defaults;
		}

		const config: StoreConfig = {
			...defaults,
			storeName: shop.name || defaults.storeName,
			storeDescription: shop.description || defaults.storeDescription || "Welcome to our store",
			storeDomain: shop.primaryDomain?.host || defaults.storeDomain,
			seo: {
				...defaults.seo,
				defaultTitle: `${shop.name} - Online Store`,
				defaultDescription: shop.description || defaults.seo?.defaultDescription || "Shop our amazing products",
			},
		};

		setStoreConfig(config);
		return config;
	} catch {
		const defaultConfig = getDefaultStoreConfig() as StoreConfig;
		setStoreConfig(defaultConfig);
		return defaultConfig;
	}
});

export const initializeStoreConfig = async (): Promise<void> => {
	try {
		await loadStoreConfiguration();
	} catch {
		// Defaults already applied in loader
	}
};

export const updateStoreConfiguration = (updates: Partial<StoreConfig>): StoreConfig => {
	const currentConfig = getStoreConfig();
	const newConfig = { ...currentConfig, ...updates };
	setStoreConfig(newConfig);
	return newConfig;
};
