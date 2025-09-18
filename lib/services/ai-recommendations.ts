"use server";

import { aiClient } from './ai-client';
import { isAIFeatureEnabled } from '@/lib/config/ai-config';
import type { Product } from '@/lib/types';

export interface ProductRecommendation {
  productId: string;
  reason: string;
  confidence: number;
  type: 'similar' | 'complementary' | 'upgrade' | 'bundle';
}

export interface BundleRecommendation {
  title: string;
  description: string;
  products: string[];
  savings: string;
  reason: string;
}

export async function generateProductRecommendations(
  currentProduct: Product,
  availableProducts: Product[],
  userHistory?: string[]
): Promise<ProductRecommendation[] | null> {
  if (!isAIFeatureEnabled('recommendations') || !aiClient.isAvailable()) {
    return null;
  }

  try {
    const productContext = availableProducts.slice(0, 20).map(p => ({
      id: p.id,
      title: p.title,
      description: p.description?.substring(0, 200),
      tags: p.tags?.slice(0, 5),
      price: p.priceRange?.minVariantPrice?.amount
    }));

    const prompt = `
You are a product recommendation expert for a mushroom growing store. Recommend related products.

Current Product: ${currentProduct.title}
Description: ${currentProduct.description?.substring(0, 300)}
Tags: ${currentProduct.tags?.join(', ')}

Available Products: ${JSON.stringify(productContext)}

User History: ${userHistory?.join(', ') || 'None'}

Generate up to 6 recommendations with JSON array format:
[{
  "productId": "product_id",
  "reason": "brief explanation why this pairs well",
  "confidence": 0.85,
  "type": "similar|complementary|upgrade|bundle"
}]

Types:
- similar: Same category/function
- complementary: Works together with current product
- upgrade: Better/premium version
- bundle: Part of a growing kit/process

Focus on mushroom cultivation logic and user needs.`;

    const response = await aiClient.complete(prompt, {
      maxTokens: 600,
      temperature: 0.7
    });

    try {
      const recommendations = JSON.parse(response);
      return Array.isArray(recommendations) ? recommendations : null;
    } catch (parseError) {
      console.error('Recommendations parsing error:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Product recommendations error:', error);
    return null;
  }
}

export async function generateBundleRecommendations(
  products: Product[],
  targetProduct?: Product
): Promise<BundleRecommendation[] | null> {
  if (!isAIFeatureEnabled('bundleSuggestions') || !aiClient.isAvailable()) {
    return null;
  }

  try {
    const productData = products.slice(0, 15).map(p => ({
      id: p.id,
      title: p.title,
      tags: p.tags?.slice(0, 3),
      price: p.priceRange?.minVariantPrice?.amount
    }));

    const targetInfo = targetProduct ? {
      title: targetProduct.title,
      tags: targetProduct.tags?.slice(0, 3)
    } : null;

    const prompt = `
Create product bundles for a mushroom growing store that would incentivize purchases.

Available Products: ${JSON.stringify(productData)}
${targetInfo ? `Target Product: ${JSON.stringify(targetInfo)}` : ''}

Create 2-3 logical bundles with JSON array format:
[{
  "title": "Bundle Name",
  "description": "Why this bundle makes sense for customers",
  "products": ["product_id1", "product_id2", "product_id3"],
  "savings": "Save 15%",
  "reason": "Explanation of the growing process this supports"
}]

Focus on:
- Complete growing processes (substrate + kit + tools)
- Beginner-friendly combinations
- Advanced grower upgrades
- Problem-solving bundles
- Logical cultivation workflows

Each bundle should have 2-4 products that work together.`;

    const response = await aiClient.complete(prompt, {
      maxTokens: 700,
      temperature: 0.8
    });

    try {
      const bundles = JSON.parse(response);
      return Array.isArray(bundles) ? bundles : null;
    } catch (parseError) {
      console.error('Bundle recommendations parsing error:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Bundle recommendations error:', error);
    return null;
  }
}

export async function analyzeUserIntent(
  searchQuery?: string,
  viewedProducts?: string[],
  cartItems?: string[]
): Promise<{
  intent: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  recommendations: string[];
} | null> {
  if (!isAIFeatureEnabled('recommendations') || !aiClient.isAvailable()) {
    return null;
  }

  try {
    const prompt = `
Analyze user behavior for a mushroom growing store and provide recommendations.

Search Query: ${searchQuery || 'None'}
Viewed Products: ${viewedProducts?.join(', ') || 'None'}
Cart Items: ${cartItems?.join(', ') || 'None'}

Provide JSON with:
1. intent - user's likely goal (e.g., "starting cultivation", "expanding setup", "troubleshooting")
2. experience - "beginner", "intermediate", or "advanced"
3. recommendations - array of 3-5 specific product suggestions or next steps

Base recommendations on cultivation logic and user journey.`;

    const response = await aiClient.complete(prompt, {
      maxTokens: 400,
      temperature: 0.6
    });

    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('User intent parsing error:', parseError);
      return null;
    }
  } catch (error) {
    console.error('User intent analysis error:', error);
    return null;
  }
}

// Recommendation caching
const recommendationCache = new Map<string, ProductRecommendation[]>();
const bundleCache = new Map<string, BundleRecommendation[]>();

export async function getCachedRecommendations(
  productId: string,
  availableProducts: Product[]
): Promise<ProductRecommendation[] | null> {
  const cached = recommendationCache.get(productId);
  if (cached) {
    return cached;
  }

  const currentProduct = availableProducts.find(p => p.id === productId);
  if (!currentProduct) {
    return null;
  }

  const recommendations = await generateProductRecommendations(currentProduct, availableProducts);
  if (recommendations) {
    recommendationCache.set(productId, recommendations);
    // Limit cache size
    if (recommendationCache.size > 100) {
      const firstKey = recommendationCache.keys().next().value;
      recommendationCache.delete(firstKey);
    }
  }

  return recommendations;
}