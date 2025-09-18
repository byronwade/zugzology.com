/**
 * AI-Powered Content Optimization System
 * Analyzes and scores content for SEO effectiveness
 */

interface ContentAnalysis {
  score: number;
  suggestions: string[];
  keywords: {
    density: number;
    distribution: 'good' | 'poor' | 'over-optimized';
    missing: string[];
    opportunities: string[];
  };
  readability: {
    score: number;
    level: string;
    sentenceLength: number;
    wordComplexity: number;
  };
  structure: {
    headings: boolean;
    paragraphLength: number;
    lists: boolean;
    images: boolean;
  };
  semantics: {
    entities: string[];
    topics: string[];
    relatedTerms: string[];
  };
}

export class AIContentOptimizer {
  private targetKeywords: string[];
  private competitorKeywords: Set<string>;
  
  constructor(targetKeywords: string[] = []) {
    this.targetKeywords = targetKeywords;
    this.competitorKeywords = new Set();
  }
  
  /**
   * Analyze content for SEO optimization
   */
  analyzeContent(content: string, metadata?: {
    title?: string;
    description?: string;
    url?: string;
  }): ContentAnalysis {
    const analysis: ContentAnalysis = {
      score: 0,
      suggestions: [],
      keywords: this.analyzeKeywords(content),
      readability: this.analyzeReadability(content),
      structure: this.analyzeStructure(content),
      semantics: this.analyzeSemantics(content),
    };
    
    // Calculate overall score
    analysis.score = this.calculateScore(analysis);
    
    // Generate suggestions
    analysis.suggestions = this.generateSuggestions(analysis, metadata);
    
    return analysis;
  }
  
