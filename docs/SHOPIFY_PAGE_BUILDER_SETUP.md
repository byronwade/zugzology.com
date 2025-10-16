# Shopify Dynamic Page Builder - Setup Guide

This guide explains how to configure and use the dynamic page builder system with Shopify metaobjects.

## Overview

The page builder allows you to create beautiful, customizable pages in Shopify that are dynamically rendered by your Next.js storefront. It uses Shopify's metaobjects system to store section configurations.

## Architecture

```
Shopify Dashboard
  ├── Metaobject Definitions (Section types)
  ├── Metaobject Entries (Section instances)
  └── Pages (with metafield references)

Next.js App
  ├── GraphQL queries (fetch page + sections)
  ├── Data parsing (metaobjects → TypeScript)
  └── Dynamic rendering (section components)
```

## Step 1: Create Metaobject Definitions

In your Shopify Admin, go to **Settings → Custom data → Metaobjects**

### Hero Section

**Definition Name:** `hero_section`
**Type:** Metaobject

**Fields:**
- `heading` (Single line text) - Required
- `subheading` (Single line text) - Optional
- `cta_text` (Single line text) - Optional
- `cta_link` (Single line text) - Optional
- `background_image` (File - Image) - Optional
- `layout` (Single line text) - Default: "full-width" (Options: "full-width", "split", "minimal")
- `theme` (Single line text) - Default: "light" (Options: "light", "dark")

**Storefront Access:** ✅ Enable "Storefront API"

### Content Block Section

**Definition Name:** `content_block_section`
**Type:** Metaobject

**Fields:**
- `heading` (Single line text) - Optional
- `content` (Rich text) - Required
- `image` (File - Image) - Optional
- `image_position` (Single line text) - Default: "right" (Options: "left", "right", "top", "bottom")
- `background_color` (Color) - Optional
- `text_align` (Single line text) - Default: "left" (Options: "left", "center", "right")

**Storefront Access:** ✅ Enable "Storefront API"

### Product Carousel Section

**Definition Name:** `product_carousel_section`
**Type:** Metaobject

**Fields:**
- `heading` (Single line text) - Required
- `subheading` (Single line text) - Optional
- `products` (List of product references) - Required
- `cta_text` (Single line text) - Optional
- `cta_link` (Single line text) - Optional
- `show_prices` (True/False) - Default: true

**Storefront Access:** ✅ Enable "Storefront API"

### CTA Banner Section

**Definition Name:** `cta_banner_section`
**Type:** Metaobject

**Fields:**
- `heading` (Single line text) - Required
- `description` (Multi-line text) - Optional
- `cta_text` (Single line text) - Required
- `cta_link` (Single line text) - Required
- `background_image` (File - Image) - Optional
- `theme` (Single line text) - Default: "primary" (Options: "primary", "secondary", "accent")
- `size` (Single line text) - Default: "medium" (Options: "small", "medium", "large")

**Storefront Access:** ✅ Enable "Storefront API"

### Feature Grid Section

**Definition Name:** `feature_grid_section`
**Type:** Metaobject

**Fields:**
- `heading` (Single line text) - Required
- `subheading` (Single line text) - Optional
- `features` (JSON) - Required - Format:
  ```json
  [
    {
      "icon": "sparkles",
      "title": "Feature Title",
      "description": "Feature description"
    }
  ]
  ```
- `columns` (Number) - Default: 3 (Options: 2, 3, 4)

**Storefront Access:** ✅ Enable "Storefront API"

**Available Icons:** `sparkles`, `check`, `shield`, `star`, `zap`, `leaf`

## Step 2: Create Page Metafield Definitions

In **Settings → Custom data → Pages**, create these metafield definitions:

### Sections Metafield

- **Namespace & key:** `custom.sections`
- **Name:** Page Sections
- **Type:** List of metaobject references
- **Validation:** References can include all section types created above
- **Storefront Access:** ✅ Enable

### Layout Metafield

- **Namespace & key:** `custom.layout`
- **Name:** Page Layout
- **Type:** Single line text
- **Validation:** One of: "full-width", "contained", "split"
- **Default:** "contained"
- **Storefront Access:** ✅ Enable

### Theme Metafield

- **Namespace & key:** `custom.theme`
- **Name:** Page Theme
- **Type:** Single line text
- **Validation:** One of: "default", "dark", "accent"
- **Default:** "default"
- **Storefront Access:** ✅ Enable

## Step 3: Create Section Entries (Metaobjects)

Navigate to **Content → Metaobjects** and create entries for each section you want to use.

### Example: Hero Section

1. Click "Add entry" for `hero_section`
2. Fill in the fields:
   - **Heading:** "Grow Better Mushrooms"
   - **Subheading:** "Professional-grade supplies for serious growers"
   - **CTA Text:** "Shop Now"
   - **CTA Link:** "/products"
   - **Layout:** "full-width"
   - **Background Image:** Upload an image
3. Save the entry

### Example: Product Carousel Section

