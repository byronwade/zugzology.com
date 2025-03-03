/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		ppr: true,
		inlineCss: true,
		reactCompiler: true,
		useCache: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	// Disable source maps when using Bun to avoid the SourceMap error
	productionBrowserSourceMaps: false,
	webpack: (config: any, { dev }: { dev: boolean }) => {
		// Disable source maps in development when using Bun
		if (dev && process.env.BUN_RUNTIME) {
			config.devtool = false;
		}
		return config;
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

