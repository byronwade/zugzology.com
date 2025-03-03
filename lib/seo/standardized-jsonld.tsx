import { WithContext } from "schema-dts";
import {
	Organization,
	Product,
	LocalBusiness,
	FAQPage,
	Store,
	WebSite,
	BreadcrumbList,
	Blog,
	BlogPosting,
	WebPage,
	CollectionPage,
	ProductGroup,
	Person,
} from "schema-dts";
import { ShopifyProduct } from "@/lib/types";

// Base Organization data
export const getOrganizationSchema = (siteSettings?: any): WithContext<Organization> => {
	const storeName = siteSettings?.name || "Zugzology";
	const storeUrl = siteSettings?.url || "https://zugzology.com";
	const logo = siteSettings?.logo || "https://zugzology.com/logo.png";
	const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";

	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: storeName,
		url: storeUrl,
		logo: {
			"@type": "ImageObject",
			url: logo,
			width: 180,
			height: 60,
		},
		sameAs: [
			"https://facebook.com/zugzology",
			"https://twitter.com/zugzology",
			"https://instagram.com/zugzology",
			"https://pinterest.com/zugzology",
		],
		description:
			"Premium mushroom cultivation supplies and equipment provider. Quality growing kits, substrates, and expert guidance.",
		contactPoint: [
			{
				"@type": "ContactPoint",
				telephone: phone,
				contactType: "customer service",
				availableLanguage: "English",
				email: "support@zugzology.com",
			},
			{
				"@type": "ContactPoint",
				telephone: phone,
				contactType: "sales",
				availableLanguage: "English",
				email: "sales@zugzology.com",
			},
		],
	};
};

// Store schema (more specific than Organization)
export const getStoreSchema = (siteSettings?: any): WithContext<Store & LocalBusiness> => {
	const storeName = siteSettings?.name || "Zugzology";
	const storeUrl = siteSettings?.url || "https://zugzology.com";
	const logo = siteSettings?.logo || "https://zugzology.com/logo.png";
	const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";

	return {
		"@context": "https://schema.org",
		"@type": ["Store", "LocalBusiness"],
		name: storeName,
		url: storeUrl,
		logo: {
			"@type": "ImageObject",
			url: logo,
			width: 180,
			height: 60,
		},
		image: logo,
		description:
			"Premium mushroom cultivation supplies and equipment provider. Quality growing kits, substrates, and expert guidance.",
		telephone: phone,
		email: "support@zugzology.com",
		priceRange: "$$",
		paymentAccepted: "Credit Card, PayPal, Shop Pay",
		openingHours: "Mo-Fr 09:00-17:00",
		currenciesAccepted: "USD",
		hasMap: "https://maps.google.com/?q=Zugzology",
		sameAs: ["https://facebook.com/zugzology", "https://twitter.com/zugzology", "https://instagram.com/zugzology"],
		address: {
			"@type": "PostalAddress",
			addressCountry: "US",
		},
		// Important for local SEO even for online stores
		areaServed: {
			"@type": "GeoCircle",
			geoMidpoint: {
				"@type": "GeoCoordinates",
				latitude: 37.7749,
				longitude: -122.4194,
			},
			geoRadius: "2000",
		},
	};
};

// Website schema
export const getWebsiteSchema = (siteSettings?: any): WithContext<WebSite> => {
	const storeName = siteSettings?.name || "Zugzology";
	const storeUrl = siteSettings?.url || "https://zugzology.com";
	const description = siteSettings?.description || "Premium mushroom growing supplies and cultivation equipment shop.";

	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: storeName,
		url: storeUrl,
		description: description,
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${storeUrl}/search?q={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};
};

