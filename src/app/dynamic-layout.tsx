/**
 * Dynamic Layout Component
 *
 * This component handles dynamic store configuration loading and provides
 * a fallback while the store data is being fetched.
 */

import { Suspense } from "react";
import { generateStoreStructuredData } from "@/lib/config/dynamic-metadata";
import { loadStoreConfiguration } from "@/lib/config/store-data-loader";

type DynamicLayoutProps = {
	children: React.ReactNode;
};

/**
 * Layout content that uses store configuration
 */
async function LayoutContent({ children }: DynamicLayoutProps) {
	// Load store configuration from Shopify
	await loadStoreConfiguration();

	// Generate structured data
	const storeStructuredData = generateStoreStructuredData();

	return (
		<>
			{/* Store structured data */}
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(storeStructuredData),
				}}
				type="application/ld+json"
			/>
			{children}
		</>
	);
}

/**
 * Dynamic layout with store configuration loading
 */
export default function DynamicLayout({ children }: DynamicLayoutProps) {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-background">
					<div className="text-center">
						<div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
						<p className="text-muted-foreground text-sm">Loading store...</p>
					</div>
				</div>
			}
		>
			<LayoutContent>{children}</LayoutContent>
		</Suspense>
	);
}
