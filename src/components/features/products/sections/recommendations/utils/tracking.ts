// Debounce helper
const debounce = <T extends (...args: any[]) => void>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
};

// Batch updates
let viewsBatch: { [key: string]: { views: number; lastViewed: string } } = {};
let isBatchScheduled = false;

const flushBatch = () => {
	if (Object.keys(viewsBatch).length === 0) {
		return;
	}

	const existingData = JSON.parse(localStorage.getItem("productViews") || "{}");
	const updatedData = { ...existingData };

	// Update with batched views
	Object.entries(viewsBatch).forEach(([productId, data]) => {
		updatedData[productId] = {
			views: (existingData[productId]?.views || 0) + data.views,
			lastViewed: data.lastViewed,
		};
	});

	localStorage.setItem("productViews", JSON.stringify(updatedData));
	viewsBatch = {};
	isBatchScheduled = false;
};

// Debounced flush function
const debouncedFlush = debounce(flushBatch, 1000);

export const trackProductView = (productId: string) => {
	// Add to batch
	if (!viewsBatch[productId]) {
		viewsBatch[productId] = {
			views: 0,
			lastViewed: new Date().toISOString(),
		};
	}
	viewsBatch[productId].views++;
	viewsBatch[productId].lastViewed = new Date().toISOString();

	// Schedule batch update if not already scheduled
	if (!isBatchScheduled) {
		isBatchScheduled = true;
		debouncedFlush();
	}
};

// Cleanup function to ensure data is saved before page unload
if (typeof window !== "undefined") {
	window.addEventListener("beforeunload", flushBatch);
}

export const calculateTrendingScore = (product: any): number => {
	if (!product) {
		return 0;
	}

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
		product.variants?.edges?.reduce((sum: number, { node }: any) => sum + (node?.quantityAvailable || 0), 0) || 0;

	if (totalInventory > 0) {
		score += Math.min(3, Math.log(totalInventory));
	}

	// 6. Recent purchases from metafields
	const recentPurchasesMetafield = product.metafields?.edges?.find(({ node }: any) => node.key === "recent_purchases")
		?.node?.value;

	if (recentPurchasesMetafield) {
		const purchases = Number.parseInt(recentPurchasesMetafield, 10);
		if (!Number.isNaN(purchases)) {
			score += purchases;
		}
	}

	return score;
};
