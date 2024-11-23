export const runtime = "edge";

import { shopifyClient, type ShopifyResponse } from "@/lib/shopify";
import type { Article } from "@/lib/types/shopify";
import { unstable_cache } from "@/lib/unstable-cache";

export const getMyceliumsGambitPostsQuery = `#graphql
  query GetMyceliumsGambitPosts($first: Int!, $after: String) {
    blog(handle: "myceliums-gambit") {
      id
      handle
      title
      articles(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          cursor
          node {
            id
            title
            handle
            content
            contentHtml
            excerpt
            excerptHtml
            publishedAt
            image {
              url
              altText
              width
              height
            }
            author {
              name
            }
            blog {
              handle
            }
          }
        }
      }
    }
  }
`;

type MyceliumsGambitResponse = {
	blog: {
		id: string;
		handle: string;
		title: string;
		articles: {
			pageInfo: {
				hasNextPage: boolean;
				endCursor: string | null;
			};
			edges: Array<{
				cursor: string;
				node: Article;
			}>;
		};
	};
};

async function fetchPosts(first: number = 50) {
	try {
		const allPosts: Article[] = [];
		let hasNextPage = true;
		let afterCursor: string | null = null;

		while (hasNextPage) {
			const response: ShopifyResponse<MyceliumsGambitResponse> = await shopifyClient.request(getMyceliumsGambitPostsQuery, {
				variables: {
					first: Math.min(first, 50),
					after: afterCursor,
				},
			});

			if (!response.data?.blog) {
				throw new Error("Blog not found or not accessible");
			}

			const { edges, pageInfo } = response.data.blog.articles;

			allPosts.push(...edges.map((edge) => edge.node));

			hasNextPage = pageInfo.hasNextPage;
			afterCursor = pageInfo.endCursor;

			if (allPosts.length >= first) {
				break;
			}
		}

		return allPosts;
	} catch (error) {
		console.error("Error fetching posts:", error);
		throw error;
	}
}

// Export both cached and uncached versions
export const getMyceliumsGambitPosts = unstable_cache(fetchPosts, ["myceliums-gambit-posts"], { revalidate: 60 });

export const getMyceliumsGambitPostsUncached = fetchPosts;
