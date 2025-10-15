import type { Metadata } from "next";

export type HreflangConfig = {
	defaultLocale: string;
	locales: Array<{
		code: string; // e.g., 'en-US', 'fr-CA'
		domain?: string; // Optional custom domain
		path?: string; // e.g., '/en', '/fr'
	}>;
};

export type AlternateLink = {
	hreflang: string;
	href: string;
};

/**
 * Generate hreflang tags for international SEO
 */
export function generateHreflangTags(pathname: string, config: HreflangConfig): AlternateLink[] {
	const alternates: AlternateLink[] = [];
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zugzology.com";

	// Add alternate links for each locale
	config.locales.forEach((locale) => {
		const url = locale.domain
			? `https://${locale.domain}${pathname}`
			: locale.path
				? `${baseUrl}${locale.path}${pathname}`
				: `${baseUrl}${pathname}`;

		alternates.push({
			hreflang: locale.code,
			href: url,
		});
	});

	// Add x-default for the default locale
	const defaultLocale = config.locales.find((l) => l.code === config.defaultLocale);
	if (defaultLocale) {
		const defaultUrl = defaultLocale.domain
			? `https://${defaultLocale.domain}${pathname}`
			: defaultLocale.path
				? `${baseUrl}${defaultLocale.path}${pathname}`
				: `${baseUrl}${pathname}`;

		alternates.push({
			hreflang: "x-default",
			href: defaultUrl,
		});
	}

	return alternates;
}

/**
 * Add hreflang to Next.js metadata
 */
export function addHreflangToMetadata(metadata: Metadata, pathname: string, config: HreflangConfig): Metadata {
	const alternates = generateHreflangTags(pathname, config);

	// Convert to Next.js alternates format
	const languages: Record<string, string> = {};
	let canonical = "";

	alternates.forEach((alt) => {
		if (alt.hreflang === "x-default") {
			canonical = alt.href;
		} else {
			languages[alt.hreflang] = alt.href;
		}
	});

	return {
		...metadata,
		alternates: {
			...metadata.alternates,
			canonical: canonical || metadata.alternates?.canonical,
			languages,
		},
	};
}

/**
 * Default hreflang configuration
 */
export const defaultHreflangConfig: HreflangConfig = {
	defaultLocale: "en-US",
	locales: [
		{ code: "en-US", path: "" }, // United States (default)
		{ code: "en-CA", path: "/ca" }, // Canada (English)
		{ code: "fr-CA", path: "/ca/fr" }, // Canada (French)
		{ code: "en-GB", path: "/uk" }, // United Kingdom
		{ code: "en-AU", path: "/au" }, // Australia
		{ code: "en-NZ", path: "/nz" }, // New Zealand
	],
};

/**
 * Generate link tags for HTML head
 */
export function generateHreflangLinkTags(pathname: string, config: HreflangConfig = defaultHreflangConfig): string {
	const alternates = generateHreflangTags(pathname, config);

	return alternates.map((alt) => `<link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`).join("\n");
}

/**
 * Generate sitemap alternates
 */
export function generateSitemapAlternates(
	pathname: string,
	config: HreflangConfig = defaultHreflangConfig
): Array<{ lang: string; url: string }> {
	const alternates = generateHreflangTags(pathname, config);

	return alternates
		.filter((alt) => alt.hreflang !== "x-default")
		.map((alt) => ({
			lang: alt.hreflang,
			url: alt.href,
		}));
}

/**
 * Detect user's preferred locale from headers
 */
export function detectUserLocale(acceptLanguage: string | null): string {
	if (!acceptLanguage) {
		return "en-US";
	}

	// Parse Accept-Language header
	const languages = acceptLanguage
		.split(",")
		.map((lang) => {
			const [code, q = "1"] = lang.trim().split(";q=");
			return { code: code.toLowerCase(), quality: Number.parseFloat(q) };
		})
		.sort((a, b) => b.quality - a.quality);

	// Map common language codes to our supported locales
	const localeMap: Record<string, string> = {
		en: "en-US",
		"en-us": "en-US",
		"en-ca": "en-CA",
		"fr-ca": "fr-CA",
		"en-gb": "en-GB",
		"en-au": "en-AU",
		"en-nz": "en-NZ",
		fr: "fr-CA", // Default French to Canadian French
	};

	for (const lang of languages) {
		const mappedLocale = localeMap[lang.code];
		if (mappedLocale) {
			return mappedLocale;
		}
	}

	return "en-US"; // Default
}

/**
 * Get locale-specific content
 */
export function getLocalizedContent(locale: string, content: Record<string, any>): any {
	const fallbackLocale = "en-US";

	// Try exact match
	if (content[locale]) {
		return content[locale];
	}

	// Try language-only match (e.g., 'en' for 'en-CA')
	const language = locale.split("-")[0];
	const languageMatch = Object.keys(content).find((key) => key.startsWith(language));

	if (languageMatch) {
		return content[languageMatch];
	}

	// Fallback to default
	return content[fallbackLocale] || content[Object.keys(content)[0]];
}

/**
 * Format currency for locale
 */
export function formatCurrency(amount: number, locale: string, currency?: string): string {
	// Map locale to currency
	const currencyMap: Record<string, string> = {
		"en-US": "USD",
		"en-CA": "CAD",
		"fr-CA": "CAD",
		"en-GB": "GBP",
		"en-AU": "AUD",
		"en-NZ": "NZD",
	};

	const localeCurrency = currency || currencyMap[locale] || "USD";

	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: localeCurrency,
	}).format(amount);
}

/**
 * Get locale-specific meta tags
 */
export function getLocaleMetaTags(locale: string): {
	language: string;
	region?: string;
	ogLocale: string;
} {
	const [language, region] = locale.split("-");

	return {
		language,
		region: region?.toUpperCase(),
		ogLocale: `${language}_${region?.toUpperCase() || "US"}`,
	};
}
