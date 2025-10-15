/**
 * Store Data Loader
 *
 * Fetches store configuration from Shopify API and admin settings.
 * This replaces all hardcoded values with dynamic data from Shopify.
 */

import { cache } from "react";
import { getDefaultStoreConfig, getStoreConfig, type StoreConfig, setStoreConfig } from "./store-config";

/**
 * Shopify Shop query to get store information
 */
const SHOP_QUERY = `
  query getShop {
    shop {
      name
      description
      myshopifyDomain
      primaryDomain {
        url
        host
      }
      currencyCode
      moneyFormat
      brand {
        logo {
          image {
            url
            altText
          }
        }
        colors {
          primary {
            background
            foreground
          }
          secondary {
            background
            foreground
          }
        }
      }
      metafields(identifiers: [
        {namespace: "template_config", key: "homepage_template"},
        {namespace: "template_config", key: "product_template"},
        {namespace: "template_config", key: "collection_template"},
        {namespace: "template_config", key: "affiliate_links"},
        {namespace: "template_config", key: "features"},
        {namespace: "template_config", key: "promotions"},
        {namespace: "template_config", key: "seo_settings"}
      ]) {
        key
        value
        namespace
      }
    }
  }
`;

/**
 * Load store configuration from Shopify API
 */
export const loadStoreConfiguration = cache(async (): Promise<StoreConfig> => {
	try {
		const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
		const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

		if (!(storeDomain && storefrontToken)) {
			const defaultConfig = getDefaultStoreConfig() as StoreConfig;
			setStoreConfig(defaultConfig);
			return defaultConfig;
		}

		// Get basic shop information
		const shopData = await fetch(`https://${storeDomain}/api/2024-01/graphql.json`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": storefrontToken,
			},
			body: JSON.stringify({ query: SHOP_QUERY }),
		});

		if (!shopData.ok) {
			throw new Error(`Shopify Storefront API responded with ${shopData.status}`);
		}

		const { data } = await shopData.json();
		const shop = data?.shop;

		if (!shop) {
			return getDefaultStoreConfig() as StoreConfig;
		}

		// Parse metafields for custom configuration
		const metafields = shop.metafields || [];
		const getMetafieldValue = (key: string) => {
			const metafield = metafields.find((m: any) => m.key === key);
			try {
				return metafield?.value ? JSON.parse(metafield.value) : null;
			} catch {
				return metafield?.value || null;
			}
		};

		// Build configuration object
		const config: StoreConfig = {
			storeName: shop.name || "Your Store",
			storeDescription: shop.description || "Welcome to our store",
			storeDomain: shop.myshopifyDomain || shop.primaryDomain?.host || "your-store.myshopify.com",

			currency: {
				code: shop.currencyCode || "USD",
				symbol: extractCurrencySymbol(shop.moneyFormat) || "$",
			},

			branding: {
				primaryColor: shop.brand?.colors?.primary?.background || "#7c3aed",
				secondaryColor: shop.brand?.colors?.secondary?.background || "#06b6d4",
				logoUrl: shop.brand?.logo?.image?.url,
				faviconUrl: shop.brand?.logo?.image?.url, // Use logo as favicon fallback
			},

			navigation: {
				mainMenu: "main-menu", // Default, can be configured via metafields
				footerMenu: "footer",
				affiliateLinks: getMetafieldValue("affiliate_links") || [],
			},

			features: {
				showPromos: true,
				enableSearch: true,
				enableWishlist: true,
				enableReviews: true,
				enableBlog: true,
				enableCollections: true,
				...getMetafieldValue("features"),
			},

			seo: {
				defaultTitle: `${shop.name} - Online Store`,
				defaultDescription: shop.description || "Shop our amazing products",
				keywords: [],
				ogImage: shop.brand?.logo?.image?.url,
				...getMetafieldValue("seo_settings"),
			},

			templates: {
				homepage: getMetafieldValue("homepage_template") || "default",
				productPage: getMetafieldValue("product_template") || "standard",
				collectionPage: getMetafieldValue("collection_template") || "grid",
			},

			promotions: getMetafieldValue("promotions"),
		};

		// Cache the configuration
		setStoreConfig(config);

		return config;
	} catch (_error) {
		// Return default configuration on error
		const defaultConfig = getDefaultStoreConfig() as StoreConfig;
		setStoreConfig(defaultConfig);
		return defaultConfig;
	}
});

/**
 * Extract currency symbol from Shopify money format
 */
function extractCurrencySymbol(moneyFormat: string): string {
	if (!moneyFormat) {
		return "$";
	}

	// Common patterns in Shopify money formats
	const patterns = [
		/^([^0-9{]+)/, // Symbol at start
		/([^0-9}]+)$/, // Symbol at end
	];

	for (const pattern of patterns) {
		const match = moneyFormat.match(pattern);
		if (match) {
			return match[1].trim();
		}
	}

	return "$"; // Fallback
}

/**
 * Initialize store configuration on app start
 */
export const initializeStoreConfig = async () => {
	try {
		await loadStoreConfiguration();
	} catch (_error) {}
};

/**
 * Update store configuration (for admin panel)
 */
export const updateStoreConfiguration = async (updates: Partial<StoreConfig>) => {
	// For now, we'll just update the local configuration
	// In production, this should make API calls to update Shopify metafields
	const currentConfig = getStoreConfig();
	const newConfig = { ...currentConfig, ...updates };
	setStoreConfig(newConfig);

	return newConfig;
};
