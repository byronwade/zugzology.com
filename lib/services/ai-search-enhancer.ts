"use server";

import { aiClient } from './ai-client';
import { isAIFeatureEnabled } from '@/lib/config/ai-config';

export interface SearchEnhancement {
  enhancedQuery: string;
  suggestions: string[];
  intent: 'product' | 'information' | 'problem-solving' | 'comparison';
  filters?: {
    category?: string;
    experience?: 'beginner' | 'intermediate' | 'advanced';
    priceRange?: 'budget' | 'mid' | 'premium';
  };
}

export async function enhanceSearchQuery(query: string): Promise<SearchEnhancement | null> {
  if (!isAIFeatureEnabled('searchEnhancement') || !aiClient.isAvailable()) {
    return null;
  }

  try {
    const prompt = `
You are a search enhancement system for a mushroom growing supplies store. Analyze this search query and improve it.

User Query: "${query}"

Provide a JSON response with:
1. enhancedQuery - Improved search terms with better keywords
2. suggestions - Array of 3-5 related search suggestions
3. intent - User's likely intent: "product", "information", "problem-solving", or "comparison"
4. filters - Suggested filters object with category, experience level, price range (if applicable)

Consider mushroom cultivation terminology, common beginner questions, product categories like:
- Growing kits, substrates, tools, sterilization
- Oyster, shiitake, lion's mane mushrooms
- Indoor/outdoor growing
- Beginner vs advanced techniques

Respond with valid JSON only.`;

    const response = await aiClient.complete(prompt, {
      maxTokens: 400,
      temperature: 0.7
    });

    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Search enhancement parsing error:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Search enhancement error:', error);
    return null;
  }
}

export async function generateSearchSuggestions(partialQuery: string): Promise<string[] | null> {
  if (!isAIFeatureEnabled('searchEnhancement') || !aiClient.isAvailable()) {
    return null;
  }

  if (partialQuery.length < 2) {
    return null;
  }

  try {
    const prompt = `
Generate 5 autocomplete suggestions for this partial search in a mushroom growing store:

Partial query: "${partialQuery}"

Consider common products:
- Growing kits (oyster, shiitake, lion's mane)
- Substrates and growing mediums
- Sterilization equipment
- Tools and supplies
- Beginner guides

Return as JSON array of strings, ordered by relevance.`;

    const response = await aiClient.complete(prompt, {
      maxTokens: 200,
      temperature: 0.6
    });

    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Suggestions parsing error:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Search suggestions error:', error);
    return null;
  }
}

export async function categorizeSearchQuery(query: string): Promise<{
  category: string;
  confidence: number;
  subcategories: string[];
} | null> {
  if (!isAIFeatureEnabled('searchEnhancement') || !aiClient.isAvailable()) {
    return null;
  }

  try {
    const prompt = `
Categorize this search query for a mushroom growing store:

Query: "${query}"

Categories:
- kits (growing kits, starter kits)
- substrates (growing mediums, materials)
- tools (equipment, instruments)
- sterilization (cleaning, sanitizing)
- mushroom-types (specific varieties)
- guides (information, tutorials)
- troubleshooting (problems, issues)

Provide JSON with:
1. category - main category
2. confidence - 0-1 confidence score
3. subcategories - array of related subcategories

Respond with valid JSON only.`;

    const response = await aiClient.complete(prompt, {
      maxTokens: 200,
      temperature: 0.5
    });

    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Categorization parsing error:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Query categorization error:', error);
    return null;
  }
}

// Cache for search enhancements
const searchCache = new Map<string, SearchEnhancement>();
const suggestionCache = new Map<string, string[]>();

export async function getCachedSearchEnhancement(query: string): Promise<SearchEnhancement | null> {
  const cached = searchCache.get(query.toLowerCase());
  if (cached) {
    return cached;
  }

  const enhanced = await enhanceSearchQuery(query);
  if (enhanced) {
    searchCache.set(query.toLowerCase(), enhanced);
    // Limit cache size
    if (searchCache.size > 1000) {
      const firstKey = searchCache.keys().next().value;
      searchCache.delete(firstKey);
    }
  }

  return enhanced;
}

export async function getCachedSearchSuggestions(partialQuery: string): Promise<string[] | null> {
  const key = partialQuery.toLowerCase();
  const cached = suggestionCache.get(key);
  if (cached) {
    return cached;
  }

  const suggestions = await generateSearchSuggestions(partialQuery);
  if (suggestions) {
    suggestionCache.set(key, suggestions);
    // Limit cache size
    if (suggestionCache.size > 500) {
      const firstKey = suggestionCache.keys().next().value;
      suggestionCache.delete(firstKey);
    }
  }

  return suggestions;
}