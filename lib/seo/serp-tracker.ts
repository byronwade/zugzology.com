/**
 * Real-Time SERP Position Tracking System
 */

interface SERPResult {
  keyword: string;
  position: number | null;
  url: string;
  title: string;
  snippet: string;
  features: string[];
  timestamp: Date;
  location?: string;
  device: 'desktop' | 'mobile';
}

interface RankingHistory {
  keyword: string;
  positions: Array<{
    position: number | null;
    date: Date;
    changeFromPrevious: number;
  }>;
}

interface CompetitorData {
  domain: string;
  position: number;
  title: string;
  snippet: string;
}

interface SERPFeatures {
  peopleAlsoAsk: string[];
  relatedSearches: string[];
  featuredSnippet?: {
    type: 'paragraph' | 'list' | 'table';
    source: string;
    snippet: string;
  };
  localPack?: Array<{
    name: string;
    rating: number;
    reviews: number;
  }>;
  shopping?: Array<{
    title: string;
    price: string;
    source: string;
  }>;
  images: string[];
  videos: Array<{
    title: string;
    source: string;
    duration: string;
  }>;
}

export class SERPTracker {
  private domain: string;
  private keywords: string[];
  private trackingHistory: Map<string, RankingHistory> = new Map();
  
  constructor(domain: string, keywords: string[]) {
    this.domain = domain;
    this.keywords = keywords;
  }
  
  /**
   * Track keyword position in SERP
   */
  async trackKeyword(
    keyword: string,
    location: string = 'United States',
    device: 'desktop' | 'mobile' = 'desktop'
  ): Promise<SERPResult | null> {
    try {
      // In production, you would use an actual SERP API like:
      // - DataForSEO
      // - SerpApi
      // - SEMrush API
      // - Ahrefs API
      
      // For demo purposes, we'll simulate the API call
      const serpData = await this.simulateSerpApi(keyword, location, device);
      
      // Find our domain in results
      const ourResult = serpData.organicResults.find((result: any) => 
        result.url.includes(this.domain)
      );
      
      if (!ourResult) {
        return null;
      }
      
      const result: SERPResult = {
        keyword,
        position: ourResult.position,
        url: ourResult.url,
        title: ourResult.title,
        snippet: ourResult.snippet,
        features: serpData.features,
        timestamp: new Date(),
        location,
        device,
      };
      
      // Update tracking history
      this.updateTrackingHistory(keyword, ourResult.position);
      
      return result;
    } catch (error) {
      console.error('SERP tracking error:', error);
      return null;
    }
  }
  
  /**
   * Track multiple keywords
   */
  async trackAllKeywords(): Promise<SERPResult[]> {
    const results: SERPResult[] = [];
    
    for (const keyword of this.keywords) {
      const result = await this.trackKeyword(keyword);
      if (result) {
        results.push(result);
      }
      
      // Add delay to avoid rate limiting
      await this.delay(1000);
    }
    
    return results;
  }
  
  /**
   * Get ranking trends
   */
  getRankingTrends(keyword: string): RankingHistory | null {
    return this.trackingHistory.get(keyword) || null;
  }
  
  /**
   * Analyze SERP features
   */
  async analyzeSerpFeatures(keyword: string): Promise<SERPFeatures> {
    const serpData = await this.simulateSerpApi(keyword);
    
    return {
      peopleAlsoAsk: serpData.peopleAlsoAsk || [],
      relatedSearches: serpData.relatedSearches || [],
      featuredSnippet: serpData.featuredSnippet,
      localPack: serpData.localPack,
      shopping: serpData.shopping,
      images: serpData.images || [],
      videos: serpData.videos || [],
    };
  }
  
  /**
   * Track competitors
   */
  async trackCompetitors(keyword: string): Promise<CompetitorData[]> {
    const serpData = await this.simulateSerpApi(keyword);
    
    return serpData.organicResults
      .filter((result: any) => !result.url.includes(this.domain))
      .slice(0, 10)
      .map((result: any) => ({
        domain: this.extractDomain(result.url),
        position: result.position,
        title: result.title,
        snippet: result.snippet,
      }));
  }
  
