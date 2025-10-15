import type { MetadataRoute } from "next";
import { BRAND, INDUSTRY } from "@/lib/config/wadesdesign.config";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: BRAND.name,
		short_name: BRAND.name,
		description: BRAND.tagline,
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: BRAND.colors.primary,
		orientation: "portrait",
		scope: "/",
		lang: "en",
		dir: "ltr",
		categories: [INDUSTRY.type, "shopping", "business"],
		icons: [
			{
				src: "/icon-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/icon-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/icon-32x32.png",
				sizes: "32x32",
				type: "image/png",
				purpose: "any",
			},
		],
		screenshots: [
			{
				src: "/banner.png",
				sizes: "1920x1080",
				type: "image/png",
				form_factor: "wide",
				label: `${BRAND.name} Homepage`,
			},
		],
		related_applications: [],
		prefer_related_applications: false,
		shortcuts: [
			{
				name: "Products",
				short_name: "Shop",
				description: "Browse all products",
				url: "/products",
				icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
			},
			{
				name: "Cart",
				short_name: "Cart",
				description: "View shopping cart",
				url: "/cart",
				icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
			},
			{
				name: "Account",
				short_name: "Account",
				description: "My account",
				url: "/account",
				icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
			},
		],
	};
}
