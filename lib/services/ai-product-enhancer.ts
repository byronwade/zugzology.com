"use server";

import { aiClient } from './ai-client';
import { isAIFeatureEnabled } from '@/lib/config/ai-config';
import type { Product } from '@/lib/types';

export interface EnhancedProductData {
  enhancedDescription?: string;
  growingTips?: string;
  useCase?: string;
  targetAudience?: string;
  benefits?: string[];
  warnings?: string[];
}

export async function enhanceProductDescription(product: Product): Promise<EnhancedProductData | null> {
  if (!isAIFeatureEnabled('productDescriptions') || !aiClient.isAvailable()) {
    return null;
  }

  try {
    const prompt = `
You are an expert in mushroom cultivation and growing supplies. Enhance this product listing for a mushroom growing supplies store called Zugzology.

Product: ${product.title}
Current Description: ${product.description || 'No description provided'}
Price: ${product.priceRange?.minVariantPrice?.amount} ${product.priceRange?.minVariantPrice?.currencyCode}
Tags: ${product.tags?.join(', ') || 'None'}

Please provide a JSON response with:
1. enhancedDescription - A compelling, informative product description (2-3 sentences)
2. growingTips - Specific cultivation tips for this product (1-2 sentences)
3. useCase - Primary use cases (1 sentence)
4. targetAudience - Who this product is best for (1 sentence)
5. benefits - Array of 3-5 key benefits
6. warnings - Array of any important safety or usage warnings (if applicable)

Focus on:
- Mushroom cultivation expertise
- Clear, actionable information
- Sales-oriented but educational tone
- Appropriate technical level for hobbyists
- Safety and best practices

Respond with valid JSON only.`;

    const response = await aiClient.complete(prompt, {
      maxTokens: 800,
      temperature: 0.7
    });

    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('AI response parsing error:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Product enhancement error:', error);
    return null;
  }
}

export async function generateGrowingGuide(productTitle: string, productType: string): Promise<string | null> {
  if (!isAIFeatureEnabled('growingGuides') || !aiClient.isAvailable()) {
    return null;
  }

  try {
    const prompt = `
Create a concise growing guide for "${productTitle}" in mushroom cultivation.

Product Type: ${productType}

Provide a step-by-step guide in markdown format covering:
1. Preparation
2. Usage/Application
3. Timeline expectations
4. Success indicators
5. Common troubleshooting tips

Keep it practical, beginner-friendly, and under 300 words. Focus on actionable steps specific to this product.`;

    return await aiClient.complete(prompt, {
      maxTokens: 500,
      temperature: 0.6
    });
  } catch (error) {
    console.error('Growing guide generation error:', error);
    return null;
  }
}

export async function generateProductTags(product: Product): Promise<string[] | null> {
  if (!isAIFeatureEnabled('productDescriptions') || !aiClient.isAvailable()) {
    return null;
  }

  try {
    const prompt = `
Generate relevant tags for this mushroom growing product:

Title: ${product.title}
Description: ${product.description || 'No description'}
Current Tags: ${product.tags?.join(', ') || 'None'}

Suggest 5-8 relevant tags for better categorization and search. Focus on:
- Growing methods (e.g., "substrate", "sterilization", "inoculation")
- Experience level (e.g., "beginner-friendly", "advanced")
- Product type (e.g., "kit", "tool", "medium")
- Mushroom types if applicable

Return as comma-separated list without quotes.`;

    const response = await aiClient.complete(prompt, {
      maxTokens: 100,
      temperature: 0.5
    });

    return response.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  } catch (error) {
    console.error('Tag generation error:', error);
    return null;
  }
}

// Cache enhanced data to avoid repeated API calls
const enhancementCache = new Map<string, EnhancedProductData>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedProductEnhancement(productId: string, product: Product): Promise<EnhancedProductData | null> {
  const cacheKey = `${productId}-${Date.now()}`;
  const cached = enhancementCache.get(productId);
  
  if (cached) {
    return cached;
  }

  const enhanced = await enhanceProductDescription(product);
  if (enhanced) {
    enhancementCache.set(productId, enhanced);
    // Clean up cache periodically
    setTimeout(() => enhancementCache.delete(productId), CACHE_DURATION);
  }

  return enhanced;
}