import type { Metadata } from "next";
import type { ShopifyBlogArticle, ShopifyCollection, ShopifyProduct } from "@/lib/types";
import { getStoreConfigSafe } from "../config/store-config";

type SEOConfig = {
	title?: string;
	description?: string;
	keywords?: string[];
	url?: string;
	image?: {
		url: string;
		width?: number;
		height?: number;
		alt?: string;
	};
	noindex?: boolean;
	nofollow?: boolean;
	canonical?: string;
	alternates?: {
		languages?: Record<string, string>;
		types?: Record<string, string>;
	};
	openGraph?: {
		type?: "website" | "article" | "product" | "profile";
		locale?: string;
		siteName?: string;
		publishedTime?: string;
		modifiedTime?: string;
		authors?: string[];
		tags?: string[];
		section?: string;
		price?: {
			amount: string;
			currency: string;
		};
		availability?: "instock" | "outofstock" | "discontinued";
	};
	twitter?: {
		card?: "summary" | "summary_large_image" | "player" | "app";
		site?: string;
		creator?: string;
		player?: string;
	};
	article?: {
		publishedTime?: string;
		modifiedTime?: string;
		expirationTime?: string;
		authors?: string[];
		section?: string;
		tags?: string[];
	};
	product?: {
		price?: string;
		currency?: string;
		availability?: string;
		condition?: string;
		brand?: string;
		category?: string;
		retailerItemId?: string;
	};
};

/**
 * Generate comprehensive metadata with all SEO best practices
 */
export function generateMetadata(config: SEOConfig): Metadata {
	const storeConfig = getStoreConfigSafe();
	const baseUrl = `https://${storeConfig.storeDomain}`;

	const title = config.title || storeConfig.seo.defaultTitle;
	const description = config.description || storeConfig.seo.defaultDescription;
	const url = config.url ? `${baseUrl}${config.url}` : baseUrl;

	const metadata: Metadata = {
		metadataBase: new URL(baseUrl),
		title: {
			default: title,
			template: `%s | ${storeConfig.storeName}`,
		},
		description,
		keywords: config.keywords || storeConfig.seo.keywords,
		authors: [{ name: storeConfig.storeName }],
		creator: storeConfig.storeName,
		publisher: storeConfig.storeName,
		formatDetection: {
			email: false,
			address: false,
			telephone: false,
		},
		openGraph: {
			title: config.openGraph?.siteName ? title : `${title} | ${storeConfig.storeName}`,
			description,
			url,
			siteName: config.openGraph?.siteName || storeConfig.storeName,
			locale: config.openGraph?.locale || "en_US",
			type: config.openGraph?.type || "website",
			images: config.image
				? [
						{
							url: config.image.url,
							width: config.image.width || 1200,
							height: config.image.height || 630,
							alt: config.image.alt || title,
						},
					]
				: storeConfig.seo.ogImage
					? [
							{
								url: storeConfig.seo.ogImage,
								width: 1200,
								height: 630,
								alt: storeConfig.storeName,
							},
						]
					: [],
		},
		twitter: {
			card: config.twitter?.card || "summary_large_image",
			site: config.twitter?.site || storeConfig.seo.twitterHandle,
			creator: config.twitter?.creator || storeConfig.seo.twitterHandle,
			title,
			description,
			images: config.image?.url ? [config.image.url] : storeConfig.seo.ogImage ? [storeConfig.seo.ogImage] : undefined,
		},
		robots: {
			index: !config.noindex,
			follow: !config.nofollow,
			nocache: false,
			googleBot: {
				index: !config.noindex,
				follow: !config.nofollow,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
		alternates: {
			canonical: config.canonical || url,
			languages: config.alternates?.languages,
			types: config.alternates?.types,
		},
		verification: {
			google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
			yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
			bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
		},
	};

	// Add article-specific metadata
	if (config.article) {
		metadata.openGraph = {
			...metadata.openGraph,
			type: "article",
			publishedTime: config.article.publishedTime,
			modifiedTime: config.article.modifiedTime,
			expirationTime: config.article.expirationTime,
			authors: config.article.authors,
			section: config.article.section,
			tags: config.article.tags,
		};
	}

	// Add product-specific metadata
	if (config.product) {
		metadata.openGraph = {
			...metadata.openGraph,
			type: "website", // Using website type but with product data
		};
		metadata.other = {
			"product:price:amount": config.product.price || "",
			"product:price:currency": config.product.currency || "USD",
			"product:availability": config.product.availability || "instock",
			"product:condition": config.product.condition || "new",
			"product:brand": config.product.brand || storeConfig.storeName,
			"product:category": config.product.category || "",
			"product:retailer_item_id": config.product.retailerItemId || "",
		};
	}

	return metadata;
}

/**
 * Generate product-specific metadata with enhanced SEO
 */
export function generateEnhancedProductMetadata(product: ShopifyProduct): Metadata {
	const storeConfig = getStoreConfigSafe();
	const price = product.priceRange?.minVariantPrice?.amount || "0";
	const currency = product.priceRange?.minVariantPrice?.currencyCode || "USD";
	const formattedPrice = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
	}).format(Number.parseFloat(price));

	// Create compelling title with key benefits
	const title = `${product.title} - ${formattedPrice} | Free Shipping Available`;

	// Create description with USPs
	const baseDescription = product.description
		? product.description.replace(/<[^>]*>/g, "").substring(0, 150)
		: `Premium ${product.title}`;
	const description = `${baseDescription}. ✓ Expert Support ✓ 30-Day Returns ✓ Ships in 1-2 Days. Shop now at ${storeConfig.storeName}!`;

	// Generate comprehensive keywords
	const keywords = [
		product.title,
		product.productType,
		product.vendor,
		...(product.tags || []),
		"buy online",
		"free shipping",
		"premium quality",
		storeConfig.storeName,
	].filter(Boolean);

	return generateMetadata({
		title,
		description,
		keywords,
		url: `/products/${product.handle}`,
		image: product.images?.nodes?.[0]
			? {
					url: product.images.nodes[0].url,
					width: product.images.nodes[0].width,
					height: product.images.nodes[0].height,
					alt: product.images.nodes[0].altText || product.title,
				}
			: undefined,
		openGraph: {
			type: "website",
		},
		product: {
			price,
			currency,
			availability: product.availableForSale ? "instock" : "outofstock",
			brand: product.vendor || storeConfig.storeName,
			category: product.productType || "",
			retailerItemId: product.id,
			condition: "new",
		},
	});
}

