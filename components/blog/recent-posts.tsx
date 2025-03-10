import Link from "next/link";
import Image from "next/image";
import type { ShopifyBlogArticle } from "@/lib/types";

interface RecentPostsProps {
	posts: ShopifyBlogArticle[];
}

export function RecentPosts({ posts }: RecentPostsProps) {
	if (posts.length === 0) return null;

	return (
		<div className="border-t dark:border-neutral-800 pt-16">
			<h2 className="text-2xl font-bold mb-8 text-neutral-900 dark:text-neutral-100">Latest from Our Blog</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{posts.slice(0, 3).map((post) => (
					<Link key={post.id} href={`/blogs/${post.blogHandle}/${post.handle}`} className="group">
						<article className="space-y-4">
							<div className="not-prose">
								<div className="aspect-[16/9] relative overflow-hidden rounded-xl transition-transform group-hover:scale-[1.02] border border-foreground/10 hover:border-foreground/20">
									{post.image ? (
										<Image src={post.image.url} alt={post.image.altText || post.title} fill className="object-cover rounded-xl" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
									) : (
										<div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-center p-4">
											<div className="space-y-2">
												<p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">🍄 A Mushroom Pic</p>
												<p className="text-neutral-400 dark:text-neutral-500 text-xs">Still Growing...</p>
											</div>
										</div>
									)}
								</div>
							</div>
							<div className="space-y-2">
								<div className="space-y-1">
									<p className="text-sm font-medium text-purple-600 dark:text-purple-400">{post.blogTitle}</p>
									<h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{post.title}</h3>
								</div>
								<p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{post.excerpt}</p>
								<div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
									<span>{post.author.name}</span>
									<span>•</span>
									<time dateTime={post.publishedAt}>
										{new Date(post.publishedAt).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</time>
								</div>
							</div>
						</article>
					</Link>
				))}
			</div>
		</div>
	);
}
