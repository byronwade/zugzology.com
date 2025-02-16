import { Link } from "@/components/ui/link";
import Image from "next/image";
import type { ShopifyBlogArticle } from "@/lib/types";

interface RecentPostsProps {
	posts: ShopifyBlogArticle[];
}

export function RecentPosts({ posts }: RecentPostsProps) {
	if (posts.length === 0) return null;

	return (
		<section className="mt-16 mb-16 border-t dark:border-neutral-800 pt-16">
			<h2 className="text-2xl font-bold mb-8 text-neutral-900 dark:text-neutral-100">Latest from Our Blog</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{posts.slice(0, 3).map((post) => (
					<Link key={post.id} href={`/blogs/${post.blogHandle}/${post.handle}`} className="group">
						<article className="space-y-4">
							{post.image && (
								<div className="not-prose">
									<div className="aspect-[16/9] relative overflow-hidden rounded-xl transition-transform group-hover:scale-[1.02] border border-foreground/10 hover:border-foreground/20">
										<Image src={post.image.url} alt={post.image.altText || post.title} fill className="object-cover rounded-xl" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
									</div>
								</div>
							)}
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
		</section>
	);
}
