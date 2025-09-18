# Zugzology Storefront

A Next.js 15 App Router storefront wired to Shopify's Storefront API and Customer Account OAuth flow. The app powers Zugzology's e-commerce experience with GraphQL data fetching, account management, and rich merchandising components.

## Highlights
- React Server Components with streaming routes and Tailwind CSS UI primitives.
- Shopify Storefront API 2024-01 requests for products, collections, carts, and customer data.
- NextAuth provider for Shopify Customer Accounts, including PKCE/OAuth handling.
- Server Actions for cart mutations plus client helpers for quick add-to-cart and checkout redirects.

## Requirements
- Node.js 20+ (aligns with Next.js 15 canary requirements).
- npm, pnpm, yarn, or bun for package management.
- A Shopify store with the Storefront API and Customer Account API enabled.

## Quick Start
1. Copy the sample environment file and fill in the secrets you obtained from Shopify:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies with your preferred package manager (examples use npm):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000 and verify that product data and login flows load without errors.

## Environment Variables
These variables coordinate the Storefront API, Customer Account OAuth, and runtime URLs. Values shown are illustrative.

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | ✅ | `your-shop.myshopify.com` | Base domain for Storefront API requests and checkout redirects. |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | ✅ | `shpat_***` | Token used in the `X-Shopify-Storefront-Access-Token` header for Storefront API calls ([Shopify Storefront API guide](https://shopify.dev/docs/api/storefront/latest/queries/Customer)). |
| `SHOPIFY_SHOP_ID` | ✅ | `59412611132` | Numeric shop ID for the Customer Account OAuth URLs (`https://shopify.com/authentication/<shopId>/...`). |
| `SHOPIFY_CLIENT_ID` | ✅ | `shp_xxx-xxx` | Shopify Customer Account public client ID. The code adds the `shp_` prefix if it is missing. |
| `SHOPIFY_CLIENT_SECRET` | ✅ | `********` | Customer Account confidential client secret used during the token exchange. |
| `NEXTAUTH_URL` | ✅ | `https://your-domain.com` | Base URL NextAuth uses to compute the callback route (`/api/auth/callback/shopify`). |
| `NEXT_PUBLIC_NEXTAUTH_URL` | ✅ | `https://your-domain.com` | Mirrors `NEXTAUTH_URL` for client-side redirects and debug messaging. |
| `NEXT_PUBLIC_APP_URL` | ✅ | `https://your-domain.com` | Used by API routes to redirect after login/logout. |
| `NEXT_PUBLIC_SHOPIFY_SHOP_ID` | ⚙️ | `59412611132` | Optional client-side copy of the shop ID for helpful console diagnostics. |
| `NEXT_PUBLIC_SITE_URL` | ⚙️ | `https://zugzology.com` | Used for sitemap/robots metadata. |
| `NEXT_PUBLIC_CONTACT_PHONE` | ⚙️ | `+1-555-123-4567` | Populates structured data schema. |
| `NEXTAUTH_SECRET` | 🚀 | `long-random-string` | Required in production to sign NextAuth cookies/tokens. |

> ℹ️ If you rotate any of the credentials, restart the dev server so that NextAuth and the Shopify fetch client pick up the new values.

## Shopify Configuration Checklist
Follow Shopify's Customer Account API documentation when obtaining credentials and registering redirect URIs ([Shopify OAuth flow reference](https://shopify.dev/docs/storefronts/mobile/checkout-kit/authenticate-checkouts)).

- Enable the **Customer Account API** and request the `openid`, `email`, and `customer-account-api:full` scopes for the confidential client.
- Configure the callback URL _exactly_ as `https://<your-domain>/api/auth/callback/shopify`; Shopify is strict about matching redirect URIs.
- For local development, expose your app URL (ngrok, Cloudflare tunnel, etc.) and append `/account/authorize` as Shopify's docs suggest for customer account testing domains.
- Create a Storefront API access token with the product, collection, and cart scopes needed by this app, then paste it into `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`.
- If you use an allowlist on your shop, add the dev tunnel domain so the OAuth redirect succeeds.

## How Data Flows
- **Storefront GraphQL** requests originate from server actions and API routes via `lib/api/shopify/client.ts`. Requests set `X-Shopify-Storefront-Access-Token` using your storefront token, as documented in Shopify's API examples ([Storefront API headers](https://shopify.dev/docs/api/storefront/latest/queries/Customer)).
- **Customer login** runs through NextAuth (`auth.ts`) with a custom Shopify provider. The provider constructs authorization/token URLs in the format `https://shopify.com/authentication/<shopId>/{authorize|token|userinfo}` and enforces PKCE/state checks.
- **Cart and checkout** helpers convert variant IDs to the `gid://shopify/ProductVariant/<id>` form Shopify expects before calling cart mutations or building `/cart/{variant}:{quantity}` checkout URLs.

## npm Scripts
- `npm run dev` – Start Next.js locally on port 3000.
- `npm run dev:turbo` – Opt-in to Turbopack.
- `npm run build` / `npm run start` – Production build and serve.
- `npm run lint` – Run ESLint across the repo.
- `npm run scan` – Launch the app and execute `react-scan` for performance insights.

## Troubleshooting
- **`invalid_client` during login**: Double-check the client ID/secret pair and ensure the redirect URI matches the Shopify app configuration character-for-character.
- **Callback loops to `/login?error`**: Confirm `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` both point to the same reachable origin.
- **Product data empty**: Verify the Storefront API token has `unauthenticated_read_product_listings` and related scopes, and that the shop uses the same API version (`2024-01`) configured in `lib/api/shopify/client.ts`.

## Next Steps
- Keep an eye on Shopify's "Customer Account API" changelog for breaking changes and versioned endpoint updates.
- Consider adding automated health checks that validate the required environment variables before deploying.
- Expand documentation with feature guides (blogs, bundles, Trustoo reviews) as those modules stabilize.
