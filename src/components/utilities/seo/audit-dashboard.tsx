"use client";

import { AlertTriangle, CheckCircle, Download, Eye, FileText, Hash, Search, TrendingUp, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { globalSEOAudit, type PageAuditResult, type SEOAuditReport } from "@/lib/seo/page-audit-system";

export function SEOAuditDashboard() {
	const [report, setReport] = useState<SEOAuditReport | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Generate audit report
		const generateReport = () => {
			try {
				const auditReport = globalSEOAudit.generateReport();
				setReport(auditReport);
			} catch (_error) {
			} finally {
				setLoading(false);
			}
		};

		generateReport();
	}, []);

	const downloadReport = (format: "json" | "csv") => {
		const data = globalSEOAudit.exportResults(format);
		const blob = new Blob([data], {
			type: format === "json" ? "application/json" : "text/csv",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `seo-audit-report.${format}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	if (loading) {
		return (
			<div className="space-y-6 p-6">
				<div className="animate-pulse">
					<div className="mb-4 h-8 w-1/4 rounded bg-gray-200" />
					<div className="grid gap-4 md:grid-cols-4">
						{[...new Array(4)].map((_, i) => (
							<div className="h-32 rounded bg-gray-200" key={i} />
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!report) {
		return (
			<div className="p-6 text-center">
				<AlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
				<h3 className="mb-2 font-semibold text-lg">No Audit Data Available</h3>
				<p className="text-gray-600">Run an audit first to see SEO performance data.</p>
			</div>
		);
	}

	const getScoreColor = (score: number) => {
		if (score >= 90) {
			return "text-green-600";
		}
		if (score >= 70) {
			return "text-yellow-600";
		}
		if (score >= 50) {
			return "text-orange-600";
		}
		return "text-red-600";
	};

	const _getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
		if (score >= 90) {
			return "default";
		}
		if (score >= 70) {
			return "secondary";
		}
		if (score >= 50) {
			return "outline";
		}
		return "destructive";
	};

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">SEO Audit Dashboard</h1>
					<p className="mt-1 text-gray-600">Comprehensive SEO analysis for {report.totalPages} pages</p>
				</div>
				<div className="flex gap-2">
					<Button className="flex items-center gap-2" onClick={() => downloadReport("csv")} variant="outline">
						<Download className="h-4 w-4" />
						CSV
					</Button>
					<Button className="flex items-center gap-2" onClick={() => downloadReport("json")} variant="outline">
						<Download className="h-4 w-4" />
						JSON
					</Button>
				</div>
			</div>

			{/* Overview Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Overall Score</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className={`font-bold text-2xl ${getScoreColor(report.averageScore)}`}>{report.averageScore}%</div>
						<Progress className="mt-2" value={report.averageScore} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Excellent Pages</CardTitle>
						<CheckCircle className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-green-600">{report.summary.excellentPages}</div>
						<p className="text-muted-foreground text-xs">90%+ score</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Need Improvement</CardTitle>
						<AlertTriangle className="h-4 w-4 text-yellow-500" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-yellow-600">{report.summary.needsImprovementPages}</div>
						<p className="text-muted-foreground text-xs">50-69% score</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Critical Issues</CardTitle>
						<XCircle className="h-4 w-4 text-red-500" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-red-600">{report.summary.poorPages}</div>
						<p className="text-muted-foreground text-xs">&lt;50% score</p>
					</CardContent>
				</Card>
			</div>

			{/* Critical Issues */}
			{report.criticalIssues.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-red-500" />
							Critical Issues
						</CardTitle>
						<CardDescription>Issues that need immediate attention</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2">
							{report.criticalIssues.map((issue, index) => (
								<li className="flex items-center gap-2" key={index}>
									<XCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
									<span>{issue}</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			)}

			{/* Recommendations */}
			{report.recommendations.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-blue-500" />
							Recommendations
						</CardTitle>
						<CardDescription>Suggested improvements for better SEO performance</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2">
							{report.recommendations.map((recommendation, index) => (
								<li className="flex items-center gap-2" key={index}>
									<CheckCircle className="h-4 w-4 flex-shrink-0 text-blue-500" />
									<span>{recommendation}</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			)}

			{/* Page Details */}
			<Card>
				<CardHeader>
					<CardTitle>Page Analysis</CardTitle>
					<CardDescription>Detailed SEO analysis for each page</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{report.pageResults.map((page, index) => (
							<PageAuditCard key={index} page={page} />
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function PageAuditCard({ page }: { page: PageAuditResult }) {
	const [expanded, setExpanded] = useState(false);

	const getScoreColor = (score: number) => {
		if (score >= 90) {
			return "bg-green-100 text-green-800 border-green-200";
		}
		if (score >= 70) {
			return "bg-yellow-100 text-yellow-800 border-yellow-200";
		}
		if (score >= 50) {
			return "bg-orange-100 text-orange-800 border-orange-200";
		}
		return "bg-red-100 text-red-800 border-red-200";
	};

	return (
		<div className="space-y-3 rounded-lg border p-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Badge className={getScoreColor(page.score)} variant="outline">
						{page.score}%
					</Badge>
					<div>
						<p className="font-medium">{page.path}</p>
						<p className="text-gray-600 text-sm">{page.pageType}</p>
					</div>
				</div>
				<Button onClick={() => setExpanded(!expanded)} size="sm" variant="ghost">
					{expanded ? "Less" : "More"} Details
				</Button>
			</div>

			{/* Quick indicators */}
			<div className="flex flex-wrap gap-2">
				<CriteriaIcon icon={FileText} label="Title" met={page.criteria.hasTitle} />
				<CriteriaIcon icon={Search} label="Description" met={page.criteria.hasDescription} />
				<CriteriaIcon icon={Hash} label="Structured Data" met={page.criteria.hasStructuredData} />
				<CriteriaIcon icon={Eye} label="Analytics" met={page.criteria.hasAnalytics} />
			</div>

			{/* Expanded details */}
			{expanded && (
				<div className="space-y-3 border-t pt-3">
					{page.issues.length > 0 && (
						<div>
							<h4 className="mb-2 font-medium text-red-600">Issues</h4>
							<ul className="space-y-1">
								{page.issues.map((issue, index) => (
									<li className="flex items-center gap-2 text-sm" key={index}>
										<XCircle className="h-3 w-3 text-red-500" />
										{issue}
									</li>
								))}
							</ul>
						</div>
					)}

					{page.recommendations.length > 0 && (
						<div>
							<h4 className="mb-2 font-medium text-blue-600">Recommendations</h4>
							<ul className="space-y-1">
								{page.recommendations.map((rec, index) => (
									<li className="flex items-center gap-2 text-sm" key={index}>
										<TrendingUp className="h-3 w-3 text-blue-500" />
										{rec}
									</li>
								))}
							</ul>
						</div>
					)}

					<div className="text-gray-500 text-xs">Last audited: {new Date(page.lastAudited).toLocaleString()}</div>
				</div>
			)}
		</div>
	);
}

function CriteriaIcon({ icon: Icon, label, met }: { icon: any; label: string; met: boolean }) {
	return (
		<div
			className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
				met ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
			}`}
		>
			<Icon className="h-3 w-3" />
			<span>{label}</span>
			{met ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
		</div>
	);
}
