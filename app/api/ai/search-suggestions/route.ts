import { NextRequest, NextResponse } from 'next/server';
import { getCachedSearchSuggestions, enhanceSearchQuery } from '@/lib/services/ai-search-enhancer';
import { isAIFeatureEnabled } from '@/lib/config/ai-config';

export async function POST(request: NextRequest) {
  try {
    // Check if AI search enhancement is enabled
    if (!isAIFeatureEnabled('searchEnhancement')) {
      return NextResponse.json(
        { error: 'AI search enhancement is not enabled' },
        { status: 503 }
      );
    }

    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Get AI-powered suggestions
    const suggestions = await getCachedSearchSuggestions(query);

    return NextResponse.json({
      suggestions: suggestions || [],
      query
    });

  } catch (error) {
    console.error('AI Search Suggestions API Error:', error);
    
    return NextResponse.json(
      { error: 'Unable to generate search suggestions' },
      { status: 500 }
    );
  }
}

// Also support search query enhancement
export async function PUT(request: NextRequest) {
  try {
    if (!isAIFeatureEnabled('searchEnhancement')) {
      return NextResponse.json(
        { error: 'AI search enhancement is not enabled' },
        { status: 503 }
      );
    }

    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const enhancement = await enhanceSearchQuery(query);

    return NextResponse.json({
      enhancement,
      originalQuery: query
    });

  } catch (error) {
    console.error('AI Search Enhancement API Error:', error);
    
    return NextResponse.json(
      { error: 'Unable to enhance search query' },
      { status: 500 }
    );
  }
}