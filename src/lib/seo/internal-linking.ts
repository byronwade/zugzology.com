import type { ShopifyBlogArticle, ShopifyCollection, ShopifyProduct } from "@/lib/types";

type LinkSuggestion = {
	url: string;
	text: string;
	relevance: number;
	type: "product" | "collection" | "blog" | "page";
	context?: string;
};

type ContentEntity = {
	id: string;
	title: string;
	description?: string;
	url: string;
	type: "product" | "collection" | "blog" | "page";
	keywords: string[];
	tags?: string[];
};

/**
 * Calculate text similarity using Jaccard index
 */
function calculateSimilarity(text1: string, text2: string): number {
	const words1 = new Set(text1.toLowerCase().split(/\s+/));
	const words2 = new Set(text2.toLowerCase().split(/\s+/));

	const intersection = new Set([...words1].filter((x) => words2.has(x)));
	const union = new Set([...words1, ...words2]);

	return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
	// Remove common stop words
	const stopWords = new Set([
		"the",
		"a",
		"an",
		"and",
		"or",
		"but",
		"in",
		"on",
		"at",
		"to",
		"for",
		"of",
		"with",
		"by",
		"from",
		"as",
		"is",
		"was",
		"are",
		"were",
		"be",
		"been",
		"being",
		"have",
		"has",
		"had",
		"do",
		"does",
		"did",
		"will",
		"would",
		"could",
		"should",
		"may",
		"might",
		"must",
		"can",
		"shall",
		"it",
		"this",
		"that",
		"these",
		"those",
		"i",
		"you",
		"we",
		"they",
	]);

	const words = text
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.split(/\s+/)
		.filter((word) => word.length > 2 && !stopWords.has(word));

	// Count word frequency
	const frequency = new Map<string, number>();
	words.forEach((word) => {
		frequency.set(word, (frequency.get(word) || 0) + 1);
	});

	// Return top keywords
	return Array.from(frequency.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)
		.map(([word]) => word);
}

/**
 * Generate internal link suggestions for content
 */
export function generateInternalLinks(
	currentContent: string,
	currentUrl: string,
	entities: ContentEntity[],
	maxLinks = 5
): LinkSuggestion[] {
	const currentKeywords = extractKeywords(currentContent);
	const suggestions: LinkSuggestion[] = [];

	// Filter out current page
	const otherEntities = entities.filter((e) => e.url !== currentUrl);

	// Calculate relevance scores
	otherEntities.forEach((entity) => {
		// Calculate keyword overlap
		const entityKeywords = entity.keywords;
		const keywordOverlap = currentKeywords.filter((k) =>
			entityKeywords.some((ek) => ek.includes(k) || k.includes(ek))
		).length;

		// Calculate text similarity
		const textSimilarity = calculateSimilarity(currentContent, `${entity.title} ${entity.description || ""}`);

		// Calculate tag overlap if available
		const tagOverlap = entity.tags
			? entity.tags.filter((tag) => currentContent.toLowerCase().includes(tag.toLowerCase())).length
			: 0;

		// Combined relevance score
		const relevance = keywordOverlap * 0.4 + textSimilarity * 0.4 + tagOverlap * 0.2;

		if (relevance > 0.1) {
			suggestions.push({
				url: entity.url,
				text: entity.title,
				relevance,
				type: entity.type,
				context: findBestContext(currentContent, entity.title),
			});
		}
	});

	// Sort by relevance and return top suggestions
	return suggestions.sort((a, b) => b.relevance - a.relevance).slice(0, maxLinks);
}

/**
 * Find best context for link placement
 */
function findBestContext(content: string, linkText: string): string | undefined {
	const sentences = content.split(/[.!?]+/);
	const keywords = linkText.toLowerCase().split(/\s+/);

	// Find sentence with most keyword matches
	let bestSentence = "";
	let bestScore = 0;

	sentences.forEach((sentence) => {
		const sentenceLower = sentence.toLowerCase();
		const score = keywords.filter((k) => sentenceLower.includes(k)).length;

		if (score > bestScore) {
			bestScore = score;
			bestSentence = sentence.trim();
		}
	});

	return bestScore > 0 ? bestSentence : undefined;
}

/**
 * Convert Shopify products to content entities
 */
export function productsToEntities(products: ShopifyProduct[]): ContentEntity[] {
	return products.map((product) => ({
		id: product.id,
		title: product.title,
		description: product.description,
		url: `/products/${product.handle}`,
		type: "product",
		keywords: extractKeywords(`${product.title} ${product.description || ""} ${product.productType || ""}`),
		tags: product.tags,
	}));
}

/**
 * Convert Shopify collections to content entities
 */
export function collectionsToEntities(collections: ShopifyCollection[]): ContentEntity[] {
	return collections.map((collection) => ({
		id: collection.id,
		title: collection.title,
		description: collection.description,
		url: `/collections/${collection.handle}`,
		type: "collection",
		keywords: extractKeywords(`${collection.title} ${collection.description || ""}`),
	}));
}

/**
 * Convert blog articles to content entities
 */
export function articlesToEntities(articles: ShopifyBlogArticle[]): ContentEntity[] {
	return articles.map((article) => ({
		id: article.id,
		title: article.title,
		description: article.excerpt || article.summary,
		url: `/blogs/${article.blog?.handle || "blog"}/${article.handle}`,
		type: "blog",
		keywords: extractKeywords(`${article.title} ${article.excerpt || ""} ${article.content || ""}`),
		tags: article.tags,
	}));
}

