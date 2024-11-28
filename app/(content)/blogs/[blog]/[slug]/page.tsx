import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { notFound } from "next/navigation";

interface BlogPost {
	id: string;
	title: string;
	content: string;
	publishedAt: string;
	author: {
		name: string;
		avatar: string;
		bio: string;
	};
}

// Mock blog posts data
const mockBlogPosts: Record<string, Record<string, BlogPost>> = {
	lifestyle: {
		"10-essential-items-minimalist-living": {
			id: "1",
			title: "10 Essential Items for Minimalist Living",
			content: `
				<p>In today's fast-paced world, more people are turning to minimalism as a way to simplify their lives and focus on what truly matters. Here are 10 essential items that every minimalist should consider:</p>
				
				<h2>1. Multi-purpose Furniture</h2>
				<p>Invest in furniture that serves multiple purposes, such as a sofa bed or an ottoman with storage space. This helps maximize your living space while maintaining functionality.</p>
				
				<h2>2. Quality Kitchenware</h2>
				<p>Instead of having numerous cheap utensils, invest in a few high-quality pieces that will last longer and serve you better. A good chef's knife, a versatile pot, and a durable pan are essential.</p>
				
				<h2>3. Capsule Wardrobe</h2>
				<p>Create a wardrobe with versatile pieces that can be mixed and matched. Focus on quality over quantity, and choose timeless styles over trendy items.</p>
				
				<p>Remember, minimalism isn't about deprivation; it's about being intentional with your possessions and choosing items that truly add value to your life.</p>
			`,
			publishedAt: "2024-01-15T10:00:00Z",
			author: {
				name: "Emma Thompson",
				avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
				bio: "Minimalism expert and lifestyle consultant with over 10 years of experience helping people simplify their lives.",
			},
		},
	},
	tech: {
		"future-smart-home-technology": {
			id: "3",
			title: "The Future of Smart Home Technology",
			content: `
				<p>Smart home technology is rapidly evolving, transforming the way we interact with our living spaces. Let's explore the latest innovations and what the future holds.</p>
				
				<h2>AI-Powered Home Assistants</h2>
				<p>The next generation of home assistants will be more intuitive and capable of learning from your daily routines. They'll anticipate your needs and automate tasks before you even ask.</p>
				
				<h2>Advanced Security Systems</h2>
				<p>Future security systems will integrate facial recognition, behavioral analysis, and environmental monitoring to provide comprehensive protection for your home.</p>
				
				<h2>Energy Management</h2>
				<p>Smart homes will become more energy-efficient with advanced systems that optimize power usage based on real-time data and renewable energy integration.</p>
				
				<p>The future of smart homes is not just about convenience; it's about creating sustainable, secure, and personalized living spaces that enhance our daily lives.</p>
			`,
			publishedAt: "2024-01-14T14:20:00Z",
			author: {
				name: "Alex Chen",
				avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
				bio: "Technology journalist and smart home enthusiast. Writing about the intersection of technology and daily life.",
			},
		},
	},
};

const getBlogPost = unstable_cache(
	async (blog: string, slug: string) => {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return mockBlogPosts[blog]?.[slug] || null;
	},
	["blog-post"],
	{
		revalidate: 1800,
		tags: ["blog"],
	}
);

function BlogPostLoading() {
	return <div className="animate-pulse">Loading blog post...</div>;
}

function AuthorCard({ author }: { author: BlogPost["author"] }) {
	return (
		<div className="flex items-center space-x-4 border-t border-b py-6 my-8">
			<img src={author.avatar} alt={author.name} className="w-16 h-16 rounded-full" />
			<div>
				<h3 className="font-semibold text-lg">{author.name}</h3>
				<p className="text-gray-600">{author.bio}</p>
			</div>
		</div>
	);
}

async function BlogPostContent({ blog, slug }: { blog: string; slug: string }) {
	const post = await getBlogPost(blog, slug);

	if (!post) {
		notFound();
	}

	return (
		<article className="prose lg:prose-xl mx-auto">
			<h1>{post.title}</h1>
			<div className="text-gray-500 mb-8">Published on {new Date(post.publishedAt).toLocaleDateString()}</div>
			<div dangerouslySetInnerHTML={{ __html: post.content }} />
			<AuthorCard author={post.author} />
		</article>
	);
}

export default function BlogPostPage({ params }: { params: { blog: string; slug: string } }) {
	return (
		<div className="container mx-auto px-4 py-8">
			<Suspense fallback={<BlogPostLoading />}>
				<BlogPostContent blog={params.blog} slug={params.slug} />
			</Suspense>
		</div>
	);
}
