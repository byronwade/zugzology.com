// Products fragment for GraphQL queries
export const PRODUCTS_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    title
    handle
    description
    descriptionHtml
    productType
    vendor
    tags
    isGiftCard
    availableForSale
    options {
      id
      name
      values
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 250) {
      nodes {
        id
        title
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
        selectedOptions {
          name
          value
        }
        image {
          url
          altText
          width
          height
        }
      }
    }
    images(first: 20) {
      nodes {
        url
        altText
        width
        height
      }
    }
    media(first: 20) {
      nodes {
        id
        mediaContentType
        alt
        previewImage {
          url
          altText
          height
          width
        }
        ... on MediaImage {
          id
          image {
            url
            altText
            height
            width
            originalSrc
          }
        }
        ... on Video {
          id
          sources {
            format
            height
            mimeType
            url
            width
          }
        }
        ... on ExternalVideo {
          id
          embedUrl
          host
          originUrl
        }
        ... on Model3d {
          id
          sources {
            format
            mimeType
            url
            filesize
          }
        }
      }
    }
    metafields(identifiers: [
      {namespace: "custom", key: "rating"},
      {namespace: "custom", key: "rating_count"},
      {namespace: "custom", key: "recent_purchases"},
      {namespace: "custom", key: "youtube_videos"},
      {namespace: "custom", key: "complementary_products"}
    ]) {
      id
      namespace
      key
      value
      type
    }
    publishedAt
  }
`;

// Article fragment - Define this first since it's used by BlogFragment
export const ARTICLE_FRAGMENT = `
  fragment ArticleFragment on Article {
    id
    title
    handle
    content
    contentHtml
    excerpt
    publishedAt
    author {
      name
    }
    image {
      url
      altText
      width
      height
    }
    blog {
      title
      handle
    }
  }
`;

// Blog fragment - Now ArticleFragment is defined before it's used
export const BLOG_FRAGMENT = `
  fragment BlogFragment on Blog {
    id
    title
    handle
    articles(first: 100) {
      edges {
        node {
          ...ArticleFragment
        }
      }
    }
  }
  ${ARTICLE_FRAGMENT}
`;

// Collection fragment for GraphQL queries
export const COLLECTION_FRAGMENT = `
  fragment CollectionFragment on Collection {
    id
    title
    handle
    description
    image {
      url
      altText
      width
      height
    }
    metafields(identifiers: [
      {namespace: "custom", key: "discount_code"},
      {namespace: "custom", key: "discount_amount"},
      {namespace: "custom", key: "discount_type"}
    ]) {
      id
      namespace
      key
      value
      type
    }
    products(first: 100) {
      nodes {
        ...ProductFragment
      }
    }
  }
  ${PRODUCTS_FRAGMENT}
`;

// Cart Fragment
export const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              product {
                id
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const MENU_ITEM_FRAGMENT = `
  fragment MenuItemFragment on MenuItem {
    id
    title
    url
    resourceId
    items {
      id
      title
      url
      resourceId
      items {
        id
        title
        url
        resourceId
      }
    }
  }
`;
