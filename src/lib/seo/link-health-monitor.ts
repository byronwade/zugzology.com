/**
 * Automated Broken Link Detection and Fixing System
 */

type LinkStatus = {
	url: string;
	status: "ok" | "broken" | "redirect" | "timeout";
	statusCode?: number;
	redirectUrl?: string;
	lastChecked: Date;
	pageUrl: string;
	anchorText: string;
	suggestion?: string;
};

type LinkHealthReport = {
	totalLinks: number;
	brokenLinks: LinkStatus[];
	redirects: LinkStatus[];
	healthy: number;
	lastScan: Date;
	pages: Map<string, LinkStatus[]>;
};

export class LinkHealthMonitor {
	private readonly linkCache: Map<string, LinkStatus> = new Map();
	private readonly checkInterval = 3_600_000; // 1 hour

	/**
	 * Scan all links on a page
	 */
	async scanPage(pageUrl: string, html: string): Promise<LinkStatus[]> {
		const links = this.extractLinks(html);
		const results: LinkStatus[] = [];

		for (const link of links) {
			const status = await this.checkLink(link.url, pageUrl, link.anchorText);
			results.push(status);
		}

		return results;
	}

	/**
	 * Extract all links from HTML
	 */
	private extractLinks(html: string): Array<{ url: string; anchorText: string }> {
		const links: Array<{ url: string; anchorText: string }> = [];

		// Extract <a> tags
		const anchorRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)</gi;
		let match;

		while ((match = anchorRegex.exec(html)) !== null) {
			links.push({
				url: match[1],
				anchorText: match[2].trim(),
			});
		}

		// Extract image sources
		const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
		while ((match = imgRegex.exec(html)) !== null) {
			links.push({
				url: match[1],
				anchorText: "[Image]",
			});
		}

		// Extract CSS links
		const cssRegex = /<link[^>]+href=["']([^"']+\.css[^"']*)["']/gi;
		while ((match = cssRegex.exec(html)) !== null) {
			links.push({
				url: match[1],
				anchorText: "[Stylesheet]",
			});
		}

		// Extract script sources
		const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
		while ((match = scriptRegex.exec(html)) !== null) {
			links.push({
				url: match[1],
				anchorText: "[Script]",
			});
		}

		return links;
	}

	/**
	 * Check if a link is valid
	 */
	private async checkLink(url: string, pageUrl: string, anchorText: string): Promise<LinkStatus> {
		// Check cache first
		const cached = this.linkCache.get(url);
		if (cached && Date.now() - cached.lastChecked.getTime() < this.checkInterval) {
			return { ...cached, pageUrl, anchorText };
		}

		// Skip certain URLs
		if (this.shouldSkipUrl(url)) {
			return {
				url,
				status: "ok",
				lastChecked: new Date(),
				pageUrl,
				anchorText,
			};
		}

		try {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

			const response = await fetch(url, {
				method: "HEAD",
				signal: controller.signal,
				redirect: "manual",
			});

			clearTimeout(timeout);

			let status: LinkStatus["status"] = "ok";
			let redirectUrl: string | undefined;
			let suggestion: string | undefined;

			if (response.status >= 200 && response.status < 300) {
				status = "ok";
			} else if (response.status >= 300 && response.status < 400) {
				status = "redirect";
				redirectUrl = response.headers.get("location") || undefined;
				suggestion = `Update link to: ${redirectUrl}`;
			} else if (response.status >= 400) {
				status = "broken";
				suggestion = this.generateFixSuggestion(url, response.status);
			}

			const linkStatus: LinkStatus = {
				url,
				status,
				statusCode: response.status,
				redirectUrl,
				lastChecked: new Date(),
				pageUrl,
				anchorText,
				suggestion,
			};

			// Cache the result
			this.linkCache.set(url, linkStatus);

			return linkStatus;
		} catch (error) {
			const linkStatus: LinkStatus = {
				url,
				status: error instanceof Error && error.name === "AbortError" ? "timeout" : "broken",
				lastChecked: new Date(),
				pageUrl,
				anchorText,
				suggestion: "Check if the URL is correct or the server is responding",
			};

			this.linkCache.set(url, linkStatus);
			return linkStatus;
		}
	}

	/**
	 * Determine if URL should be skipped
	 */
	private shouldSkipUrl(url: string): boolean {
		// Skip certain protocols
		if (url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("javascript:")) {
			return true;
		}

		// Skip anchor links
		if (url.startsWith("#")) {
			return true;
		}

		// Skip data URLs
		if (url.startsWith("data:")) {
			return true;
		}

		return false;
	}

	/**
	 * Generate fix suggestion based on error
	 */
	private generateFixSuggestion(_url: string, statusCode: number): string {
		switch (statusCode) {
			case 404:
				return "Page not found - check if URL has changed or remove link";
			case 403:
				return "Access forbidden - check permissions or authentication";
			case 500:
			case 502:
			case 503:
				return "Server error - temporary issue, check again later";
			case 301:
			case 302:
				return "Redirect detected - update to final destination URL";
			default:
				return `HTTP ${statusCode} error - review and update link`;
		}
	}

	/**
	 * Generate health report for all scanned pages
	 */
	generateReport(scanResults: LinkStatus[]): LinkHealthReport {
		const pages = new Map<string, LinkStatus[]>();
		const brokenLinks: LinkStatus[] = [];
		const redirects: LinkStatus[] = [];
		let healthy = 0;

		scanResults.forEach((result) => {
			// Group by page
			const pageLinks = pages.get(result.pageUrl) || [];
			pageLinks.push(result);
			pages.set(result.pageUrl, pageLinks);

			// Categorize
			if (result.status === "broken" || result.status === "timeout") {
				brokenLinks.push(result);
			} else if (result.status === "redirect") {
				redirects.push(result);
			} else {
				healthy++;
			}
		});

		return {
			totalLinks: scanResults.length,
			brokenLinks,
			redirects,
			healthy,
			lastScan: new Date(),
			pages,
		};
	}

	/**
	 * Auto-fix common link issues
	 */
	async autoFix(brokenLink: LinkStatus): Promise<string | null> {
		const { url, pageUrl } = brokenLink;

		// Try common fixes
		const fixes = [
			// Add/remove trailing slash
			url.endsWith("/") ? url.slice(0, -1) : `${url}/`,

			// Try HTTPS if HTTP
			url.replace(/^http:/, "https:"),

			// Try without www
			url.replace(/^https?:\/\/www\./, "https://"),

			// Try with www
			url.replace(/^https?:\/\//, "https://www."),

			// Fix common typos
			url
				.replace(/\.con$/, ".com")
				.replace(/\.cm$/, ".com")
				.replace(/\.og$/, ".org"),
		];

		for (const fixedUrl of fixes) {
			if (fixedUrl === url) {
				continue;
			}

			const status = await this.checkLink(fixedUrl, pageUrl, brokenLink.anchorText);
			if (status.status === "ok") {
				return fixedUrl;
			}
		}

		return null;
	}
}

