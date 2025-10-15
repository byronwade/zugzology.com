# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `npm run dev` - Start development server on port 3000
- `npm run dev:turbo` - Start with Turbopack for faster builds
- `npm run dev:node` - Start on port 3003 (alternative)
- `npm run scan` - Launch with react-scan for performance insights

**Build & Deploy:**
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture Overview

This is a Next.js 15 App Router e-commerce storefront built for Zugzology, a premium mushroom growing supplies store. The application integrates with Shopify's Storefront API and Customer Account OAuth flow.

### Core Technologies
- **Next.js 15** with App Router and experimental features (PPR, React Compiler, useCache)
- **React 19** with Server Components as the default
- **TypeScript** with strict configuration
- **Tailwind CSS** + **Shadcn/ui** component system
- **Shopify Storefront API 2024-01** for product data
- **NextAuth** with custom Shopify Customer Account provider
- **React Query/SWR** for client-side data fetching

### Project Structure

**App Router Architecture:**
- `app/(account)/` - Account management with protected routes
- `app/(content)/` - Blog and content pages
- `app/(products)/` - Product catalog, search, and wishlist
- `app/api/` - API routes for cart, auth, and Shopify integration

**Component Organization:**
- `components/ui/` - Shadcn/ui primitives (Button, Card, Dialog, etc.)
- `components/auth/` - Authentication forms and providers
- `components/products/` - Product-specific components with sections pattern
- `components/navigation/` - Enhanced search and navigation
- `components/providers/` - Context providers (Auth, Cart, Theme, etc.)

### Key Architecture Patterns

**Data Fetching:**
- Server Components fetch data by default using `shopifyFetch()` in `lib/api/shopify/client.ts`
- GraphQL queries are organized in `lib/api/shopify/queries/`
- Cache configuration in `lib/api/shopify/cache-config.ts`
- Use `"use cache"` directive for Next.js 15 caching (not `unstable_cache`)

**Authentication Flow:**
- Custom Shopify provider in `auth/providers/shopify.ts`
- NextAuth configuration in `auth.ts` with Shopify Customer Account API
- Session management with Shopify access tokens

**State Management:**
- URL-driven state with `nuqs` for search and filters
- Context providers for cart, wishlist, and authentication
- Server Actions for cart mutations and form handling

**Component Patterns:**
- Server Components by default, Client Components only when needed
- Sections pattern for product pages (`components/products/sections/`)
- Suspense boundaries with loading states
- Error boundaries for graceful failure handling

### Environment Requirements

**Critical Variables:**
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` - Shopify store domain
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Storefront API token
- `SHOPIFY_SHOP_ID` - Numeric shop ID for Customer Account API
- `SHOPIFY_CLIENT_ID` / `SHOPIFY_CLIENT_SECRET` - Customer Account credentials
- `NEXTAUTH_URL` / `NEXT_PUBLIC_NEXTAUTH_URL` - Base URLs for auth
- `NEXTAUTH_SECRET` - Required for production

### Coding Conventions

**Following .cursorrules:**
- React Server Components by default, avoid `'use client'` unless necessary
- Functional programming patterns with early returns
- TypeScript interfaces over types
- Named exports preferred
- Event handlers prefixed with `handle`
- Await async props individually (not dot notation)

**File Organization:**
- Colocation of related components and utilities
- Barrel exports from index files
- Clear separation between server and client code
- GraphQL fragments and queries in dedicated files

### Shopify Integration

**Storefront API:**
- GraphQL client in `lib/api/shopify/client.ts`
- Queries use fragments for reusability
- Product variants handled with GID format conversion
- Cart operations via Server Actions

**Customer Account API:**
- OAuth flow through NextAuth
- PKCE/state validation
- Customer data accessible in protected routes

### Performance Optimizations

- React Compiler enabled for automatic memoization
- PPR (Partial Prerendering) experimental feature
- Image optimization with Shopify CDN
- CSS inlining for critical styles
- Selective hydration with Server Components

### Testing & Development

- ESLint configuration extends Next.js core web vitals
- TypeScript strict mode enabled
- Build and type errors ignored during development for rapid iteration
- React Scan integration for performance monitoring

## Development Principles

- Never change the styling content or layout unless specifically asked for, your goal is to always make improvements to the logic but to not change the design or layout at all

## Recent System Improvements (Applied)

**Core Issues Resolved:**
- ✅ Fixed collection handling with fallback to all products when collections don't exist
- ✅ Resolved 400 image errors with proper placeholder.svg handling
- ✅ Added missing DialogDescription for accessibility compliance
- ✅ Fixed Next.js Image sizes prop warnings throughout the app
- ✅ Updated home and products pages to use real Shopify API data instead of mock data
- ✅ Optimized data fetching patterns and caching strategies
- ✅ Verified blog functionality with proper pagination
- ✅ Ensured navigation works correctly across all routes

**Performance Enhancements:**
- Image optimization with proper `sizes` attributes
- Memory cache cleanup with automatic garbage collection
- Request deduplication to prevent duplicate API calls
- All accessibility warnings resolved
- Proper fallback systems for missing data