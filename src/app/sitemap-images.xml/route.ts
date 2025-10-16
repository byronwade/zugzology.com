import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/api/shopify/client";
import { getStoreConfigSafe } from "@/lib/config/store-config";

type ImageData = {
	url: string;
	title: string;
	caption?: string;
	geoLocation?: string;
	license?: string;
};

type SitemapImage = {
	loc: string;
	images: ImageData[];
};

async function getAllImages() {
	const query = `#graphql
		query GetAllImages {
			products(first: 250) {
				edges {
					node {
						id
						handle
						title
						description
						images(first: 10) {
							edges {
								node {
									url
									altText
									width
									height
								}
							}
						}
					}
				}
			}
			collections(first: 100) {
				edges {
					node {
						id
						handle
						title
						description
						image {
							url
							altText
							width
							height
						}
					}
				}
			}
			blogs(first: 25) {
				edges {
					node {
						handle
						title
						articles(first: 250) {
							edges {
								node {
									id
									handle
									title
									image {
										url
										altText
										width
										height
									}
								}
							}
						}
					}
				}
			}
		}
	`;

	const { data } = await shopifyFetch<any>({
		query,
		cache: "force-cache",
		next: {
			tags: ["image-sitemap"],
			revalidate: 3600,
		},
	});

	return {
		products: data.products.edges.map((edge: any) => edge.node),
		collections: data.collections.edges.map((edge: any) => edge.node),
		articles: data.blogs.edges.flatMap((edge: any) =>
			edge.node.articles.edges.map((articleEdge: any) => ({
				...articleEdge.node,
				blog: {
					handle: edge.node.handle,
					title: edge.node.title,
				},
			}))
		),
	};
}

export async function GET() {
	try {
		const config = getStoreConfigSafe();
		const baseUrl = `https://${config.storeDomain}`;

		const { products, collections, articles } = await getAllImages();

		const sitemapImages: SitemapImage[] = [];

		// Add product images
		for (const product of products) {
			const images: ImageData[] = [];

			for (const imageEdge of product.images?.edges || []) {
				const image = imageEdge.node;
				if (image?.url) {
					images.push({
						url: image.url,
						title: image.altText || product.title,
						caption: product.description
							? product.description.replace(/<[^>]+>/g, "").substring(0, 150)
							: product.title,
						license: "https://creativecommons.org/licenses/by-nc/4.0/",
					});
				}
			}

			if (images.length > 0) {
				sitemapImages.push({
					loc: `${baseUrl}/products/${product.handle}`,
					images,
				});
			}
		}

		// Add collection images
		for (const collection of collections) {
			if (collection.image?.url) {
				sitemapImages.push({
					loc: `${baseUrl}/collections/${collection.handle}`,
					images: [
						{
							url: collection.image.url,
							title: collection.image.altText || collection.title,
							caption: collection.description
								? collection.description.replace(/<[^>]+>/g, "").substring(0, 150)
								: collection.title,
							license: "https://creativecommons.org/licenses/by-nc/4.0/",
						},
					],
				});
			}
		}

		// Add blog article images
		for (const article of articles) {
			if (article.image?.url) {
				const blogHandle = article.blog?.handle || "news";
				sitemapImages.push({
					loc: `${baseUrl}/blogs/${blogHandle}/${article.handle}`,
					images: [
						{
							url: article.image.url,
							title: article.image.altText || article.title,
							caption: article.title,
							license: "https://creativecommons.org/licenses/by-nc/4.0/",
						},
					],
				});
			}
		}

		// Generate XML sitemap
		const xml = generateImageSitemap(sitemapImages);

		return new NextResponse(xml, {
			status: 200,
			headers: {
				"Content-Type": "application/xml; charset=utf-8",
				"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
			},
		});
	} catch (error) {
		console.error("Failed to generate image sitemap:", error);
		return NextResponse.json({ error: "Failed to generate image sitemap" }, { status: 500 });
	}
}

/**
 * Generate XML image sitemap following Google's specifications
 * @see https://developers.google.com/search/docs/advanced/sitemaps/image-sitemaps
 */
function generateImageSitemap(images: SitemapImage[]): string {
	const now = new Date().toISOString();

	const urls = images
		.map((item) => {
			const imageElements = item.images
				.map(
					(img) => `
			<image:image>
				<image:loc>${escapeXml(img.url)}</image:loc>
				<image:title>${escapeXml(img.title)}</image:title>
				${img.caption ? `<image:caption>${escapeXml(img.caption)}</image:caption>` : ""}
				${img.license ? `<image:license>${escapeXml(img.license)}</image:license>` : ""}
			</image:image>`
				)
				.join("");

			return `
	<url>
		<loc>${escapeXml(item.loc)}</loc>
		<lastmod>${now}</lastmod>
		<changefreq>daily</changefreq>
		<priority>0.8</priority>${imageElements}
	</url>`;
		})
		.join("");

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
		xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
	${urls}
</urlset>`;
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
