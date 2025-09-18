import { NextResponse } from 'next/server';
import { getProducts, getCollections } from '@/lib/actions/shopify';
import { getStoreConfigSafe } from '@/lib/config/store-config';
import type { ShopifyProduct } from '@/lib/types';

export async function GET() {
  try {
    const config = getStoreConfigSafe();
    const baseUrl = `https://${config.storeDomain}`;
    
    // Fetch all products
    const products = await getProducts();
    const collections = await getCollections();
    
    // Create collection map for Google product categories
    const collectionMap = new Map(
      collections.map(c => [c.id, c.title])
    );
    
    // Generate XML feed
    const xml = generateGoogleMerchantFeed(products, baseUrl, config);
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating Google Merchant feed:', error);
    return NextResponse.json(
      { error: 'Failed to generate feed' },
      { status: 500 }
    );
  }
}

function generateGoogleMerchantFeed(
  products: ShopifyProduct[],
  baseUrl: string,
  config: any
): string {
  const items = products.map(product => {
    const variant = product.variants?.nodes?.[0];
    const image = product.images?.nodes?.[0];
    const additionalImages = product.images?.nodes?.slice(1, 10) || [];
    
    // Map product types to Google product categories
    const googleCategory = mapToGoogleCategory(product.productType);
    
    // Calculate availability
    const availability = product.availableForSale 
      ? 'in_stock' 
      : 'out_of_stock';
    
    // Get price
    const price = variant?.price?.amount || '0';
    const currency = variant?.price?.currencyCode || 'USD';
    const comparePrice = variant?.compareAtPrice?.amount;
    
    // Generate unique ID
    const id = `shopify_US_${product.id}_${variant?.id || ''}`;
    
    // Clean description
    const description = cleanDescription(product.description || product.title);
    
    return `
    <item>
      <g:id>${escapeXml(id)}</g:id>
      <g:title>${escapeXml(product.title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${baseUrl}/products/${product.handle}</g:link>
      <g:image_link>${escapeXml(image?.url || '')}</g:image_link>
      ${additionalImages.map(img => 
        `<g:additional_image_link>${escapeXml(img.url)}</g:additional_image_link>`
      ).join('\n      ')}
      <g:availability>${availability}</g:availability>
      <g:price>${price} ${currency}</g:price>
      ${comparePrice ? `<g:sale_price>${price} ${currency}</g:sale_price>` : ''}
      ${comparePrice ? `<g:sale_price_effective_date>${getSaleDates()}</g:sale_price_effective_date>` : ''}
      <g:brand>${escapeXml(product.vendor || config.storeName)}</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:product_type>${escapeXml(product.productType || 'Mushroom Supplies')}</g:product_type>
      ${variant?.sku ? `<g:mpn>${escapeXml(variant.sku)}</g:mpn>` : ''}
      ${variant?.barcode ? `<g:gtin>${escapeXml(variant.barcode)}</g:gtin>` : ''}
      <g:identifier_exists>${variant?.sku || variant?.barcode ? 'yes' : 'no'}</g:identifier_exists>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 USD</g:price>
        <g:min_handling_time>1</g:min_handling_time>
        <g:max_handling_time>3</g:max_handling_time>
      </g:shipping>
      <g:shipping_weight>${variant?.weight?.value || '1'} ${variant?.weight?.unit || 'lb'}</g:shipping_weight>
      <g:custom_label_0>${product.tags?.[0] || ''}</g:custom_label_0>
      <g:custom_label_1>${product.collections?.nodes?.[0]?.title || ''}</g:custom_label_1>
      <g:age_group>adult</g:age_group>
      <g:adult>no</g:adult>
    </item>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${config.storeName} - Product Feed</title>
    <link>${baseUrl}</link>
    <description>${config.storeDescription}</description>
    ${items}
  </channel>
</rss>`;
}

function mapToGoogleCategory(productType?: string): string {
  const categoryMap: Record<string, string> = {
    'Growing Kits': 'Home & Garden > Lawn & Garden > Gardening > Greenhouses & Hydroponics',
    'Substrates': 'Home & Garden > Lawn & Garden > Gardening > Soils & Soil Amendments',
    'Spawn': 'Home & Garden > Lawn & Garden > Gardening > Plants > Plant Seeds & Bulbs',
    'Equipment': 'Home & Garden > Lawn & Garden > Gardening > Gardening Tools',
    'Supplies': 'Home & Garden > Lawn & Garden > Gardening > Gardening Supplies',
    'Books': 'Media > Books > Non-Fiction > Home & Garden Books',
    'Tools': 'Home & Garden > Lawn & Garden > Gardening > Gardening Tools',
  };
  
  if (!productType) return 'Home & Garden > Lawn & Garden > Gardening';
  
  for (const [key, value] of Object.entries(categoryMap)) {
    if (productType.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return 'Home & Garden > Lawn & Garden > Gardening';
}

function cleanDescription(text: string): string {
  // Remove HTML tags
  let cleaned = text.replace(/<[^>]*>/g, '');
  
  // Remove special characters
  cleaned = cleaned.replace(/[^\w\s.,!?-]/g, ' ');
  
  // Collapse whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Limit length (5000 chars max for Google)
  if (cleaned.length > 4999) {
    cleaned = cleaned.substring(0, 4996) + '...';
  }
  
  return cleaned;
}

function escapeXml(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getSaleDates(): string {
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);
  
  const format = (date: Date) => date.toISOString().split('T')[0];
  
  return `${format(now)}/${format(endDate)}`;
}