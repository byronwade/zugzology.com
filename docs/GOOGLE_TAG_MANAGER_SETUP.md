# Google Tag Manager Setup Guide

This guide explains how to set up and use Google Tag Manager (GTM) in your Zugzology e-commerce store.

## Prerequisites

1. **Google Tag Manager Account** - Create one at [tagmanager.google.com](https://tagmanager.google.com)
2. **Google Analytics 4 Property** - Create one at [analytics.google.com](https://analytics.google.com)

---

## Step 1: Install GTM in Your Application

### 1.1 Add GTM ID to Environment Variables

Add to your `.env.local` file:

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GTM_ENABLED=true  # Optional: enables GTM in development
```

### 1.2 Add GTM Component to Root Layout

Update `src/app/layout.tsx`:

```tsx
import { GoogleTagManager } from "@/components/analytics/google-tag-manager";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Add GTM Component */}
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID!} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

---

## Step 2: Configure Google Tag Manager

### 2.1 Create GA4 Configuration Tag

1. Go to your GTM container
2. Click **Tags** → **New**
3. Tag Configuration: **Google Analytics: GA4 Configuration**
4. Measurement ID: Your GA4 Measurement ID (G-XXXXXXXXXX)
5. Trigger: **All Pages**
6. Save and name it "GA4 - Config"

### 2.2 Create Enhanced Ecommerce Tags

#### View Item Event (Product Page Views)

**Tag Configuration:**
- Tag Type: **Google Analytics: GA4 Event**
- Configuration Tag: Select your GA4 Config tag
- Event Name: `view_item`
- Event Parameters:
  - `items`: `{{Ecommerce - Items}}`
  - `currency`: `{{Ecommerce - Currency}}`
  - `value`: `{{Ecommerce - Value}}`

**Trigger:**
- Type: **Custom Event**
- Event Name: `view_item`

#### Add to Cart Event

**Tag Configuration:**
- Tag Type: **Google Analytics: GA4 Event**
- Event Name: `add_to_cart`
- Event Parameters:
  - `items`: `{{Ecommerce - Items}}`
  - `currency`: `{{Ecommerce - Currency}}`
  - `value`: `{{Ecommerce - Value}}`

**Trigger:**
- Type: **Custom Event**
- Event Name: `add_to_cart`

#### Begin Checkout Event

**Tag Configuration:**
- Tag Type: **Google Analytics: GA4 Event**
- Event Name: `begin_checkout`
- Event Parameters:
  - `items`: `{{Ecommerce - Items}}`
  - `currency`: `{{Ecommerce - Currency}}`
  - `value`: `{{Ecommerce - Value}}`

**Trigger:**
- Type: **Custom Event**
- Event Name: `begin_checkout`

#### Purchase Event

**Tag Configuration:**
- Tag Type: **Google Analytics: GA4 Event**
- Event Name: `purchase`
- Event Parameters:
  - `transaction_id`: `{{Ecommerce - Transaction ID}}`
  - `value`: `{{Ecommerce - Value}}`
  - `currency`: `{{Ecommerce - Currency}}`
  - `tax`: `{{Ecommerce - Tax}}`
  - `shipping`: `{{Ecommerce - Shipping}}`
  - `items`: `{{Ecommerce - Items}}`

**Trigger:**
- Type: **Custom Event**
- Event Name: `purchase`

---

## Step 3: Use GTM in Your Code

### 3.1 Track Product Views

In your product page component:

```tsx
import { gtmEcommerce } from "@/components/analytics/google-tag-manager";
import { useEffect } from "react";

export function ProductPage({ product }: { product: Product }) {
  useEffect(() => {
    gtmEcommerce.viewItem({
      item_id: product.id,
      item_name: product.title,
      price: parseFloat(product.priceRange.minVariantPrice.amount),
      currency: product.priceRange.minVariantPrice.currencyCode,
      item_category: product.productType,
      item_brand: product.vendor,
    });
  }, [product]);

  return <div>{/* Your product UI */}</div>;
}
```

### 3.2 Track Add to Cart

In your add to cart button:

```tsx
import { gtmEcommerce } from "@/components/analytics/google-tag-manager";

function AddToCartButton({ product, quantity }: AddToCartButtonProps) {
  const handleAddToCart = () => {
    // Add to cart logic

    // Track with GTM
    gtmEcommerce.addToCart({
      item_id: product.id,
      item_name: product.title,
      price: parseFloat(product.price.amount),
      currency: product.price.currencyCode,
      quantity,
      item_category: product.productType,
      item_brand: product.vendor,
    });
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

### 3.3 Track Search

In your search component:

```tsx
import { gtmInteraction } from "@/components/analytics/google-tag-manager";

