export const getTagsQuery = `#graphql
  query GetTags {
    products(first: 250) {
      edges {
        node {
          tags
        }
      }
    }
  }
`;

export const getProductsByTagQuery = `#graphql
  query GetProductsByTag($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          description
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
          images(first: 1) {
            edges {
              node {
                url
                altText
                width
                height
                id
                transformedSrc(
                  maxWidth: 800
                  maxHeight: 800
                  crop: CENTER
                  preferredContentType: WEBP
                )
              }
            }
          }
          availableForSale
          tags
        }
      }
    }
  }
`;
