import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getBlogByHandle, getPaginatedBlogPostsByHandle } from "@/lib/api/shopify/actions";
import type { ShopifyBlogArticle, ShopifyBlog } from "@/lib/types";
import { BlogBreadcrumb } from "@/components/blog/blog-breadcrumb";
import { jsonLdScriptProps } from "react-schemaorg";
import type { WithContext } from "schema-dts";
import { Blog, BreadcrumbList } from "schema-dts";
import { unstable_noStore as noStore } from "next/cache";
import { PaginationControls } from "@/components/ui/pagination";

// Constants for pagination
const POSTS_PER_PAGE = 12;

// Get blog data
async function getBlogData(handle: string) {
	noStore();
	return getBlogByHandle(handle);
}

export async function generateMetadata({ params }: { params: { blog: string } }): Promise<Metadata> {
	const nextParams = await params;
	const blog = await getBlogData(nextParams.blog);

	if (!blog) {
		return {
			title: "Blog Not Found",
			description: "The requested blog category could not be found.",
		};
	}

	const title = `${blog.title} - Zugzology Blog`;
	const description = `Explore our ${blog.title} articles. Find expert insights, tips, and guides about mushroom cultivation and mycology.`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "website",
			images: [
				{
					url: "https://zugzology.com/blog-og-image.jpg",
					width: 1200,
					height: 630,
					alt: title,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: ["https://zugzology.com/blog-twitter-image.jpg"],
		},
	};
}

interface BlogCardProps {
	article: ShopifyBlogArticle;
	blogHandle: string;
}

