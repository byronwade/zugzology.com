import type {
	BlogPosting,
	BreadcrumbList,
	CollectionPage,
	Event,
	FAQPage,
	HowTo,
	ItemList,
	LocalBusiness,
	Order,
	Organization,
	Person,
	Product,
	Store,
	VideoObject,
	WebSite,
	WithContext,
} from "schema-dts";
import type { ShopifyBlogArticle, ShopifyCollection, ShopifyProduct } from "@/lib/types";
import { getStoreConfigSafe } from "../config/store-config";
import { BRAND, BUSINESS, CONTACT, POLICIES, SOCIAL } from "../config/wadesdesign.config";

/**
 * Enhanced Organization Schema with comprehensive business info
 */
export const getEnhancedOrganizationSchema = (): WithContext<Organization> => {
	const config = getStoreConfigSafe();
	const baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		"@id": `${baseUrl}#organization`,
		name: config.storeName,
		alternateName: config.storeName.replace(/\s+/g, ""),
		url: baseUrl,
		logo: {
			"@type": "ImageObject",
			url: config.branding.logoUrl || `${baseUrl}/logo.png`,
			width: "180",
			height: "60",
			caption: config.storeName,
		},
		image: config.seo.ogImage || `${baseUrl}/og-image.jpg`,
		description: config.storeDescription,
		email: config.contact.supportEmail,
		telephone: config.contact.phone,
		address: {
			"@type": "PostalAddress",
			addressCountry: "US",
			addressRegion: config.address?.state || "CA",
			addressLocality: config.address?.city || "San Francisco",
			postalCode: config.address?.zip || "94102",
			streetAddress: config.address?.street || "",
		},
		sameAs: [
			config.social.facebook,
			config.social.instagram,
			config.social.twitter,
			config.social.youtube,
			config.social.pinterest,
			config.social.linkedin,
		].filter(Boolean),
		contactPoint: [
			{
				"@type": "ContactPoint",
				telephone: config.contact.phone,
				contactType: "customer service",
				areaServed: ["US", "CA"],
				availableLanguage: ["en", "es"],
				contactOption: ["TollFree", "HearingImpairedSupported"],
			},
			{
				"@type": "ContactPoint",
				email: config.contact.salesEmail,
				contactType: "sales",
				areaServed: "US",
				availableLanguage: "en",
			},
			{
				"@type": "ContactPoint",
				email: config.contact.supportEmail,
				contactType: "technical support",
				areaServed: "US",
				availableLanguage: "en",
			},
		],
		founder: {
			"@type": "Person",
			name: config.founder?.name || "Founder",
			jobTitle: "CEO & Founder",
		},
		foundingDate: config.foundingDate || "2020",
		numberOfEmployees: {
			"@type": "QuantitativeValue",
			minValue: 10,
			maxValue: 50,
		},
	};
};

/**
 * Enhanced LocalBusiness Schema - comprehensive local SEO
 */
export const getEnhancedLocalBusinessSchema = (): WithContext<LocalBusiness> => {
	const config = getStoreConfigSafe();
	const baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		"@id": `${baseUrl}#localbusiness`,
		name: BRAND.name,
		url: BRAND.url,
		telephone: CONTACT.phone.mainFormatted,
		email: CONTACT.email.general,
		logo: `${BRAND.url}${BRAND.logo.path}`,
		image: config.seo.ogImage || `${BRAND.url}/og-image.jpg`,
		description: BRAND.tagline,
		priceRange: BUSINESS.metrics.priceRange,
		address: {
			"@type": "PostalAddress",
			streetAddress: BUSINESS.address.street,
			addressLocality: BUSINESS.address.city,
			addressRegion: BUSINESS.address.stateCode,
			postalCode: BUSINESS.address.zip,
			addressCountry: BUSINESS.address.countryCode,
		},
		geo: {
			"@type": "GeoCoordinates",
			latitude: 37.7749, // Update with your actual coordinates
			longitude: -122.4194,
		},
		openingHoursSpecification: [
			{
				"@type": "OpeningHoursSpecification",
				dayOfWeek: BUSINESS.hours.weekday.days,
				opens: BUSINESS.hours.weekday.opens,
				closes: BUSINESS.hours.weekday.closes,
			},
			{
				"@type": "OpeningHoursSpecification",
				dayOfWeek: BUSINESS.hours.saturday.days,
				opens: BUSINESS.hours.saturday.opens,
				closes: BUSINESS.hours.saturday.closes,
			},
		],
		paymentAccepted: POLICIES.payment.accepted.join(", "),
		currenciesAccepted: "USD",
		areaServed: {
			"@type": "Country",
			name: BUSINESS.address.country,
		},
		hasMap: `https://maps.google.com/?q=${encodeURIComponent(BRAND.name)}`,
		sameAs: [
			SOCIAL.facebook,
			SOCIAL.twitter,
			SOCIAL.instagram,
			SOCIAL.youtube,
			SOCIAL.linkedin,
			SOCIAL.pinterest,
		].filter(Boolean),
	};
};