// Product schema for individual product pages
export const getProductSchema = (product: ShopifyProduct): WithContext<Product> => {
	if (!product) return null as any;

	// Check for variants via different possible paths in the API response
	const variants = product.variants?.nodes || product.variants?.edges?.map((edge) => edge.node) || [];

	// Same for images
	const images = product.images?.nodes || product.images?.edges?.map((edge) => edge.node) || [];

	// Get price range safely
	const minPrice = product.priceRange?.minVariantPrice?.amount || "0";
	const maxPrice = product.priceRange?.maxVariantPrice?.amount || minPrice;
	const currencyCode = product.priceRange?.minVariantPrice?.currencyCode || "USD";

	// Get review data from metafields if available
	const reviewCount =
		product.metafields?.find((m) => m?.key === "review_count")?.value || product.reviewsCount?.toString() || "0";

	const ratingValue =
		product.metafields?.find((m) => m?.key === "rating")?.value || product.rating?.toString() || "5.0";

	// Handle possible SKU locations
	const sku = variants[0]?.sku || variants[0]?.id || product.id;

	const schema: WithContext<Product> = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.title,
		description: product.description || `${product.title} - Available at Zugzology`,
		image: images.map((img) => img.url),
		sku: sku,
		mpn: product.id,
		brand: {
			"@type": "Brand",
			name: product.vendor || "Zugzology",
		},
		offers: {
			"@type": "AggregateOffer",
			priceCurrency: currencyCode,
			lowPrice: minPrice,
			highPrice: maxPrice,
			offerCount: variants.length || 1,
			offers: variants.map((variant) => ({
				"@type": "Offer",
				price: variant.price?.amount || minPrice,
				priceCurrency: variant.price?.currencyCode || currencyCode,
				availability: variant.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
				url: `https://zugzology.com/products/${product.handle}?variant=${variant.id}`,
				itemCondition: "https://schema.org/NewCondition",
				priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 90 days from now
			})),
		},
		url: `https://zugzology.com/products/${product.handle}`,
		productID: product.id,
		category: product.productType,
	};

	// Only add review data if we have valid values
	if (parseInt(reviewCount) > 0 && parseFloat(ratingValue) > 0) {
		schema.aggregateRating = {
			"@type": "AggregateRating",
			ratingValue: parseFloat(ratingValue).toFixed(1),
			reviewCount: parseInt(reviewCount),
			bestRating: "5",
			worstRating: "1",
		};
	}

	return schema;
};

// Breadcrumb schema
export const getBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>): WithContext<BreadcrumbList> => {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: breadcrumbs.map((crumb, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: crumb.name,
			item: crumb.url,
		})),
	};
};

// FAQ schema
export const getFAQSchema = (questions: Array<{ question: string; answer: string }>): WithContext<FAQPage> => {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: questions.map((q) => ({
			"@type": "Question",
			name: q.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: q.answer,
			},
		})),
	};
};

// Collection schema
export const getCollectionSchema = (
	collection: any,
	products: ShopifyProduct[] = []
): WithContext<CollectionPage | ProductGroup> => {
	const collectionUrl = `https://zugzology.com/collections/${collection.handle}`;

	return {
		"@context": "https://schema.org",
		"@type": products.length > 0 ? "ProductGroup" : "CollectionPage",
		name: collection.title,
		description: collection.description || `Shop our premium ${collection.title.toLowerCase()} collection.`,
		url: collectionUrl,
		...(collection.image && {
			image: {
				"@type": "ImageObject",
				url: collection.image.url,
				width: collection.image.width || 800,
				height: collection.image.height || 800,
				alt: collection.image.altText || collection.title,
			},
		}),
		...(products.length > 0 && {
			variesBy: {
				"@type": "PropertyValue",
				name: "category",
				value: collection.title,
			},
			hasVariant: products.slice(0, 10).map((product) => ({
				"@type": "Product",
				name: product.title,
				description: product.description?.substring(0, 150) || "",
				url: `https://zugzology.com/products/${product.handle}`,
				image: product.images?.nodes?.[0]?.url || "",
				sku: product.variants?.nodes?.[0]?.sku || product.variants?.nodes?.[0]?.id || "",
			})),
		}),
	};
};

