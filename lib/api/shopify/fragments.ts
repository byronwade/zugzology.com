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
      edges {
        node {
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
          variants(first: 100) {
            edges {
              node {
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
          }
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
          metafields(identifiers: [
            {namespace: "custom", key: "rating"},
            {namespace: "custom", key: "rating_count"},
            {namespace: "custom", key: "recent_purchases"}
          ]) {
            id
            namespace
            key
            value
            type
          }
          publishedAt
        }
      }
    }
  }
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

// Blog fragment
export const BLOG_FRAGMENT = `
  fragment BlogFragment on Blog {
    id
    title
    handle
    articles(first: 100) {
      edges {
        node {
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
        }
      }
    }
  }
`;

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
    variants(first: 100) {
      edges {
        node {
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
    }
    media(first: 20) {
      edges {
        node {
          ... on MediaImage {
            id
            mediaContentType
            image {
              url
              altText
              width
              height
            }
          }
          ... on Video {
            id
            mediaContentType
            sources {
              url
              mimeType
              format
              height
              width
            }
            previewImage {
              url
              altText
              width
              height
            }
          }
          ... on ExternalVideo {
            id
            mediaContentType
            embedUrl
            host
            previewImage {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
    images(first: 20) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    metafields(first: 10) {
      edges {
        node {
          id
          namespace
          key
          value
          type
          references(first: 5) {
            edges {
              node {
                ... on Product {
                  id
                  title
                  handle
                  description
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
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
                  variants(first: 1) {
                    edges {
                      node {
                        id
                        availableForSale
                        price {
                          amount
                          currencyCode
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
    }
    complementaryProducts: metafield(namespace: "custom", key: "complementary_products") {
      references(first: 4) {
        edges {
          node {
            ... on Product {
              id
              title
              handle
              description
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
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
              variants(first: 1) {
                edges {
                  node {
                    id
                    availableForSale
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    publishedAt
  }
`;
