export const getTaxonomyQuery = `#graphql
  query GetTaxonomy($query: String!, $first: Int!) {
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
          vendor
          productType
        }
      }
    }
  }
`;

export const getCollectionQuery = `#graphql
  query GetCollection($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first) {
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
            vendor
            productType
          }
        }
      }
    }
  }
`;

export const getAllProductsQuery = `#graphql
  query GetAllProducts($first: Int!) {
    products(first: $first) {
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
          vendor
          productType
        }
      }
    }
  }
`;
