/**
 * Dynamic Metadata Generator
 * 
 * Generates page metadata using store configuration instead of hardcoded values.
 * Works with any Shopify store and respects their branding and SEO settings.
 */

import { type Metadata } from 'next';
import { getStoreConfigSafe } from './store-config';
import type { ShopifyProduct, ShopifyBlogArticle, ShopifyCollection } from '@/lib/types';

/**
 * Generate metadata for the homepage
 */
export function generateHomeMetadata(): Metadata {
  const config = getStoreConfigSafe();
  
  return {
    title: config.seo.defaultTitle,
    description: config.seo.defaultDescription,
    keywords: config.seo.keywords,
    openGraph: {
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
      url: `https://${config.storeDomain}`,
      siteName: config.storeName,
      images: config.seo.ogImage ? [
        {
          url: config.seo.ogImage,
          width: 1200,
          height: 630,
          alt: config.storeName,
        }
      ] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
      creator: config.seo.twitterHandle,
      images: config.seo.ogImage ? [config.seo.ogImage] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Generate metadata for product pages
 */
export function generateProductMetadata(product: ShopifyProduct): Metadata {
  const config = getStoreConfigSafe();
  const price = product.priceRange.minVariantPrice.amount;
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: config.currency.code,
  }).format(parseFloat(price));
  
  const title = `${product.title} | ${config.storeName}`;
  const description = product.description 
    ? `${product.description.substring(0, 150)}... Available for ${formattedPrice} at ${config.storeName}.`
    : `Shop ${product.title} for ${formattedPrice} at ${config.storeName}. ${config.storeDescription}`;
  
  return {
    title,
    description,
    keywords: [
      product.title,
      product.productType || '',
      product.vendor || '',
      ...(product.tags || []),
      config.storeName,
      ...config.seo.keywords,
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url: `https://${config.storeDomain}/products/${product.handle}`,
      siteName: config.storeName,
      images: product.images?.nodes?.length ? [
        {
          url: product.images.nodes[0].url,
          width: 1200,
          height: 1200,
          alt: product.images.nodes[0].altText || product.title,
        }
      ] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: config.seo.twitterHandle,
      images: product.images?.nodes?.length ? [product.images.nodes[0].url] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Generate metadata for collection pages
 */
export function generateCollectionMetadata(collection: ShopifyCollection): Metadata {
  const config = getStoreConfigSafe();
  
  const title = `${collection.title} | ${config.storeName}`;
  const description = collection.description 
    ? `${collection.description.substring(0, 150)}... Shop the ${collection.title} collection at ${config.storeName}.`
    : `Browse our ${collection.title} collection at ${config.storeName}. ${config.storeDescription}`;
  
  return {
    title,
    description,
    keywords: [
      collection.title,
      'collection',
      config.storeName,
      ...config.seo.keywords,
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url: `https://${config.storeDomain}/collections/${collection.handle}`,
      siteName: config.storeName,
      images: collection.image ? [
        {
          url: collection.image.url,
          width: 1200,
          height: 630,
          alt: collection.image.altText || collection.title,
        }
      ] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: config.seo.twitterHandle,
      images: collection.image ? [collection.image.url] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Generate metadata for blog posts
 */
export function generateBlogMetadata(post: ShopifyBlogArticle): Metadata {
  const config = getStoreConfigSafe();
  
  const title = `${post.title} | ${config.storeName} Blog`;
  const description = post.summary || post.excerpt 
    ? (post.summary || post.excerpt).substring(0, 150) + '...'
    : `Read about ${post.title} on the ${config.storeName} blog.`;
  
  return {
    title,
    description,
    keywords: [
      post.title,
      ...(post.tags || []),
      'blog',
      config.storeName,
      ...config.seo.keywords,
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url: `https://${config.storeDomain}/blogs/${post.blog?.handle || 'blog'}/${post.handle}`,
      siteName: config.storeName,
      images: post.image ? [
        {
          url: post.image.url,
          width: 1200,
          height: 630,
          alt: post.image.altText || post.title,
        }
      ] : [],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: post.authorV2?.displayName ? [post.authorV2.displayName] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: config.seo.twitterHandle,
      images: post.image ? [post.image.url] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Generate metadata for search pages
 */
export function generateSearchMetadata(query?: string): Metadata {
  const config = getStoreConfigSafe();
  
  const title = query 
    ? `Search results for "${query}" | ${config.storeName}`
    : `Search Products | ${config.storeName}`;
  
  const description = query
    ? `Browse search results for "${query}" at ${config.storeName}. ${config.storeDescription}`
    : `Search our products at ${config.storeName}. ${config.storeDescription}`;
  
  return {
    title,
    description,
    keywords: [
      query || 'search',
      'products',
      config.storeName,
      ...config.seo.keywords,
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url: query 
        ? `https://${config.storeDomain}/search?q=${encodeURIComponent(query)}`
        : `https://${config.storeDomain}/search`,
      siteName: config.storeName,
      images: config.seo.ogImage ? [
        {
          url: config.seo.ogImage,
          width: 1200,
          height: 630,
          alt: config.storeName,
        }
      ] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: config.seo.twitterHandle,
      images: config.seo.ogImage ? [config.seo.ogImage] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Generate structured data for store
 */
export function generateStoreStructuredData() {
  const config = getStoreConfigSafe();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: config.storeName,
    description: config.storeDescription,
    url: `https://${config.storeDomain}`,
    logo: config.branding.logoUrl,
    image: config.seo.ogImage,
    currenciesAccepted: config.currency.code,
    paymentAccepted: 'Credit Card, PayPal, Shop Pay',
    priceRange: '$',
  };
}