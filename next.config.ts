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
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "placehold.co",
			},
			{
				protocol: "https",
				hostname: "img.youtube.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "**",
				pathname: "/**",
			},
		],
		dangerouslyAllowSVG: true,
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},
};

export default nextConfig;

