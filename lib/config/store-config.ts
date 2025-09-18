/**
 * Store Configuration System
 * 
 * This file defines the configuration structure for any Shopify store using this template.
 * All hardcoded values should be replaced with data from this configuration or Shopify API.
 */

export interface StoreConfig {
  // Basic store information (from Shopify API)
  storeName: string;
  storeDescription: string;
  storeDomain: string;
  currency: {
    code: string;
    symbol: string;
  };
  
  // Branding (from Shopify settings or admin panel)
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
  
  // Contact information
  contact: {
    supportEmail: string;
    salesEmail: string;
    phone: string;
  };
  
  // Social media links
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    pinterest?: string;
    linkedin?: string;
  };
  
  // Business address
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  
  // Business info
  founder?: {
    name: string;
  };
  foundingDate?: string;
  slogan?: string;
  
  // Navigation (from Shopify menus or admin panel)
  navigation: {
    mainMenu: string; // Shopify menu handle
    footerMenu: string; // Shopify menu handle
    affiliateLinks?: AffiliateLink[];
  };
  
  // Features (configurable via admin panel)
  features: {
    showPromos: boolean;
    enableSearch: boolean;
    enableWishlist: boolean;
    enableReviews: boolean;
    enableBlog: boolean;
    enableCollections: boolean;
  };
  
  // SEO (from Shopify settings or admin panel)
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
    ogImage?: string;
    twitterHandle?: string;
  };
  
  // Layout templates (for admin panel selection)
  templates: {
    homepage: 'default' | 'minimal' | 'featured' | 'grid';
    productPage: 'standard' | 'sidebar' | 'gallery';
    collectionPage: 'grid' | 'list' | 'masonry';
  };
  
  // Promotional content (admin configurable)
  promotions?: {
    bannerText?: string;
    bannerLink?: string;
    discountPercentage?: number;
    expiryDate?: string;
  };
}

export interface AffiliateLink {
  name: string;
  url: string;
  description?: string;
}

/**
 * Default configuration - uses environment variables and Shopify API data
 */
export const getDefaultStoreConfig = (): Partial<StoreConfig> => ({
  storeName: process.env.SHOPIFY_STORE_NAME || 'Your Store',
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN || 'your-store.myshopify.com',
  currency: {
    code: process.env.SHOPIFY_CURRENCY_CODE || 'USD',
    symbol: process.env.SHOPIFY_CURRENCY_SYMBOL || '$',
  },
  branding: {
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#7c3aed',
    secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#06b6d4',
  },
  navigation: {
    mainMenu: process.env.SHOPIFY_MAIN_MENU_HANDLE || 'main-menu',
    footerMenu: process.env.SHOPIFY_FOOTER_MENU_HANDLE || 'footer',
  },
  features: {
    showPromos: process.env.NEXT_PUBLIC_ENABLE_PROMOS !== 'false',
    enableSearch: process.env.NEXT_PUBLIC_ENABLE_SEARCH !== 'false',
    enableWishlist: process.env.NEXT_PUBLIC_ENABLE_WISHLIST !== 'false',
    enableReviews: process.env.NEXT_PUBLIC_ENABLE_REVIEWS !== 'false',
    enableBlog: process.env.NEXT_PUBLIC_ENABLE_BLOG !== 'false',
    enableCollections: process.env.NEXT_PUBLIC_ENABLE_COLLECTIONS !== 'false',
  },
  templates: {
    homepage: (process.env.NEXT_PUBLIC_HOMEPAGE_TEMPLATE as any) || 'default',
    productPage: (process.env.NEXT_PUBLIC_PRODUCT_TEMPLATE as any) || 'standard',
    collectionPage: (process.env.NEXT_PUBLIC_COLLECTION_TEMPLATE as any) || 'grid',
  },
});

/**
 * Store configuration context - will be populated from Shopify API and admin settings
 */
let storeConfig: StoreConfig | null = null;

export const setStoreConfig = (config: StoreConfig) => {
  storeConfig = config;
};

export const getStoreConfig = (): StoreConfig => {
  if (!storeConfig) {
    throw new Error('Store configuration not initialized. Call setStoreConfig() first.');
  }
  return storeConfig;
};

/**
 * Get store configuration with fallbacks
 */
export const getStoreConfigSafe = (): StoreConfig => {
  const defaultConfig = getDefaultStoreConfig();
  const storeName = storeConfig?.storeName || defaultConfig.storeName || 'Your Store';
  
  return {
    storeName,
    storeDescription: storeConfig?.storeDescription || defaultConfig.storeDescription || 'Welcome to our store',
    storeDomain: storeConfig?.storeDomain || defaultConfig.storeDomain || 'your-store.myshopify.com',
    currency: storeConfig?.currency || defaultConfig.currency || { code: 'USD', symbol: '$' },
    branding: { ...defaultConfig.branding, ...storeConfig?.branding },
    contact: storeConfig?.contact || {
      supportEmail: 'support@' + (storeConfig?.storeDomain || defaultConfig.storeDomain || 'example.com').replace(/^https?:\/\//, ''),
      salesEmail: 'sales@' + (storeConfig?.storeDomain || defaultConfig.storeDomain || 'example.com').replace(/^https?:\/\//, ''),
      phone: '1-800-555-0100',
    },
    social: storeConfig?.social || {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      pinterest: '',
      linkedin: '',
    },
    address: storeConfig?.address || {
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
    },
    founder: storeConfig?.founder || {
      name: 'Founder',
    },
    foundingDate: storeConfig?.foundingDate || '2020',
    slogan: storeConfig?.slogan || 'Premium Quality Products',
    navigation: { ...defaultConfig.navigation, ...storeConfig?.navigation },
    features: { ...defaultConfig.features, ...storeConfig?.features },
    seo: {
      defaultTitle: storeConfig?.seo?.defaultTitle || `${storeName} - Online Store`,
      defaultDescription: storeConfig?.seo?.defaultDescription || 'Shop our amazing products',
      keywords: storeConfig?.seo?.keywords || [],
      ogImage: storeConfig?.seo?.ogImage,
      twitterHandle: storeConfig?.seo?.twitterHandle,
    },
    templates: { ...defaultConfig.templates, ...storeConfig?.templates },
    promotions: storeConfig?.promotions,
  } as StoreConfig;
};