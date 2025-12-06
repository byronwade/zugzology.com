import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { Footer, Header } from "@/components/layout";
import { AuditProvider } from "@/components/utilities/seo/audit-provider";
import { generateHomeMetadata, generateStoreStructuredData, generateViewport } from "@/lib/config/dynamic-metadata";
import { getStoreConfigSafe } from "@/lib/config/store-config";
import { loadStoreConfiguration } from "@/lib/config/store-data-loader";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

// Loading components
function HeaderLoading() {
	return <div className="h-16 w-full animate-pulse bg-background" />;
}

function FooterLoading() {
	return <div className="h-64 w-full animate-pulse bg-background" />;
}

// Generate dynamic metadata based on store configuration
export async function generateMetadata(): Promise<Metadata> {
	await loadStoreConfiguration();
	return generateHomeMetadata();
}

// Generate viewport configuration
export const viewport: Viewport = generateViewport();

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	await loadStoreConfiguration();
	// Get store configuration for dynamic structured data
	const storeConfig = getStoreConfigSafe();
	const structuredData = generateStoreStructuredData();
	const requestHeaders = await headers();
	const secFetchSite = requestHeaders.get("sec-fetch-site") ?? "unknown";
	const secFetchDest = requestHeaders.get("sec-fetch-dest") ?? "unknown";
	const referer = requestHeaders.get("referer") ?? "none";
	const origin = requestHeaders.get("origin") ?? "none";
	const host = requestHeaders.get("host") ?? "unknown";
	const frameAncestors = ["*"];
	const hasWildcardAncestor = frameAncestors.includes("*");
	let refererHost: string | null = null;
	try {
		refererHost = referer !== "none" ? new URL(referer).hostname : null;
	} catch {
		refererHost = null;
	}
	const isAllowedFrameAncestor =
		hasWildcardAncestor ||
		(refererHost === null
			? null
			: refererHost === "byronwade.com" ||
				refererHost.endsWith(".byronwade.com") ||
				referer.startsWith("http://localhost:3000"));

	// #region agent log
	await fetch("http://127.0.0.1:7242/ingest/9560ed6e-3480-46d0-a1ef-10f735eff877", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			sessionId: "debug-session",
			runId: "post-csp",
			hypothesisId: "H1",
			location: "src/app/layout.tsx:request-context",
			message: "Request context for iframe diagnosis",
			data: { host, origin, referer, secFetchSite, secFetchDest },
			timestamp: Date.now(),
		}),
	}).catch(() => {});
	// #endregion

	// #region agent log
	await fetch("http://127.0.0.1:7242/ingest/9560ed6e-3480-46d0-a1ef-10f735eff877", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			sessionId: "debug-session",
			runId: "post-csp",
			hypothesisId: "H1",
			location: "src/app/layout.tsx:frame-ancestor-check",
			message: "Frame ancestor allow check",
			data: { refererHost, isAllowedFrameAncestor, allowedList: frameAncestors, hasWildcardAncestor },
			timestamp: Date.now(),
		}),
	}).catch(() => {});
	// #endregion

	// #region agent log
	await fetch("http://127.0.0.1:7242/ingest/9560ed6e-3480-46d0-a1ef-10f735eff877", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			sessionId: "debug-session",
			runId: "post-csp",
			hypothesisId: "H2",
			location: "src/app/layout.tsx:header-baseline",
			message: "Current frame-ancestors policy used in next.config.ts",
			data: { frameAncestors, hasWildcardAncestor },
			timestamp: Date.now(),
		}),
	}).catch(() => {});
	// #endregion

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							// Aggressive scroll reset
							(function() {
								// Disable browser scroll restoration
								if ('scrollRestoration' in history) {
									history.scrollRestoration = 'manual';
								}

								// Force instant scroll to top - no smooth behavior
								window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

								// Also set it immediately on DOMContentLoaded
								document.addEventListener('DOMContentLoaded', function() {
									window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
								});

								// And on page show (for back/forward navigation)
								window.addEventListener('pageshow', function() {
									window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
								});
							})();
						`,
					}}
				/>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							// Minimal iframe render diagnostics
							(function() {
								const ingestUrl = "http://127.0.0.1:7242/ingest/9560ed6e-3480-46d0-a1ef-10f735eff877";
								const safeString = (value) => {
									try {
										return typeof value === "string" ? value : JSON.stringify(value);
									} catch (_err) {
										return "unserializable";
									}
								};
								const snapshot = () => {
									try {
										const body = document.body;
										const html = document.documentElement;
										const first = body.firstElementChild;
										const firstStyle = first ? getComputedStyle(first) : null;
										const payload = {
											sessionId: "debug-session",
											runId: "post-csp",
											hypothesisId: "iframe-debug",
											location: "layout:iframe-snapshot",
											message: "Body snapshot for iframe render",
											timestamp: Date.now(),
											data: {
												htmlClass: html?.className || "",
												bodyChildren: body?.children?.length || 0,
												bodyHeight: body?.getBoundingClientRect()?.height || 0,
												firstChild: first
													? {
															tag: first.tagName,
															id: first.id || "",
															class: first.className || "",
															display: firstStyle?.display || "",
															visibility: firstStyle?.visibility || "",
															opacity: firstStyle?.opacity || "",
														}
													: null,
												textSample: (body?.innerText || "").slice(0, 1200),
												nextData: typeof window.__NEXT_DATA__ !== "undefined" ? safeString(window.__NEXT_DATA__).slice(0, 1200) : null,
											},
										};
										fetch(ingestUrl, {
											method: "POST",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify(payload),
										}).catch(() => {});
									} catch (_err) {
									}
								};
								if (document.readyState === "complete") {
									snapshot();
								} else {
									window.addEventListener("load", snapshot, { once: true });
								}
							})();
						`,
					}}
				/>
				<script
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "Organization",
							name: storeConfig.storeName,
							url: `https://${storeConfig.storeDomain}`,
							logo: storeConfig.branding.logoUrl || `https://${storeConfig.storeDomain}/logo.png`,
							description: storeConfig.storeDescription,
							sameAs: [],
						}),
					}}
					type="application/ld+json"
				/>
				<script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />

				{/* RSS Feed Auto-Discovery */}
				<link
					href={`https://${storeConfig.storeDomain}/api/feed.xml`}
					rel="alternate"
					title={`${storeConfig.storeName} Blog Feed`}
					type="application/rss+xml"
				/>
				<link
					href={`https://${storeConfig.storeDomain}/api/feed.xml`}
					rel="alternate"
					title={`${storeConfig.storeName} Blog Feed`}
					type="application/atom+xml"
				/>

				{/* Critical Resource Hints - DNS prefetch for third-party domains */}
				<link href="https://cdn.shopify.com" rel="dns-prefetch" />
				<link href="https://fonts.googleapis.com" rel="dns-prefetch" />
				<link href="https://fonts.gstatic.com" rel="dns-prefetch" />
				<link href="https://bevgyjm5apuichhj.public.blob.vercel-storage.com" rel="dns-prefetch" />

				{/* Preconnect to critical origins (DNS + TCP + TLS) */}
				<link crossOrigin="anonymous" href="https://cdn.shopify.com" rel="preconnect" />
				<link href="https://fonts.googleapis.com" rel="preconnect" />
				<link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
				<link crossOrigin="anonymous" href="https://bevgyjm5apuichhj.public.blob.vercel-storage.com" rel="preconnect" />
			</head>
			<body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
				<Providers>
					<AuditProvider>
						<div className="relative flex min-h-screen flex-col">
							<Suspense fallback={<HeaderLoading />}>
								<Header />
							</Suspense>
							<main className="flex-1">{children}</main>
							<Suspense fallback={<FooterLoading />}>
								<Footer />
							</Suspense>
						</div>
					</AuditProvider>
				</Providers>
				<Analytics />
			</body>
		</html>
	);
}
