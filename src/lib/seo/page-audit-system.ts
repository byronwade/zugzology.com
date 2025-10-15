/**
 * Comprehensive SEO Page Audit System
 *
 * This system tracks SEO completeness across all pages and provides
 * audit reports for optimization tracking and compliance verification.
 */

export type SEOAuditCriteria = {
	hasMetadata: boolean;
	hasTitle: boolean;
	hasDescription: boolean;
	hasKeywords: boolean;
	hasCanonicalUrl: boolean;
	hasOpenGraph: boolean;
	hasTwitterCard: boolean;
	hasStructuredData: boolean;
	hasBreadcrumbs: boolean;
	hasAnalytics: boolean;
	isIndexable: boolean;
	hasProperNoindex: boolean;
};

export type PageAuditResult = {
	path: string;
	pageType: string;
	criteria: SEOAuditCriteria;
	score: number;
	issues: string[];
	recommendations: string[];
	lastAudited: string;
};

export type SEOAuditReport = {
	totalPages: number;
	auditedPages: number;
	averageScore: number;
	pageResults: PageAuditResult[];
	summary: {
		excellentPages: number; // 90-100%
		goodPages: number; // 70-89%
		needsImprovementPages: number; // 50-69%
		poorPages: number; // <50%
	};
	criticalIssues: string[];
	recommendations: string[];
};

export class SEOAuditSystem {
	private readonly auditResults: Map<string, PageAuditResult> = new Map();

	/**
	 * Audit a single page for SEO completeness
	 */
	auditPage(path: string, pageType: string, document?: Document, metadata?: any): PageAuditResult {
		const criteria = this.evaluatePage(document, metadata);
		const score = this.calculateScore(criteria);
		const issues = this.identifyIssues(criteria, pageType);
		const recommendations = this.generateRecommendations(criteria, pageType);

		const result: PageAuditResult = {
			path,
			pageType,
			criteria,
			score,
			issues,
			recommendations,
			lastAudited: new Date().toISOString(),
		};

		this.auditResults.set(path, result);
		return result;
	}

	/**
	 * Evaluate SEO criteria for a page
	 */
	private evaluatePage(document?: Document, metadata?: any): SEOAuditCriteria {
		if (typeof document === "undefined") {
			// Server-side evaluation based on metadata
			return this.evaluateServerSide(metadata);
		}

		// Client-side evaluation
		return this.evaluateClientSide(document);
	}

	/**
	 * Server-side SEO evaluation
	 */
	private evaluateServerSide(metadata?: any): SEOAuditCriteria {
		return {
			hasMetadata: !!metadata,
			hasTitle: !!metadata?.title,
			hasDescription: !!metadata?.description,
			hasKeywords: !!metadata?.keywords,
			hasCanonicalUrl: !!metadata?.alternates?.canonical,
			hasOpenGraph: !!metadata?.openGraph,
			hasTwitterCard: !!metadata?.twitter,
			hasStructuredData: false, // Cannot easily check server-side
			hasBreadcrumbs: false, // Cannot easily check server-side
			hasAnalytics: false, // Cannot easily check server-side
			isIndexable: !(metadata?.robots?.noindex || metadata?.noindex),
			hasProperNoindex: this.shouldBeNoindexed(metadata) ? !!metadata?.noindex : true,
		};
	}

	/**
	 * Client-side SEO evaluation
	 */
	private evaluateClientSide(document: Document): SEOAuditCriteria {
		return {
			hasMetadata: this.hasMetaTags(document),
			hasTitle: !!document.title,
			hasDescription: this.hasMetaDescription(document),
			hasKeywords: this.hasMetaKeywords(document),
			hasCanonicalUrl: this.hasCanonicalUrl(document),
			hasOpenGraph: this.hasOpenGraph(document),
			hasTwitterCard: this.hasTwitterCard(document),
			hasStructuredData: this.hasStructuredData(document),
			hasBreadcrumbs: this.hasBreadcrumbs(document),
			hasAnalytics: this.hasAnalytics(document),
			isIndexable: this.isIndexable(document),
			hasProperNoindex: this.hasProperNoindex(document),
		};
	}

	/**
	 * Calculate SEO score based on criteria
	 */
	private calculateScore(criteria: SEOAuditCriteria): number {
		const weights = {
			hasMetadata: 10,
			hasTitle: 15,
			hasDescription: 15,
			hasKeywords: 10,
			hasCanonicalUrl: 10,
			hasOpenGraph: 10,
			hasTwitterCard: 5,
			hasStructuredData: 15,
			hasBreadcrumbs: 5,
			hasAnalytics: 5,
			isIndexable: 5,
			hasProperNoindex: 5,
		};

		let score = 0;
		let totalWeight = 0;

		Object.entries(criteria).forEach(([key, value]) => {
			const weight = weights[key as keyof typeof weights] || 0;
			totalWeight += weight;
			if (value) {
				score += weight;
			}
		});

		return totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;
	}

