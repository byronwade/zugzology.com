import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getBlog } from "@/lib/actions/shopify";

interface BlogArticle {
	id: string;
	title: string;
	handle: string;
	excerpt: string;
	publishedAt: string;
	author: {
		name: string;
	};
	image?: {
		url: string;
		altText: string;
		width: number;
		height: number;
	};
}

export async function generateMetadata({ params }: { params: { blog: string } }): Promise<Metadata> {
	const nextjs15 = await params;
	const blog = await getBlog(nextjs15.blog);
	if (!blog) return notFound();

	return {
		title: `${blog.title} | Zugzology`,
		description: `Read our latest articles about ${blog.title.toLowerCase()}`,
	};
}

function BlogPostCard({ article }: { article: BlogArticle }) {
	return (
		<article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
			<div className="p-6">
				{article.image && (
					<div className="mb-4 aspect-video relative overflow-hidden rounded-lg">
						<Image src={article.image.url} alt={article.image.altText || article.title} width={article.image.width} height={article.image.height} className="object-cover" />
					</div>
				)}
				<div className="mb-4">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						By {article.author.name} • {new Date(article.publishedAt).toLocaleDateString()}
					</p>
				</div>
				<h2 className="text-xl font-bold mb-2 dark:text-gray-100">{article.title}</h2>
				<p className="text-gray-600 dark:text-gray-300 mb-4">{article.excerpt}</p>
				<Link href={`/blogs/${article.handle}`} className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium inline-flex items-center">
					Read more
					<svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
					</svg>
				</Link>
			</div>
		</article>
	);
}

async function BlogContent({ handle }: { handle: string }) {
	const blog = await getBlog(handle);

	if (!blog) {
		return notFound();
	}

	const articles = blog.articles.edges.map((edge) => edge.node);

	return (
		<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
			{articles.map((article) => (
				<BlogPostCard key={article.id} article={article} />
			))}
		</div>
	);
}

export default async function BlogPage({ params }: { params: { blog: string } }) {
	const nextjs15 = await params;
	const blog = await getBlog(nextjs15.blog);

	if (!blog) return notFound();

	return (
		<>
			<h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">{blog.title}</h1>
			<Suspense
				fallback={
					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64" />
						))}
					</div>
				}
			>
				<BlogContent handle={nextjs15.blog} />
			</Suspense>
		</>
	);
}