/**
 * Search Intent Classifier
 */
export class SearchIntentClassifier {
	private readonly intentPatterns = {
		informational: [
			/^(what|how|why|when|where|who|which)/i,
			/\b(guide|tutorial|learn|understand|explain)\b/i,
			/\b(definition|meaning|difference|vs)\b/i,
		],
		navigational: [
			/\b(website|site|page|homepage|login|sign\s?in)\b/i,
			/\b(brand|company|store)\s+name/i,
			/^go\s+to\b/i,
		],
		transactional: [
			/\b(buy|purchase|order|shop|price|cost|cheap|discount|deal|sale)\b/i,
			/\b(free\s+shipping|coupon|promo|offer)\b/i,
			/\b(cart|checkout|payment)\b/i,
		],
		commercial: [
			/\b(best|top|review|compare|comparison|vs|versus)\b/i,
			/\b(recommended|suggestion|alternative)\b/i,
			/\b(worth|quality|reliable)\b/i,
		],
		local: [
			/\b(near\s+me|nearby|local|in\s+[a-z]+)\b/i,
			/\b(store|shop|business)\s+(hours|location|address)/i,
			/\b(directions|map|where\s+to\s+find)\b/i,
		],
	};

	/**
	 * Classify search intent
	 */
	classifyIntent(query: string): {
		primary: string;
		confidence: number;
		secondary?: string;
	} {
		const scores = {
			informational: 0,
			navigational: 0,
			transactional: 0,
			commercial: 0,
			local: 0,
		};

		// Check patterns
		Object.entries(this.intentPatterns).forEach(([intent, patterns]) => {
			patterns.forEach((pattern) => {
				if (pattern.test(query)) {
					scores[intent as keyof typeof scores] += 1;
				}
			});
		});

		// Find primary intent
		const sortedIntents = Object.entries(scores).sort((a, b) => b[1] - a[1]);
		const primary = sortedIntents[0][0];
		const primaryScore = sortedIntents[0][1];
		const secondary = sortedIntents[1][1] > 0 ? sortedIntents[1][0] : undefined;

		// Calculate confidence
		const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
		const confidence = totalScore > 0 ? primaryScore / totalScore : 0;

		return {
			primary,
			confidence: Math.round(confidence * 100),
			secondary,
		};
	}

