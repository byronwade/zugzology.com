export const trackProductView = (productId: string) => {
	const viewsData = JSON.parse(localStorage.getItem("productViews") || "{}");

	viewsData[productId] = {
		views: (viewsData[productId]?.views || 0) + 1,
		lastViewed: new Date().toISOString(),
	};

	localStorage.setItem("productViews", JSON.stringify(viewsData));
};

export const calculateTrendingScore = (product: any): number => {
	if (!product) return 0;

	const now = new Date();
	const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

	// Factors that contribute to trending score:
	let score = 0;

	// 1. Recent views (from localStorage)
	const viewsData = JSON.parse(localStorage.getItem("productViews") || "{}");
	const recentViews = viewsData[product.id]?.views || 0;
	const lastViewedAt = viewsData[product.id]?.lastViewed ? new Date(viewsData[product.id].lastViewed) : null;

	// More recent views have higher weight
	if (lastViewedAt && lastViewedAt > twoWeeksAgo) {
		score += recentViews * 2;
	} else {
		score += recentViews;
	}

	// 2. Product is new (based on publishedAt if available)
	const publishedAt = product.publishedAt ? new Date(product.publishedAt) : null;
	if (publishedAt && publishedAt > twoWeeksAgo) {
		score += 5;
	}

	// 3. Has "trending" or "popular" tag
	const productTags = Array.isArray(product.tags) ? product.tags : [];
	if (productTags.includes("trending") || productTags.includes("popular")) {
		score += 3;
	}

	// 4. Is in stock and available
	if (product.availableForSale) {
		score += 2;
	}

	// 5. Has high inventory (if available)
	const totalInventory =
		product.variants?.edges?.reduce((sum: number, { node }: any) => {
			return sum + (node?.quantityAvailable || 0);
		}, 0) || 0;

	if (totalInventory > 0) {
		score += Math.min(3, Math.log(totalInventory));
	}

	// 6. Recent purchases from metafields
	const recentPurchasesMetafield = product.metafields?.edges?.find(({ node }: any) => node.key === "recent_purchases")?.node?.value;

	if (recentPurchasesMetafield) {
		const purchases = parseInt(recentPurchasesMetafield, 10);
		if (!isNaN(purchases)) {
			score += purchases;
		}
	}

	return score;
};