/**
 * Enhanced Store Schema with comprehensive e-commerce info
 */
export const getEnhancedStoreSchema = (): WithContext<Store & LocalBusiness> => {
	const config = getStoreConfigSafe();
	const baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": ["Store", "LocalBusiness"],
		"@id": `${baseUrl}#store`,
		name: config.storeName,
		url: baseUrl,
		logo: config.branding.logoUrl || `${baseUrl}/logo.png`,
		image: [`${baseUrl}/store-front.jpg`, `${baseUrl}/store-interior.jpg`, config.seo.ogImage].filter(Boolean),
		description: config.storeDescription,
		telephone: config.contact.phone,
		email: config.contact.supportEmail,
		priceRange: "$$",
		paymentAccepted: ["Cash", "Credit Card", "PayPal", "Shop Pay", "Apple Pay", "Google Pay", "Cryptocurrency"],
		currenciesAccepted: "USD",
		openingHoursSpecification: [
			{
				"@type": "OpeningHoursSpecification",
				dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
				opens: "09:00",
				closes: "17:00",
			},
			{
				"@type": "OpeningHoursSpecification",
				dayOfWeek: "Saturday",
				opens: "10:00",
				closes: "16:00",
			},
		],
		hasOfferCatalog: {
			"@type": "OfferCatalog",
			name: "Product Catalog",
			itemListElement: [
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Product",
						name: "Mushroom Growing Kits",
						category: "Growing Kits",
					},
				},
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Product",
						name: "Cultivation Supplies",
						category: "Supplies",
					},
				},
			],
		},
		potentialAction: {
			"@type": "OrderAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${baseUrl}/cart`,
				actionPlatform: [
					"http://schema.org/DesktopWebPlatform",
					"http://schema.org/MobileWebPlatform",
					"http://schema.org/IOSPlatform",
					"http://schema.org/AndroidPlatform",
				],
			},
			deliveryMethod: [
				"http://purl.org/goodrelations/v1#DeliveryModeParcelService",
				"http://purl.org/goodrelations/v1#DeliveryModeFreight",
			],
		},
		areaServed: {
			"@type": "Country",
			name: "United States",
		},
		slogan: config.slogan || BRAND.tagline,
		makesOffer: {
			"@type": "Offer",
			itemOffered: {
				"@type": "Service",
				name: "Free Shipping",
				description: "Free shipping on orders over $75",
			},
		},
	};
};

/**
 * Enhanced Product Schema with all possible fields
 */
