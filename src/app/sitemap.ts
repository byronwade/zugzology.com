import type { MetadataRoute } from "next";
import { shopifyFetch } from "@/lib/api/shopify/client";
import { getSiteOrigin } from "@/lib/config/store-config";

const baseUrl = getSiteOrigin();

async function getAllShopifyData() {
	const query = `#graphql
		query GetSitemapData {
			shop {
				name
				description
				primaryDomain {
					url
				}
			}
			products(first: 250) {
				edges {
					node {
						id
						handle
						title
						description
						updatedAt
						publishedAt
						images(first: 1) {
							edges {
								node {
									url
									altText
								}
							}
						}
						seo {
							title
							description
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
						updatedAt
						image {
							url
							altText
						}
						seo {
							title
							description
						}
						products(first: 1) {
							edges {
								node {
									updatedAt
								}
							}
						}
					}
				}
			}
			blogs(first: 25) {
				edges {
					node {
						id
						handle
						title
						seo {
							title
							description
						}
						articles(first: 250) {
							edges {
								node {
									id
									handle
									title
									content
									excerpt
									publishedAt
									image {
										url
										altText
									}
									seo {
										title
										description
									}
									blog {
										handle
										title
									}
									author {
										name
									}
								}
							}
						}
					}
				}
			}
			menu(handle: "main-menu") {
				items {
					url
					title
				}
			}
		}
	`;

	try {
		const { data } = await shopifyFetch<any>({
			query,
			cache: "force-cache",
			next: {
				tags: ["sitemap"],
				revalidate: 3600, // Revalidate every hour
			},
		});

		const blogEdges = data?.blogs?.edges ?? [];

		return {
			shop: data?.shop ?? null,
			products: (data?.products?.edges ?? []).map((edge: any) => edge.node),
			collections: (data?.collections?.edges ?? []).map((edge: any) => edge.node),
			blogs: blogEdges.map((edge: any) => edge.node),
			articles: blogEdges.flatMap((edge: any) =>
				(edge.node?.articles?.edges ?? []).map((articleEdge: any) => ({
					...articleEdge.node,
					blog: { handle: edge.node.handle, title: edge.node.title },
				}))
			),
			menuItems: data?.menu?.items || [],
		};
	} catch {
		// Shopify outage / missing credentials: keep sitemap buildable with static routes only
		return {
			shop: null,
			products: [],
			collections: [],
			blogs: [],
			articles: [],
			menuItems: [],
		};
	}
}

// Helper function to generate alternate language URLs if needed
function getAlternateLanguageUrls(path: string) {
	// Add your supported languages here
	const languages = ["en"]; // Add more languages as needed: ['en', 'fr', 'es']
	return languages.map((lang) => ({
		lang,
		url: `${baseUrl}${lang === "en" ? "" : `/${lang}`}${path}`,
	}));
}

// Helper to generate image sitemap entries
function _generateImageSitemapData(images: any[]) {
	if (!images?.length) {
		return;
	}

	const validImages = images
		.filter((image) => {
			// Extract URL from image object if needed
			const imageUrl = typeof image === "string" ? image : image.url || image.src;
			return typeof imageUrl === "string" && imageUrl.startsWith("http");
		})
		.map((image) => {
			// Extract URL and alt text, handling both string and object formats
			const imageUrl = typeof image === "string" ? image : image.url || image.src;
			const imageTitle = typeof image === "object" ? image.altText || undefined : undefined;

			return {
				loc: imageUrl, // Using loc instead of url for XML sitemap spec
				title: imageTitle,
				license: "https://creativecommons.org/licenses/by-nc/4.0/",
			};
		});

	return validImages.length > 0 ? validImages : undefined;
}

