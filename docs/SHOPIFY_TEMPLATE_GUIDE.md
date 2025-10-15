# Universal Shopify Template - Complete Guide

## 🎯 Overview

This is a **universal Shopify template** that works with **ANY Shopify store** out of the box. Simply connect your store's API credentials and you're ready to go! No hardcoded values, no store-specific customizations needed.

## ✨ Key Features

### 🔌 **Plug & Play**
- **Zero hardcoded values** - everything is dynamically loaded from your Shopify store
- **Auto-detection** of store name, currency, branding, and content
- **Universal compatibility** with any Shopify store or plan

### 🎨 **Dynamic Branding**
- Automatically uses your store's brand colors and logo
- Responsive design that adapts to your content
- Multiple template layouts to choose from

### ⚡ **Performance Optimized**
- Built with Next.js 15 and React 19
- Optimized search with real-time results
- Image optimization and lazy loading
- Efficient caching strategies

### 🛍️ **Complete E-commerce**
- Product browsing and search
- Shopping cart and wishlist
- Collection pages
- Blog integration
- User authentication (optional)

## 🚀 Quick Start

### 1. **Clone and Install**
```bash
git clone [repository-url]
cd shopify-template
npm install
```

### 2. **Configure Your Store**
Copy the environment template:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your store details:
```env
# REQUIRED: Your Shopify store domain
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com

# REQUIRED: Your Storefront API token
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token
```

### 3. **Get Your Shopify API Token**
1. Go to your Shopify Admin
2. Navigate to **Apps > App and sales channel settings**
3. Click **Develop apps**
4. Create a new app or select existing
5. Configure **Storefront API access** with these scopes:
   ```
   unauthenticated_read_product_listings
   unauthenticated_read_product_inventory
   unauthenticated_read_collections
   unauthenticated_read_content
   ```
6. Generate and copy your **Storefront access token**

### 4. **Launch Your Store**
```bash
npm run dev
```

Visit `http://localhost:3000` - your store is now live! 🎉

## 📁 Project Structure

```
shopify-template/
├── app/                          # Next.js App Router
│   ├── (products)/              # Product-related pages
│   ├── (content)/               # Blog and content pages
│   ├── (account)/               # User account pages
│   └── layout.tsx               # Root layout
├── components/
│   ├── features/                # Feature-based components
│   │   ├── products/           # Product components
│   │   ├── search/             # Search functionality
│   │   ├── cart/               # Shopping cart
│   │   ├── auth/               # Authentication
│   │   └── blog/               # Blog components
│   ├── layout/                 # Layout components
│   └── ui/                     # Reusable UI components
├── lib/
│   ├── config/                 # Store configuration
│   ├── api/                    # Shopify API integration
│   └── utils/                  # Utility functions
└── hooks/                      # Custom React hooks
```

## 🎛️ Configuration Options

### **Template Selection**
Choose different layouts for your pages:

```env
# Homepage templates: default, minimal, featured, grid
NEXT_PUBLIC_HOMEPAGE_TEMPLATE=default

# Product page templates: standard, sidebar, gallery
NEXT_PUBLIC_PRODUCT_TEMPLATE=standard

# Collection page templates: grid, list, masonry
NEXT_PUBLIC_COLLECTION_TEMPLATE=grid
```

### **Feature Flags**
Enable or disable specific features:

```env
NEXT_PUBLIC_ENABLE_SEARCH=true      # Search functionality
NEXT_PUBLIC_ENABLE_WISHLIST=true    # Wishlist feature
NEXT_PUBLIC_ENABLE_BLOG=true        # Blog integration
NEXT_PUBLIC_ENABLE_REVIEWS=true     # Product reviews
NEXT_PUBLIC_ENABLE_PROMOS=true      # Promotional banners
```

### **Brand Customization**
Override auto-detected settings:

```env
# Colors (hex format)
NEXT_PUBLIC_PRIMARY_COLOR=#7c3aed
NEXT_PUBLIC_SECONDARY_COLOR=#06b6d4

# Store information
SHOPIFY_STORE_NAME="Your Store Name"
SHOPIFY_CURRENCY_CODE=USD
```

## 🎨 Advanced Customization

### **Shopify Metafields**
Configure advanced features using Shopify metafields:

#### **Template Configuration**
Namespace: `template_config`

- `homepage_template`: Choose homepage layout
- `product_template`: Choose product page layout
- `collection_template`: Choose collection page layout

