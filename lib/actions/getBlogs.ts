export const runtime = "edge";

import { shopifyStorefront } from "@/lib/shopify";

export async function getBlogs() {
	const query = `#graphql
		{
			blogs(first: 10) {
				edges {
					node {
						id
						handle
						title
						articles(first: 250, sortKey: PUBLISHED_AT, reverse: true) {
							edges {
								node {
									id
									handle
									title
									excerpt
									publishedAt
									contentHtml
									author {
										name
									}
									image {
										url
										altText
										width
										height
									}
								}
							}
						}
					}
				}
			}
		}
	`;

	try {
		console.log("Sending query to Shopify...");
		const response = await shopifyStorefront.query(query);
		console.log("Raw Shopify response:", JSON.stringify(response, null, 2));

		if (!response?.blogs?.edges) {
			console.error("Invalid response structure:", response);
			return [];
		}

		// Transform the response to include articles
		const blogs = response.blogs.edges.map(({ node: blog }) => ({
			id: blog.id,
			handle: blog.handle,
			title: blog.title,
			articles: blog.articles.edges.map(({ node: article }) => ({
				id: article.id,
				handle: article.handle,
				title: article.title,
				excerpt: article.excerpt,
				publishedAt: article.publishedAt,
				contentHtml: article.contentHtml,
				author: article.author,
				image: article.image,
			})),
		}));

		console.log("Found blogs:", blogs.length);
		console.log(
			"Blog handles:",
			blogs.map((b) => b.handle)
		);
		return blogs;
	} catch (error) {
		console.error("Detailed error in getBlogs:", {
			message: error.message,
			stack: error.stack,
			response: error.response,
		});
		throw error;
	}
}
