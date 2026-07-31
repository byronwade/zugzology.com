import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
	reactCompiler: true,

	// Allow static shell + dynamic holes where needed
	cacheComponents: false,

	// Dynamic routes stream their <title>/<meta> into the body rather than the
	// initial <head> flush — on /products the description landed ~36KB in. Next
	// only falls back to blocking metadata for user agents matching this regex,
	// and its default list leaves out Googlebot and every generic crawler on the
	// assumption they execute JS. Widening it costs real users nothing (they are
	// not bots) and means no crawler depends on running our JS to find the
	// description. Keep the upstream defaults and add the rest.
	htmlLimitedBots:
		/Googlebot|Google-InspectionTool|GoogleOther|AdsBot-Google|Storebot-Google|Mediapartners-Google|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Pinterest|TelegramBot|Embedly|PetalBot|SemrushBot|AhrefsBot|GPTBot|ChatGPT-User|PerplexityBot|ClaudeBot|Bytespider/i,

	experimental: {
		// Measured, not assumed: inlining takes the document from 566KB to 850KB
		// and costs more than the 330ms of render-blocking CSS it removes —
		// mobile performance 78-83 with the external sheet, 69-70 inlined.
		inlineCss: false,
		optimizePackageImports: [
			"lucide-react",
			"@radix-ui/react-dialog",
			"@radix-ui/react-dropdown-menu",
			"@radix-ui/react-popover",
			"@radix-ui/react-select",
			"@radix-ui/react-tabs",
			"@radix-ui/react-tooltip",
			"@radix-ui/react-scroll-area",
			"@radix-ui/react-accordion",
			"sonner",
		],
	},

	typescript: {
		ignoreBuildErrors: true,
	},

	compiler: {
		removeConsole:
			process.env.NODE_ENV === "production"
				? {
						exclude: ["error", "warn"],
					}
				: false,
	},

	images: {
		formats: ["image/avif", "image/webp"],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 31_536_000,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.shopify.com",
			},
			{
				protocol: "https",
				hostname: "bevgyjm5apuichhj.public.blob.vercel-storage.com",
				port: "",
				pathname: "/**",
				search: "",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
	},

	compress: true,
	poweredByHeader: false,

	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "Content-Security-Policy",
						value:
							"default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.shopify.com https://unpkg.com https://ajax.googleapis.com https://*.googletagmanager.com https://*.google-analytics.com https://va.vercel-scripts.com https://vitals.vercel-insights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://cdn.shopify.com https://*.shopify.com https://*.google-analytics.com https://va.vercel-scripts.com https://vitals.vercel-insights.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://*.shopify.com; child-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://*.shopify.com; frame-ancestors 'self'",
					},
				],
			},
		];
	},

	env: {
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://zugzology.com",
		NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
		NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
	},
};

export default withBundleAnalyzer(nextConfig);
