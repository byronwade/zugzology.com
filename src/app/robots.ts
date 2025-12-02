import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zugzology.com";

	return {
		rules: [
			{
				// Allow all legitimate search engines
				userAgent: "*",
				allow: "/",
				disallow: [
					"/api/",
					"/admin/",
					"/account/",
					"/cart",
					"/checkout",
					"/private/",
					"/*.json$",
					"/search?*",
					"/*?*sort=",
					"/*?*filter=",
					"/*?*page=",
					"/cdn-cgi/",
					"/_next/",
				],
				crawlDelay: 1,
			},
			{
				// Specific rules for Googlebot with less restrictions
				userAgent: "Googlebot",
				allow: "/",
				disallow: ["/api/", "/admin/", "/checkout", "/account/", "/*.json$", "/cdn-cgi/"],
			},
			{
				// Allow Googlebot-Image to crawl product images
				userAgent: "Googlebot-Image",
				allow: ["/", "/products/", "/collections/", "/blogs/"],
				disallow: ["/account/", "/checkout"],
			},
			{
				// Rules for Google Ads bot
				userAgent: "AdsBot-Google",
				allow: "/",
				disallow: ["/api/", "/admin/", "/checkout", "/account/"],
			},
			{
				// Allow Bingbot
				userAgent: "Bingbot",
				allow: "/",
				disallow: ["/api/", "/admin/", "/account/", "/checkout", "/*.json$"],
			},
			{
				// Block aggressive SEO bots
				userAgent: ["AhrefsBot", "SemrushBot", "DotBot", "MJ12bot", "Bytespider"],
				disallow: "/",
			},
		],
		sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/sitemap-images.xml`],
		host: baseUrl,
	};
}
