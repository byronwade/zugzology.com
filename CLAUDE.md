# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

**Development:**
```bash
npm run dev              # Start dev server on port 3000 with Turbopack
npm run dev:legacy       # Start dev server without Turbopack
npm run dev:node         # Start on port 3003 (alternative)
npm run scan             # Launch with react-scan for performance analysis
```

**Build & Quality:**
```bash
npm run build            # Production build with Turbopack
npm run build:legacy     # Production build without Turbopack
npm run build:analyze    # Build with bundle analyzer (ANALYZE=true)
npm run start            # Start production server
npm run lint             # Check code quality with Biome
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Biome
npm run type-check       # TypeScript validation (no emit)
npm run clean            # Clean .next and cache directories
npm run knip             # Check for unused code and dependencies
npm run knip:fix         # Auto-fix unused code issues
```

## Architecture Overview

This is a **Next.js 16 e-commerce storefront** for Zugzology, a premium mushroom growing supplies store. The application is deeply integrated with **Shopify's Storefront API (2024-01)** and **Customer Account OAuth flow**.

### Technology Stack

- **Next.js 16.0.6** (stable) with App Router, Turbopack, React Compiler, and Partial Prerendering (cacheComponents)
- **React 19.2** with Server Components as the default rendering strategy
- **TypeScript 5.9** with strict mode and comprehensive type safety
- **Tailwind CSS** + **shadcn/ui** component system built on Radix UI primitives
- **Biome** (via Ultracite preset) for linting and formatting
- **Knip** for detecting unused code and dependencies
- **Shopify Storefront API 2024-01** for product, collection, and cart data
- **NextAuth** with custom Shopify Customer Account provider for authentication

### Critical Environment Variables

All Shopify-related variables must be set for the application to function:

**Required for Basic Operation:**
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` - Your Shopify store domain (e.g., `your-store.myshopify.com`)
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Storefront API token with product/cart scopes

**Required for Authentication:**
- `SHOPIFY_SHOP_ID` - Numeric shop ID for Customer Account OAuth URLs
- `SHOPIFY_CLIENT_ID` - Customer Account public client ID (with or without `shp_` prefix)
- `SHOPIFY_CLIENT_SECRET` - Customer Account confidential secret
- `NEXTAUTH_URL` - Base URL for NextAuth callbacks (e.g., `https://your-domain.com`)
- `NEXT_PUBLIC_NEXTAUTH_URL` - Client-side mirror of NEXTAUTH_URL
- `NEXT_PUBLIC_APP_URL` - Used by API routes for redirects after login/logout
- `NEXTAUTH_SECRET` - Required in production for signing cookies/tokens

**OAuth Callback URL:**
The Shopify app configuration must include the exact callback URL: `https://<your-domain>/api/auth/callback/shopify`

See `.env.example` for the complete list of optional configuration variables (analytics, theme colors, contact info, etc.).

## Project Structure

