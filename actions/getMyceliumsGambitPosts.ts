export const runtime = "edge";

import { shopifyClient } from "@/lib/shopify";
import { unstable_cache } from "next/cache";
import type { Article } from "@/lib/types/shopify";

const getBlogPostsQuery = `#graphql
  query GetBlogPosts($first: Int!) {
    blog(handle: "myceliums-gambit") {
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

export const getMyceliumsGambitPosts = unstable_cache(
	async (first: number): Promise<Article[]> => {
		try {
			const response = await shopifyClient.request(getBlogPostsQuery, {
				variables: { first },
			});

			const posts = response.data?.blog?.articles?.edges?.map((edge: { node: Article }) => edge.node) || [];

			console.log(`Fetched ${posts.length} blog posts`);

			return posts;
		} catch (error) {
			console.error("Error fetching blog posts:", error);
			console.error("Error details:", JSON.stringify(error, null, 2));
			return [];
		}
	},
	["blog-posts"],
	{ revalidate: 60 }
);

export const getMyceliumsGambitPost = unstable_cache(
	async (handle: string): Promise<Article | null> => {
		try {
			const posts = await getMyceliumsGambitPosts(250);
			const post = posts.find((post) => post.handle === handle);

			if (!post) {
				console.log(`No post found with handle: ${handle}`);
			}

			return post || null;
		} catch (error) {
			console.error("Error fetching blog post:", error);
			return null;
		}
	},
	["blog-post"],
	{ revalidate: 60 }
);