function BlogCard({ article, blogHandle }: BlogCardProps) {
	return (
		<Link href={`/blogs/${blogHandle}/${article.handle}`} className="group">
			<article className="space-y-4">
				<div className="not-prose">
					<div className="aspect-[16/9] relative overflow-hidden rounded-xl transition-transform group-hover:scale-[1.02] border border-foreground/10 hover:border-foreground/20">
						{article.image ? (
							<Image src={article.image.url} alt={article.image.altText || article.title} fill className="object-cover rounded-xl" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
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
						<p className="text-sm font-medium text-purple-600 dark:text-purple-400">{article.blog?.title}</p>
						<h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{article.title}</h3>
					</div>
					<p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{article.excerpt}</p>
					<div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
						<span>{article.author.name}</span>
						<span>•</span>
						<time dateTime={article.publishedAt}>
							{new Date(article.publishedAt).toLocaleDateString("en-US", {
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

// Helper function to get random featured posts
function getRandomFeaturedPosts(posts: ShopifyBlogArticle[], count: number = 3) {
	const shuffled = [...posts].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

export default async function BlogCategoryPage({ params, searchParams }: { params: { blog: string }; searchParams?: { page?: string } }) {
	const startTime = performance.now();

	// Always await params and searchParams in Next.js 15
	const nextParams = await params;
	const nextSearchParams = await searchParams;
	const currentPage = nextSearchParams?.page ? parseInt(nextSearchParams.page) : 1;

	// Get paginated blog posts for this blog handle
	const { posts, blog, pagination } = await getPaginatedBlogPostsByHandle(nextParams.blog, currentPage, POSTS_PER_PAGE);

	if (!blog) {
		console.log(`❌ [Blog Category] Not found: ${nextParams.blog}`);
		return notFound();
	}

	// If no posts found and we're not on the first page, redirect to first page
	if (posts.length === 0 && currentPage > 1) {
		return notFound();
	}

	// Get featured posts (only on first page)
	const featuredPosts = currentPage === 1 ? getRandomFeaturedPosts(posts) : [];

	// Filter out featured posts from the main list if we're on the first page
	const remainingPosts = currentPage === 1 ? posts.filter((post) => !featuredPosts.find((fp) => fp.id === post.id)) : posts;

	const duration = performance.now() - startTime;
	console.log(`⚡ [Blog Category ${blog.title}] ${duration.toFixed(2)}ms`, {
		articles: posts.length,
		hasImages: posts.filter((a: ShopifyBlogArticle) => a.image).length,
		page: currentPage,
		totalPages: pagination.totalPages,
	});

	// Generate structured data
	const blogStructuredData: WithContext<Blog> = {
		"@context": "https://schema.org",
		"@type": "Blog",
		name: `${blog.title} - Zugzology Blog`,
		description: `Explore our ${blog.title} articles. Find expert insights, tips, and guides about mushroom cultivation and mycology.`,
		url: `https://zugzology.com/blogs/${blog.handle}`,
		publisher: {
			"@type": "Organization",
			name: "Zugzology",
			logo: {
				"@type": "ImageObject",
				url: "https://zugzology.com/logo.png",
			},
		},
		blogPost: posts.map((article: ShopifyBlogArticle) => ({
			"@type": "BlogPosting",
			headline: article.title,
			description: article.excerpt,
			datePublished: article.publishedAt,
			author: {
				"@type": "Person",
				name: article.author.name,
			},
			url: `https://zugzology.com/blogs/${blog.handle}/${article.handle}`,
			...(article.image && {
				image: {
					"@type": "ImageObject",
					url: article.image.url,
					height: article.image.height?.toString() || "600",
					width: article.image.width?.toString() || "800",
				},
			}),
		})),
	};

	const breadcrumbStructuredData: WithContext<BreadcrumbList> = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				item: {
					"@type": "Thing",
					name: "Home",
					"@id": "https://zugzology.com",
				},
			},
			{
				"@type": "ListItem",
				position: 2,
				item: {
					"@type": "Thing",
					name: "Blogs",
					"@id": "https://zugzology.com/blogs",
				},
			},
			{
				"@type": "ListItem",
				position: 3,
				item: {
					"@type": "Thing",
					name: blog.title,
					"@id": `https://zugzology.com/blogs/${blog.handle}`,
				},
			},
		],
	};

	return (
		<>
			<script {...jsonLdScriptProps(blogStructuredData)} />
			<script {...jsonLdScriptProps(breadcrumbStructuredData)} />
			<section className="w-full p-4">
				<div className="max-w-[1800px] mx-auto">
					{/* Featured Posts Section - Only show if there are featured posts */}
					{featuredPosts.length > 0 && (
						<section className="mb-16">
							<div className="flex items-center justify-between mb-8">
								<div>
									<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Featured {blog.title} Articles</h2>
									<p className="mt-1 text-neutral-600 dark:text-neutral-400">Hand-picked articles from this category</p>
								</div>
							</div>
							<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
								{featuredPosts.map((post) => (
									<Link key={post.id} href={`/blogs/${blog.handle}/${post.handle}`} className="group lg:col-span-4 md:col-span-1">
										<article className="space-y-3">
											<div className="aspect-[16/9] relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 group-hover:border-purple-500 dark:group-hover:border-purple-500 transition-colors duration-200">
												{post.image ? (
													<Image src={post.image.url} alt={post.image.altText || post.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 33vw" priority={post === featuredPosts[0]} />
												) : (
													<div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-center p-4">
														<div className="space-y-2">
															<p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">🍄 A Mushroom Pic</p>
															<p className="text-neutral-400 dark:text-neutral-500 text-xs">Still Growing...</p>
														</div>
													</div>
												)}
											</div>
											<div className="space-y-2">
												<h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">{post.title}</h3>
												<p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2">{post.excerpt}</p>
												<div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200 dark:border-neutral-800">
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
					)}

					{/* All Articles Section - Only show if there are remaining posts */}
					{remainingPosts.length > 0 && (
						<section>
							<div className="flex items-center justify-between mb-8">
								<div>
									<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">All {blog.title} Articles</h2>
									<p className="mt-1 text-neutral-600 dark:text-neutral-400">{pagination.totalPosts > 0 ? `Showing ${(pagination.currentPage - 1) * pagination.postsPerPage + 1}-${Math.min(pagination.currentPage * pagination.postsPerPage, pagination.totalPosts)} of ${pagination.totalPosts} articles` : "No articles available"}</p>
								</div>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
								{remainingPosts.map((article) => (
									<BlogCard key={article.id} article={article} blogHandle={blog.handle} />
								))}
							</div>

							{/* Pagination */}
							{pagination.totalPages > 1 && (
								<div className="mt-12 mb-8">
									<PaginationControls currentPage={pagination.currentPage} totalPages={pagination.totalPages} baseUrl={`/blogs/${blog.handle}`} />
								</div>
							)}
						</section>
					)}

					{/* Show message if no posts at all */}
					{posts.length === 0 && (
						<div className="text-center py-12">
							<p className="text-neutral-600 dark:text-neutral-400">No articles found in this category.</p>
						</div>
					)}
				</div>
			</section>
		</>
	);
}
