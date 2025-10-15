"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SEOHealthData = {
	score: number;
	status: "healthy" | "needs-improvement" | "critical";
	timestamp: string;
	checks: Array<{
		check: string;
		status: "pass" | "warning" | "fail";
		message: string;
		details?: any;
	}>;
	recommendations: string[];
};

type WebVitalsData = {
	metrics: {
		[key: string]: {
			count: number;
			sum: number;
			good: number;
			needsImprovement: number;
			poor: number;
			average: number;
			median: number;
			p75: number;
			p95: number;
		};
	};
};

export function SEODashboard() {
	const [healthData, setHealthData] = useState<SEOHealthData | null>(null);
	const [vitalsData, setVitalsData] = useState<WebVitalsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");

	useEffect(() => {
		fetchSEOData();
	}, [fetchSEOData]);

	const fetchSEOData = async () => {
		setLoading(true);
		try {
			const [health, vitals] = await Promise.all([
				fetch("/api/seo/monitor").then((r) => r.json()),
				fetch("/api/analytics/vitals").then((r) => r.json()),
			]);

			setHealthData(health);
			setVitalsData(vitals);
		} catch (_error) {
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="h-12 w-12 animate-spin rounded-full border-primary border-b-2" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">SEO Dashboard</h1>
					<p className="text-muted-foreground">Monitor your site&apos;s SEO health and performance</p>
				</div>
				<Button onClick={fetchSEOData}>Refresh Data</Button>
			</div>

			{/* Score Overview */}
			{healthData && (
				<Card>
					<CardHeader>
						<CardTitle>SEO Health Score</CardTitle>
						<CardDescription>Overall SEO performance</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-6">
							<div className="relative h-32 w-32">
								<svg className="-rotate-90 h-32 w-32 transform">
									<circle
										className="text-muted"
										cx="64"
										cy="64"
										fill="none"
										r="56"
										stroke="currentColor"
										strokeWidth="12"
									/>
									<circle
										className={
											healthData.score >= 80
												? "text-green-500"
												: healthData.score >= 60
													? "text-yellow-500"
													: "text-red-500"
										}
										cx="64"
										cy="64"
										fill="none"
										r="56"
										stroke="currentColor"
										strokeDasharray={`${(healthData.score / 100) * 351.86} 351.86`}
										strokeWidth="12"
									/>
								</svg>
								<div className="absolute inset-0 flex items-center justify-center">
									<span className="font-bold text-3xl">{healthData.score}</span>
								</div>
							</div>

							<div className="flex-1 space-y-2">
								<Badge
									variant={
										healthData.status === "healthy"
											? "default"
											: healthData.status === "needs-improvement"
												? "secondary"
												: "destructive"
									}
								>
									{healthData.status}
								</Badge>
								<p className="text-muted-foreground text-sm">
									Last checked: {new Date(healthData.timestamp).toLocaleString()}
								</p>
								{healthData.recommendations.length > 0 && (
									<div className="mt-4">
										<h4 className="mb-2 font-semibold">Top Recommendations:</h4>
										<ul className="list-inside list-disc space-y-1 text-sm">
											{healthData.recommendations.slice(0, 3).map((rec, i) => (
												<li key={i}>{rec}</li>
											))}
										</ul>
									</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Tabs */}
			<Tabs onValueChange={setActiveTab} value={activeTab}>
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="vitals">Web Vitals</TabsTrigger>
					<TabsTrigger value="schemas">Schemas</TabsTrigger>
					<TabsTrigger value="feeds">Feeds</TabsTrigger>
				</TabsList>

				<TabsContent className="space-y-4" value="overview">
					{healthData?.checks.map((check, i) => (
						<Card key={i}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg">{check.check}</CardTitle>
									<Badge
										variant={
											check.status === "pass" ? "default" : check.status === "warning" ? "secondary" : "destructive"
										}
									>
										{check.status}
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-sm">{check.message}</p>
								{check.details && (
									<pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs">
										{JSON.stringify(check.details, null, 2)}
									</pre>
								)}
							</CardContent>
						</Card>
					))}
				</TabsContent>

				<TabsContent className="space-y-4" value="vitals">
					{vitalsData &&
						Object.entries(vitalsData.metrics).map(([metric, data]) => (
							<Card key={metric}>
								<CardHeader>
									<CardTitle className="text-lg">{metric}</CardTitle>
									<CardDescription>{data.count} measurements collected</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
										<div>
											<p className="font-semibold text-sm">Average</p>
											<p className="text-2xl">{data.average.toFixed(0)}ms</p>
										</div>
										<div>
											<p className="font-semibold text-sm">Median</p>
											<p className="text-2xl">{data.median.toFixed(0)}ms</p>
										</div>
										<div>
											<p className="font-semibold text-sm">P75</p>
											<p className="text-2xl">{data.p75.toFixed(0)}ms</p>
										</div>
										<div>
											<p className="font-semibold text-sm">P95</p>
											<p className="text-2xl">{data.p95.toFixed(0)}ms</p>
										</div>
									</div>

									<div className="mt-4 space-y-2">
										<div className="flex justify-between text-sm">
											<span>Good</span>
											<span>
												{data.good} ({((data.good / data.count) * 100).toFixed(0)}%)
											</span>
										</div>
										<Progress className="h-2" value={(data.good / data.count) * 100} />

										<div className="flex justify-between text-sm">
											<span>Needs Improvement</span>
											<span>
												{data.needsImprovement} ({((data.needsImprovement / data.count) * 100).toFixed(0)}%)
											</span>
										</div>
										<Progress className="h-2" value={(data.needsImprovement / data.count) * 100} />

										<div className="flex justify-between text-sm">
											<span>Poor</span>
											<span>
												{data.poor} ({((data.poor / data.count) * 100).toFixed(0)}%)
											</span>
										</div>
										<Progress className="h-2" value={(data.poor / data.count) * 100} />
									</div>
								</CardContent>
							</Card>
						))}
				</TabsContent>

				<TabsContent className="space-y-4" value="schemas">
					<Card>
						<CardHeader>
							<CardTitle>Structured Data Implementation</CardTitle>
							<CardDescription>JSON-LD schemas currently active on your site</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
								{[
									"Organization",
									"Store",
									"LocalBusiness",
									"Product",
									"AggregateOffer",
									"Review",
									"BreadcrumbList",
									"FAQPage",
									"WebSite",
									"SearchAction",
									"BlogPosting",
									"ItemList",
									"VideoObject",
									"Event",
									"HowTo",
									"SpecialAnnouncement",
									"Speakable",
									"OfferCatalog",
								].map((schema) => (
									<div className="flex items-center gap-2" key={schema}>
										<div className="h-2 w-2 rounded-full bg-green-500" />
										<span className="text-sm">{schema}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Schema Validation</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<Button
									className="w-full"
									onClick={() => window.open("https://validator.schema.org/", "_blank")}
									variant="outline"
								>
									Test with Schema.org Validator
								</Button>
								<Button
									className="w-full"
									onClick={() => window.open("https://search.google.com/test/rich-results", "_blank")}
									variant="outline"
								>
									Test with Google Rich Results
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent className="space-y-4" value="feeds">
					<Card>
						<CardHeader>
							<CardTitle>Product Feed Status</CardTitle>
							<CardDescription>Shopping feed integrations for various platforms</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{[
									{
										name: "Google Merchant Center",
										url: "/api/feeds/google-merchant",
										status: "active",
										products: "All products",
									},
									{
										name: "Facebook Catalog",
										url: "/api/feeds/facebook",
										status: "active",
										products: "All products",
									},
									{
										name: "Pinterest",
										url: "/api/feeds/pinterest",
										status: "pending",
										products: "Not configured",
									},
									{
										name: "Bing Shopping",
										url: "/api/feeds/bing",
										status: "pending",
										products: "Not configured",
									},
								].map((feed) => (
									<div className="flex items-center justify-between rounded border p-4" key={feed.name}>
										<div>
											<h4 className="font-semibold">{feed.name}</h4>
											<p className="text-muted-foreground text-sm">{feed.products}</p>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant={feed.status === "active" ? "default" : "secondary"}>{feed.status}</Badge>
											{feed.status === "active" && (
												<Button onClick={() => window.open(feed.url, "_blank")} size="sm" variant="outline">
													View Feed
												</Button>
											)}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