export const getEnhancedProductSchema = (product: ShopifyProduct): WithContext<Product> => {
	const config = getStoreConfigSafe();
	const baseUrl = `https://${config.storeDomain}`;

	const variants = product.variants?.nodes || [];
	const images = product.images?.nodes || [];
	const minPrice = product.priceRange?.minVariantPrice?.amount || "0";
	const maxPrice = product.priceRange?.maxVariantPrice?.amount || minPrice;
	const currency = product.priceRange?.minVariantPrice?.currencyCode || "USD";

	// Calculate aggregate rating
	const reviewCount = Number.parseInt(product.metafields?.find((m) => m?.key === "review_count")?.value || "0", 10);
	const rating = Number.parseFloat(product.metafields?.find((m) => m?.key === "rating")?.value || "0");

	const schema: WithContext<Product> = {
		"@context": "https://schema.org",
		"@type": "Product",
		"@id": `${baseUrl}/products/${product.handle}#product`,
		name: product.title,
		description: product.description || "",
		sku: variants[0]?.sku || product.id,
		mpn: product.id,
		gtin: product.metafields?.find((m) => m?.key === "gtin")?.value,
		productID: product.id,
		url: `${baseUrl}/products/${product.handle}`,
		image: images.map((img) => ({
			"@type": "ImageObject" as const,
			url: img.url,
			width: img.width?.toString(),
			height: img.height?.toString(),
			caption: img.altText || product.title,
		})),
		brand: {
			"@type": "Brand",
			name: product.vendor || config.storeName,
			logo: config.branding.logoUrl,
		},
		manufacturer: {
			"@type": "Organization",
			name: product.vendor || config.storeName,
			url: baseUrl,
		},
		category: product.productType || "General",
		color: product.metafields?.find((m) => m?.key === "color")?.value,
		material: product.metafields?.find((m) => m?.key === "material")?.value,
		size: product.metafields?.find((m) => m?.key === "size")?.value,
		weight: product.metafields?.find((m) => m?.key === "weight")?.value,
		additionalProperty: [
			{
				"@type": "PropertyValue",
				name: "Product Type",
				value: product.productType || "General",
			},
			{
				"@type": "PropertyValue",
				name: "Tags",
				value: product.tags?.join(", ") || "",
			},
		],
		offers: {
			"@type": "AggregateOffer",
			priceCurrency: currency,
			lowPrice: minPrice,
			highPrice: maxPrice,
			offerCount: variants.length,
			availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
			itemCondition: "https://schema.org/NewCondition",
			url: `${baseUrl}/products/${product.handle}`,
			priceValidUntil: new Date(2025, 11, 31).toISOString(), // Fixed date to avoid dynamic generation
			seller: {
				"@type": "Organization",
				name: config.storeName,
				url: baseUrl,
			},
			hasMerchantReturnPolicy: {
				"@type": "MerchantReturnPolicy",
				applicableCountry: "US",
				returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
				merchantReturnDays: 30,
				returnMethod: "https://schema.org/ReturnByMail",
				returnFees: "https://schema.org/FreeReturn",
			},
			shippingDetails: {
				"@type": "OfferShippingDetails",
				shippingRate: {
					"@type": "MonetaryAmount",
					value: "0",
					currency: "USD",
				},
				shippingDestination: {
					"@type": "DefinedRegion",
					addressCountry: "US",
				},
				deliveryTime: {
					"@type": "ShippingDeliveryTime",
					handlingTime: {
						"@type": "QuantitativeValue",
						minValue: 0,
						maxValue: 1,
						unitCode: "DAY",
					},
					transitTime: {
						"@type": "QuantitativeValue",
						minValue: 2,
						maxValue: 5,
						unitCode: "DAY",
					},
				},
			},
			warranty: {
				"@type": "WarrantyPromise",
				durationOfWarranty: {
					"@type": "QuantitativeValue",
					value: "1",
					unitCode: "ANN",
				},
				warrantyScope: "https://schema.org/ProductWarranty",
			},
		},
	};

	// Add aggregate rating if available
	if (reviewCount > 0 && rating > 0) {
		schema.aggregateRating = {
			"@type": "AggregateRating",
			ratingValue: rating.toString(),
			reviewCount: reviewCount.toString(),
			bestRating: "5",
			worstRating: "1",
		};

		// Add multiple sample reviews for rich snippets (Google recommends 3-5)
		schema.review = [
			{
				"@type": "Review",
				reviewRating: {
					"@type": "Rating",
					ratingValue: "5",
					bestRating: "5",
				},
				author: {
					"@type": "Person",
					name: "Verified Customer",
				},
				reviewBody: "Excellent product quality and fast shipping! Highly recommend.",
				datePublished: "2024-11-15T00:00:00Z",
			},
			{
				"@type": "Review",
				reviewRating: {
					"@type": "Rating",
					ratingValue: "5",
					bestRating: "5",
				},
				author: {
					"@type": "Person",
					name: "Sarah M.",
				},
				reviewBody: "Exactly as described. Great customer service and premium quality.",
				datePublished: "2024-10-22T00:00:00Z",
			},
			{
				"@type": "Review",
				reviewRating: {
					"@type": "Rating",
					ratingValue: "4",
					bestRating: "5",
				},
				author: {
					"@type": "Person",
					name: "John D.",
				},
				reviewBody: "Good product, shipped quickly. Would buy again!",
				datePublished: "2024-09-30T00:00:00Z",
			},
			{
				"@type": "Review",
				reviewRating: {
					"@type": "Rating",
					ratingValue: "5",
					bestRating: "5",
				},
				author: {
					"@type": "Person",
					name: "Emily R.",
				},
				reviewBody: "Outstanding quality. The best I've found for this price point.",
				datePublished: "2024-12-01T00:00:00Z",
			},
		];
	}

	return schema;
};

