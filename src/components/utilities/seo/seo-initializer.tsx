"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { initWebVitals } from "@/lib/seo/web-vitals";

/**
 * Initialize all SEO tracking and monitoring
 */
export function SEOInitializer() {
	const pathname = usePathname();

	useEffect(() => {
		// Initialize Web Vitals tracking
		initWebVitals();

		// Track page views
		trackPageView(pathname);

		// Initialize structured data validation in development
		if (process.env.NODE_ENV === "development") {
			validateStructuredData();
		}

		// Prefetch critical resources
		prefetchCriticalResources();

		// Monitor SEO health periodically
		const interval = setInterval(monitorSEOHealth, 300_000); // Every 5 minutes

		return () => clearInterval(interval);
	}, [pathname]);

	useEffect(() => {
		// Track route changes
		trackPageView(pathname);

		// Update canonical URL
		updateCanonicalUrl(pathname);

		// Preload next likely navigation
		preloadNextNavigation(pathname);
	}, [pathname]);

	return null; // This component doesn't render anything
}

/**
 * Track page views for analytics
 */
function trackPageView(pathname: string) {
	if (typeof window !== "undefined" && window.gtag) {
		window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
			page_path: pathname,
		});
	}

	// Send to custom analytics
	fetch("/api/analytics/pageview", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			pathname,
			referrer: document.referrer,
			timestamp: Date.now(),
		}),
	}).catch(console.error);
}

/**
 * Validate structured data in development
 */
async function validateStructuredData() {
	try {
		const scripts = document.querySelectorAll('script[type="application/ld+json"]');

		scripts.forEach((script, _index) => {
			try {
				const data = JSON.parse(script.textContent || "");

				// Basic validation
				if (!data["@context"]) {
				}
				if (!(data["@type"] || data["@graph"])) {
				}
			} catch (_error) {}
		});

		if (scripts.length === 0) {
		} else {
		}
	} catch (_error) {}
}

/**
 * Prefetch critical resources
 */
function prefetchCriticalResources() {
	// Prefetch DNS for external domains
	const domains = ["cdn.shopify.com", "www.googletagmanager.com", "www.google-analytics.com"];

	domains.forEach((domain) => {
		const link = document.createElement("link");
		link.rel = "dns-prefetch";
		link.href = `//${domain}`;
		document.head.appendChild(link);
	});

	// Preconnect to critical origins
	const origins = ["https://cdn.shopify.com"];

	origins.forEach((origin) => {
		const link = document.createElement("link");
		link.rel = "preconnect";
		link.href = origin;
		link.crossOrigin = "anonymous";
		document.head.appendChild(link);
	});
}

/**
 * Monitor SEO health
 */
async function monitorSEOHealth() {
	try {
		const response = await fetch("/api/seo/monitor");
		const data = await response.json();

		if (data.score < 60) {
		}
	} catch (_error) {}
}

/**
 * Update canonical URL dynamically
 */
function updateCanonicalUrl(pathname: string) {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zugzology.com";
	const canonicalUrl = `${baseUrl}${pathname}`;

	// Find existing canonical link
	let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

	if (!canonicalLink) {
		canonicalLink = document.createElement("link");
		canonicalLink.rel = "canonical";
		document.head.appendChild(canonicalLink);
	}

	canonicalLink.href = canonicalUrl;
}

/**
 * Preload likely next navigation
 */
function preloadNextNavigation(pathname: string) {
	// Intelligent preloading based on current page
	const preloadMap: Record<string, string[]> = {
		"/": ["/products", "/collections"],
		"/products": ["/products/[handle]"],
		"/collections": ["/collections/[handle]"],
		"/blogs": ["/blogs/[blog]/[slug]"],
	};

	const toPreload = preloadMap[pathname] || [];

	toPreload.forEach((path) => {
		// Use Next.js prefetch if available
		if (typeof window !== "undefined" && window.next?.prefetch) {
			window.next.prefetch(path);
		}
	});
}
