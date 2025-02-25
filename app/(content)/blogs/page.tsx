import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getBlogs, getPaginatedBlogPosts } from "@/lib/api/shopify/actions";
import type { ShopifyBlogArticle, ShopifyBlog } from "@/lib/types";
import { jsonLdScriptProps } from "react-schemaorg";
import { WithContext, Blog, BreadcrumbList } from "schema-dts";
import { notFound } from "next/navigation";
import { PaginationControls } from "@/components/ui/pagination";

export const metadata: Metadata = {
	title: "Blog - Mushroom Cultivation Insights & Guides | Zugzology",
	description: "Explore expert insights, guides, and tips about mushroom cultivation. Learn about growing techniques, equipment, and best practices from Zugzology's knowledge base.",
	openGraph: {
		title: "Mushroom Cultivation Blog | Zugzology",
		description: "Expert insights, guides, and tips about mushroom cultivation. Learn about growing techniques, equipment, and best practices.",
		type: "website",
		images: [
			{
				url: "https://zugzology.com/blog-og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Zugzology Blog",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Mushroom Cultivation Blog | Zugzology",
		description: "Expert insights, guides, and tips about mushroom cultivation. Learn about growing techniques, equipment, and best practices.",
		images: ["https://zugzology.com/blog-twitter-image.jpg"],
	},
};

interface BlogPost extends ShopifyBlogArticle {
	blogHandle: string;
}

interface BlogCardProps {
	post: BlogPost;
	blogHandle: string;
}

function BlogCard({ post, blogHandle }: BlogCardProps) {
	return (
		<Link prefetch={true} href={`/blogs/${blogHandle}/${post.handle}`} className="group">
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
	);
}

// Helper function to get random featured posts
function getRandomFeaturedPosts(posts: ShopifyBlogArticle[], count: number = 2) {
	// Convert ShopifyBlogArticle to BlogPost by adding blogHandle
	const blogPosts: BlogPost[] = posts.map((post) => ({
		...post,
		blogHandle: post.blog?.handle || "news", // Default to 'news' if blog handle is not available
	}));

	const shuffled = [...blogPosts].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

// Constants for pagination
const POSTS_PER_PAGE = 12;

export default async function BlogsPage({ searchParams }: { searchParams?: { page?: string } }) {
	// Always await searchParams in Next.js 15
	const nextjs15SearchParams = await searchParams;
	const currentPage = nextjs15SearchParams?.page ? parseInt(nextjs15SearchParams.page) : 1;

	// Get blogs for structured data
	const blogs = await getBlogs();

	if (!blogs) {
		return notFound();
	}

	// Get paginated blog posts
	const { posts: allPosts, pagination } = await getPaginatedBlogPosts(currentPage, POSTS_PER_PAGE);

	if (!allPosts.length && currentPage > 1) {
		// If no posts found and we're not on the first page, redirect to first page
		return notFound();
	}

	// Generate structured data
	const blogStructuredData: WithContext<Blog> = {
		"@context": "https://schema.org",
		"@type": "Blog",
		name: "Zugzology Blog",
		description: "Expert insights, guides, and tips about mushroom cultivation. Learn about growing techniques, equipment, and best practices.",
		url: "https://zugzology.com/blogs",
		publisher: {
			"@type": "Organization",
			name: "Zugzology",
			logo: {
				"@type": "ImageObject",
				url: "https://zugzology.com/logo.png",
			},
		},
	};

	const breadcrumbStructuredData: WithContext<BreadcrumbList> = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: "https://zugzology.com",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Blogs",
				item: "https://zugzology.com/blogs",
			},
		],
	};

	// Get featured posts (only on first page)
	const featuredPosts = currentPage === 1 ? getRandomFeaturedPosts(allPosts) : [];

	// Filter out featured posts from the main list if we're on the first page
	// Convert ShopifyBlogArticle to BlogPost by adding blogHandle
	const blogPosts: BlogPost[] = allPosts.map((post) => ({
		...post,
		blogHandle: post.blog?.handle || "news", // Default to 'news' if blog handle is not available
	}));

	const paginatedPosts = currentPage === 1 ? blogPosts.filter((post) => !featuredPosts.find((fp) => fp.id === post.id)) : blogPosts;

	return (
		<>
			<script {...jsonLdScriptProps(blogStructuredData)} />
			<script {...jsonLdScriptProps(breadcrumbStructuredData)} />
			<div className="min-h-screen w-full">
				<div className="max-w-[1800px] mx-auto px-4 py-8">
					{/* Featured Posts Section - Only show if there are featured posts */}
					{featuredPosts.length > 0 && (
						<section className="mb-16">
							<div className="flex items-center justify-between mb-8">
								<div>
									<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Featured Articles</h2>
									<p className="mt-1 text-neutral-600 dark:text-neutral-400">Hand-picked articles worth reading</p>
								</div>
							</div>
							<div className="grid gap-8 md:grid-cols-2">
								{featuredPosts.map((post) => (
									<Link key={post.id} prefetch={true} href={`/blogs/${post.blogHandle}/${post.handle}`} className="group">
										<article className="relative">
											<div className="aspect-[16/9] relative overflow-hidden rounded-xl transition-transform group-hover:scale-[1.02] border border-foreground/10 hover:border-foreground/20">
												{post.image ? (
													<Image src={post.image.url} alt={post.image.altText || post.title} fill className="object-cover rounded-xl" sizes="(max-width: 768px) 100vw, 50vw" />
												) : (
													<div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-center p-4">
														<div className="space-y-2">
															<p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">🍄 A Mushroom Pic</p>
															<p className="text-neutral-400 dark:text-neutral-500 text-xs">Still Growing...</p>
														</div>
													</div>
												)}
												<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0 rounded-xl" />
												<div className="absolute bottom-0 p-6 text-white">
													<p className="text-sm font-medium text-purple-200 mb-2">{post.blogTitle}</p>
													<h3 className="font-semibold text-xl mb-2 group-hover:text-purple-200 transition-colors">{post.title}</h3>
													<div className="flex items-center gap-2 text-sm text-neutral-200">
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
											</div>
										</article>
									</Link>
								))}
							</div>
						</section>
					)}

					{/* Latest Articles Section - Only show if there are remaining posts */}
					{paginatedPosts.length > 0 && (
						<section>
							<div className="flex items-center justify-between mb-8">
								<div>
									<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Latest Articles</h2>
									<p className="mt-1 text-neutral-600 dark:text-neutral-400">{pagination.totalPosts > 0 ? `Showing ${(pagination.currentPage - 1) * pagination.postsPerPage + 1}-${Math.min(pagination.currentPage * pagination.postsPerPage, pagination.totalPosts)} of ${pagination.totalPosts} articles` : "No articles available"}</p>
								</div>
							</div>
							<Suspense
								fallback={
									<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
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
								<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
									{paginatedPosts.map((post) => (
										<BlogCard key={post.id} post={post} blogHandle={post.blogHandle} />
									))}
								</div>

								{/* Pagination */}
								{pagination.totalPages > 1 && (
									<div className="mt-12 mb-8">
										<PaginationControls currentPage={pagination.currentPage} totalPages={pagination.totalPages} baseUrl="/blogs" />
									</div>
								)}
							</Suspense>
						</section>
					)}

					{/* Show message if no posts at all */}
					{allPosts.length === 0 && (
						<div className="text-center py-12">
							<p className="text-neutral-600 dark:text-neutral-400">No blog posts found.</p>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