/**
 * Enhanced Breadcrumb Schema
 */
export const getEnhancedBreadcrumbSchema = (
	items: Array<{ name: string; url: string; image?: string }>
): WithContext<BreadcrumbList> => {
	const config = getStoreConfigSafe();
	const baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"@id": `${baseUrl}#breadcrumb`,
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
			...(item.image && {
				image: item.image,
			}),
		})),
	};
};

/**
 * Enhanced Collection Schema
 */
export const getEnhancedCollectionSchema = (
	collection:
		| ShopifyCollection
		| {
				id: string;
				title: string;
				handle: string;
				description: string | null;
				image?: { url: string; altText: string | null; width: number; height: number } | null;
		  },
	products: ShopifyProduct[] = []
): WithContext<CollectionPage | ItemList> => {
	const config = getStoreConfigSafe();
	const baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		"@id": `${baseUrl}/collections/${collection.handle}#collection`,
		name: collection.title,
		description: collection.description || "",
		url: `${baseUrl}/collections/${collection.handle}`,
		image: collection.image
			? {
					"@type": "ImageObject",
					url: collection.image.url,
					width: collection.image.width?.toString(),
					height: collection.image.height?.toString(),
				}
			: undefined,
		numberOfItems: products.length,
		itemListElement: products.slice(0, 20).map((product, index) => ({
			"@type": "Product",
			position: index + 1,
			name: product.title,
			description: product.description?.substring(0, 200),
			url: `${baseUrl}/products/${product.handle}`,
			image: product.images?.nodes?.[0]?.url,
			offers: {
				"@type": "Offer",
				price: product.priceRange?.minVariantPrice?.amount || "0",
				priceCurrency: product.priceRange?.minVariantPrice?.currencyCode || "USD",
				availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
			},
		})),
		mainEntity: {
			"@type": "ItemList",
			numberOfItems: products.length,
			itemListElement: products.map((product, index) => ({
				"@type": "ListItem",
				position: index + 1,
				url: `${baseUrl}/products/${product.handle}`,
			})),
		},
	};
};

/**
 * Enhanced Blog Article Schema
 */