#### **Promotional Settings**
Namespace: `template_config`
Key: `promotions`
Value (JSON):
```json
{
  "bannerText": "Special Sale",
  "bannerLink": "/collections/sale",
  "discountPercentage": 20,
  "expiryDate": "2024-12-31"
}
```

#### **Feature Configuration**
Namespace: `template_config`
Key: `features`
Value (JSON):
```json
{
  "showPromos": true,
  "enableSearch": true,
  "enableWishlist": true,
  "enableReviews": true,
  "enableBlog": true,
  "enableCollections": true
}
```

#### **Affiliate Links**
Namespace: `template_config`
Key: `affiliate_links`
Value (JSON):
```json
[
  {
    "name": "Partner Store",
    "url": "https://partner.com",
    "description": "Our partner store"
  }
]
```

### **SEO Settings**
Namespace: `template_config`
Key: `seo_settings`
Value (JSON):
```json
{
  "defaultTitle": "Your Store - Online Shopping",
  "defaultDescription": "Shop our amazing products",
  "keywords": ["keyword1", "keyword2"],
  "twitterHandle": "@yourstore"
}
```

## 🔌 API Integration

### **Shopify Storefront API**
The template uses Shopify's Storefront API for:
- Product data and inventory
- Collection information
- Blog posts and articles
- Store settings and branding

### **Auto-Detection Features**
The template automatically detects and uses:
- **Store Name**: From Shopify shop settings
- **Currency**: From Shopify store configuration
- **Brand Colors**: From Shopify brand settings
- **Logo**: From Shopify brand assets
- **Navigation Menus**: From Shopify menu configuration

### **Real-time Updates**
When you update your Shopify store:
- Product changes appear immediately
- New collections are automatically available
- Blog posts are instantly accessible
- Branding updates reflect automatically

## 🎯 Admin Panel Integration

### **Preparing for Admin Panel**
The template is designed to support a future admin panel with:

#### **Template Management**
- Visual template selection
- Live preview of changes
- Drag-and-drop page builders

#### **Branding Control**
- Color picker for brand colors
- Logo upload and management
- Typography selection

#### **Feature Toggles**
- Enable/disable features with switches
- Configure promotional campaigns
- Manage affiliate links

#### **SEO Configuration**
- Meta tag management
- Structured data configuration
- Social media integration

### **Shopify App Integration**
To enable admin panel features:

1. **Create Shopify App**
   - Set up a Shopify app for your store
   - Configure Admin API permissions
   - Enable metafield access

2. **Authentication Setup**
   - Implement Shopify OAuth
   - Store configuration in metafields
   - Real-time synchronization

3. **Admin Interface**
   - Build admin panel with template controls
   - Connect to Shopify Admin API
   - Update metafields for configuration

## 🔧 Development

### **Local Development**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### **Environment Variables**
See `.env.example` for all available configuration options.

### **Adding Features**
1. **Create Feature Components**
   - Add to `components/features/[feature-name]/`
   - Include TypeScript interfaces
   - Add to feature index exports

2. **Update Configuration**
   - Add feature flags to store config
   - Update environment variables
   - Add metafield definitions

3. **Test Compatibility**
   - Test with multiple Shopify stores
   - Verify responsive behavior
   - Check performance impact

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### **Other Platforms**
The template works on any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean
- AWS
- Google Cloud

### **Production Checklist**
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your domain
- [ ] Configure all required environment variables
- [ ] Test with your Shopify store
- [ ] Set up analytics (optional)
- [ ] Configure custom domain
- [ ] Enable HTTPS

## 🤝 Contributing

### **Template Philosophy**
- **Universal compatibility**: Works with ANY Shopify store
- **Zero hardcoding**: All data from Shopify API or config
- **Performance first**: Optimized for speed and UX
- **Developer friendly**: Well-documented and maintainable

### **Contribution Guidelines**
1. Test with multiple Shopify stores
2. Avoid store-specific code
3. Use TypeScript throughout
4. Document all configuration options
5. Maintain backward compatibility

## 📞 Support

### **Getting Help**
- Check this documentation first
- Review environment variable configuration
- Test Shopify API connectivity
- Verify store permissions

### **Common Issues**
- **"Store not found"**: Check `SHOPIFY_STORE_DOMAIN`
- **"Invalid token"**: Verify `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- **Missing products**: Check API permissions
- **Styling issues**: Verify brand color configuration

## 📄 License

This template is open source and available under the MIT License.

---

**Ready to launch your Shopify store? Start with the Quick Start guide above! 🚀**