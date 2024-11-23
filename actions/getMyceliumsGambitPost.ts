export const runtime = "edge";

import { shopifyClient, type ShopifyResponse } from "@/lib/shopify";
import type { Article } from "@/lib/types/shopify";
import { unstable_cache } from "@/lib/unstable-cache";

export const getMyceliumsGambitPostQuery = `#graphql
  query GetMyceliumsGambitPost($handle: String!) {
    blog(handle: "myceliums-gambit") {
      articleByHandle(handle: $handle) {
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
`;

type PostResponse = {
	blog: {
		articleByHandle: Article | null;
	};
};

const getMyceliumsGambitPostUncached = async (handle: string) => {
	try {
		const response: ShopifyResponse<PostResponse> = await shopifyClient.request(getMyceliumsGambitPostQuery, {
			variables: { handle },
		});

		if (!response.data?.blog?.articleByHandle) {
			return null;
		}

		return response.data.blog.articleByHandle;
	} catch (error) {
		console.error("Error fetching post:", error);
		throw error;
	}
};

export const getMyceliumsGambitPost = unstable_cache(
	getMyceliumsGambitPostUncached,
	["myceliums-gambit-post"],
	{ revalidate: 60 } // Revalidate every minute
);