function SearchBar() {
  const handleSearch = (query: string, resultsCount: number) => {
    gtmInteraction.search(query, resultsCount);
  };

  return <input onChange={(e) => handleSearch(e.target.value, 10)} />;
}
```

### 3.4 Track Newsletter Signup

```tsx
import { gtmInteraction } from "@/components/analytics/google-tag-manager";

function NewsletterForm() {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Submit logic

    // Track signup
    gtmInteraction.newsletterSignup("footer_form");
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

---

## Step 4: Set Up Additional Tracking

### 4.1 Facebook Pixel

1. In GTM, create a new tag
2. Tag Type: **Custom HTML**
3. HTML:
```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
```
4. Trigger: **All Pages**

### 4.2 Pinterest Tag

1. Create a new tag in GTM
2. Tag Type: **Custom HTML**
3. HTML:
```html
<script>
!function(e){if(!window.pintrk){window.pintrk = function () {
window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
  n=window.pintrk;n.queue=[],n.version="3.0";var
  t=document.createElement("script");t.async=!0,t.src=e;var
  r=document.getElementsByTagName("script")[0];
  r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
pintrk('load', 'YOUR_TAG_ID');
pintrk('page');
</script>
```
4. Trigger: **All Pages**

---

## Step 5: Testing

### 5.1 Use GTM Preview Mode

1. In GTM, click **Preview**
2. Enter your website URL
3. Browse your site and verify events fire correctly

### 5.2 Use Google Tag Assistant

Install the [Google Tag Assistant Chrome Extension](https://chrome.google.com/webstore/detail/tag-assistant-companion/jmekfmbnaedfebfnmakmokmlfpblbfdm)

### 5.3 Check GA4 Real-Time Reports

1. Go to your GA4 property
2. Click **Reports** → **Realtime**
3. Browse your site and verify events appear

---

## Step 6: Publish Your Container

1. In GTM, click **Submit**
2. Add version name and description
3. Click **Publish**

---

## Common Event Tracking Examples

### Track Outbound Links

```typescript
import { gtmEvent } from "@/components/analytics/google-tag-manager";

<a
  href="https://external-site.com"
  onClick={() => gtmEvent("outbound_click", {
    destination: "https://external-site.com"
  })}
>
  External Link
</a>
```

### Track Video Views

```typescript
import { gtmInteraction } from "@/components/analytics/google-tag-manager";

const handleVideoProgress = (percent: number) => {
  gtmInteraction.videoProgress("Product Demo Video", percent);
};
```

### Track Custom Events

```typescript
import { gtmEvent } from "@/components/analytics/google-tag-manager";

// Track when user views size guide
gtmEvent("view_size_guide", {
  product_id: product.id,
  product_name: product.title,
});

// Track when user applies coupon
gtmEvent("apply_coupon", {
  coupon_code: "SUMMER2025",
  discount_amount: 15,
});
```

---

## Best Practices

1. **Use Descriptive Event Names** - Make events clear and consistent
2. **Include Context** - Add relevant parameters to understand user behavior
3. **Test Before Publishing** - Always use Preview mode
4. **Document Your Events** - Keep a list of all events and their parameters
5. **Use Data Layer** - Push events to dataLayer, don't hardcode GA calls
6. **Monitor Performance** - Check GTM's impact on page load time
7. **Version Control** - Name and describe all GTM container versions

---

## Troubleshooting

### GTM Not Loading

- Check environment variable is set correctly
- Verify GTM ID format (should be `GTM-XXXXXXX`)
- Check browser console for errors
- Ensure ad blockers are disabled during testing

### Events Not Firing

- Use GTM Preview mode to debug
- Check event names match exactly
- Verify triggers are configured correctly
- Check dataLayer in browser console: `console.log(window.dataLayer)`

### Data Not Appearing in GA4

- Wait 24-48 hours for data processing
- Check Real-Time reports for immediate verification
- Verify GA4 Measurement ID is correct in GTM
- Ensure GA4 Configuration tag is firing on all pages

---

## Environment Variables Reference

```env
# Required
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Optional
NEXT_PUBLIC_GTM_ENABLED=true  # Enable in development
```

---

## Resources

- [Google Tag Manager Documentation](https://developers.google.com/tag-platform/tag-manager)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Enhanced Ecommerce Implementation Guide](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [GTM Best Practices](https://developers.google.com/tag-platform/tag-manager/best-practices)
