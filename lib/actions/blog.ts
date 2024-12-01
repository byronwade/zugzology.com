import { unstable_cache } from "next/cache";

// Blog post interface
export interface BlogPost {
	id: string;
	title: string;
	handle: string;
	excerpt: string;
	publishedAt: string;
	author: {
		name: string;
		avatar: string;
		bio: string;
	};
	image?: {
		url: string;
		altText: string;
		width: number;
		height: number;
	};
	content?: string;
	category?: string;
	references?: string[];
	methodology?: string;
}

// Mock blog data
const mockBlogs = {
	research: {
		title: "Research & Studies",
		handle: "research",
		articles: {
			edges: [
				{
					node: {
						id: "1",
						title: "Mycelium's Gambit: Advanced Research",
						handle: "myceliums-gambit",
						excerpt: "Recent advances in mycology research have opened new frontiers...",
						publishedAt: "2024-01-20T10:00:00Z",
						author: {
							name: "Dr. Maria Santos",
							avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
							bio: "Lead researcher in mycology with focus on therapeutic applications.",
						},
						image: {
							url: "https://images.unsplash.com/photo-1516044734145-07ca8eef8731?w=800&q=80",
							altText: "Mycology Research",
							width: 800,
							height: 600,
						},
					},
				},
			],
		},
	},
	lifestyle: {
		title: "Lifestyle",
		handle: "lifestyle",
		articles: {
			edges: [
				{
					node: {
						id: "2",
						title: "10 Essential Items for Minimalist Living",
						handle: "10-essential-items-minimalist-living",
						excerpt: "In today's fast-paced world, more people are turning to minimalism...",
						publishedAt: "2024-01-15T10:00:00Z",
						author: {
							name: "Emma Thompson",
							avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
							bio: "Minimalism expert and lifestyle consultant",
						},
						image: {
							url: "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=800&q=80",
							altText: "Minimalist Living",
							width: 800,
							height: 600,
						},
					},
				},
			],
		},
	},
};

// Get blog data
export const getBlog = unstable_cache(
	async (handle: string) => {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 100));
		return mockBlogs[handle as keyof typeof mockBlogs] || null;
	},
	["blog"],
	{
		revalidate: 3600,
		tags: ["blog"],
	}
);

// Get blog post data
export const getBlogPost = unstable_cache(
	async (blogHandle: string, postHandle: string) => {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 100));

		const blog = mockBlogs[blogHandle as keyof typeof mockBlogs];
		if (!blog) return null;

		const post = blog.articles.edges.find(({ node }) => node.handle === postHandle)?.node;

		if (!post) return null;

		// Add full content for the post
		return {
			...post,
			content: `
        <p>${post.excerpt}</p>
        <h2>Key Points</h2>
        <ul>
          <li>Important finding 1</li>
          <li>Important finding 2</li>
          <li>Important finding 3</li>
        </ul>
        <p>More detailed content would go here...</p>
      `,
			category: blogHandle,
			...(blogHandle === "research" && {
				methodology: "Combined laboratory analysis and field studies",
				references: ["Journal of Mycology (2023)", "International Research Review (2024)"],
			}),
		};
	},
	["blog-post"],
	{
		revalidate: 3600,
		tags: ["blog"],
	}
);