/*
 * There is deliberately no generateSitemaps() here.
 *
 * It used to return [{id:"main"},{id:"images"}], which moved the route to
 * /sitemap/main.xml and /sitemap/images.xml and left /sitemap.xml — the URL
 * robots.txt advertises, and the one crawlers try first — returning a 404. The
 * two ids also produced byte-identical output, because sitemap() never read the
 * id it was handed. Splitting is only worth it past the 50k-URL / 50MB limit,
 * and the image sitemap already has its own route at /sitemap-images.xml.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const { shop, products, collections, articles, blogs, menuItems } = await getAllShopifyData();

	// Core static routes that should always be included
	const coreRoutes = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "daily" as const,
			priority: 1,
			alternateRefs: getAlternateLanguageUrls("/"),
		},
		{
			url: `${baseUrl}/products`,
			lastModified: new Date(),
			changeFrequency: "daily" as const,
			priority: 0.9,
			alternateRefs: getAlternateLanguageUrls("/products"),
		},
		{
			url: `${baseUrl}/blogs`,
			lastModified: new Date(),
			changeFrequency: "daily" as const,
			priority: 0.9,
			alternateRefs: getAlternateLanguageUrls("/blogs"),
		},
		{
			url: `${baseUrl}/search`,
			lastModified: new Date(),
			changeFrequency: "daily" as const,
			priority: 0.8,
			alternateRefs: getAlternateLanguageUrls("/search"),
		},
		{
			url: `${baseUrl}/wishlist`,
			lastModified: new Date(),
			changeFrequency: "daily" as const,
			priority: 0.7,
			alternateRefs: getAlternateLanguageUrls("/wishlist"),
		},
		{
			url: `${baseUrl}/help`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.6,
			alternateRefs: getAlternateLanguageUrls("/help"),
		},
		{
			url: `${baseUrl}/login`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.5,
			alternateRefs: getAlternateLanguageUrls("/login"),
		},
		{
			url: `${baseUrl}/register`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.5,
			alternateRefs: getAlternateLanguageUrls("/register"),
		},
	];

	// Product routes with enhanced metadata
	const productRoutes = products.map((product: any) => {
		// Extract image data
		const imageData = product.images?.edges?.[0]?.node;

		return {
			url: `${baseUrl}/products/${product.handle}`,
			lastModified: new Date(product.updatedAt || product.publishedAt),
			changeFrequency: "daily" as const,
			priority: 0.7,
			alternateRefs: getAlternateLanguageUrls(`/products/${product.handle}`),
			// Single image object structure
			image: imageData?.url
				? {
						image: {
							loc: imageData.url,
							title: imageData.altText || product.title,
						},
					}
				: undefined,
		};
	});

	// Collection routes, excluding 'all' collection
	const collectionRoutes = collections
		.filter((collection: any) => collection.handle !== "all")
		.map((collection: any) => ({
			url: `${baseUrl}/collections/${collection.handle}`,
			lastModified: new Date(collection.updatedAt || collection.products.edges[0]?.node.updatedAt || new Date()),
			changeFrequency: "daily" as const,
			priority: 0.6,
			alternateRefs: getAlternateLanguageUrls(`/collections/${collection.handle}`),
			image: collection.image?.url
				? {
						image: {
							loc: collection.image.url,
							title: collection.image.altText || collection.title,
						},
					}
				: undefined,
		}));

	// Blog routes with enhanced metadata
	const blogRoutes = articles.map((article: any) => ({
		url: `${baseUrl}/blogs/${article.blog.handle}/${article.handle}`,
		lastModified: new Date(article.publishedAt),
		changeFrequency: "weekly" as const,
		priority: 0.6,
		alternateRefs: getAlternateLanguageUrls(`/blogs/${article.blog.handle}/${article.handle}`),
		image: article.image?.url
			? {
					image: {
						loc: article.image.url,
						title: article.title,
					},
				}
			: undefined,
	}));

	// Blog index pages
	const blogIndexRoutes = blogs.map((blog: any) => ({
		url: `${baseUrl}/blogs/${blog.handle}`,
		lastModified: new Date(),
		changeFrequency: "daily" as const,
		priority: 0.7,
		alternateRefs: getAlternateLanguageUrls(`/blogs/${blog.handle}`),
	}));

	// Get all unique URLs from the main menu for static routes
	const menuUrls = new Set(
		menuItems
			.map((item: any) => {
				try {
					const url = new URL(item.url);
					return url.pathname;
				} catch {
					return item.url.startsWith("/") ? item.url : `/${item.url}`;
				}
			})
			.filter((url: string | undefined) => url && url !== "/collections/all")
	);

	// Static routes based on menu items
	const menuRoutes = Array.from(menuUrls).map((url) => ({
		url: `${baseUrl}${url as string}`,
		lastModified: new Date(),
		changeFrequency: "daily" as const,
		priority: 0.8,
		alternateRefs: getAlternateLanguageUrls(url as string),
	}));

	// Combine all routes, with core routes first
	return [...coreRoutes, ...menuRoutes, ...productRoutes, ...collectionRoutes, ...blogIndexRoutes, ...blogRoutes];
}