	/**
	 * Identify SEO issues
	 */
	private identifyIssues(criteria: SEOAuditCriteria, pageType: string): string[] {
		const issues: string[] = [];

		if (!criteria.hasTitle) {
			issues.push("Missing page title");
		}
		if (!criteria.hasDescription) {
			issues.push("Missing meta description");
		}
		if (!criteria.hasCanonicalUrl) {
			issues.push("Missing canonical URL");
		}
		if (!criteria.hasOpenGraph) {
			issues.push("Missing Open Graph tags");
		}
		if (!criteria.hasStructuredData) {
			issues.push("Missing structured data (JSON-LD)");
		}
		if (!criteria.hasBreadcrumbs && this.shouldHaveBreadcrumbs(pageType)) {
			issues.push("Missing breadcrumb navigation");
		}
		if (!criteria.hasAnalytics) {
			issues.push("Missing analytics tracking");
		}
		if (!criteria.hasProperNoindex) {
			issues.push("Incorrect noindex configuration");
		}

		return issues;
	}

	/**
	 * Generate SEO recommendations
	 */
	private generateRecommendations(criteria: SEOAuditCriteria, pageType: string): string[] {
		const recommendations: string[] = [];

		if (!criteria.hasKeywords) {
			recommendations.push("Add relevant keywords to improve search visibility");
		}
		if (!criteria.hasTwitterCard) {
			recommendations.push("Add Twitter Card metadata for better social sharing");
		}
		if (criteria.hasTitle && criteria.hasDescription) {
			recommendations.push("Consider optimizing title and description length");
		}
		if (!criteria.hasStructuredData) {
			recommendations.push(`Add ${this.getRecommendedSchema(pageType)} schema markup`);
		}

		return recommendations;
	}

	/**
	 * Client-side helper methods
	 */
	private hasMetaTags(document: Document): boolean {
		return document.querySelectorAll("meta").length > 0;
	}

	private hasMetaDescription(document: Document): boolean {
		const meta = document.querySelector('meta[name="description"]');
		return !!meta?.getAttribute("content");
	}

	private hasMetaKeywords(document: Document): boolean {
		const meta = document.querySelector('meta[name="keywords"]');
		return !!meta?.getAttribute("content");
	}

	private hasCanonicalUrl(document: Document): boolean {
		return !!document.querySelector('link[rel="canonical"]');
	}

	private hasOpenGraph(document: Document): boolean {
		return document.querySelectorAll('meta[property^="og:"]').length > 0;
	}

	private hasTwitterCard(document: Document): boolean {
		return document.querySelectorAll('meta[name^="twitter:"]').length > 0;
	}

	private hasStructuredData(document: Document): boolean {
		return document.querySelectorAll('script[type="application/ld+json"]').length > 0;
	}

	private hasBreadcrumbs(document: Document): boolean {
		return (
			!!document.querySelector('[itemtype*="BreadcrumbList"]') ||
			!!document.querySelector('nav[aria-label*="breadcrumb" i]') ||
			!!document.querySelector(".breadcrumb")
		);
	}

	private hasAnalytics(document: Document): boolean {
		return (
			!!document.querySelector('script[src*="gtag"]') ||
			!!document.querySelector('script[src*="analytics"]') ||
			!!(window as any).gtag ||
			!!(window as any).ga
		);
	}

	private isIndexable(document: Document): boolean {
		const robotsMeta = document.querySelector('meta[name="robots"]');
		const content = robotsMeta?.getAttribute("content") || "";
		return !content.includes("noindex");
	}

	private hasProperNoindex(document: Document): boolean {
		const path = window.location.pathname;
		return this.shouldBeNoindexed({ url: path }) ? !this.isIndexable(document) : this.isIndexable(document);
	}

	/**
	 * Utility methods
	 */
	private shouldBeNoindexed(metadata?: any): boolean {
		const path = metadata?.url || "";
		const noindexPaths = ["/cart", "/wishlist", "/account", "/login", "/register", "/loading", "/error"];

		return (
			noindexPaths.some((noindexPath) => path.includes(noindexPath)) ||
			(path.includes("?page=") && !path.includes("?page=1"))
		);
	}

