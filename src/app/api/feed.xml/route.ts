import { NextResponse } from "next/server";
import { getAllBlogPosts } from "@/lib/api/shopify/actions";
import { getStoreConfigSafe } from "@/lib/config/store-config";

export async function GET() {
	try {
		const config = getStoreConfigSafe();
		const baseUrl = `https://${config.storeDomain}`;

		// Fetch all blog posts
		const articles = await getAllBlogPosts();

		// Sort by publication date (newest first)
		const sortedArticles = articles.sort((a, b) => {
			const dateA = new Date(a.publishedAt || a.createdAt);
			const dateB = new Date(b.publishedAt || b.createdAt);
			return dateB.getTime() - dateA.getTime();
		});

		// Generate RSS feed
		const rss = generateRSSFeed(sortedArticles, baseUrl, config);

		return new NextResponse(rss, {
			status: 200,
			headers: {
				"Content-Type": "application/xml; charset=utf-8",
				"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
			},
		});
	} catch (error) {
		console.error("Failed to generate RSS feed:", error);
		return NextResponse.json({ error: "Failed to generate feed" }, { status: 500 });
	}
}

/**
 * Generate RSS 2.0 feed with Atom extensions
 */
function generateRSSFeed(articles: any[], baseUrl: string, config: any): string {
	const now = new Date().toUTCString();
	const latestPubDate = articles[0]?.publishedAt
		? new Date(articles[0].publishedAt).toUTCString()
		: now;

	const feedItems = articles
		.slice(0, 50) // Limit to 50 most recent articles
		.map((article) => {
			const pubDate = article.publishedAt
				? new Date(article.publishedAt).toUTCString()
				: now;

			const blogHandle = article.blog?.handle || "news";
			const articleUrl = `${baseUrl}/blogs/${blogHandle}/${article.handle}`;

			// Clean HTML from content and create excerpt
			const textContent = article.content
				? article.content.replace(/<[^>]+>/g, "").substring(0, 500)
				: article.excerpt || article.title;

			const description = article.excerpt || textContent;

			return `
		<item>
			<title><![CDATA[${escapeXml(article.title)}]]></title>
			<link>${articleUrl}</link>
			<guid isPermaLink="true">${articleUrl}</guid>
			<pubDate>${pubDate}</pubDate>
			<description><![CDATA[${escapeXml(description)}]]></description>
			${article.content ? `<content:encoded><![CDATA[${article.content}]]></content:encoded>` : ""}
			${article.author?.name ? `<dc:creator><![CDATA[${escapeXml(article.author.name)}]]></dc:creator>` : ""}
			${article.blog?.title ? `<category><![CDATA[${escapeXml(article.blog.title)}]]></category>` : ""}
			${article.tags?.map((tag: string) => `<category><![CDATA[${escapeXml(tag)}]]></category>`).join("\n			") || ""}
			${
				article.image?.url
					? `
			<media:content url="${escapeXml(article.image.url)}" medium="image">
				${article.image.altText ? `<media:title type="plain"><![CDATA[${escapeXml(article.image.altText)}]]></media:title>` : ""}
			</media:content>
			<enclosure url="${escapeXml(article.image.url)}" type="image/jpeg" />`
					: ""
			}
		</item>`;
		})
		.join("");

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:atom="http://www.w3.org/2005/Atom"
	xmlns:media="http://search.yahoo.com/mrss/">
	<channel>
		<title><![CDATA[${config.storeName} Blog - Mushroom Cultivation Guides & Tips]]></title>
		<description><![CDATA[Expert mushroom cultivation guides, growing tips, and industry insights from ${config.storeName}. Stay updated with the latest in mushroom farming and cultivation techniques.]]></description>
		<link>${baseUrl}/blogs</link>
		<language>en-us</language>
		<copyright>Copyright ${new Date().getFullYear()} ${config.storeName}</copyright>
		<lastBuildDate>${now}</lastBuildDate>
		<pubDate>${latestPubDate}</pubDate>
		<ttl>60</ttl>
		<generator>Next.js ${config.storeName}</generator>
		<image>
			<url>${config.branding.logoUrl || `${baseUrl}/logo.png`}</url>
			<title><![CDATA[${config.storeName}]]></title>
			<link>${baseUrl}</link>
		</image>
		<atom:link href="${baseUrl}/api/feed.xml" rel="self" type="application/rss+xml" />
		<atom:link href="${baseUrl}/blogs" rel="alternate" type="text/html" />
		${feedItems}
	</channel>
</rss>`;
}

/**
 * Escape special XML characters
 */
function escapeXml(unsafe: string): string {
	if (!unsafe) {
		return "";
	}

	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}
