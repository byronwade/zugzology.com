import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getBlogs, getPaginatedBlogPosts } from "@/lib/api/shopify/actions";
import type { ShopifyBlogArticle, ShopifyBlog } from "@/lib/types";
import { jsonLdScriptProps } from "react-schemaorg";
import { WithContext, Blog, BreadcrumbList } from "schema-dts";
import { notFound } from "next/navigation";
import { PaginationControlsSSR } from "@/components/ui/pagination";

export const metadata: Metadata = {
	title: "Blog - Mushroom Cultivation Insights & Guides | Zugzology",
	description:
		"Explore expert insights, guides, and tips about mushroom cultivation. Learn about growing techniques, equipment, and best practices from Zugzology's knowledge base.",
	openGraph: {
		title: "Mushroom Cultivation Blog | Zugzology",
		description:
			"Expert insights, guides, and tips about mushroom cultivation. Learn about growing techniques, equipment, and best practices.",
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
		description:
			"Expert insights, guides, and tips about mushroom cultivation. Learn about growing techniques, equipment, and best practices.",
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
			<article className="flex flex-col h-full bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group-hover:translate-y-[-4px]">
				<div className="relative">
					<div className="aspect-[16/9] relative overflow-hidden">
						{post.image ? (
							<Image
								src={post.image.url}
								alt={post.image.altText || post.title}
								fill
								className="object-cover transition-transform duration-300 group-hover:scale-105"
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							/>
						) : (
							<div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-center p-4">
								<div className="space-y-2">
									<p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">🍄 A Mushroom Pic</p>
									<p className="text-neutral-400 dark:text-neutral-500 text-xs">Still Growing...</p>
								</div>
							</div>
						)}
					</div>
					<div className="absolute top-3 left-3">
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
							{post.blogTitle}
						</span>
					</div>
				</div>
				<div className="flex flex-col flex-grow p-5 space-y-3">
					<h3 className="font-semibold text-xl text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
						{post.title}
					</h3>
					<p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 flex-grow">{post.excerpt}</p>
					<div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
						<span>{post.author.name}</span>
						<span>•</span>
						<time dateTime={post.publishedAt}>
							{new Date(post.publishedAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</time>
						<span>•</span>
						<span>{Math.ceil((post.excerpt?.split(" ").length || 0) / 200)} min read</span>
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

interface BlogsPageProps {
	searchParams?: Promise<{
		page?: string;
	}>;
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
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
		description:
			"Expert insights, guides, and tips about mushroom cultivation. Learn about growing techniques, equipment, and best practices.",
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

	const paginatedPosts =
		currentPage === 1 ? blogPosts.filter((post) => !featuredPosts.find((fp) => fp.id === post.id)) : blogPosts;

	return (
		<>
			<script {...jsonLdScriptProps<WithContext<Blog>>(blogStructuredData)} key="blog-jsonld" />
			<script {...jsonLdScriptProps<WithContext<BreadcrumbList>>(breadcrumbStructuredData)} key="breadcrumb-jsonld" />

			<div className="bg-white dark:bg-black min-h-screen">
				{/* Breadcrumb */}
				<div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<nav className="hidden md:flex" aria-label="Breadcrumb">
						<ol className="inline-flex items-center space-x-1 md:space-x-3">
							<li className="inline-flex items-center">
								<Link
									href="/"
									className="inline-flex items-center text-sm font-medium text-neutral-700 hover:text-purple-600 dark:text-neutral-400 dark:hover:text-purple-500"
								>
									Home
								</Link>
							</li>
							<li aria-current="page">
								<div className="flex items-center">
									<span className="mx-2 text-neutral-400 dark:text-neutral-500">/</span>
									<span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Blogs</span>
								</div>
							</li>
						</ol>
					</nav>
				</div>

				{/* Blog Categories Section */}
				<section className="w-full py-8 mb-8 bg-neutral-50 dark:bg-neutral-900 rounded-2xl">
					<div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex flex-col md:flex-row items-center justify-between mb-6">
							<div>
								<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Browse by Category</h2>
								<p className="mt-1 text-neutral-600 dark:text-neutral-400">
									Explore our specialized blog categories to find exactly what you're looking for
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
							{blogs.map((blogCategory) => (
								<Link
									key={blogCategory.id}
									href={`/blogs/${blogCategory.handle}`}
									className="group flex items-center p-3 rounded-lg border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
								>
									<div className="flex-1">
										<h3 className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm">
											{blogCategory.title}
										</h3>
										<p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
											{blogCategory.articles.edges?.length || 0}{" "}
											{blogCategory.articles.edges?.length === 1 ? "article" : "articles"}
										</p>
									</div>
								</Link>
							))}
						</div>
					</div>
				</section>

				{/* Featured Articles */}
				<section className="py-12">
					{/* Featured Posts Section - Only show if there are featured posts */}
					{featuredPosts.length > 0 && (
						<section className="w-full bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-black py-16">
							<div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
								<div className="flex items-center justify-between mb-10">
									<div>
										<h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Featured Articles</h2>
										<p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
											Hand-picked articles worth reading
										</p>
									</div>
								</div>
								<div className="grid gap-8 md:grid-cols-2">
									{featuredPosts.map((post) => (
										<Link
											key={post.id}
											prefetch={true}
											href={`/blogs/${post.blogHandle}/${post.handle}`}
											className="group"
										>
											<article className="relative">
												<div className="aspect-[16/9] relative overflow-hidden rounded-xl transition-transform group-hover:scale-[1.02] border border-foreground/10 hover:border-foreground/20">
													{post.image ? (
														<Image
															src={post.image.url}
															alt={post.image.altText || post.title}
															fill
															className="object-cover rounded-xl"
															sizes="(max-width: 768px) 100vw, 50vw"
														/>
													) : (
														<div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-center p-4">
															<div className="space-y-2">
																<p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
																	🍄 A Mushroom Pic
																</p>
																<p className="text-neutral-400 dark:text-neutral-500 text-xs">Still Growing...</p>
															</div>
														</div>
													)}
													<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0 rounded-xl" />
													<div className="absolute bottom-0 p-6 text-white">
														<p className="text-sm font-medium text-purple-200 mb-2">{post.blogTitle}</p>
														<h3 className="font-semibold text-2xl mb-2 group-hover:text-purple-200 transition-colors">
															{post.title}
														</h3>
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
							</div>
						</section>
					)}

					{/* All Posts Section */}
					<section className="w-full py-16">
						<div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
							<div className="flex items-center justify-between mb-10">
								<div>
									<h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">All Articles</h2>
									<p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
										{pagination.totalPosts > 0
											? `Showing ${(pagination.currentPage - 1) * pagination.postsPerPage + 1}-${Math.min(
													pagination.currentPage * pagination.postsPerPage,
													pagination.totalPosts
											  )} of ${pagination.totalPosts} articles`
											: "No articles available"}
									</p>
								</div>
								<div className="hidden md:flex items-center gap-4">
									<div className="flex items-center gap-2">
										<span className="text-sm text-neutral-600 dark:text-neutral-400">Filter by:</span>
										<select
											className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-1.5 text-sm"
											disabled
										>
											<option>All Categories</option>
										</select>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-sm text-neutral-600 dark:text-neutral-400">Sort by:</span>
										<select
											className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-1.5 text-sm"
											disabled
										>
											<option>Latest</option>
										</select>
									</div>
								</div>
							</div>

							{/* Blog Grid */}
							<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
								{paginatedPosts.map((post) => (
									<BlogCard key={post.id} post={post} blogHandle={post.blogHandle} />
								))}
							</div>

							{/* Pagination */}
							<div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
								<PaginationControlsSSR currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
							</div>
						</div>
					</section>
				</section>
			</div>
		</>
	);
}
