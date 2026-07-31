import { AlertTriangle, FlaskConical } from "lucide-react";

import { getShopifyConnectionStatus } from "@/lib/api/shopify/health";

/**
 * Site-wide notice when live Shopify is down and/or Mock.shop demo data is active.
 */
export async function ShopifyStatusBanner(): Promise<React.ReactElement | null> {
	const status = await getShopifyConnectionStatus();

	if (status.mode === "live") {
		return null;
	}

	if (status.mode === "demo") {
		return (
			<output
				aria-live="polite"
				className="block w-full border-sky-500/40 border-b bg-sky-50 text-left text-sky-950 dark:bg-sky-950/50 dark:text-sky-50"
			>
				<div className="container mx-auto flex items-start gap-3 px-4 py-3 text-sm sm:items-center">
					<FlaskConical aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-sky-700 sm:mt-0 dark:text-sky-300" />
					<div className="min-w-0 space-y-0.5">
						<p className="font-medium tracking-tight">Demo catalog active</p>
						<p className="text-sky-900/85 dark:text-sky-100/85">
							The live store isn&apos;t connected right now, so you&apos;re browsing sample products from Mock.shop.
							Navigation, product pages, and cart still work with demo data.
						</p>
					</div>
				</div>
			</output>
		);
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
