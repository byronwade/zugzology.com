"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Download,
  Search,
  Eye,
  FileText,
  Hash
} from 'lucide-react';
import { SEOAuditReport, PageAuditResult, globalSEOAudit } from '@/lib/seo/page-audit-system';

export function SEOAuditDashboard() {
  const [report, setReport] = useState<SEOAuditReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate audit report
    const generateReport = () => {
      try {
        const auditReport = globalSEOAudit.generateReport();
        setReport(auditReport);
      } catch (error) {
        console.error('Failed to generate audit report:', error);
      } finally {
        setLoading(false);
      }
    };

    generateReport();
  }, []);

  const downloadReport = (format: 'json' | 'csv') => {
    const data = globalSEOAudit.exportResults(format);
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-audit-report.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Audit Data Available</h3>
        <p className="text-gray-600">Run an audit first to see SEO performance data.</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    if (score >= 50) return 'outline';
    return 'destructive';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SEO Audit Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive SEO analysis for {report.totalPages} pages
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => downloadReport('csv')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => downloadReport('json')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            JSON
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(report.averageScore)}`}>
              {report.averageScore}%
            </div>
            <Progress value={report.averageScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excellent Pages</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {report.summary.excellentPages}
            </div>
            <p className="text-xs text-muted-foreground">
              90%+ score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Improvement</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {report.summary.needsImprovementPages}
            </div>
            <p className="text-xs text-muted-foreground">
              50-69% score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {report.summary.poorPages}
            </div>
            <p className="text-xs text-muted-foreground">
              &lt;50% score
            </p>
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
            <CardDescription>
              Issues that need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.criticalIssues.map((issue, index) => (
                <li key={index} className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
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
            <CardDescription>
              Suggested improvements for better SEO performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
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
          <CardDescription>
            Detailed SEO analysis for each page
          </CardDescription>
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
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (score >= 50) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className={getScoreColor(page.score)}
          >
            {page.score}%
          </Badge>
          <div>
            <p className="font-medium">{page.path}</p>
            <p className="text-sm text-gray-600">{page.pageType}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Less' : 'More'} Details
        </Button>
      </div>

      {/* Quick indicators */}
      <div className="flex gap-2 flex-wrap">
        <CriteriaIcon 
          icon={FileText} 
          label="Title" 
          met={page.criteria.hasTitle} 
        />
        <CriteriaIcon 
          icon={Search} 
          label="Description" 
          met={page.criteria.hasDescription} 
        />
        <CriteriaIcon 
          icon={Hash} 
          label="Structured Data" 
          met={page.criteria.hasStructuredData} 
        />
        <CriteriaIcon 
          icon={Eye} 
          label="Analytics" 
          met={page.criteria.hasAnalytics} 
        />
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="space-y-3 pt-3 border-t">
          {page.issues.length > 0 && (
            <div>
              <h4 className="font-medium text-red-600 mb-2">Issues</h4>
              <ul className="space-y-1">
                {page.issues.map((issue, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <XCircle className="h-3 w-3 text-red-500" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {page.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-600 mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {page.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Last audited: {new Date(page.lastAudited).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

function CriteriaIcon({ 
  icon: Icon, 
  label, 
  met 
}: { 
  icon: any; 
  label: string; 
  met: boolean; 
}) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
      met 
        ? 'bg-green-100 text-green-700' 
        : 'bg-red-100 text-red-700'
    }`}>
      <Icon className="h-3 w-3" />
      <span>{label}</span>
      {met ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
    </div>
  );
}