/**
 * Generate breadcrumb links for navigation
 */
export function generateBreadcrumbs(
	path: string,
	productTitle?: string,
	collectionTitle?: string
): Array<{ name: string; url: string }> {
	const segments = path.split("/").filter(Boolean);
	const breadcrumbs: Array<{ name: string; url: string }> = [{ name: "Home", url: "/" }];

	let currentPath = "";
	segments.forEach((segment, index) => {
		currentPath += `/${segment}`;

		// Handle special cases
		if (segment === "products" && productTitle && index === segments.length - 1) {
			breadcrumbs.push({
				name: "Products",
				url: "/products",
			});
			breadcrumbs.push({
				name: productTitle,
				url: currentPath,
			});
		} else if (segment === "collections" && collectionTitle && index === segments.length - 1) {
			breadcrumbs.push({
				name: "Collections",
				url: "/collections",
			});
			breadcrumbs.push({
				name: collectionTitle,
				url: currentPath,
			});
		} else if (segment === "blogs" && index < segments.length - 1) {
			breadcrumbs.push({
				name: "Blog",
				url: "/blogs",
			});
		} else {
			// Format segment name
			const name = segment
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

			breadcrumbs.push({
				name,
				url: currentPath,
			});
		}
	});

	return breadcrumbs;
}

/**
 * Generate contextual CTAs based on content
 */
export function generateContextualCTAs(
	content: string,
	products: ShopifyProduct[]
): Array<{ product: ShopifyProduct; reason: string }> {
	const ctaSuggestions: Array<{ product: ShopifyProduct; reason: string }> = [];

	// Keywords that suggest user intent
	const intentKeywords = {
		beginner: ["beginner", "start", "new to", "first time", "easy"],
		advanced: ["advanced", "professional", "expert", "commercial"],
		oyster: ["oyster", "pleurotus"],
		shiitake: ["shiitake", "lentinula"],
		lions: ["lions mane", "lion's mane", "hericium"],
		substrate: ["substrate", "medium", "growing material"],
		kit: ["kit", "all-in-one", "complete", "bundle"],
	};

	const contentLower = content.toLowerCase();

	products.forEach((product) => {
		const productLower = product.title.toLowerCase();
		const descLower = (product.description || "").toLowerCase();

		// Check for intent matches
		Object.entries(intentKeywords).forEach(([intent, keywords]) => {
			const contentMatch = keywords.some((k) => contentLower.includes(k));
			const productMatch = keywords.some((k) => productLower.includes(k) || descLower.includes(k));

			if (contentMatch && productMatch) {
				ctaSuggestions.push({
					product,
					reason: `Perfect for ${intent} growers`,
				});
			}
		});
	});

	// Return unique suggestions
	const seen = new Set<string>();
	return ctaSuggestions
		.filter((s) => {
			if (seen.has(s.product.id)) {
				return false;
			}
			seen.add(s.product.id);
			return true;
		})
		.slice(0, 3);
}

/**
 * Generate category hub links for SEO
 * Creates a link structure between related categories
 */
export function generateCategoryHubLinks(
	currentCollection: string,
	allCollections: ShopifyCollection[]
): Array<{ collection: ShopifyCollection; relationship: string }> {
	const hubLinks: Array<{ collection: ShopifyCollection; relationship: string }> = [];

	// Define relationships between collection types
	const relationships = {
		substrate: ["kit", "spawn", "supplies"],
		kit: ["substrate", "equipment", "supplies"],
		equipment: ["kit", "supplies"],
		spawn: ["substrate", "kit"],
		supplies: ["kit", "equipment", "substrate"],
	};

	// Find related collections
	const currentType = Object.keys(relationships).find((type) => currentCollection.includes(type));

	if (currentType && relationships[currentType as keyof typeof relationships]) {
		const relatedTypes = relationships[currentType as keyof typeof relationships];

		allCollections.forEach((collection) => {
			relatedTypes.forEach((type) => {
				if (collection.handle.includes(type) && collection.handle !== currentCollection) {
					hubLinks.push({
						collection,
						relationship: `Also explore our ${collection.title}`,
					});
				}
			});
		});
	}

	return hubLinks.slice(0, 4);
}

/**
 * Generate footer links with SEO value
 */
export function generateFooterLinks(): Array<{
	section: string;
	links: Array<{ text: string; url: string; priority: number }>;
}> {
	return [
		{
			section: "Popular Collections",
			links: [
				{ text: "Growing Kits", url: "/collections/growing-kits", priority: 1 },
				{ text: "Substrates", url: "/collections/substrates", priority: 1 },
				{ text: "Equipment", url: "/collections/equipment", priority: 2 },
				{ text: "Bulk Orders", url: "/collections/bulk", priority: 3 },
			],
		},
		{
			section: "Learning Resources",
			links: [
				{ text: "Growing Guides", url: "/guides", priority: 1 },
				{ text: "Video Tutorials", url: "/videos", priority: 2 },
				{ text: "Blog Articles", url: "/blogs", priority: 1 },
				{ text: "FAQ", url: "/faq", priority: 2 },
			],
		},
	];
}