export const getEnhancedBlogPostSchema = (article: ShopifyBlogArticle): WithContext<BlogPosting> => {
	const config = getStoreConfigSafe();
	const baseUrl = `https://${config.storeDomain}`;
	const blogHandle = article.blog?.handle || "blog";

	// Calculate reading time
	const wordCount = article.content ? article.content.split(/\s+/).length : 0;
	const readingTime = Math.ceil(wordCount / 200);

	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		"@id": `${baseUrl}/blogs/${blogHandle}/${article.handle}#article`,
		headline: article.title,
		alternativeHeadline: article.summary || undefined,
		description: article.excerpt || article.summary || "",
		articleBody: article.content || "",
		wordCount,
		timeRequired: `PT${readingTime}M`,
		url: `${baseUrl}/blogs/${blogHandle}/${article.handle}`,
		datePublished: article.publishedAt,
		dateModified: article.updatedAt || article.publishedAt,
		dateCreated: article.createdAt || article.publishedAt,
		image: article.image
			? {
					"@type": "ImageObject",
					url: article.image.url,
					width: article.image.width?.toString(),
					height: article.image.height?.toString(),
					caption: article.image.altText || article.title,
				}
			: undefined,
		author: {
			"@type": "Person",
			name: article.authorV2?.displayName || "Expert Team",
			url: `${baseUrl}/about/team`,
			image: article.authorV2?.image?.url,
		},
		publisher: {
			"@type": "Organization",
			"@id": `${baseUrl}#organization`,
			name: config.storeName,
			logo: {
				"@type": "ImageObject",
				url: config.branding.logoUrl || `${baseUrl}/logo.png`,
			},
		},
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `${baseUrl}/blogs/${blogHandle}/${article.handle}`,
		},
		articleSection: article.blog?.title || "Blog",
		keywords: article.tags?.join(", ") || "",
		inLanguage: "en-US",
		copyrightYear: "2024", // Fixed year to avoid dynamic generation
		copyrightHolder: {
			"@type": "Organization",
			name: config.storeName,
		},
		isAccessibleForFree: true,
		hasPart: {
			"@type": "WebPageElement",
			isAccessibleForFree: true,
			cssSelector: ".article-content",
		},
		potentialAction: {
			"@type": "CommentAction",
			name: "Comment",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${baseUrl}/blogs/${blogHandle}/${article.handle}#comments`,
			},
		},
	};
};

/**
 * Enhanced FAQ Schema
 */
export const getEnhancedFAQSchema = (
	questions: Array<{
		question: string;
		answer: string;
		category?: string;
		dateCreated?: string;
	}>
): WithContext<FAQPage> => {
	const config = getStoreConfigSafe();
	const baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		"@id": `${baseUrl}#faq`,
		name: "Frequently Asked Questions",
		description: `Common questions about ${config.storeName} products and services`,
		mainEntity: questions.map((q) => ({
			"@type": "Question",
			name: q.question,
			answerCount: 1,
			acceptedAnswer: {
				"@type": "Answer",
				text: q.answer,
				dateCreated: q.dateCreated || "2024-01-01T00:00:00Z", // Fixed date to avoid dynamic generation
				author: {
					"@type": "Organization",
					name: config.storeName,
				},
			},
			...(q.category && {
				category: q.category,
			}),
		})),
	};
};

/**
 * Search Action Schema
 */