  /**
   * Analyze keyword usage
   */
  private analyzeKeywords(content: string): ContentAnalysis['keywords'] {
    const words = content.toLowerCase().split(/\s+/);
    const wordCount = words.length;
    const keywordCounts = new Map<string, number>();
    
    // Count keyword occurrences
    this.targetKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
      const matches = content.match(regex);
      keywordCounts.set(keyword, matches ? matches.length : 0);
    });
    
    // Calculate density
    const totalKeywordCount = Array.from(keywordCounts.values()).reduce((a, b) => a + b, 0);
    const density = (totalKeywordCount / wordCount) * 100;
    
    // Determine distribution
    let distribution: 'good' | 'poor' | 'over-optimized' = 'good';
    if (density < 0.5) distribution = 'poor';
    else if (density > 3) distribution = 'over-optimized';
    
    // Find missing keywords
    const missing = this.targetKeywords.filter(k => !keywordCounts.get(k));
    
    // Find keyword opportunities (LSI keywords)
    const opportunities = this.findLSIKeywords(content);
    
    return {
      density,
      distribution,
      missing,
      opportunities,
    };
  }
  
  /**
   * Analyze readability
   */
  private analyzeReadability(content: string): ContentAnalysis['readability'] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const words = content.split(/\s+/).filter(w => w.trim());
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);
    
    // Flesch Reading Ease Score
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    const fleschScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
    
    // Determine reading level
    let level = 'College';
    if (fleschScore >= 90) level = '5th Grade';
    else if (fleschScore >= 80) level = '6th Grade';
    else if (fleschScore >= 70) level = '7th Grade';
    else if (fleschScore >= 60) level = '8th-9th Grade';
    else if (fleschScore >= 50) level = '10th-12th Grade';
    else if (fleschScore >= 30) level = 'College';
    else level = 'Graduate';
    
    return {
      score: Math.max(0, Math.min(100, fleschScore)),
      level,
      sentenceLength: avgWordsPerSentence,
      wordComplexity: avgSyllablesPerWord,
    };
  }
  
  /**
   * Analyze content structure
   */
  private analyzeStructure(content: string): ContentAnalysis['structure'] {
    const hasHeadings = /<h[1-6]|#{1,6}\s/.test(content);
    const hasList = /<ul|<ol|^\s*[-*+]\s/m.test(content);
    const hasImages = /<img|!\[.*?\]\(.*?\)/.test(content);
    
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length;
    
    return {
      headings: hasHeadings,
      paragraphLength: avgParagraphLength,
      lists: hasList,
      images: hasImages,
    };
  }
  
  /**
   * Analyze semantic elements
   */
  private analyzeSemantics(content: string): ContentAnalysis['semantics'] {
    // Extract entities (simplified - in production, use NLP library)
    const entities = this.extractEntities(content);
    
    // Extract topics
    const topics = this.extractTopics(content);
    
    // Find related terms
    const relatedTerms = this.findRelatedTerms(content);
    
    return {
      entities,
      topics,
      relatedTerms,
    };
  }
  
  /**
   * Calculate overall SEO score
   */
  private calculateScore(analysis: ContentAnalysis): number {
    let score = 0;
    
    // Keyword score (30 points)
    if (analysis.keywords.distribution === 'good') score += 20;
    else if (analysis.keywords.distribution === 'poor') score += 10;
    score += Math.min(10, 10 - analysis.keywords.missing.length * 2);
    
    // Readability score (25 points)
    score += (analysis.readability.score / 100) * 25;
    
    // Structure score (25 points)
    if (analysis.structure.headings) score += 10;
    if (analysis.structure.lists) score += 5;
    if (analysis.structure.images) score += 5;
    if (analysis.structure.paragraphLength < 150) score += 5;
    
    // Semantics score (20 points)
    score += Math.min(10, analysis.semantics.entities.length * 2);
    score += Math.min(10, analysis.semantics.topics.length * 2);
    
    return Math.round(score);
  }
  
  /**
   * Generate optimization suggestions
   */
  private generateSuggestions(
    analysis: ContentAnalysis,
    metadata?: { title?: string; description?: string; url?: string }
  ): string[] {
    const suggestions: string[] = [];
    
    // Keyword suggestions
    if (analysis.keywords.distribution === 'poor') {
      suggestions.push('Increase keyword usage - target 1-2% keyword density');
    } else if (analysis.keywords.distribution === 'over-optimized') {
      suggestions.push('Reduce keyword density to avoid over-optimization');
    }
    
    if (analysis.keywords.missing.length > 0) {
      suggestions.push(`Include missing keywords: ${analysis.keywords.missing.join(', ')}`);
    }
    
    // Readability suggestions
    if (analysis.readability.score < 60) {
      suggestions.push('Simplify content - use shorter sentences and simpler words');
    }
    
    if (analysis.readability.sentenceLength > 20) {
      suggestions.push('Break up long sentences for better readability');
    }
    
    // Structure suggestions
    if (!analysis.structure.headings) {
      suggestions.push('Add headings (H2, H3) to organize content');
    }
    
    if (!analysis.structure.lists) {
      suggestions.push('Use bullet points or numbered lists to improve scannability');
    }
    
    if (!analysis.structure.images) {
      suggestions.push('Add relevant images with alt text');
    }
    
    if (analysis.structure.paragraphLength > 150) {
      suggestions.push('Break up long paragraphs (aim for 3-4 sentences)');
    }
    
    // Metadata suggestions
    if (metadata?.title && metadata.title.length > 60) {
      suggestions.push('Shorten title tag to under 60 characters');
    }
    
    if (metadata?.description && metadata.description.length > 155) {
      suggestions.push('Shorten meta description to under 155 characters');
    }
    
    // Semantic suggestions
    if (analysis.semantics.entities.length < 3) {
      suggestions.push('Mention more specific entities (brands, places, people)');
    }
    
    if (analysis.semantics.relatedTerms.length > 0) {
      suggestions.push(`Consider adding related terms: ${analysis.semantics.relatedTerms.slice(0, 3).join(', ')}`);
    }
    
    return suggestions;
  }
  
  /**
   * Count syllables in a word (approximation)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    let count = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = /[aeiou]/.test(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    // Adjust for silent e
    if (word.endsWith('e')) count--;
    
    // Ensure at least one syllable
    return Math.max(1, count);
  }
  
  /**
   * Find LSI (Latent Semantic Indexing) keywords
   */
  private findLSIKeywords(content: string): string[] {
    // This is a simplified version - in production, use AI/NLP
    const lsiMap: Record<string, string[]> = {
      'mushroom': ['fungi', 'mycelium', 'spores', 'cultivation', 'substrate'],
      'growing': ['cultivation', 'farming', 'production', 'harvest'],
      'kit': ['set', 'package', 'bundle', 'starter'],
      'supplies': ['equipment', 'materials', 'tools', 'accessories'],
    };
    
    const opportunities: string[] = [];
    
    Object.entries(lsiMap).forEach(([keyword, related]) => {
      if (content.toLowerCase().includes(keyword)) {
        related.forEach(term => {
          if (!content.toLowerCase().includes(term)) {
            opportunities.push(term);
          }
        });
      }
    });
    
    return [...new Set(opportunities)];
  }
  
  /**
   * Extract entities from content
   */
  private extractEntities(content: string): string[] {
    const entities: string[] = [];
    
    // Extract capitalized words (potential entities)
    const capitalizedWords = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
    
    // Filter common words
    const commonWords = new Set(['The', 'This', 'That', 'These', 'Those', 'A', 'An']);
    
    capitalizedWords.forEach(word => {
      if (!commonWords.has(word) && word.length > 2) {
        entities.push(word);
      }
    });
    
    return [...new Set(entities)].slice(0, 10);
  }
  
  /**
   * Extract main topics from content
   */
  private extractTopics(content: string): string[] {
    // Simplified topic extraction - in production, use topic modeling
    const topics: string[] = [];
    
    const topicPatterns = [
      /mushroom\s+\w+/gi,
      /\w+\s+cultivation/gi,
      /\w+\s+growing/gi,
      /\w+\s+kit/gi,
      /\w+\s+substrate/gi,
    ];
    
    topicPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      topics.push(...matches);
    });
    
    return [...new Set(topics)].slice(0, 10);
  }
  
  /**
   * Find related terms for content
   */
  private findRelatedTerms(content: string): string[] {
    // This would typically use AI/NLP for better results
    const relatedMap: Record<string, string[]> = {
      'mushroom': ['fungus', 'mycology', 'edible fungi'],
      'grow': ['cultivate', 'produce', 'farm'],
      'organic': ['natural', 'sustainable', 'eco-friendly'],
      'beginner': ['starter', 'novice', 'first-time'],
      'professional': ['commercial', 'expert', 'advanced'],
    };
    
    const related: string[] = [];
    
    Object.entries(relatedMap).forEach(([term, synonyms]) => {
      if (content.toLowerCase().includes(term)) {
        synonyms.forEach(synonym => {
          if (!content.toLowerCase().includes(synonym)) {
            related.push(synonym);
          }
        });
      }
    });
    
    return [...new Set(related)];
  }
}

/**
 * Real-time content scoring hook
 */
export function useContentOptimizer(targetKeywords: string[]) {
  const optimizer = new AIContentOptimizer(targetKeywords);
  
  return {
    analyze: (content: string, metadata?: any) => optimizer.analyzeContent(content, metadata),
    getScore: (content: string) => {
      const analysis = optimizer.analyzeContent(content);
      return analysis.score;
    },
    getSuggestions: (content: string) => {
      const analysis = optimizer.analyzeContent(content);
      return analysis.suggestions;
    },
  };
}