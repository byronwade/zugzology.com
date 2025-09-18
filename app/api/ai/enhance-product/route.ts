import { NextRequest, NextResponse } from 'next/server';
import { enhanceProductDescription } from '@/lib/services/ai-product-enhancer';
import { isAIFeatureEnabled } from '@/lib/config/ai-config';
import type { Product } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Check if AI product descriptions are enabled
    if (!isAIFeatureEnabled('productDescriptions')) {
      return NextResponse.json(
        { error: 'AI product descriptions are not enabled' },
        { status: 503 }
      );
    }

    const { product }: { product: Product } = await request.json();

    if (!product || !product.id) {
      return NextResponse.json(
        { error: 'Product data is required' },
        { status: 400 }
      );
    }

    const enhancement = await enhanceProductDescription(product);

    if (!enhancement) {
      return NextResponse.json(
        { error: 'Unable to generate enhancement at this time' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      enhancement,
      productId: product.id
    });

  } catch (error) {
    console.error('AI Product Enhancement API Error:', error);
    
    return NextResponse.json(
      { error: 'Unable to process enhancement request' },
      { status: 500 }
    );
  }
}