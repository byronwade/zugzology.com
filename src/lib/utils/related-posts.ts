import type { ShopifyBlogArticle } from "@/lib/types";

// Regex patterns for word splitting (moved to top level for performance)
const WORD_SPLIT_REGEX = /\W+/;

export function findRelatedPosts(
	currentPost: ShopifyBlogArticle,
	allPosts: ShopifyBlogArticle[],
	maxPosts = 3
): ShopifyBlogArticle[] {
	// Remove the current post from consideration
	const otherPosts = allPosts.filter((post) => post.id !== currentPost.id);

	// Create a scoring system for each post
	const scoredPosts = otherPosts.map((post) => {
		let score = 0;

		// Score based on title similarity
		const titleWords = new Set(currentPost.title.toLowerCase().split(WORD_SPLIT_REGEX));
		const postTitleWords = new Set(post.title.toLowerCase().split(WORD_SPLIT_REGEX));
		const titleIntersection = new Set([...titleWords].filter((x) => postTitleWords.has(x)));
		score += titleIntersection.size * 2;

		// Score based on content similarity (using excerpt as a proxy)
		const contentWords = new Set(currentPost.excerpt?.toLowerCase().split(WORD_SPLIT_REGEX) || []);
		const postContentWords = new Set(post.excerpt?.toLowerCase().split(WORD_SPLIT_REGEX) || []);
		const contentIntersection = new Set([...contentWords].filter((x) => postContentWords.has(x)));
		score += contentIntersection.size;

		// Boost score if published around the same time (within 3 months)
		const currentDate = new Date(currentPost.publishedAt);
		const postDate = new Date(post.publishedAt);
		const monthsDifference = Math.abs(
			(currentDate.getFullYear() - postDate.getFullYear()) * 12 + (currentDate.getMonth() - postDate.getMonth())
		);
		if (monthsDifference <= 3) {
			score += 2;
		}

		// Boost score if by the same author
		if (post.author.name === currentPost.author.name) {
			score += 3;
		}

		return { post, score };
	});

	// Sort by score and take the top N posts
	return scoredPosts
		.sort((a, b) => b.score - a.score)
		.slice(0, maxPosts)
		.map(({ post }) => post);
}
