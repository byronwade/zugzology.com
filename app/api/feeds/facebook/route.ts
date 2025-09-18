import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/actions/shopify';
import { getStoreConfigSafe } from '@/lib/config/store-config';
import type { ShopifyProduct } from '@/lib/types';

export async function GET() {
  try {
    const config = getStoreConfigSafe();
    const baseUrl = `https://${config.storeDomain}`;
    
    // Fetch all products
    const products = await getProducts();
    
    // Generate CSV feed for Facebook
    const csv = generateFacebookCatalogCSV(products, baseUrl, config);
    
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="facebook-catalog.csv"',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating Facebook catalog:', error);
    return NextResponse.json(
      { error: 'Failed to generate catalog' },
      { status: 500 }
    );
  }
}

function generateFacebookCatalogCSV(
  products: ShopifyProduct[],
  baseUrl: string,
  config: any
): string {
  // CSV Headers required by Facebook
  const headers = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'link',
    'image_link',
    'brand',
    'google_product_category',
    'fb_product_category',
    'quantity_to_sell_on_facebook',
    'sale_price',
    'sale_price_effective_date',
    'item_group_id',
    'gender',
    'age_group',
    'color',
    'size',
    'shipping',
    'custom_label_0',
    'custom_label_1',
    'custom_label_2',
    'additional_image_link',
    'product_type',
  ];
  
  const rows = [headers.join(',')];
  
  products.forEach(product => {
    const variants = product.variants?.nodes || [];
    
    variants.forEach(variant => {
      const row = generateFacebookRow(product, variant, baseUrl, config);
      rows.push(row);
    });
  });
  
  return rows.join('\n');
}

function generateFacebookRow(
  product: ShopifyProduct,
  variant: any,
  baseUrl: string,
  config: any
): string {
  const image = product.images?.nodes?.[0];
  const additionalImages = product.images?.nodes?.slice(1, 10)
    .map(img => img.url)
    .join(',') || '';
  
  const price = `${variant.price?.amount || '0'} ${variant.price?.currencyCode || 'USD'}`;
  const salePrice = variant.compareAtPrice?.amount 
    ? `${variant.compareAtPrice.amount} ${variant.compareAtPrice.currencyCode || 'USD'}`
    : '';
  
  const availability = variant.availableForSale ? 'in stock' : 'out of stock';
  const quantity = variant.quantityAvailable || 0;
  
  const description = cleanCSVField(product.description || product.title);
  const title = cleanCSVField(`${product.title} ${variant.title !== 'Default Title' ? `- ${variant.title}` : ''}`);
  
  const fbCategory = mapToFacebookCategory(product.productType);
  const googleCategory = '3237'; // Home & Garden > Lawn & Garden
  
  const fields = [
    variant.id,                                          // id
    title,                                                // title
    description,                                          // description
    availability,                                         // availability
    'new',                                               // condition
    price,                                               // price
    `${baseUrl}/products/${product.handle}?variant=${variant.id}`, // link
    image?.url || '',                                   // image_link
    product.vendor || config.storeName,                 // brand
    googleCategory,                                     // google_product_category
    fbCategory,                                         // fb_product_category
    quantity.toString(),                                // quantity_to_sell_on_facebook
    salePrice,                                          // sale_price
    salePrice ? getSalePeriod() : '',                  // sale_price_effective_date
    product.id,                                         // item_group_id
    'unisex',                                           // gender
    'all ages',                                         // age_group
    variant.selectedOptions?.find(o => o.name === 'Color')?.value || '', // color
    variant.selectedOptions?.find(o => o.name === 'Size')?.value || '',  // size
    'US::Standard::0 USD',                             // shipping
    product.tags?.[0] || '',                           // custom_label_0
    product.productType || '',                         // custom_label_1
    product.collections?.nodes?.[0]?.title || '',      // custom_label_2
    additionalImages,                                   // additional_image_link
    product.productType || '',                         // product_type
  ];
  
  return fields.map(field => `"${field}"`).join(',');
}

function mapToFacebookCategory(productType?: string): string {
  const categoryMap: Record<string, string> = {
    'Growing Kits': '613',  // Home & Garden > Lawn & Garden
    'Substrates': '613',
    'Spawn': '613',
    'Equipment': '619',     // Home & Garden > Tools
    'Supplies': '613',
    'Books': '436',         // Media > Books
    'Tools': '619',
  };
  
  if (!productType) return '613';
  
  for (const [key, value] of Object.entries(categoryMap)) {
    if (productType.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return '613';
}

function cleanCSVField(text: string): string {
  if (!text) return '';
  
  // Remove HTML tags
  let cleaned = text.replace(/<[^>]*>/g, '');
  
  // Escape quotes
  cleaned = cleaned.replace(/"/g, '""');
  
  // Remove newlines and tabs
  cleaned = cleaned.replace(/[\n\r\t]/g, ' ');
  
  // Collapse whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Limit length
  if (cleaned.length > 5000) {
    cleaned = cleaned.substring(0, 4997) + '...';
  }
  
  return cleaned;
}

function getSalePeriod(): string {
  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 30);
  
  return `${now.toISOString()}/${end.toISOString()}`;
}