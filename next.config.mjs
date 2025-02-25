/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ["cdn.shopify.com", "images.unsplash.com", "tailwindui.com", "zugzology.com"],
		formats: ["image/avif", "image/webp"],
	},
	experimental: {
		useCache: true,
	},
};

export default nextConfig;