```
/src
  /app                           # Next.js 16 App Router
    /(account)                   # Protected account routes (route group)
      /account/[number]/         # Order details pages
      /account/orders/           # Order history
    /(content)                   # Public content (route group)
      /blogs/[blog]/[slug]/      # Blog post pages
      /blogs/[blog]/             # Blog listing
      /pages/[handle]/           # Dynamic Shopify pages with metaobject sections
    /(products)                  # E-commerce routes (route group)
      /cart/                     # Shopping cart
      /collections/[handle]/     # Collection pages
      /products/[handle]/        # Product detail pages
      /search/                   # Search results
      /wishlist/                 # User wishlist
    /api                         # API routes
      /auth/                     # NextAuth routes
      /cart/                     # Cart operations
      /products/                 # Product data endpoints
      /trustoo/[...path]/        # Trustoo reviews proxy
    /error/                      # Error page
    /help/                       # Help page
    /login/                      # Login page
    /register/                   # Registration page
    layout.tsx                   # Root layout with providers
    page.tsx                     # Homepage

  /auth
    /providers/shopify.ts        # Custom Shopify OAuth provider

  /components
    /features/                   # Feature-specific components
      /auth/                     # Authentication UI
      /blog/                     # Blog components
      /cart/                     # Cart UI
      /products/                 # Product components
        /sections/               # Product page sections pattern
      /search/                   # Search functionality
    /layout/                     # Layout components
      /header/                   # Header with navigation
      /footer/                   # Footer
    /providers/                  # React context providers
      compound-provider.tsx      # Combines all providers
      auth-provider.tsx
      cart-provider.tsx
      search-provider.tsx
      wishlist-provider.tsx
    /sections/                   # Page sections (hero, featured, etc.)
    /ui/                         # shadcn/ui primitives
    /utilities/                  # Shared utility components

  /hooks                         # Custom React hooks

  /lib
    /actions/                    # Server Actions
      /shopify/                  # Shopify mutations
      /search.ts                 # Search actions
    /api/shopify/                # Shopify integration layer
      client.ts                  # GraphQL fetch function
      actions.ts                 # Server-side Shopify operations
      cache-config.ts            # Caching strategies
      fragments.ts               # Reusable GraphQL fragments
      types.ts                   # Shopify type definitions
      /queries/                  # GraphQL queries
        product.ts
        collection.ts
        header.ts
        page.ts                  # Page queries for dynamic pages
      page-actions.ts            # Page data fetchers with metaobject parsing
    /auth/                       # Authentication utilities
    /config/                     # App configuration
    /utils/                      # General utilities
    constants.ts                 # Environment variable exports

  /types                         # TypeScript type definitions

/auth.ts                         # NextAuth configuration
/proxy.ts                        # Auth protection and security headers (Next.js 16 proxy pattern)
/next.config.ts                  # Next.js configuration
/tailwind.config.ts              # Tailwind configuration
/biome.jsonc                     # Biome linting/formatting config
/tsconfig.json                   # TypeScript configuration
```

## Key Architecture Patterns

### 1. Data Fetching Strategy

**Server Components (Default):**
Server Components fetch data directly using the `shopifyFetch()` function from `lib/api/shopify/client.ts`:

```typescript
import { shopifyFetch } from "@/lib/api/shopify/client";
import { PRODUCT_QUERY } from "@/lib/api/shopify/queries/product";

export default async function ProductPage({ params }) {
  const { handle } = await params;
  const { data } = await shopifyFetch({
    query: PRODUCT_QUERY,
    variables: { handle },
    tags: [`product:${handle}`],
    next: { revalidate: 300 }
  });

  return <ProductContent product={data.product} />;
}
```

**Caching:**
- Use Next.js 15's `"use cache"` directive for caching (NOT `unstable_cache`)
- Cache configuration in `lib/api/shopify/cache-config.ts`
- Default revalidation: 300 seconds (5 minutes)
- Tags for granular cache invalidation

**Client Components:**
Use SWR for client-side data fetching when interactivity requires it:

```typescript
"use client";

import useSWR from "swr";

export function ClientComponent() {
  const { data, error } = useSWR("/api/products", fetcher);

  if (error) return <ErrorState />;
  if (!data) return <LoadingState />;

  return <ProductList products={data} />;
}
```

### 2. Authentication Architecture

**Shopify Customer Account OAuth Flow:**

The authentication system uses NextAuth with a custom Shopify provider (`auth/providers/shopify.ts`) that implements:
- PKCE (Proof Key for Code Exchange) for security
- State parameter validation
- Token exchange with Shopify's Customer Account API
- Session management with access tokens and ID tokens

**Protected Routes:**
The proxy (`proxy.ts`) protects `/account/*` routes by:
1. Checking for three required cookies: `customerAccessToken`, `accessToken`, `idToken`
2. Redirecting unauthenticated users to `/login?callbackUrl=<original-path>`
3. Setting security headers on all responses

