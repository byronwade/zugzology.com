export const getPagesQuery = `#graphql
  query GetPages {
    pages(first: 250) {
      edges {
        node {
          id
          title
          handle
          bodySummary
          body
          bodyHtml
          createdAt
          updatedAt
          onlineStoreUrl
          author {
            name
          }
          publishedAt
          seo {
            title
            description
          }
        }
      }
    }
  }
`;

export const getPageQuery = `#graphql
  query GetPage($handle: String!) {
    page(handle: $handle) {
      id
      title
      handle
      bodySummary
      body
      bodyHtml
      createdAt
      updatedAt
      onlineStoreUrl
      author {
        name
      }
      publishedAt
      seo {
        title
        description
      }
    }
  }
`;