	private shouldHaveBreadcrumbs(pageType: string): boolean {
		const breadcrumbPages = ["product", "collection", "blog-post", "blog-category", "search", "help"];
		return breadcrumbPages.includes(pageType);
	}

	private getRecommendedSchema(pageType: string): string {
		const schemaMap: Record<string, string> = {
			product: "Product",
			collection: "CollectionPage",
			"blog-post": "BlogPosting",
			"blog-category": "Blog",
			search: "SearchResultsPage",
			help: "FAQPage",
			home: "WebSite",
			about: "AboutPage",
		};
		return schemaMap[pageType] || "WebPage";
	}

	/**
	 * Generate comprehensive audit report
	 */
	generateReport(): SEOAuditReport {
		const results = Array.from(this.auditResults.values());
		const totalPages = results.length;
		const averageScore = results.reduce((sum, result) => sum + result.score, 0) / totalPages;

		const summary = {
			excellentPages: results.filter((r) => r.score >= 90).length,
			goodPages: results.filter((r) => r.score >= 70 && r.score < 90).length,
			needsImprovementPages: results.filter((r) => r.score >= 50 && r.score < 70).length,
			poorPages: results.filter((r) => r.score < 50).length,
		};

		const criticalIssues = this.identifyCriticalIssues(results);
		const recommendations = this.generateGlobalRecommendations(results);

		return {
			totalPages,
			auditedPages: totalPages,
			averageScore: Math.round(averageScore),
			pageResults: results.sort((a, b) => a.score - b.score),
			summary,
			criticalIssues,
			recommendations,
		};
	}

	private identifyCriticalIssues(results: PageAuditResult[]): string[] {
		const criticalIssues: string[] = [];

		const missingTitles = results.filter((r) => !r.criteria.hasTitle).length;
		if (missingTitles > 0) {
			criticalIssues.push(`${missingTitles} pages missing titles`);
		}

		const missingDescriptions = results.filter((r) => !r.criteria.hasDescription).length;
		if (missingDescriptions > 0) {
			criticalIssues.push(`${missingDescriptions} pages missing descriptions`);
		}

		const missingStructuredData = results.filter((r) => !r.criteria.hasStructuredData).length;
		if (missingStructuredData > 0) {
			criticalIssues.push(`${missingStructuredData} pages missing structured data`);
		}

		return criticalIssues;
	}

	private generateGlobalRecommendations(results: PageAuditResult[]): string[] {
		const recommendations: string[] = [];

		const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
		if (avgScore < 80) {
			recommendations.push("Overall SEO score needs improvement - focus on missing metadata");
		}

		const poorPages = results.filter((r) => r.score < 50);
		if (poorPages.length > 0) {
			recommendations.push(`Priority: Fix ${poorPages.length} pages with critical SEO issues`);
		}

		return recommendations;
	}

	/**
	 * Export audit results
	 */
	exportResults(format: "json" | "csv" = "json"): string {
		const report = this.generateReport();

		if (format === "csv") {
			return this.exportToCSV(report);
		}

		return JSON.stringify(report, null, 2);
	}

	private exportToCSV(report: SEOAuditReport): string {
		const headers = [
			"Path",
			"Page Type",
			"Score",
			"Has Title",
			"Has Description",
			"Has Structured Data",
			"Has Breadcrumbs",
			"Issues",
			"Recommendations",
		];

		const rows = report.pageResults.map((result) => [
			result.path,
			result.pageType,
			result.score.toString(),
			result.criteria.hasTitle ? "Yes" : "No",
			result.criteria.hasDescription ? "Yes" : "No",
			result.criteria.hasStructuredData ? "Yes" : "No",
			result.criteria.hasBreadcrumbs ? "Yes" : "No",
			result.issues.join("; "),
			result.recommendations.join("; "),
		]);

		return [headers, ...rows].map((row) => row.join(",")).join("\n");
	}
}

// Global audit system instance
export const globalSEOAudit = new SEOAuditSystem();

/**
 * Client-side audit hook for React components
 */
export function usePageAudit(path: string, pageType: string) {
	if (typeof window !== "undefined") {
		// Run audit after component mounts
		setTimeout(() => {
			globalSEOAudit.auditPage(path, pageType, document);
		}, 1000);
	}
}

/**
 * Development-only audit reporting
 */
export function logAuditReport() {
	if (process.env.NODE_ENV === "development") {
		const report = globalSEOAudit.generateReport();

		if (report.criticalIssues.length > 0) {
		}

		if (report.recommendations.length > 0) {
		}
	}
}
