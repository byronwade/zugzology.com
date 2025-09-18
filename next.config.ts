/** @type {import('next').NextConfig} */
const nextConfig = {
experimental: {
		ppr: true,
		inlineCss: true,
		reactCompiler: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		minimumCacheTTL: 31536000,
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'cdn.shopify.com',
			},
			{
			  protocol: "https",
			  hostname: "bevgyjm5apuichhj.public.blob.vercel-storage.com",
			  port: "",
			  pathname: "/**",
			  search: "",
			},
		],
	},
	env: {
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://zugzology.com',
		NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
		NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
	},
}

export default nextConfig;