**Auth Flow:**
```typescript
// In auth.ts
export const authConfig: AuthOptions = {
  providers: [
    Shopify({
      shopId: process.env.SHOPIFY_SHOP_ID,
      clientId: process.env.SHOPIFY_CLIENT_ID,
      clientSecret: process.env.SHOPIFY_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.shopifyAccessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.shopifyAccessToken) {
        session.shopifyAccessToken = token.shopifyAccessToken;
      }
      return session;
    },
  },
};
```

### 3. Component Patterns

**Server Component by Default:**
```typescript
// No "use client" directive
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**Client Component Only When Needed:**
Use `"use client"` only for:
- Interactive components with event handlers
- Browser APIs (localStorage, window, etc.)
- React hooks (useState, useEffect, etc.)
- Context providers and consumers

```typescript
"use client";

import { useState } from "react";

export function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Sections Pattern for Complex Pages:**
Product pages and dynamic pages use a sections pattern where each section is a separate component:

**Product Sections:**
- `components/features/products/sections/product-info.tsx`
- `components/features/products/sections/product-gallery.tsx`
- `components/features/products/sections/product-actions.tsx`
- `components/features/products/sections/related-products.tsx`

**Dynamic Page Sections:**
- `components/features/pages/page-renderer.tsx` - Server component orchestrator
- `components/features/pages/section-renderer.tsx` - Client component router
- `components/features/pages/sections/hero-section.tsx` - Hero with 3 layout variants
- `components/features/pages/sections/content-block-section.tsx` - Rich content blocks
- `components/features/pages/sections/product-carousel-section.tsx` - Product showcases
- `components/features/pages/sections/cta-banner-section.tsx` - Call-to-action banners
- `components/features/pages/sections/feature-grid-section.tsx` - Feature grids (2-4 columns)

This allows for better code organization and independent optimization of each section.

### 4. State Management

**URL-Driven State:**
Use `nuqs` for search parameters and filters:
```typescript
import { useQueryState } from "nuqs";

export function FilterComponent() {
  const [category, setCategory] = useQueryState("category");
  // URL automatically updates: ?category=value
}
```

**Context Providers:**
Global state is managed through context providers in `components/providers/`:
- `CartProvider` - Shopping cart state
- `WishlistProvider` - Wishlist state
- `AuthProvider` - Authentication state
- `SearchProvider` - Search state and results

All providers are combined in `CompoundProviders` component.

### 5. GraphQL Query Organization

**Fragments for Reusability:**
Common fields are extracted into fragments in `lib/api/shopify/fragments.ts`:
```typescript
export const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    images(first: 10) {
      edges {
        node {
          url
          altText
        }
      }
    }
  }
`;
```

**Query Composition:**
Queries in `lib/api/shopify/queries/` compose fragments:
```typescript
import { PRODUCT_FRAGMENT } from "../fragments";

export const PRODUCT_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
      variants(first: 100) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;
```

### 6. Error Handling

**Error Boundaries:**
Each major route has an `error.tsx` for graceful error handling:
```typescript
"use client";

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**Loading States:**
Use `loading.tsx` files with Suspense for loading states:
```typescript
export default function Loading() {
  return <ProductSkeleton />;
}
```

## Code Quality Standards (Biome/Ultracite)

This project uses **Biome** with the **Ultracite** preset for linting and formatting. All code MUST follow these rules:

### Formatting
- **Indentation:** Tabs (width 2)
- **Line width:** 120 characters maximum
- **Quotes:** Double quotes only
- **Semicolons:** Always required
- **Trailing commas:** ES5 style (only for multi-line)
- **Arrow functions:** Always use parentheses around parameters
- **Bracket spacing:** Enabled

### Code Quality
- **Maximum function complexity:** 15
- **Maximum function length:** 60 lines
- **No unused variables or imports**
- **No console.log** (use console.warn/error if needed)
- **Explicit TypeScript types** for all function parameters and returns
- **Avoid `any` type** - use `unknown` if type is truly unknown

