'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface SEOHealthData {
  score: number;
  status: 'healthy' | 'needs-improvement' | 'critical';
  timestamp: string;
  checks: Array<{
    check: string;
    status: 'pass' | 'warning' | 'fail';
    message: string;
    details?: any;
  }>;
  recommendations: string[];
}

interface WebVitalsData {
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
}

export function SEODashboard() {
  const [healthData, setHealthData] = useState<SEOHealthData | null>(null);
  const [vitalsData, setVitalsData] = useState<WebVitalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchSEOData();
  }, []);
  
  const fetchSEOData = async () => {
    setLoading(true);
    try {
      const [health, vitals] = await Promise.all([
        fetch('/api/seo/monitor').then(r => r.json()),
        fetch('/api/analytics/vitals').then(r => r.json()),
      ]);
      
      setHealthData(health);
      setVitalsData(vitals);
    } catch (error) {
      console.error('Failed to fetch SEO data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SEO Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your site&apos;s SEO health and performance
          </p>
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
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(healthData.score / 100) * 351.86} 351.86`}
                    className={
                      healthData.score >= 80
                        ? 'text-green-500'
                        : healthData.score >= 60
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{healthData.score}</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <Badge
                  variant={
                    healthData.status === 'healthy'
                      ? 'default'
                      : healthData.status === 'needs-improvement'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {healthData.status}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Last checked: {new Date(healthData.timestamp).toLocaleString()}
                </p>
                {healthData.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Top Recommendations:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="schemas">Schemas</TabsTrigger>
          <TabsTrigger value="feeds">Feeds</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {healthData?.checks.map((check, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{check.check}</CardTitle>
                  <Badge
                    variant={
                      check.status === 'pass'
                        ? 'default'
                        : check.status === 'warning'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {check.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{check.message}</p>
                {check.details && (
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(check.details, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="vitals" className="space-y-4">
          {vitalsData && Object.entries(vitalsData.metrics).map(([metric, data]) => (
            <Card key={metric}>
              <CardHeader>
                <CardTitle className="text-lg">{metric}</CardTitle>
                <CardDescription>
                  {data.count} measurements collected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-semibold">Average</p>
                    <p className="text-2xl">{data.average.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Median</p>
                    <p className="text-2xl">{data.median.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">P75</p>
                    <p className="text-2xl">{data.p75.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">P95</p>
                    <p className="text-2xl">{data.p95.toFixed(0)}ms</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Good</span>
                    <span>{data.good} ({((data.good / data.count) * 100).toFixed(0)}%)</span>
                  </div>
                  <Progress value={(data.good / data.count) * 100} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Needs Improvement</span>
                    <span>{data.needsImprovement} ({((data.needsImprovement / data.count) * 100).toFixed(0)}%)</span>
                  </div>
                  <Progress value={(data.needsImprovement / data.count) * 100} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Poor</span>
                    <span>{data.poor} ({((data.poor / data.count) * 100).toFixed(0)}%)</span>
                  </div>
                  <Progress value={(data.poor / data.count) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="schemas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Structured Data Implementation</CardTitle>
              <CardDescription>
                JSON-LD schemas currently active on your site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  'Organization',
                  'Store',
                  'LocalBusiness',
                  'Product',
                  'AggregateOffer',
                  'Review',
                  'BreadcrumbList',
                  'FAQPage',
                  'WebSite',
                  'SearchAction',
                  'BlogPosting',
                  'ItemList',
                  'VideoObject',
                  'Event',
                  'HowTo',
                  'SpecialAnnouncement',
                  'Speakable',
                  'OfferCatalog',
                ].map(schema => (
                  <div key={schema} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
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
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open('https://validator.schema.org/', '_blank')}
                >
                  Test with Schema.org Validator
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open('https://search.google.com/test/rich-results', '_blank')}
                >
                  Test with Google Rich Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feeds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Feed Status</CardTitle>
              <CardDescription>
                Shopping feed integrations for various platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    name: 'Google Merchant Center', 
                    url: '/api/feeds/google-merchant',
                    status: 'active',
                    products: 'All products',
                  },
                  { 
                    name: 'Facebook Catalog', 
                    url: '/api/feeds/facebook',
                    status: 'active',
                    products: 'All products',
                  },
                  { 
                    name: 'Pinterest', 
                    url: '/api/feeds/pinterest',
                    status: 'pending',
                    products: 'Not configured',
                  },
                  { 
                    name: 'Bing Shopping', 
                    url: '/api/feeds/bing',
                    status: 'pending',
                    products: 'Not configured',
                  },
                ].map(feed => (
                  <div key={feed.name} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-semibold">{feed.name}</h4>
                      <p className="text-sm text-muted-foreground">{feed.products}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={feed.status === 'active' ? 'default' : 'secondary'}>
                        {feed.status}
                      </Badge>
                      {feed.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(feed.url, '_blank')}
                        >
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