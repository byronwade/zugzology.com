import { PAGE_FRAGMENT } from "../fragments";

/**
 * Query to get a single page by handle with all sections
 */
export const GET_PAGE_BY_HANDLE = `
  query getPageByHandle($handle: String!) {
    page(handle: $handle) {
      ...PageFragment
    }
  }
  ${PAGE_FRAGMENT}
`;

/**
 * Query to get all pages for static generation
 * Returns basic page info for generating static params
 */
export const GET_ALL_PAGES = `
  query getAllPages($first: Int = 100, $after: String) {
    pages(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        handle
        title
        updatedAt
      }
    }
  }
`;

/**
 * Query to get paginated pages
 */
export const GET_PAGINATED_PAGES = `
  query getPaginatedPages(
    $first: Int = 20
    $after: String
    $query: String
    $sortKey: PageSortKeys = UPDATED_AT
    $reverse: Boolean = true
  ) {
    pages(
      first: $first
      after: $after
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        ...PageFragment
      }
    }
  }
  ${PAGE_FRAGMENT}
`;

/**
 * Query to get page by ID
 */
export const GET_PAGE_BY_ID = `
  query getPageById($id: ID!) {
    page(id: $id) {
      ...PageFragment
    }
  }
  ${PAGE_FRAGMENT}
`;
