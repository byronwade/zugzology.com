import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

interface BlogPost {
	id: string;
	title: string;
	content: string;
	publishedAt: string;
	category: string;
	author: {
		name: string;
		avatar: string;
		bio: string;
	};
	references?: string[];
	methodology?: string;
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
			category: "lifestyle",
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
			category: "tech",
			author: {
				name: "Alex Chen",
				avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
				bio: "Technology journalist and smart home enthusiast. Writing about the intersection of technology and daily life.",
			},
		},
	},
	research: {
		"latest-mycology-research": {
			id: "5",
			title: "Latest Developments in Mycology Research",
			content: `
				<p>Recent advances in mycology research have opened new frontiers in our understanding of fungi and their potential applications.</p>
				
				<h2>Key Research Areas</h2>
				<p>Current research focuses on several key areas:</p>
				<ul>
					<li>Therapeutic applications of various mushroom species</li>
					<li>Advanced cultivation techniques</li>
					<li>Genetic analysis and species identification</li>
				</ul>
				
				<h2>Methodology</h2>
				<p>This research combines laboratory analysis with field studies...</p>
			`,
			publishedAt: "2024-01-20T10:00:00Z",
			category: "research",
			author: {
				name: "Dr. Maria Santos",
				avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
				bio: "Lead researcher in mycology with focus on therapeutic applications.",
			},
			methodology: "Combined laboratory analysis and field studies",
			references: ["Journal of Mycology (2023)", "International Research Review (2024)"],
		},
	},
};

export async function generateMetadata({ params }: { params: { blog: string; slug: string } }): Promise<Metadata> {
	const post = await getBlogPost(params.blog, params.slug);
	if (!post) return notFound();

	return {
		title: post.title,
		description: post.content.substring(0, 160).replace(/<[^>]*>/g, ""),
		openGraph: {
			title: post.title,
			description: post.content.substring(0, 160).replace(/<[^>]*>/g, ""),
			type: "article",
			authors: [post.author.name],
			publishedTime: post.publishedAt,
		},
	};
}

const getBlogPost = unstable_cache(
	async (category: string, slug: string) => {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return mockBlogPosts[category]?.[slug] || null;
	},
	["blog-post"],
	{
		revalidate: 1800,
		tags: ["blog"],
	}
);

function AuthorCard({ author }: { author: BlogPost["author"] }) {
	return (
		<div className="flex items-center space-x-4 border-t border-b border-gray-200 dark:border-gray-700 py-6 my-8">
			<Image src={author.avatar} alt={author.name} width={64} height={64} className="rounded-full" />
			<div>
				<h3 className="font-semibold text-lg dark:text-gray-200">{author.name}</h3>
				<p className="text-gray-600 dark:text-gray-400">{author.bio}</p>
			</div>
		</div>
	);
}

function ResearchDetails({ post }: { post: BlogPost }) {
	if (post.category !== "research") return null;

	return (
		<div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mt-8">
			{post.methodology && (
				<div className="mb-4">
					<h3 className="font-semibold text-lg mb-2">Methodology</h3>
					<p className="text-gray-600 dark:text-gray-300">{post.methodology}</p>
				</div>
			)}
			{post.references && post.references.length > 0 && (
				<div>
					<h3 className="font-semibold text-lg mb-2">References</h3>
					<ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
						{post.references.map((ref, index) => (
							<li key={index}>{ref}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

async function BlogPostContent({ category, slug }: { category: string; slug: string }) {
	const post = await getBlogPost(category, slug);

	if (!post) {
		return notFound();
	}

	return (
		<article className="prose prose-lg dark:prose-invert mx-auto">
			<Link href={`/blogs/${category}`} className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mb-4 inline-block">
				← Back to {category} articles
			</Link>
			<h1>{post.title}</h1>
			<div className="text-gray-500 dark:text-gray-400 mb-8">Published on {new Date(post.publishedAt).toLocaleDateString()}</div>
			<div dangerouslySetInnerHTML={{ __html: post.content }} className="mt-8" />
			{post.category === "research" && <ResearchDetails post={post} />}
			<AuthorCard author={post.author} />
		</article>
	);
}

export default function BlogPostPage({ params }: { params: { blog: string; slug: string } }) {
	return (
		<div className="max-w-4xl mx-auto">
			<Suspense
				fallback={
					<div className="space-y-4 animate-pulse">
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
						<div className="space-y-2">
							{[...Array(5)].map((_, i) => (
								<div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
							))}
						</div>
					</div>
				}
			>
				<BlogPostContent category={params.blog} slug={params.slug} />
			</Suspense>
		</div>
	);
}
