/**
 * Optimized GraphQL fragments for homepage performance
 * Minimal fields for fast loading - only what ProductCard needs
 */

// Minimal product fragment for homepage grids
export const PRODUCT_CARD_FRAGMENT = `
  fragment ProductCardFragment on Product {
    id
    title
    handle
    vendor
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        quantityAvailable
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
    images(first: 1) {
      nodes {
        url
        altText
        width
        height
      }
    }
    metafields(identifiers: [
      {namespace: "custom", key: "rating"},
      {namespace: "custom", key: "rating_count"},
      {namespace: "custom", key: "recent_purchases"}
    ]) {
      namespace
      key
      value
    }
  }
`;

// Minimal hero product fragment - just for hero section
export const HERO_PRODUCT_FRAGMENT = `
  fragment HeroProductFragment on Product {
    id
    title
    handle
    variants(first: 1) {
      nodes {
        id
        price {
          amount
          currencyCode
        }
      }
    }
    images(first: 1) {
      nodes {
        url
      }
    }
  }
`;