### Import Order
Imports must be organized in this exact order:
1. React and Next.js imports
2. Third-party library imports
3. Internal modules (`@/`)
4. Relative imports (`./`, `../`)
5. Type imports at the end

```typescript
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ProductCard } from "./product-card";

import type { Product } from "@/types";
```

### TypeScript Standards
- Strict mode enabled
- Explicit return types for all functions
- Interfaces for object shapes (not types)
- Generics for reusable components
- Proper null/undefined handling
- Use `satisfies` operator for type validation

## Naming Conventions

- **Files:** `kebab-case.tsx` (or `PascalCase.tsx` for components)
- **Components/Classes:** `PascalCase`
- **Functions/Variables:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Types/Interfaces:** `PascalCase`
- **Event handlers:** Prefix with `handle` (e.g., `handleClick`, `handleSubmit`)

## Shopify Integration Details

### Storefront API Usage

The `shopifyFetch()` function in `lib/api/shopify/client.ts` handles all GraphQL communication:

```typescript
export async function shopifyFetch<T>({
  query,
  variables,
  tags,
  cache = "force-cache",
  next,
}: ShopifyFetchParams<T>): Promise<{ data: T }> {
  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      next: {
        ...next,
        tags: [...(next?.tags || []), ...(tags || [])],
        revalidate: next?.revalidate ?? 300,
      },
    }
  );

  // Error handling and response parsing
}
```

### Cart Operations

Cart mutations use Server Actions in `lib/actions/shopify/`:
- Convert variant IDs to GID format: `gid://shopify/ProductVariant/<id>`
- Use Shopify's cart API for add/remove/update operations
- Redirect to Shopify checkout for final purchase

### Customer Account API

Authentication uses the format:
- Authorization: `https://shopify.com/authentication/<shopId>/authorize`
- Token: `https://shopify.com/authentication/<shopId>/token`
- Userinfo: `https://shopify.com/authentication/<shopId>/userinfo`

The provider enforces PKCE and state checks as required by Shopify's OAuth implementation.

## Performance Optimizations

### Next.js 16 Features
- **React Compiler:** Enabled for automatic memoization (`reactCompiler: true`)
- **Partial Prerendering (PPR):** Using `cacheComponents: true` (replaces experimental.ppr)
- **Turbopack:** Stable and used by default
- **CSS Inlining:** Enabled with `experimental.inlineCss`
- **Package Import Optimization:** Configured for lucide-react, Radix UI, and recharts

### Image Optimization
- Next.js Image component with Shopify CDN
- AVIF and WebP formats
- Responsive image sizes configured
- Minimum cache TTL: 1 year

### Bundle Optimization
- Remove console logs in production (except warn/error)
- Bundle analyzer available with `npm run build:analyze`
- Code splitting with dynamic imports

## Development Workflow

### Making Changes
1. Always run `npm run lint` before committing
2. Fix issues with `npm run lint:fix` or `npm run format`
3. Verify TypeScript with `npm run type-check`
4. Test locally with `npm run dev`

### Debugging
- Use `npm run scan` to analyze component render performance
- Use `npm run build:analyze` to inspect bundle size
- Check console output for NextAuth debug logs (when debug mode enabled)

### Adding New Features
1. Determine if the component should be a Server or Client Component
2. Follow the sections pattern for complex page components
3. Create corresponding GraphQL queries in `lib/api/shopify/queries/`
4. Add proper error boundaries and loading states
5. Use TypeScript interfaces for all props and state

## Important Development Principles

1. **Never change styling, content, or layout** unless specifically requested - focus on logic improvements
2. **Server Components by default** - only add `"use client"` when absolutely necessary
3. **Type safety first** - all code must have proper TypeScript types
4. **Accessibility matters** - semantic HTML, ARIA labels, keyboard navigation
5. **Performance conscious** - optimize images, lazy load when appropriate, minimize client-side JavaScript