  /**
   * Get ranking alerts
   */
  generateRankingAlerts(): Array<{
    keyword: string;
    alert: string;
    severity: 'low' | 'medium' | 'high';
    change: number;
  }> {
    const alerts: Array<{
      keyword: string;
      alert: string;
      severity: 'low' | 'medium' | 'high';
      change: number;
    }> = [];
    
    this.trackingHistory.forEach((history, keyword) => {
      if (history.positions.length < 2) return;
      
      const latest = history.positions[history.positions.length - 1];
      const previous = history.positions[history.positions.length - 2];
      
      if (!latest.position || !previous.position) return;
      
      const change = previous.position - latest.position; // Positive = improvement
      
      if (change <= -10) {
        alerts.push({
          keyword,
          alert: `Dropped ${Math.abs(change)} positions`,
          severity: 'high',
          change,
        });
      } else if (change <= -5) {
        alerts.push({
          keyword,
          alert: `Dropped ${Math.abs(change)} positions`,
          severity: 'medium',
          change,
        });
      } else if (change >= 10) {
        alerts.push({
          keyword,
          alert: `Improved ${change} positions`,
          severity: 'low',
          change,
        });
      }
    });
    
    return alerts;
  }
  
  /**
   * Update tracking history
   */
  private updateTrackingHistory(keyword: string, position: number | null): void {
    let history = this.trackingHistory.get(keyword);
    
    if (!history) {
      history = {
        keyword,
        positions: [],
      };
      this.trackingHistory.set(keyword, history);
    }
    
    const previousPosition = history.positions.length > 0 
      ? history.positions[history.positions.length - 1].position 
      : null;
    
    const changeFromPrevious = previousPosition && position 
      ? previousPosition - position 
      : 0;
    
    history.positions.push({
      position,
      date: new Date(),
      changeFromPrevious,
    });
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    history.positions = history.positions.filter(
      pos => pos.date >= thirtyDaysAgo
    );
  }
  
  /**
   * Simulate SERP API call (replace with real API)
   */
  private async simulateSerpApi(
    keyword: string,
    location: string = 'United States',
    device: 'desktop' | 'mobile' = 'desktop'
  ): Promise<any> {
    // This is a mock implementation
    // In production, replace with actual SERP API calls
    
    await this.delay(500); // Simulate API delay
    
    const mockResults = {
      organicResults: [
        {
          position: 1,
          url: 'https://competitor1.com/page',
          title: 'Best Mushroom Growing Guide',
          snippet: 'Learn how to grow mushrooms at home...',
        },
        {
          position: 2,
          url: `https://${this.domain}/products/mushroom-kit`,
          title: 'Premium Mushroom Growing Kit',
          snippet: 'Complete kit for growing gourmet mushrooms...',
        },
        {
          position: 3,
          url: 'https://competitor2.com/guide',
          title: 'Mushroom Cultivation Tips',
          snippet: 'Expert tips for successful mushroom cultivation...',
        },
      ],
      features: ['People Also Ask', 'Related Searches'],
      peopleAlsoAsk: [
        'How long does it take to grow mushrooms?',
        'What equipment do I need for mushroom growing?',
        'Are mushroom growing kits worth it?',
        'How much space do I need to grow mushrooms?',
      ],
      relatedSearches: [
        'mushroom growing supplies',
        'oyster mushroom kit',
        'shiitake mushroom cultivation',
        'mushroom substrate',
      ],
      featuredSnippet: keyword.includes('how') ? {
        type: 'paragraph' as const,
        source: 'mushroom-growing.com',
        snippet: 'To grow mushrooms, you need a sterile substrate, mushroom spawn, and proper environmental conditions...',
      } : undefined,
      images: [
        'https://example.com/mushroom1.jpg',
        'https://example.com/mushroom2.jpg',
      ],
      videos: [
        {
          title: 'How to Grow Mushrooms at Home',
          source: 'YouTube',
          duration: '12:34',
        },
      ],
    };
    
    return mockResults;
  }
  
  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }
  
  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Generate keyword opportunities
   */
  generateKeywordOpportunities(serpFeatures: SERPFeatures): string[] {
    const opportunities: string[] = [];
    
    // Opportunities from People Also Ask
    if (serpFeatures.peopleAlsoAsk.length > 0) {
      opportunities.push(
        `Create FAQ content targeting: ${serpFeatures.peopleAlsoAsk.slice(0, 3).join(', ')}`
      );
    }
    
    // Opportunities from Related Searches
    if (serpFeatures.relatedSearches.length > 0) {
      opportunities.push(
        `Target related keywords: ${serpFeatures.relatedSearches.slice(0, 3).join(', ')}`
      );
    }
    
    // Featured Snippet opportunity
    if (serpFeatures.featuredSnippet && !serpFeatures.featuredSnippet.source.includes(this.domain)) {
      opportunities.push(
        `Optimize for featured snippet: Structure content as ${serpFeatures.featuredSnippet.type}`
      );
    }
    
    // Local Pack opportunity
    if (serpFeatures.localPack && serpFeatures.localPack.length > 0) {
      opportunities.push('Optimize for local search with Google My Business');
    }
    
    // Shopping opportunity
    if (serpFeatures.shopping && serpFeatures.shopping.length > 0) {
      opportunities.push('Set up Google Shopping ads for product visibility');
    }
    
    // Video opportunity
    if (serpFeatures.videos.length > 0) {
      opportunities.push('Create video content for this keyword');
    }
    
    return opportunities;
  }
}

