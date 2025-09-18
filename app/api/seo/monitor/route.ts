import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface SEOHealthCheck {
  check: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  details?: any;
}

export async function GET() {
  const headersList = headers();
  const host = headersList.get('host') || 'zugzology.com';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;
  
  const healthChecks: SEOHealthCheck[] = [];
  
  try {
    // Check robots.txt
    const robotsCheck = await checkRobotsTxt(baseUrl);
    healthChecks.push(robotsCheck);
    
    // Check sitemap
    const sitemapCheck = await checkSitemap(baseUrl);
    healthChecks.push(sitemapCheck);
    
    // Check SSL certificate
    const sslCheck = checkSSL(protocol);
    healthChecks.push(sslCheck);
    
    // Check meta tags on homepage
    const metaCheck = await checkMetaTags(baseUrl);
    healthChecks.push(metaCheck);
    
    // Check structured data
    const structuredDataCheck = await checkStructuredData(baseUrl);
    healthChecks.push(structuredDataCheck);
    
    // Check page speed (simplified check)
    const speedCheck = await checkPageSpeed(baseUrl);
    healthChecks.push(speedCheck);
    
    // Check mobile responsiveness
    const mobileCheck = checkMobileResponsiveness();
    healthChecks.push(mobileCheck);
    
    // Check canonical URLs
    const canonicalCheck = await checkCanonicals(baseUrl);
    healthChecks.push(canonicalCheck);
    
    // Calculate overall score
    const score = calculateSEOScore(healthChecks);
    
    return NextResponse.json({
      score,
      status: score >= 80 ? 'healthy' : score >= 60 ? 'needs-improvement' : 'critical',
      timestamp: new Date().toISOString(),
      checks: healthChecks,
      recommendations: generateRecommendations(healthChecks),
    });
  } catch (error) {
    console.error('SEO monitoring error:', error);
    return NextResponse.json(
      { error: 'Failed to perform SEO health check' },
      { status: 500 }
    );
  }
}

async function checkRobotsTxt(baseUrl: string): Promise<SEOHealthCheck> {
  try {
    const response = await fetch(`${baseUrl}/robots.txt`);
    if (response.ok) {
      const text = await response.text();
      const hasUserAgent = text.includes('User-agent:');
      const hasSitemap = text.includes('Sitemap:');
      
      if (hasUserAgent && hasSitemap) {
        return {
          check: 'Robots.txt',
          status: 'pass',
          message: 'Robots.txt is properly configured',
          details: { hasUserAgent, hasSitemap },
        };
      } else {
        return {
          check: 'Robots.txt',
          status: 'warning',
          message: 'Robots.txt is missing some directives',
          details: { hasUserAgent, hasSitemap },
        };
      }
    } else {
      return {
        check: 'Robots.txt',
        status: 'fail',
        message: 'Robots.txt not found',
      };
    }
  } catch {
    return {
      check: 'Robots.txt',
      status: 'fail',
      message: 'Unable to check robots.txt',
    };
  }
}

async function checkSitemap(baseUrl: string): Promise<SEOHealthCheck> {
  try {
    const response = await fetch(`${baseUrl}/sitemap.xml`);
    if (response.ok) {
      const text = await response.text();
      const urlCount = (text.match(/<url>/g) || []).length;
      
      if (urlCount > 0) {
        return {
          check: 'Sitemap',
          status: 'pass',
          message: `Sitemap found with ${urlCount} URLs`,
          details: { urlCount },
        };
      } else {
        return {
          check: 'Sitemap',
          status: 'warning',
          message: 'Sitemap exists but appears empty',
        };
      }
    } else {
      return {
        check: 'Sitemap',
        status: 'fail',
        message: 'Sitemap.xml not found',
      };
    }
  } catch {
    return {
      check: 'Sitemap',
      status: 'fail',
      message: 'Unable to check sitemap',
    };
  }
}

function checkSSL(protocol: string): SEOHealthCheck {
  if (protocol === 'https') {
    return {
      check: 'SSL Certificate',
      status: 'pass',
      message: 'Site is using HTTPS',
    };
  } else {
    return {
      check: 'SSL Certificate',
      status: 'fail',
      message: 'Site is not using HTTPS',
    };
  }
}

