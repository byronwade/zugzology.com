import { AlertTriangle, Home, LifeBuoy, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { getShopifyConnectionStatus } from "@/lib/api/shopify/health";

type ShopifyUnavailableProps = {
	title?: string;
	description?: string;
};

/**
 * Inline degraded-mode panel for Shopify-dependent pages.
 * Prefer this over notFound() when the catalog API is down.
 */
export function ShopifyUnavailable({
	title = "This page isn't working right now",
	description = "We're having trouble connecting to our store. Please try again shortly — you can keep browsing other parts of the site in the meantime.",
}: ShopifyUnavailableProps): React.ReactElement {
	return (
		<div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
			<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
				<AlertTriangle aria-hidden className="h-6 w-6" />
			</div>
			<h1 className="mb-3 font-semibold text-2xl tracking-tight">{title}</h1>
			<p className="mb-8 max-w-md text-muted-foreground">{description}</p>
			<div className="flex flex-wrap items-center justify-center gap-3">
				<Button asChild>
					<Link href="/">
						<Home className="h-4 w-4" />
						Home
					</Link>
				</Button>
				<Button asChild variant="outline">
					<Link href="/products">
						<ShoppingBag className="h-4 w-4" />
						Products
					</Link>
				</Button>
				<Button asChild variant="outline">
					<Link href="/help">
						<LifeBuoy className="h-4 w-4" />
						Help
					</Link>
				</Button>
			</div>
		</div>
	);
}

/**
 * Returns a degraded-mode panel when Shopify is down; otherwise null.
 * Helps pages avoid false 404s during outages without increasing branch complexity.
 */
export async function getShopifyUnavailableFallback(
	props: ShopifyUnavailableProps = {}
): Promise<React.ReactElement | null> {
	const status = await getShopifyConnectionStatus();
	// Live or Mock.shop demo both count as "available" for browsing
	if (status.available || status.mode === "demo") {
		return null;
	}
	return <ShopifyUnavailable {...props} />;
}