## Troubleshooting Common Issues

### Authentication Problems
- **`invalid_client` error:** Verify SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET match your Shopify app
- **Callback loops:** Ensure NEXTAUTH_URL and NEXT_PUBLIC_APP_URL point to the same reachable origin
- **Redirect URI mismatch:** Shopify requires exact match: `https://<your-domain>/api/auth/callback/shopify`

### Data Fetching Issues
- **Empty product data:** Verify Storefront API token has required scopes
- **GraphQL errors:** Check API version matches (`2024-01` in client.ts)
- **Stale data:** Use cache tags for invalidation or reduce revalidate time

### Build Errors
- **TypeScript errors:** Run `npm run type-check` to identify issues
- **Linting errors:** Run `npm run lint:fix` to auto-fix formatting issues
- **Image optimization errors:** Ensure image domains are in `next.config.ts` remotePatterns

## Dynamic Page Builder System

The application includes a powerful dynamic page builder that allows merchants to create custom pages in Shopify Admin with flexible section-based layouts.

### Architecture

**Route:** `/pages/[handle]`
**Rendering:** Server Components with ISR (5-minute revalidation)
**Static Generation:** Top 100 pages prerendered at build time

### Key Features

1. **Metaobject-Based Sections:** Pages are composed of reusable section metaobjects defined in Shopify Admin
2. **8 Section Types:** Hero, Content, Products, CTA, Features, Testimonials, Gallery, Video
3. **Layout Variants:** Full-width, contained, and split layouts
4. **Theme Support:** Default, dark, and accent color themes
5. **Type-Safe:** Complete TypeScript definitions for all section types
6. **Performance Optimized:** Code splitting, suspense boundaries, image optimization

### Data Flow

```
Shopify Admin → Metaobjects → Page Metafields → GraphQL Query → Parser → TypeScript Types → React Components
```

### Components

- **PageRenderer (Server):** Orchestrates layout and sections with Suspense boundaries
- **SectionRenderer (Client):** Routes sections to appropriate components with code splitting
- **Section Components:** Individual section implementations with variants and themes

### Configuration

Pages are configured in Shopify Admin via metafields:
- `custom.sections` - List of metaobject references (ordered)
- `custom.layout` - Layout variant: "full-width" | "contained" | "split"
- `custom.theme` - Theme: "default" | "dark" | "accent"

### Setup Documentation

Complete setup instructions available in `docs/SHOPIFY_PAGE_BUILDER_SETUP.md`:
- Creating metaobject definitions
- Configuring page metafields
- Building section entries
- Creating pages with sections
- Extending with custom sections

### Extending the System

To add new section types:
1. Define TypeScript types in `lib/types.ts`
2. Create section component in `components/features/pages/sections/`
3. Register in `section-renderer.tsx`
4. Create metaobject definition in Shopify Admin

## Recent System Improvements

**Resolved Issues:**
- ✅ Fixed collection handling with fallback to all products when collections don't exist
- ✅ Resolved 400 image errors with proper placeholder.svg handling
- ✅ Added missing DialogDescription for accessibility compliance
- ✅ Fixed Next.js Image sizes prop warnings throughout the app
- ✅ Updated pages to use real Shopify API data instead of mock data
- ✅ Optimized data fetching patterns and caching strategies
- ✅ All accessibility warnings resolved
- ✅ Implemented dynamic page builder with Shopify metaobjects
- ✅ All page links dynamically loaded from Shopify in footer/navigation

**Performance Enhancements:**
- Image optimization with proper `sizes` attributes
- Memory cache cleanup with automatic garbage collection
- Request deduplication to prevent duplicate API calls
- Proper fallback systems for missing data
- Dynamic imports for page sections with code splitting
- ISR with intelligent caching for dynamic pages