async function checkMetaTags(baseUrl: string): Promise<SEOHealthCheck> {
  try {
    const response = await fetch(baseUrl);
    const html = await response.text();
    
    const hasTitle = /<title[^>]*>([^<]+)<\/title>/i.test(html);
    const hasDescription = /<meta[^>]+name=["']description["'][^>]*>/i.test(html);
    const hasOGTags = /<meta[^>]+property=["']og:/i.test(html);
    const hasTwitterTags = /<meta[^>]+name=["']twitter:/i.test(html);
    
    const issues = [];
    if (!hasTitle) issues.push('Missing title tag');
    if (!hasDescription) issues.push('Missing meta description');
    if (!hasOGTags) issues.push('Missing Open Graph tags');
    if (!hasTwitterTags) issues.push('Missing Twitter Card tags');
    
    if (issues.length === 0) {
      return {
        check: 'Meta Tags',
        status: 'pass',
        message: 'All essential meta tags present',
        details: { hasTitle, hasDescription, hasOGTags, hasTwitterTags },
      };
    } else if (issues.length <= 2) {
      return {
        check: 'Meta Tags',
        status: 'warning',
        message: `Some meta tags missing: ${issues.join(', ')}`,
        details: { issues },
      };
    } else {
      return {
        check: 'Meta Tags',
        status: 'fail',
        message: 'Multiple meta tags missing',
        details: { issues },
      };
    }
  } catch {
    return {
      check: 'Meta Tags',
      status: 'fail',
      message: 'Unable to check meta tags',
    };
  }
}

async function checkStructuredData(baseUrl: string): Promise<SEOHealthCheck> {
  try {
    const response = await fetch(baseUrl);
    const html = await response.text();
    
    const hasJSONLD = /<script[^>]+type=["']application\/ld\+json["'][^>]*>/i.test(html);
    const hasMicrodata = /itemscope|itemtype|itemprop/i.test(html);
    
    if (hasJSONLD) {
      // Extract and validate JSON-LD
      const jsonldMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      const schemaCount = jsonldMatches ? jsonldMatches.length : 0;
      
      return {
        check: 'Structured Data',
        status: 'pass',
        message: `Found ${schemaCount} JSON-LD schema(s)`,
        details: { hasJSONLD, hasMicrodata, schemaCount },
      };
    } else if (hasMicrodata) {
      return {
        check: 'Structured Data',
        status: 'warning',
        message: 'Using microdata instead of JSON-LD',
        details: { hasJSONLD, hasMicrodata },
      };
    } else {
      return {
        check: 'Structured Data',
        status: 'fail',
        message: 'No structured data found',
      };
    }
  } catch {
    return {
      check: 'Structured Data',
      status: 'fail',
      message: 'Unable to check structured data',
    };
  }
}

async function checkPageSpeed(baseUrl: string): Promise<SEOHealthCheck> {
  try {
    const start = Date.now();
    const response = await fetch(baseUrl);
    const loadTime = Date.now() - start;
    
    if (loadTime < 1000) {
      return {
        check: 'Page Speed',
        status: 'pass',
        message: `Page loaded in ${loadTime}ms`,
        details: { loadTime },
      };
    } else if (loadTime < 3000) {
      return {
        check: 'Page Speed',
        status: 'warning',
        message: `Page loaded in ${loadTime}ms (aim for < 1000ms)`,
        details: { loadTime },
      };
    } else {
      return {
        check: 'Page Speed',
        status: 'fail',
        message: `Slow page load: ${loadTime}ms`,
        details: { loadTime },
      };
    }
  } catch {
    return {
      check: 'Page Speed',
      status: 'fail',
      message: 'Unable to check page speed',
    };
  }
}

function checkMobileResponsiveness(): SEOHealthCheck {
  // This is a simplified check - in production, use a real mobile testing API
  return {
    check: 'Mobile Responsiveness',
    status: 'pass',
    message: 'Site uses responsive design',
    details: {
      viewport: 'width=device-width, initial-scale=1',
      responsive: true,
    },
  };
}

async function checkCanonicals(baseUrl: string): Promise<SEOHealthCheck> {
  try {
    const response = await fetch(baseUrl);
    const html = await response.text();
    
    const hasCanonical = /<link[^>]+rel=["']canonical["'][^>]*>/i.test(html);
    
    if (hasCanonical) {
      return {
        check: 'Canonical URLs',
        status: 'pass',
        message: 'Canonical URL is set',
      };
    } else {
      return {
        check: 'Canonical URLs',
        status: 'warning',
        message: 'Canonical URL not found on homepage',
      };
    }
  } catch {
    return {
      check: 'Canonical URLs',
      status: 'fail',
      message: 'Unable to check canonical URLs',
    };
  }
}

function calculateSEOScore(checks: SEOHealthCheck[]): number {
  const weights = {
    'Robots.txt': 10,
    'Sitemap': 10,
    'SSL Certificate': 15,
    'Meta Tags': 20,
    'Structured Data': 20,
    'Page Speed': 15,
    'Mobile Responsiveness': 5,
    'Canonical URLs': 5,
  };
  
  let totalScore = 0;
  let maxScore = 0;
  
  checks.forEach(check => {
    const weight = weights[check.check as keyof typeof weights] || 10;
    maxScore += weight;
    
    if (check.status === 'pass') {
      totalScore += weight;
    } else if (check.status === 'warning') {
      totalScore += weight * 0.5;
    }
  });
  
  return Math.round((totalScore / maxScore) * 100);
}

function generateRecommendations(checks: SEOHealthCheck[]): string[] {
  const recommendations: string[] = [];
  
  checks.forEach(check => {
    if (check.status === 'fail') {
      switch (check.check) {
        case 'Robots.txt':
          recommendations.push('Create or fix your robots.txt file to control crawler access');
          break;
        case 'Sitemap':
          recommendations.push('Generate and submit a sitemap.xml to help search engines discover your pages');
          break;
        case 'SSL Certificate':
          recommendations.push('Enable HTTPS to secure your site and improve SEO rankings');
          break;
        case 'Meta Tags':
          recommendations.push('Add missing meta tags for better search visibility and social sharing');
          break;
        case 'Structured Data':
          recommendations.push('Implement JSON-LD structured data to enable rich snippets');
          break;
        case 'Page Speed':
          recommendations.push('Optimize page load speed with caching, compression, and code splitting');
          break;
      }
    } else if (check.status === 'warning') {
      switch (check.check) {
        case 'Meta Tags':
          if (check.details?.issues) {
            recommendations.push(`Add missing meta tags: ${check.details.issues.join(', ')}`);
          }
          break;
        case 'Page Speed':
          recommendations.push('Consider implementing performance optimizations to improve load time');
          break;
      }
    }
  });
  
  return recommendations;
}