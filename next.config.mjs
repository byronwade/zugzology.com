/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		minimumCacheTTL: 31536000,
		remotePatterns: [{ hostname: "cdn.shopify.com" }],
	},
	experimental: {
		ppr: true,
		inlineCss: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