/**
 * Generate collection metadata with category focus
 */
export function generateEnhancedCollectionMetadata(collection: ShopifyCollection, productCount?: number): Metadata {
	const storeConfig = getStoreConfigSafe();

	const title = `${collection.title} Collection - ${productCount || "Premium"} Products | Up to 30% Off`;
	const description = collection.description
		? `${collection.description.substring(0, 120)}... ✓ ${productCount || "Multiple"} Products ✓ Expert Curated ✓ Fast Shipping`
		: `Shop our ${collection.title} collection. Premium quality products with expert support. Free shipping on orders over $75!`;

	return generateMetadata({
		title,
		description,
		keywords: [collection.title, "collection", "shop", "buy", "premium", storeConfig.storeName],
		url: `/collections/${collection.handle}`,
		image: collection.image
			? {
					url: collection.image.url,
					width: collection.image.width,
					height: collection.image.height,
					alt: collection.image.altText || collection.title,
				}
			: undefined,
	});
}

/**
 * Generate blog post metadata with article optimization
 */
export function generateEnhancedBlogMetadata(post: ShopifyBlogArticle): Metadata {
	const storeConfig = getStoreConfigSafe();

	const title = `${post.title} - Expert Guide | ${storeConfig.storeName} Blog`;
	const description =
		post.summary || post.excerpt
			? `${(post.summary || post.excerpt).substring(0, 150)}... Read more expert insights.`
			: `Learn about ${post.title}. Expert guides and tips from ${storeConfig.storeName}.`;

	return generateMetadata({
		title,
		description,
		keywords: [...(post.tags || []), "guide", "tutorial", "expert advice", storeConfig.storeName],
		url: `/blogs/${post.blog?.handle || "blog"}/${post.handle}`,
		image: post.image
			? {
					url: post.image.url,
					width: post.image.width,
					height: post.image.height,
					alt: post.image.altText || post.title,
				}
			: undefined,
		article: {
			publishedTime: post.publishedAt,
			modifiedTime: post.updatedAt || post.publishedAt,
			authors: post.authorV2?.displayName ? [post.authorV2.displayName] : ["Expert Team"],
			tags: post.tags || [],
			section: post.blog?.title || "Blog",
		},
	});
}