/**
 * SERP Feature Optimizer
 */
export class SERPFeatureOptimizer {
  /**
   * Optimize content for featured snippets
   */
  optimizeForFeaturedSnippet(content: string, query: string): {
    score: number;
    suggestions: string[];
    optimizedContent: string;
  } {
    const suggestions: string[] = [];
    let optimizedContent = content;
    let score = 0;
    
    // Check if question is answered directly
    const hasDirectAnswer = this.hasDirectAnswer(content, query);
    if (hasDirectAnswer) {
      score += 25;
    } else {
      suggestions.push('Add a direct answer to the question at the beginning');
    }
    
    // Check for proper structure
    if (query.toLowerCase().includes('how to')) {
      const hasSteps = /\d+\.\s|\d+\)\s|step\s+\d+/gi.test(content);
      if (hasSteps) {
        score += 25;
      } else {
        suggestions.push('Structure content as numbered steps for "how to" queries');
        optimizedContent = this.addStepsStructure(content);
      }
    }
    
    // Check for lists
    if (query.toLowerCase().includes('best') || query.toLowerCase().includes('top')) {
      const hasLists = /<ul>|<ol>|\n\s*[-*+]\s/m.test(content);
      if (hasLists) {
        score += 25;
      } else {
        suggestions.push('Use bullet points or numbered lists for "best" or "top" queries');
        optimizedContent = this.addListStructure(content);
      }
    }
    
    // Check for tables
    if (query.toLowerCase().includes('vs') || query.toLowerCase().includes('comparison')) {
      const hasTable = /<table>|<thead>|<tbody>/i.test(content);
      if (hasTable) {
        score += 25;
      } else {
        suggestions.push('Add comparison table for "vs" or comparison queries');
      }
    }
    
    return {
      score,
      suggestions,
      optimizedContent,
    };
  }
  
  /**
   * Check if content directly answers the query
   */
  private hasDirectAnswer(content: string, query: string): boolean {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    // Look for direct answer patterns
    const answerPatterns = [
      new RegExp(`${queryWords.join('\\s+')}\\s+is\\s+`, 'i'),
      new RegExp(`${queryWords.join('\\s+')}\\s+are\\s+`, 'i'),
      new RegExp(`the\\s+answer\\s+is`, 'i'),
      new RegExp(`${queryWords[queryWords.length - 1]}\\s+is\\s+`, 'i'),
    ];
    
    return answerPatterns.some(pattern => pattern.test(contentLower));
  }
  
  /**
   * Add step structure to content
   */
  private addStepsStructure(content: string): string {
    // This is a simplified implementation
    // In production, use NLP to better identify steps
    const sentences = content.split(/\.\s+/);
    
    let stepNumber = 1;
    const structuredContent = sentences.map(sentence => {
      if (sentence.length > 50 && 
          (sentence.toLowerCase().includes('first') ||
           sentence.toLowerCase().includes('then') ||
           sentence.toLowerCase().includes('next') ||
           sentence.toLowerCase().includes('finally'))) {
        return `${stepNumber++}. ${sentence.trim()}.`;
      }
      return sentence + '.';
    });
    
    return structuredContent.join(' ');
  }
  
  /**
   * Add list structure to content
   */
  private addListStructure(content: string): string {
    // Look for enumerable items
    const sentences = content.split(/\.\s+/);
    const listItems: string[] = [];
    
    sentences.forEach(sentence => {
      if (sentence.length > 30 && 
          (sentence.toLowerCase().includes('another') ||
           sentence.toLowerCase().includes('also') ||
           sentence.toLowerCase().includes('additionally'))) {
        listItems.push(`• ${sentence.trim()}`);
      }
    });
    
    if (listItems.length > 0) {
      return content + '\n\nKey Points:\n' + listItems.join('\n');
    }
    
    return content;
  }
}