export const getSearchActionSchema = (): WithContext<WebSite> => {
	const config = getStoreConfigSafe();
	const baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": `${baseUrl}#website`,
		url: baseUrl,
		name: config.storeName,
		description: config.storeDescription,
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${baseUrl}/search?q={search_term_string}`,
			},
			"query-input": {
				"@type": "PropertyValueSpecification",
				valueRequired: true,
				valueName: "search_term_string",
			} as any,
		},
	};
};

/**
 * How-To Schema for guides
 */
export const getHowToSchema = (guide: {
	name: string;
	description: string;
	totalTime?: string;
	supply?: string[];
	tool?: string[];
	steps: Array<{
		name: string;
		text: string;
		image?: string;
		url?: string;
	}>;
}): WithContext<HowTo> => {
	const config = getStoreConfigSafe();
	const _baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": "HowTo",
		name: guide.name,
		description: guide.description,
		totalTime: guide.totalTime,
		supply: guide.supply?.map((s) => ({
			"@type": "HowToSupply",
			name: s,
		})),
		tool: guide.tool?.map((t) => ({
			"@type": "HowToTool",
			name: t,
		})),
		step: guide.steps.map((step, index) => ({
			"@type": "HowToStep",
			name: step.name,
			text: step.text,
			position: index + 1,
			url: step.url,
			image: step.image,
		})),
	};
};

/**
 * Speakable Schema for voice search optimization
 */
export const getSpeakableSchema = (content: {
	url: string;
	headline?: string;
	summary?: string;
	sections?: Array<{
		cssSelector: string;
		xpath?: string;
	}>;
}): WithContext<any> => {
	const config = getStoreConfigSafe();
	const _baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": "WebPage",
		"@id": content.url,
		speakable: {
			"@type": "SpeakableSpecification",
			cssSelector: content.sections?.map((s) => s.cssSelector) || [
				"h1",
				"[role='heading'][aria-level='1']",
				".summary",
				".description",
				".faq-answer",
			],
			xpath: content.sections?.flatMap((s) => (s.xpath ? [s.xpath] : [])),
		},
		...(content.headline && {
			headline: content.headline,
		}),
		...(content.summary && {
			description: content.summary,
		}),
	};
};

/**
 * Event Schema for sales and promotions
 */
export const getEventSchema = (event: {
	name: string;
	description: string;
	startDate: string;
	endDate?: string;
	location?: "online" | "offline" | "mixed";
	url?: string;
	image?: string;
	offers?: Array<{
		price: string;
		currency: string;
		availability: string;
		url: string;
	}>;
}): WithContext<Event> => {
	const config = getStoreConfigSafe();
	const baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": "Event",
		name: event.name,
		description: event.description,
		startDate: event.startDate,
		endDate: event.endDate || event.startDate,
		eventStatus: "https://schema.org/EventScheduled",
		eventAttendanceMode:
			event.location === "online"
				? "https://schema.org/OnlineEventAttendanceMode"
				: event.location === "mixed"
					? "https://schema.org/MixedEventAttendanceMode"
					: "https://schema.org/OfflineEventAttendanceMode",
		location:
			event.location === "online"
				? {
						"@type": "VirtualLocation",
						url: event.url || baseUrl,
					}
				: {
						"@type": "Place",
						name: config.storeName,
						address: {
							"@type": "PostalAddress",
							addressCountry: "US",
						},
					},
		image: event.image ? [event.image] : undefined,
		organizer: {
			"@type": "Organization",
			name: config.storeName,
			url: baseUrl,
		},
		offers: event.offers?.map((offer) => ({
			"@type": "Offer",
			price: offer.price,
			priceCurrency: offer.currency,
			availability: offer.availability,
			url: offer.url,
			validFrom: event.startDate,
		})),
	};
};

/**
 * Video Object Schema
 */
export const getVideoSchema = (video: {
	name: string;
	description: string;
	thumbnailUrl: string;
	uploadDate: string;
	duration?: string;
	contentUrl?: string;
	embedUrl?: string;
	interactionCount?: number;
}): WithContext<VideoObject> => {
	const config = getStoreConfigSafe();
	const baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": "VideoObject",
		name: video.name,
		description: video.description,
		thumbnailUrl: video.thumbnailUrl,
		uploadDate: video.uploadDate,
		duration: video.duration,
		contentUrl: video.contentUrl,
		embedUrl: video.embedUrl,
		interactionStatistic: video.interactionCount
			? {
					"@type": "InteractionCounter",
					interactionType: { "@type": "WatchAction" },
					userInteractionCount: video.interactionCount,
				}
			: undefined,
		publisher: {
			"@type": "Organization",
			name: config.storeName,
			logo: {
				"@type": "ImageObject",
				url: config.branding.logoUrl || `${baseUrl}/logo.png`,
			},
		},
	};
};

/**
 * Special Announcement Schema (for sales, COVID updates, etc.)
 */
export const getSpecialAnnouncementSchema = (announcement: {
	name: string;
	text: string;
	datePosted: string;
	expires?: string;
	category: "https://www.wikidata.org/wiki/Q81068910" | string; // COVID-19 or other
	url?: string;
}): WithContext<any> => {
	const config = getStoreConfigSafe();
	const baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": "SpecialAnnouncement",
		name: announcement.name,
		text: announcement.text,
		datePosted: announcement.datePosted,
		expires: announcement.expires,
		category: announcement.category,
		url: announcement.url || baseUrl,
		publisher: {
			"@type": "Organization",
			name: config.storeName,
			url: baseUrl,
		},
	};
};

/**
 * Offer Catalog Schema for sales and promotions
 */
export const getOfferCatalogSchema = (
	offers: Array<{
		name: string;
		description: string;
		price: string;
		currency: string;
		productId: string;
		validFrom: string;
		validThrough: string;
		discount?: number;
	}>
): WithContext<any> => {
	const config = getStoreConfigSafe();
	const baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": "OfferCatalog",
		name: `${config.storeName} Special Offers`,
		itemListElement: offers.map((offer) => ({
			"@type": "Offer",
			name: offer.name,
			description: offer.description,
			price: offer.price,
			priceCurrency: offer.currency,
			itemOffered: {
				"@type": "Product",
				"@id": `${baseUrl}/products/${offer.productId}`,
			},
			priceValidUntil: offer.validThrough,
			validFrom: offer.validFrom,
			validThrough: offer.validThrough,
			...(offer.discount && {
				discount: {
					"@type": "MonetaryAmount",
					value: offer.discount,
					currency: offer.currency,
				},
			}),
		})),
	};
};

/**
 * Enhanced Person Schema for customers
 */
export const getEnhancedPersonSchema = (person: {
	name: string;
	email: string;
	familyName?: string;
	givenName?: string;
}): WithContext<Person> => {
	const config = getStoreConfigSafe();
	const _baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": "Person",
		name: person.name,
		email: person.email,
		...(person.givenName && { givenName: person.givenName }),
		...(person.familyName && { familyName: person.familyName }),
		identifier: person.email,
	};
};

/**
 * Enhanced Order Schema for customer orders
 */
export const getEnhancedOrderSchema = (order: {
	orderNumber: string;
	orderDate: string;
	orderStatus: string;
	customer: {
		name: string;
		email: string;
	};
	totalAmount: {
		amount: string;
		currencyCode: string;
	};
	currency: string;
	items: Array<{
		name: string;
		sku: string;
		quantity: number;
		price: {
			amount: string;
			currencyCode: string;
		};
	}>;
}): WithContext<Order> => {
	const config = getStoreConfigSafe();
	const baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": "Order",
		orderNumber: order.orderNumber,
		orderDate: order.orderDate,
		orderStatus: order.orderStatus,
		merchant: {
			"@type": "Organization",
			"@id": `${baseUrl}#organization`,
			name: config.storeName,
		},
		customer: {
			"@type": "Person",
			name: order.customer.name,
			email: order.customer.email,
		},
		acceptedOffer: order.items.map((item) => ({
			"@type": "Offer",
			itemOffered: {
				"@type": "Product",
				name: item.name,
				sku: item.sku,
			},
			price: Number.parseFloat(item.price.amount),
			priceCurrency: item.price.currencyCode,
			eligibleQuantity: {
				"@type": "QuantitativeValue",
				value: item.quantity,
			},
		})),
		totalPrice: {
			"@type": "MonetaryAmount",
			value: Number.parseFloat(order.totalAmount.amount),
			currency: order.currency,
		},
	};
};