/**
 * Generate search page metadata
 */
export function generateEnhancedSearchMetadata(query?: string, resultCount?: number): Metadata {
	const storeConfig = getStoreConfigSafe();

	const title = query
		? `"${query}" - ${resultCount || ""} Search Results | Find Products`
		: "Search All Products | Find What You Need";

	const description = query
		? `Found ${resultCount || "multiple"} results for "${query}". Shop with confidence - free shipping, expert support, 30-day returns.`
		: `Search our entire catalog of premium products. Fast shipping, expert support, and satisfaction guaranteed at ${storeConfig.storeName}.`;

	return generateMetadata({
		title,
		description,
		keywords: [query || "search", "find products", "shop", "browse", storeConfig.storeName],
		url: query ? `/search?q=${encodeURIComponent(query)}` : "/search",
		noindex: !query, // Don't index empty search pages
	});
}

/**
 * Generate account page metadata
 */
export function generateAccountMetadata(pageType: "dashboard" | "orders" | "settings" | "wishlist"): Metadata {
	const storeConfig = getStoreConfigSafe();

	const titles = {
		dashboard: "My Account Dashboard",
		orders: "Order History & Tracking",
		settings: "Account Settings",
		wishlist: "My Wishlist",
	};

	const descriptions = {
		dashboard: "Manage your account, track orders, and view your purchase history.",
		orders: "View your order history, track shipments, and download invoices.",
		settings: "Update your profile, manage addresses, and configure preferences.",
		wishlist: "View and manage your saved products and wishlisted items.",
	};

	return generateMetadata({
		title: `${titles[pageType]} | ${storeConfig.storeName}`,
		description: descriptions[pageType],
		url: `/account/${pageType === "dashboard" ? "" : pageType}`,
		noindex: true, // Account pages should not be indexed
		nofollow: true,
	});
}

/**
 * Clean and validate text for SEO
 */
export function cleanSEOText(text: string, maxLength = 160): string {
	if (!text) {
		return "";
	}

	// Remove HTML tags
	let cleaned = text.replace(/<[^>]*>/g, "");

	// Remove special characters that might break meta tags
	cleaned = cleaned.replace(/[<>"]/g, "").replace(/\s+/g, " ").trim();

	// Truncate to max length
	if (cleaned.length > maxLength) {
		cleaned = `${cleaned.substring(0, maxLength - 3)}...`;
	}

	return cleaned;
}

/**
 * Generate breadcrumb items for structured data
 */
export function generateBreadcrumbItems(path: string, productTitle?: string) {
	const segments = path.split("/").filter(Boolean);
	const breadcrumbs = [{ name: "Home", url: "/" }];

	let currentPath = "";
	segments.forEach((segment, index) => {
		currentPath += `/${segment}`;

		// Format segment name
		let name = segment.charAt(0).toUpperCase() + segment.slice(1);
		name = name.replace(/-/g, " ");

		// Use product title for product pages
		if (segment === "products" && productTitle && index === segments.length - 1) {
			name = productTitle;
		}

		breadcrumbs.push({
			name,
			url: currentPath,
		});
	});

	return breadcrumbs;
}

/**
 * Generate FAQ items from product or content
 */
export function generateFAQItems(content: any) {
	const faqs = [];

	// Add common product FAQs
	if (content.shipping) {
		faqs.push({
			question: "What are the shipping options?",
			answer: content.shipping,
		});
	}

	if (content.returns) {
		faqs.push({
			question: "What is the return policy?",
			answer: content.returns,
		});
	}

	if (content.warranty) {
		faqs.push({
			question: "Is there a warranty?",
			answer: content.warranty,
		});
	}

	// Add any custom FAQs
	if (content.faqs && Array.isArray(content.faqs)) {
		faqs.push(...content.faqs);
	}

	return faqs;
}
