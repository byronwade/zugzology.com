import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { notFound } from "next/navigation";

interface BlogPost {
	id: string;
	title: string;
	excerpt: string;
	publishedAt: string;
	slug: string;
	author: {
		name: string;
		avatar: string;
	};
}

// Mock blogs data
const mockBlogs: Record<string, BlogPost[]> = {
	lifestyle: [
		{
			id: "1",
			title: "10 Essential Items for Minimalist Living",
			excerpt: "Discover how to simplify your life with these carefully curated items that bring both functionality and joy to your daily routine.",
			publishedAt: "2024-01-15T10:00:00Z",
			slug: "10-essential-items-minimalist-living",
			author: {
				name: "Emma Thompson",
				avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
			},
		},
		{
			id: "2",
			title: "The Art of Slow Living",
			excerpt: "Learn how to embrace a slower pace of life and find more meaning in your daily activities.",
			publishedAt: "2024-01-12T09:30:00Z",
			slug: "art-of-slow-living",
			author: {
				name: "James Wilson",
				avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
			},
		},
	],
	tech: [
		{
			id: "3",
			title: "The Future of Smart Home Technology",
			excerpt: "Explore the latest innovations in smart home technology and how they're changing the way we live.",
			publishedAt: "2024-01-14T14:20:00Z",
			slug: "future-smart-home-technology",
			author: {
				name: "Alex Chen",
				avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
			},
		},
		{
			id: "4",
			title: "5G Technology: What You Need to Know",
			excerpt: "A comprehensive guide to understanding 5G technology and its impact on our daily lives.",
			publishedAt: "2024-01-10T16:45:00Z",
			slug: "5g-technology-guide",
			author: {
				name: "Sarah Johnson",
				avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
			},
		},
	],
};

const getBlogPosts = unstable_cache(
	async (blog: string) => {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return mockBlogs[blog] || null;
	},
	["blog-posts"],
	{
		revalidate: 1800,
		tags: ["blog"],
	}
);

function BlogLoading() {
	return <div className="animate-pulse">Loading blog posts...</div>;
}

function BlogPostCard({ post }: { post: BlogPost }) {
	return (
		<article className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
			<div className="flex items-center mb-4">
				<img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full mr-3" />
				<div>
					<p className="font-semibold">{post.author.name}</p>
					<p className="text-sm text-gray-500">{new Date(post.publishedAt).toLocaleDateString()}</p>
				</div>
			</div>
			<h2 className="text-xl font-bold mb-2">{post.title}</h2>
			<p className="text-gray-600 mb-4">{post.excerpt}</p>
			<a href={`/blogs/${post.slug}`} className="text-blue-600 hover:text-blue-800 font-medium">
				Read more →
			</a>
		</article>
	);
}

async function BlogContent({ blog }: { blog: string }) {
	const posts = await getBlogPosts(blog);

	if (!posts) {
		notFound();
	}

	return (
		<div className="grid gap-8">
			{posts.map((post) => (
				<BlogPostCard key={post.id} post={post} />
			))}
		</div>
	);
}

export default function BlogPage({ params }: { params: { blog: string } }) {
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-4xl font-bold mb-8 capitalize">{params.blog} Blog</h1>
			<Suspense fallback={<BlogLoading />}>
				<BlogContent blog={params.blog} />
			</Suspense>
		</div>
	);
}