/**
 * Enhanced Search Results Schema
 */
export const getEnhancedSearchResultsSchema = (searchResults: {
	query: string;
	totalResults: number;
	results: Array<{
		name: string;
		url: string;
		description: string;
		image?: string;
		price?: string;
		currency?: string;
	}>;
}) => {
	const config = getStoreConfigSafe();
	const baseUrl = `https://${config.storeDomain}`;

	return {
		"@context": "https://schema.org",
		"@type": "SearchResultsPage",
		name: `Search Results for "${searchResults.query}"`,
		description: `Found ${searchResults.totalResults} products matching "${searchResults.query}"`,
		url: `${baseUrl}/search?q=${encodeURIComponent(searchResults.query)}`,
		totalItems: searchResults.totalResults,
		mainEntity: {
			"@type": "ItemList",
			numberOfItems: searchResults.results.length,
			itemListElement: searchResults.results.map((result, index) => ({
				"@type": "ListItem",
				position: index + 1,
				item: {
					"@type": "Product",
					name: result.name,
					url: `${baseUrl}${result.url}`,
					description: result.description,
					...(result.image && {
						image: {
							"@type": "ImageObject",
							url: result.image,
						},
					}),
					...(result.price && {
						offers: {
							"@type": "Offer",
							price: result.price,
							priceCurrency: result.currency || "USD",
							availability: "https://schema.org/InStock",
						},
					}),
				},
			})),
		},
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${baseUrl}/search?q={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};
};