1. Click "Add entry" for `product_carousel_section`
2. Fill in the fields:
   - **Heading:** "Trending Kits & Supplies"
   - **Subheading:** "Hand-selected items customers love"
   - **Products:** Select 4-8 products from your catalog
   - **CTA Text:** "View All Products"
   - **CTA Link:** "/products"
3. Save the entry

## Step 4: Create a Page with Sections

1. Navigate to **Online Store → Pages**
2. Create a new page or edit an existing one
3. Fill in the basic page information (title, content)
4. Scroll to **Metafields** section
5. Configure:
   - **Page Sections:** Select the section entries you created (they will render in order)
   - **Page Layout:** Choose "contained", "full-width", or "split"
   - **Page Theme:** Choose "default", "dark", or "accent"
6. Save the page

## Step 5: Access Your Dynamic Page

Your page will be available at:
```
https://your-domain.com/pages/{page-handle}
```

Example: `https://zugzology.com/pages/about-us`

## Advanced Configuration

### Custom Section Order

Sections render in the order they appear in the "Page Sections" metafield list. Drag and drop to reorder them in the Shopify admin.

### Mixing Section Types

You can mix any combination of section types on a single page:
```
1. Hero Section
2. Content Block Section
3. Product Carousel Section
4. Feature Grid Section
5. CTA Banner Section
```

### Responsive Images

All images uploaded to metaobjects are automatically optimized by Next.js Image component:
- Automatic format selection (WebP, AVIF)
- Responsive sizes
- Lazy loading (except above-fold)
- Shopify CDN delivery

### Performance

- **ISR (Incremental Static Regeneration):** Pages rebuild every 5 minutes
- **Top 100 pages prerendered** at build time
- **On-demand revalidation:** Use `revalidateTag('page:handle')` to force updates
- **React Server Components:** All data fetching happens server-side

## Section Component Reference

### Hero Section Layouts

**Full-width:** Large hero with overlay text (80vh)
**Split:** Two-column layout with image on one side (60vh)
**Minimal:** Compact hero with centered content (py-20)

### Content Block Image Positions

**Left:** Image on left, content on right (desktop)
**Right:** Image on right, content on left (desktop)
**Top:** Image above content (stacked)
**Bottom:** Image below content (stacked)

### CTA Banner Themes

**Primary:** Uses primary brand color
**Secondary:** Uses secondary brand color
**Accent:** Uses accent color

### Feature Grid Columns

**2 columns:** Best for detailed features with longer descriptions
**3 columns:** Balanced layout for most use cases
**4 columns:** Compact grid for simple icon features

## Troubleshooting

### Section Not Appearing

1. Verify metaobject definition has "Storefront API" enabled
2. Check that page metafield includes the section reference
3. Clear Next.js cache: `npm run build`
4. Check console for GraphQL errors

### Images Not Loading

1. Ensure images are uploaded to Shopify (not external URLs)
2. Verify image metafield type is "File - Image"
3. Check `next.config.ts` includes Shopify domain in `remotePatterns`

### Section Renders as "Not Implemented"

This means the section type doesn't have a corresponding component yet. Available types:
- `hero` ✅
- `content` ✅
- `products` ✅
- `cta` ✅
- `features` ✅
- `testimonials` ⏳ (coming soon)
- `gallery` ⏳ (coming soon)
- `video` ⏳ (coming soon)

## Extending the System

### Adding New Section Types

1. **Create TypeScript type** in `src/lib/types.ts`:
   ```typescript
   export type MySectionSettings = {
     title: string;
     // ... other fields
   };
   ```

2. **Add to PageSection union** in `src/lib/types.ts`:
   ```typescript
   export type PageSection = {
     // ...
     settings: ... | MySectionSettings | ...;
   };
   ```

3. **Create component** in `src/components/features/pages/sections/`:
   ```typescript
   export function MySection({ settings, layout, theme }) {
     // Component implementation
   }
   ```

4. **Register in SectionRenderer** (`section-renderer.tsx`):
   ```typescript
   case "my-section":
     return <MySection settings={settings} ... />;
   ```

5. **Create metaobject definition** in Shopify with type `my_section`

## Best Practices

### Performance

- ✅ Use Shopify-hosted images (not external URLs)
- ✅ Limit product carousels to 8-12 products
- ✅ Keep page sections under 10 per page
- ✅ Use appropriate image sizes (hero: 1920px, features: 800px)

### Content

- ✅ Write clear, concise headings (under 60 characters)
- ✅ Use subheadings to provide context
- ✅ Include strong CTAs on hero and banner sections
- ✅ Alt text for all images

### SEO

- ✅ Set page title and description in Shopify page settings
- ✅ Use proper heading hierarchy (h1 → h2 → h3)
- ✅ Include keywords in first content block
- ✅ Add internal links to products/collections

## Support

For issues or questions:
- Check console for error messages
- Verify Shopify API credentials in `.env.local`
- Review GraphQL query responses in Network tab
- Consult Next.js 16 documentation for App Router patterns

---

**System Version:** 1.0.0
**Last Updated:** 2025-10-15
**Requires:** Next.js 16+, Shopify Storefront API 2024-01+
