import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getBlogByHandle } from "@/lib/actions/shopify";
import type { ShopifyBlogArticle } from "@/lib/types";
import { BlogBreadcrumb } from "@/components/blog/blog-breadcrumb";

export async function generateMetadata({ params }: { params: { blog: string } }): Promise<Metadata> {
	const nextParams = await params;
	const blog = await getBlogByHandle(nextParams.blog);
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
			<Link href={`/blogs/${blogHandle}/${article.handle}`}>
				<div className="p-6">
					{article.image && (
						<div className="mb-4 not-prose">
							<div className="aspect-video relative overflow-hidden rounded-lg">
								<Image src={article.image.url} alt={article.image.altText || article.title} width={article.image.width} height={article.image.height} className="object-cover rounded-lg" />
							</div>
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

// Loading component
const BlogLoading = () => (
	<div className="min-h-screen w-full">
		<div className="max-w-[1800px] mx-auto px-4 py-8">
			<div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-8" />
			<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{[...Array(8)].map((_, i) => (
					<div key={i} className="animate-pulse">
						<div className="aspect-video bg-neutral-200 dark:bg-neutral-700 rounded-lg mb-4" />
						<div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2" />
						<div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
					</div>
				))}
			</div>
		</div>
	</div>
);

export default async function BlogCategoryPage({ params }: { params: { blog: string } }) {
	const startTime = performance.now();
	const nextParams = await params;
	const blog = await getBlogByHandle(nextParams.blog);

	if (!blog) {
		console.log(`❌ [Blog Category] Not found: ${params.blog}`);
		return notFound();
	}

	// Sort articles by date
	const articles = blog.articles.edges.map(({ node }) => node).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

	const duration = performance.now() - startTime;
	console.log(`⚡ [Blog Category ${blog.title}] ${duration.toFixed(2)}ms`, {
		articles: articles.length,
		hasImages: articles.filter((a) => a.image).length,
	});

	return (
		<section className="w-full p-4">
			<div className="max-w-[1800px] mx-auto">
				<BlogBreadcrumb blogHandle={nextParams.blog} blogTitle={blog.title} />

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{articles.length > 0 ? (
						articles.map((article) => <BlogCard key={article.id} article={article} blogHandle={blog.handle} />)
					) : (
						<div className="text-center py-12 col-span-full">
							<p className="text-neutral-600 dark:text-neutral-400">No articles found in this category.</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
