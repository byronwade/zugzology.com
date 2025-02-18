export const getProductQuery = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
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
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
      media(first: 20) {
        edges {
          node {
            mediaContentType
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
            ... on Video {
              sources {
                url
                mimeType
              }
              previewImage {
                url
                altText
              }
            }
            ... on ExternalVideo {
              embedUrl
              host
              previewImage {
                url
                altText
              }
            }
          }
        }
      }
      metafields(first: 10) {
        id
        namespace
        key
        value
        type
      }
      publishedAt
    }
  }
`;
