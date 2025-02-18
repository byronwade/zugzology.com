import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zugzology.com";

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/api/", "/account/", "/cart", "/checkout", "/private/", "/*.json", "/*.xml"],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
