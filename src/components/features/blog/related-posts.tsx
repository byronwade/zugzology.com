import Image from "next/image";
import { Link } from "@/components/ui/link";
import type { ShopifyBlogArticle } from "@/lib/types";

type RelatedPostsProps = {
	currentPost: ShopifyBlogArticle;
	relatedPosts: ShopifyBlogArticle[];
	blogHandle: string;
};

export function RelatedPosts({ currentPost, relatedPosts, blogHandle }: RelatedPostsProps) {
	if (relatedPosts.length === 0) {
		return null;
	}

	return (
		<section className="mt-20 border-t pt-16 dark:border-neutral-800">
			<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{relatedPosts.map((post) => (
					<Link className="group" href={`/blogs/${post.blogHandle}/${post.handle}`} key={post.id}>
						<article className="space-y-4">
							{post.image && (
								<div className="not-prose">
									<div className="relative aspect-[16/9] overflow-hidden rounded-xl shadow-md transition-transform group-hover:scale-[1.02]">
										<Image
											alt={post.image.altText || post.title}
											className="rounded-xl object-cover"
											fill
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
											src={post.image.url}
										/>
									</div>
								</div>
							)}
							<div className="space-y-2">
								<div className="space-y-1">
									{post.blogHandle !== currentPost.blogHandle && (
										<p className="font-medium text-primary text-sm">{post.blogTitle}</p>
									)}
									<h3 className="font-semibold text-lg text-neutral-900 transition-colors group-hover:text-primary dark:text-neutral-100">
										{post.title}
									</h3>
								</div>
								<p className="line-clamp-2 text-neutral-600 text-sm dark:text-neutral-400">{post.excerpt}</p>
								<div className="flex items-center gap-2 text-neutral-500 text-sm dark:text-neutral-400">
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
