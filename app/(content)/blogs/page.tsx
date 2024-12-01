import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getBlogs } from "@/lib/actions/shopify";
import type { ShopifyBlogArticle, ShopifyBlog } from "@/lib/types";

export const metadata: Metadata = {
	title: "Blog | Zugzology",
	description: "Read our latest articles about mushroom cultivation and research",
};

export const revalidate = 3600;

interface BlogPost extends ShopifyBlogArticle {
	blogHandle: string;
}

interface BlogCardProps {
	post: BlogPost;
	blogHandle: string;
}

function BlogCard({ post, blogHandle }: BlogCardProps) {
	return (
		<article className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
			<Link prefetch={true} href={`/blogs/${blogHandle}/${post.handle}`}>
				<div className="p-6">
					{post.image && (
						<div className="mb-4 aspect-video relative overflow-hidden rounded-lg">
							<Image src={post.image.url} alt={post.image.altText || post.title} width={post.image.width} height={post.image.height} className="object-cover" />
						</div>
					)}
					<div className="mb-4">
						<p className="text-sm text-neutral-500 dark:text-neutral-400">
							By {post.author.name} • {new Date(post.publishedAt).toLocaleDateString()}
						</p>
					</div>
					<h2 className="text-xl font-bold mb-2 dark:text-neutral-100">{post.title}</h2>
					<p className="text-neutral-600 dark:text-neutral-300 mb-4">{post.excerpt}</p>
					<span className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium">Read more →</span>
				</div>
			</Link>
		</article>
	);
}

export default async function BlogsPage() {
	const blogs = await getBlogs();
	const allPosts: BlogPost[] = blogs.flatMap((blog: ShopifyBlog) =>
		blog.articles.edges.map(({ node }) => ({
			...node,
			blogHandle: blog.handle,
		}))
	);

	// Sort posts by date
	allPosts.sort((a: BlogPost, b: BlogPost) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

	return (
		<div className="min-h-screen w-full">
			<div className="max-w-[1800px] mx-auto px-4 py-8">
				<h1 className="text-4xl font-bold mb-8 text-neutral-900 dark:text-neutral-100">Latest Articles</h1>
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
						{allPosts.length > 0 ? (
							allPosts.map((post) => <BlogCard key={post.id} post={post} blogHandle={post.blogHandle} />)
						) : (
							<div className="text-center py-12 col-span-full">
								<p className="text-neutral-600 dark:text-neutral-400">No blog posts found.</p>
							</div>
						)}
					</div>
				</Suspense>
			</div>
		</div>
	);
}