	/**
	 * Generate content recommendations based on intent
	 */
	getContentRecommendations(intent: string): string[] {
		const recommendations: Record<string, string[]> = {
			informational: [
				"Include detailed explanations and how-to guides",
				"Add FAQ section with common questions",
				"Use clear headings and subheadings",
				"Include diagrams or infographics",
				"Provide step-by-step instructions",
			],
			navigational: [
				"Ensure brand name is prominent",
				"Include clear navigation menu",
				"Add site search functionality",
				"Use breadcrumbs for navigation",
				"Optimize for brand keywords",
			],
			transactional: [
				"Show prices clearly",
				"Add prominent call-to-action buttons",
				"Include trust signals (reviews, guarantees)",
				"Display shipping information",
				"Simplify checkout process",
			],
			commercial: [
				"Include comparison tables",
				"Show customer reviews and ratings",
				"Highlight unique selling points",
				'Add "Best of" or "Top" lists',
				"Include pros and cons sections",
			],
			local: [
				"Display store location and hours",
				"Include Google Maps integration",
				"Add local schema markup",
				"Show contact information prominently",
				'Include "near me" keywords',
			],
		};

		return recommendations[intent] || [];
	}
}

/**
 * Content Decay Monitor
 */
export class ContentDecayMonitor {
	/**
	 * Analyze content freshness
	 */
	analyzeContentFreshness(
		_content: string,
		lastModified: Date,
		pageViews: number[],
		rankings?: number[]
	): {
		decayScore: number;
		status: "fresh" | "declining" | "stale";
		recommendations: string[];
	} {
		const daysSinceUpdate = Math.floor((Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24));

		// Calculate traffic trend
		const trafficTrend = this.calculateTrend(pageViews);

		// Calculate ranking trend if available
		const rankingTrend = rankings ? this.calculateTrend(rankings) : 0;

		// Calculate decay score (0-100, higher is worse)
		let decayScore = 0;

		// Age factor (max 40 points)
		if (daysSinceUpdate > 365) {
			decayScore += 40;
		} else if (daysSinceUpdate > 180) {
			decayScore += 30;
		} else if (daysSinceUpdate > 90) {
			decayScore += 20;
		} else if (daysSinceUpdate > 30) {
			decayScore += 10;
		}

		// Traffic decline factor (max 30 points)
		if (trafficTrend < -50) {
			decayScore += 30;
		} else if (trafficTrend < -25) {
			decayScore += 20;
		} else if (trafficTrend < 0) {
			decayScore += 10;
		}

		// Ranking decline factor (max 30 points)
		if (rankingTrend > 10) {
			decayScore += 30;
		} else if (rankingTrend > 5) {
			decayScore += 20;
		} else if (rankingTrend > 0) {
			decayScore += 10;
		}

		// Determine status
		let status: "fresh" | "declining" | "stale";
		if (decayScore < 30) {
			status = "fresh";
		} else if (decayScore < 60) {
			status = "declining";
		} else {
			status = "stale";
		}

		// Generate recommendations
		const recommendations = this.generateFreshnessRecommendations(daysSinceUpdate, trafficTrend, rankingTrend);

		return {
			decayScore,
			status,
			recommendations,
		};
	}

	/**
	 * Calculate trend from data points
	 */
	private calculateTrend(data: number[]): number {
		if (data.length < 2) {
			return 0;
		}

		const firstHalf = data.slice(0, Math.floor(data.length / 2));
		const secondHalf = data.slice(Math.floor(data.length / 2));

		const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
		const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

		if (firstAvg === 0) {
			return 0;
		}

		return ((secondAvg - firstAvg) / firstAvg) * 100;
	}

	/**
	 * Generate content freshness recommendations
	 */
	private generateFreshnessRecommendations(
		daysSinceUpdate: number,
		trafficTrend: number,
		rankingTrend: number
	): string[] {
		const recommendations: string[] = [];

		if (daysSinceUpdate > 180) {
			recommendations.push("Content is outdated - update with current information");
		}

		if (trafficTrend < -25) {
			recommendations.push("Traffic is declining - refresh content with new insights");
		}

		if (rankingTrend > 5) {
			recommendations.push("Rankings dropping - optimize for current search intent");
		}

		if (daysSinceUpdate > 90) {
			recommendations.push("Add new sections or expand existing content");
			recommendations.push("Update statistics and data references");
			recommendations.push("Refresh images and media");
		}

		if (recommendations.length === 0) {
			recommendations.push("Content is fresh - maintain regular updates");
		}

		return recommendations;
	}
}
