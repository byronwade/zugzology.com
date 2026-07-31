import { AlertTriangle } from "lucide-react";

import { getShopifyConnectionStatus } from "@/lib/api/shopify/health";

/**
 * Site-wide notice when Shopify Storefront API is unreachable.
 * Keeps header/footer navigable while commerce data may be unavailable.
 */
export async function ShopifyStatusBanner(): Promise<React.ReactElement | null> {
	const status = await getShopifyConnectionStatus();

	if (status.available) {
		return null;
	}

	const detail =
		status.reason === "missing_credentials"
			? "The store connection is not configured. Product catalogs, cart, and checkout are unavailable."
			: "We can't reach Shopify right now. Product catalogs, cart, and checkout may be unavailable until the connection is restored.";

	return (
		<div
			aria-live="polite"
			className="border-amber-500/40 border-b bg-amber-50 text-amber-950 dark:bg-amber-950/50 dark:text-amber-50"
			role="alert"
		>
			<div className="container mx-auto flex items-start gap-3 px-4 py-3 text-sm sm:items-center">
				<AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 sm:mt-0 dark:text-amber-300" />
				<div className="min-w-0 space-y-0.5">
					<p className="font-medium tracking-tight">Store temporarily unavailable</p>
					<p className="text-amber-900/85 dark:text-amber-100/85">{detail} You can still navigate the site.</p>
				</div>
			</div>
		</div>
	);
}
