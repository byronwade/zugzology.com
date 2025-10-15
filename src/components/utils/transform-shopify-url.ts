/**
 * Transforms Shopify URLs to local app URLs
 * @param url - The Shopify URL to transform
 * @returns The transformed local URL
 */
export function transformShopifyUrl(url: string): string {
	if (!url) {
		return "/";
	}

	try {
		// Remove domain and protocol
		const urlObj = new URL(url);
		let path = urlObj.pathname;

		// Remove trailing slashes
		path = path.replace(/\/$/, "");

		// Handle common Shopify patterns
		if (path.startsWith("/pages/")) {
			// Transform /pages/about to /about
			path = path.replace("/pages/", "/");
		}

		return path || "/";
	} catch (_error) {
		// If URL parsing fails, assume it's already a path
		let path = url;

		// Remove trailing slashes
		path = path.replace(/\/$/, "");

		// Remove /pages/ prefix if present
		if (path.startsWith("/pages/")) {
			path = path.replace("/pages/", "/");
		}

		return path || "/";
	}
}
