import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
	reactCompiler: true,

	// Allow static shell + dynamic holes where needed
	cacheComponents: false,

	experimental: {
		inlineCss: true,
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
							"default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.shopify.com https://*.googletagmanager.com https://*.google-analytics.com https://va.vercel-scripts.com https://vitals.vercel-insights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://cdn.shopify.com https://*.shopify.com https://*.google-analytics.com https://va.vercel-scripts.com https://vitals.vercel-insights.com; frame-src *; child-src *; frame-ancestors *",
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
