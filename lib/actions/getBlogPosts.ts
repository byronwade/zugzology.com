export const runtime = "edge";

import { shopifyStorefront } from "@/lib/shopify";
import { unstable_cache } from "next/cache";
import type { Article } from "@/lib/types/shopify";

const getBlogPostsQuery = `#graphql
  query GetBlogPosts($handle: String!, $first: Int!) {
    blog(handle: $handle) {
      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            excerpt
            content
            contentHtml
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
              handle
            }
          }
        }
      }
    }
  }
`;

interface BlogPostsResponse {
	data: {
		blog: {
			articles: {
				edges: Array<{
					node: Article;
				}>;
			};
		};
	};
}

export const getBlogPosts = unstable_cache(
	async (blogHandle: string, first: number = 250): Promise<Article[]> => {
		try {
			console.log(`Fetching posts for blog: ${blogHandle}...`);
			const response = await shopifyStorefront.query<BlogPostsResponse>(getBlogPostsQuery, {
				variables: { handle: blogHandle, first },
			});
			console.log("Raw blog posts response:", JSON.stringify(response, null, 2));

			if (!response?.data?.blog?.articles?.edges) {
				console.error(`No posts found for blog: ${blogHandle}`);
				console.error("Response structure:", response);
				return [];
			}

			const posts = response.data.blog.articles.edges.map((edge: { node: Article }) => edge.node);
			console.log(`Found ${posts.length} posts for blog: ${blogHandle}`);
			console.log("Posts:", JSON.stringify(posts, null, 2));
			return posts;
		} catch (error) {
			console.error(`Error fetching posts for blog ${blogHandle}:`, error);
			if (error instanceof Error) {
				console.error("Error details:", {
					message: error.message,
					stack: error.stack,
					name: error.name,
				});
			}
			// Return empty array but log the error for debugging
			return [];
		}
	},
	["blog-posts"],
	{
		revalidate: 60 * 60, // Revalidate every hour
		tags: ["blog-posts"],
	}
);

export const getBlogPost = unstable_cache(
	async (blogHandle: string, postHandle: string): Promise<Article | null> => {
		try {
			console.log(`Fetching post ${postHandle} from blog ${blogHandle}...`);
			const posts = await getBlogPosts(blogHandle);
			const post = posts.find((post) => post.handle === postHandle);

			if (!post) {
				console.log(`No post found with handle: ${postHandle} in blog: ${blogHandle}`);
				return null;
			}

			return post;
		} catch (error) {
			console.error(`Error fetching post ${postHandle} from blog ${blogHandle}:`, error);
			return null;
		}
	},
	["blog-post"],
	{ revalidate: 60 } // Revalidate every minute
);
