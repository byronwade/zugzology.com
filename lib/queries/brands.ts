export const getBrandsQuery = `#graphql
  query GetBrands {
    collections(first: 250, query: "collection_type:brand") {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
            altText
            width
            height
            id
            transformedSrc
          }
          products(first: 250) {
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
                      transformedSrc
                    }
                  }
                }
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;

export const getBrandQuery = `#graphql
  query GetBrand($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
        id
        transformedSrc
      }
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
                  transformedSrc
                }
              }
            }
            availableForSale
          }
        }
      }
    }
  }
`;
