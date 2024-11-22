export const getCategoriesQuery = `#graphql
  query GetCategories {
    collections(first: 250) {
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
            transformedSrc(
              maxWidth: 800
              maxHeight: 800
              crop: CENTER
              preferredContentType: WEBP
            )
          }
          products(first: 4) {
            edges {
              node {
                id
                title
                handle
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
              }
            }
          }
        }
      }
    }
  }
`;

export const getCategoryQuery = `#graphql
  query GetCategory($handle: String!, $first: Int!) {
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
        transformedSrc(
          maxWidth: 1920
          maxHeight: 1080
          crop: CENTER
          preferredContentType: WEBP
        )
      }
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
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
          }
        }
      }
    }
  }
`;