// Blog schema
export const getBlogSchema = (blog: any, articles: any[] = []): WithContext<Blog> => {
	const blogUrl = `https://zugzology.com/blogs/${blog.handle}`;

	return {
		"@context": "https://schema.org",
		"@type": "Blog",
		name: `${blog.title} - Zugzology Blog`,
		description: `Explore our ${blog.title} articles. Find expert insights, tips, and guides about mushroom cultivation and mycology.`,
		url: blogUrl,
		publisher: {
			"@type": "Organization",
			name: "Zugzology",
			logo: {
				"@type": "ImageObject",
				url: "https://zugzology.com/logo.png",
			},
		},
		...(articles.length > 0 && {
			blogPost: articles.map((article) => ({
				"@type": "BlogPosting",
				headline: article.title,
				description: article.excerpt || `${article.title} - Read more on the Zugzology blog`,
				datePublished: article.publishedAt,
				dateModified: article.updatedAt || article.publishedAt,
				author: {
					"@type": "Person",
					name: article.author?.name || "Zugzology Team",
				},
				url: `${blogUrl}/${article.handle}`,
				...(article.image && {
					image: {
						"@type": "ImageObject",
						url: article.image.url,
						height: article.image.height?.toString() || "600",
						width: article.image.width?.toString() || "800",
					},
				}),
			})),
		}),
	};
};

// Blog article schema
export const getBlogPostSchema = (blog: any, article: any): WithContext<BlogPosting> => {
	const articleUrl = `https://zugzology.com/blogs/${blog.handle}/${article.handle}`;
	const publishDate = new Date(article.publishedAt);
	const modifyDate = article.updatedAt ? new Date(article.updatedAt) : publishDate;

	// Calculate word count and reading time
	const wordCount = article.content ? article.content.split(/\s+/).length : 0;
	const wordsPerMinute = 200;
	const readingTime = Math.ceil(wordCount / wordsPerMinute);

	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: article.title,
		description: article.excerpt || `${article.title} - Read more on the Zugzology blog`,
		image: article.image ? [article.image.url] : [],
		datePublished: publishDate.toISOString(),
		dateModified: modifyDate.toISOString(),
		author: {
			"@type": "Person",
			name: article.author?.name || "Zugzology Team",
		},
		publisher: {
			"@type": "Organization",
			name: "Zugzology",
			logo: {
				"@type": "ImageObject",
				url: "https://zugzology.com/logo.png",
			},
		},
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": articleUrl,
		},
		wordCount: wordCount,
		timeRequired: `PT${readingTime}M`,
		articleSection: blog.title,
		...(article.tags && {
			keywords: article.tags.join(", "),
		}),
	};
};

// Helper function to standardize SEO metadata
export function getEnhancedProductMetadata(product: ShopifyProduct) {
	const title = product.title || "Product";
	const descriptionLength = 155; // Optimal for SERP snippets
	const truncatedDescription = product.description
		? product.description.substring(0, descriptionLength) +
		  (product.description.length > descriptionLength ? "..." : "")
		: `${title} - Premium mushroom cultivation supplies from Zugzology`;

	// Keywords that encourage purchasing
	const defaultTags = ["mushroom cultivation", "mushroom growing", "growing supplies"];
	const productTags = Array.isArray(product.tags)
		? product.tags
		: product.tags?.split(",").map((tag) => tag.trim()) || [];
	const keywords = [...defaultTags, ...productTags].join(", ");

	// Add incentives in the description
	const enhancedDescription = `${truncatedDescription} Free shipping on orders over $75. Premium quality guaranteed.`;

	return {
		title: `${title} | Premium Mushroom Supplies | Zugzology`,
		description: enhancedDescription,
		keywords,
		openGraph: {
			title: `${title} - Top Quality Mushroom Supplies | Zugzology`,
			description: enhancedDescription,
			type: "website",
			availability: product.availableForSale ? "instock" : "outofstock",
			price: {
				amount: product.priceRange?.minVariantPrice?.amount || "0",
				currency: product.priceRange?.minVariantPrice?.currencyCode || "USD",
			},
			images: product.images?.nodes?.[0]?.url
				? [
						{
							url: product.images.nodes[0].url,
							width: product.images.nodes[0].width || 1200,
							height: product.images.nodes[0].height || 630,
							alt: product.images.nodes[0].altText || product.title,
						},
				  ]
				: [],
		},
		twitter: {
			card: "summary_large_image",
			title: `${title} | Premium Mushroom Cultivation Supplies`,
			description: truncatedDescription,
			images: product.images?.nodes?.[0]?.url ? [product.images.nodes[0].url] : [],
		},
	};
}
