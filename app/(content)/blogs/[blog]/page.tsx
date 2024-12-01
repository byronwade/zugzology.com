import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getBlogByHandle } from "@/lib/actions/shopify";
import type { ShopifyBlogArticle } from "@/lib/types";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { blog: string } }): Promise<Metadata> {
	const nextjs15 = await params;
	const blog = await getBlogByHandle(nextjs15.blog);
	if (!blog) return notFound();

	return {
		title: `${blog.title} | Zugzology Blog`,
		description: `Read our latest articles about ${blog.title.toLowerCase()}`,
	};
}

interface BlogCardProps {
	article: ShopifyBlogArticle;
	blogHandle: string;
}

function BlogCard({ article, blogHandle }: BlogCardProps) {
	return (
		<article className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
			<Link prefetch={true} href={`/blogs/${blogHandle}/${article.handle}`}>
				<div className="p-6">
					{article.image && (
						<div className="mb-4 aspect-video relative overflow-hidden rounded-lg">
							<Image src={article.image.url} alt={article.image.altText || article.title} width={article.image.width} height={article.image.height} className="object-cover" />
						</div>
					)}
					<div className="mb-4">
						<p className="text-sm text-neutral-500 dark:text-neutral-400">
							By {article.author.name} • {new Date(article.publishedAt).toLocaleDateString()}
						</p>
					</div>
					<h2 className="text-xl font-bold mb-2 dark:text-neutral-100">{article.title}</h2>
					<p className="text-neutral-600 dark:text-neutral-300 mb-4">{article.excerpt}</p>
					<span className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium">Read more →</span>
				</div>
			</Link>
		</article>
	);
}

export default async function BlogCategoryPage({ params }: { params: { blog: string } }) {
	const nextjs15 = await params;
	const blog = await getBlogByHandle(nextjs15.blog);

	if (!blog) {
		return notFound();
	}

	// Sort articles by date
	const articles = blog.articles.edges.map(({ node }) => node).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

	return (
		<div className="min-h-screen w-full">
			<div className="max-w-[1800px] mx-auto px-4 py-8">
				<h1 className="text-4xl font-bold mb-8 text-neutral-900 dark:text-neutral-100">{blog.title}</h1>
				<Suspense
					fallback={
						<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{[...Array(8)].map((_, i) => (
								<div key={i} className="animate-pulse">
									<div className="aspect-video bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-4" />
									<div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2" />
									<div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
								</div>
							))}
						</div>
					}
				>
					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{articles.length > 0 ? (
							articles.map((article) => <BlogCard key={article.id} article={article} blogHandle={blog.handle} />)
						) : (
							<div className="text-center py-12 col-span-full">
								<p className="text-neutral-600 dark:text-neutral-400">No articles found in this category.</p>
							</div>
						)}
					</div>
				</Suspense>
			</div>
		</div>
	);
}
