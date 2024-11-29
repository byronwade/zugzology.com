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
				protocol: "https",
				hostname: "cdn.shopify.com",
			},
			{
				protocol: "https",
				hostname: "placehold.co",
			},
		],
		dangerouslyAllowSVG: true,
	},
};

export default nextConfig;
