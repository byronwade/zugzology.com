import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Script from "next/script";
import { UniversalBreadcrumb } from "@/components/layout/universal-breadcrumb";
import { Link } from "@/components/ui/link";
import { PaginationControlsSSR } from "@/components/ui/pagination";
import { getBlogs, getPaginatedBlogPosts } from "@/lib/api/shopify/actions";
import {
	getEnhancedBreadcrumbSchema,
	getEnhancedOrganizationSchema,
	getSearchActionSchema,
} from "@/lib/seo/enhanced-jsonld";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import type { ShopifyBlogArticle } from "@/lib/types";

type BlogsPageProps = {
	searchParams?: Promise<{
		page?: string;
	}>;
};

export function generateMetadata(): Metadata {
	const baseTitle = "Expert Mushroom Cultivation Blog - Growing Guides & Tips";

	const description =
		"Discover expert insights, comprehensive guides, and professional tips about mushroom cultivation. Learn advanced growing techniques, equipment recommendations, and best practices from industry experts.";

	return generateSEOMetadata({
		title: baseTitle,
		description,
		keywords: [
			"mushroom cultivation blog",
			"mushroom growing guides",
			"cultivation techniques",
			"mushroom farming tips",
			"growing equipment guides",
			"expert mushroom advice",
			"cultivation tutorials",
			"mushroom growing insights",
			"professional growing tips",
			"mushroom cultivation resources",
		],
		url: "/blogs",
		openGraph: {
			type: "website",
		},
	});
}

interface BlogPost extends ShopifyBlogArticle {
	blogHandle: string;
}

type BlogCardProps = {
	post: BlogPost;
	blogHandle: string;
};

function BlogCard({ post, blogHandle }: BlogCardProps) {
	return (
		<Link className="group" href={`/blogs/${blogHandle}/${post.handle}`} prefetch={true}>
			<article className="flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-300 hover:shadow-md group-hover:translate-y-[-4px]">
				<div className="relative">
					<div className="relative aspect-[16/9] overflow-hidden">
						{post.image ? (
							<Image
								alt={post.image.altText || post.title}
								className="object-cover transition-transform duration-300 group-hover:scale-105"
								fill
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
								src={post.image.url}
							/>
						) : (
							<div className="absolute inset-0 flex items-center justify-center bg-neutral-100 p-4 text-center dark:bg-neutral-800">
								<div className="space-y-2">
									<p className="font-medium text-neutral-500 text-sm dark:text-neutral-400">🍄 A Mushroom Pic</p>
									<p className="text-neutral-400 text-xs dark:text-neutral-500">Still Growing...</p>
								</div>
							</div>
						)}
					</div>
					<div className="absolute top-3 left-3">
						<span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs">
							{post.blogTitle}
						</span>
					</div>
				</div>
				<div className="flex flex-grow flex-col space-y-3 p-5">
					<h3 className="line-clamp-2 font-semibold text-neutral-900 text-xl transition-colors group-hover:text-primary dark:text-neutral-100">
						{post.title}
					</h3>
					<p className="line-clamp-3 flex-grow text-neutral-600 text-sm dark:text-neutral-400">{post.excerpt}</p>
					<div className="flex items-center gap-2 border-neutral-100 border-t pt-2 text-neutral-500 text-sm dark:border-neutral-800 dark:text-neutral-400">
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
function getRandomFeaturedPosts(posts: ShopifyBlogArticle[], count = 2) {
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

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
	// Always await searchParams in Next.js 15
	const nextjs15SearchParams = await searchParams;
	const currentPage = nextjs15SearchParams?.page ? Number.parseInt(nextjs15SearchParams.page, 10) : 1;

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

	// Generate enhanced structured data
	const breadcrumbs = [
		{ name: "Home", url: "/" },
		{ name: "Blog", url: "/blogs" },
	];

	const breadcrumbSchema = getEnhancedBreadcrumbSchema(breadcrumbs);
	const websiteSchema = getSearchActionSchema();
	const organizationSchema = getEnhancedOrganizationSchema();

	// Enhanced blog schema with more comprehensive data
	const blogSchema = {
		"@context": "https://schema.org",
		"@type": "Blog",
		"@id": "https://zugzology.com/blogs#blog",
		name: "Zugzology Blog - Mushroom Cultivation Insights",
		description:
			"Expert insights, comprehensive guides, and professional tips about mushroom cultivation. Learn advanced growing techniques, equipment recommendations, and best practices from industry experts.",
		url: "https://zugzology.com/blogs",
		inLanguage: "en-US",
		publisher: organizationSchema,
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": "https://zugzology.com/blogs",
		},
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: "https://zugzology.com/blogs?search={search_term_string}",
			},
			"query-input": "required name=search_term_string",
		},
		author: organizationSchema,
		numberOfPages: pagination.totalPages,
		itemListElement: allPosts.slice(0, 5).map((post, index) => ({
			"@type": "BlogPosting",
			position: index + 1,
			name: post.title,
			url: `https://zugzology.com/blogs/${post.blog?.handle || "news"}/${post.handle}`,
			datePublished: post.publishedAt,
			author: {
				"@type": "Person",
				name: post.author?.name || "Expert Team",
			},
		})),
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
			{/* JSON-LD Structured Data */}
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
				type="application/ld+json"
			/>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(blogSchema),
				}}
				type="application/ld+json"
			/>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteSchema),
				}}
				type="application/ld+json"
			/>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(organizationSchema),
				}}
				type="application/ld+json"
			/>

			{/* Google Analytics for Blog Listing */}
			<Script id="blog-listing-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'blog_listing',
						'page_location': window.location.href,
						'content_category': 'blog',
						'total_posts': ${pagination.totalPosts},
						'current_page': ${currentPage},
						'total_pages': ${pagination.totalPages}
					});
					
					// Track blog view event
					window.dataLayer.push({
						'event': 'view_item_list',
						'item_list_id': 'blog_listing',
						'item_list_name': 'Blog Articles',
						'items': ${JSON.stringify(
							allPosts.slice(0, 10).map((post, index) => ({
								item_id: post.id,
								item_name: post.title,
								item_category: "blog_post",
								item_brand: "Zugzology",
								index,
							}))
						)}
					});
				`}
			</Script>

			<div className="min-h-screen bg-background">
				{/* Breadcrumb */}
				<UniversalBreadcrumb items={breadcrumbs} />

				{/* Blog Categories Section */}
				<section className="mb-8 w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900">
					<div className="container mx-auto px-4 py-12">
						<div className="mb-6 flex flex-col items-center justify-between md:flex-row">
							<div>
								<h2 className="font-bold text-2xl text-neutral-900 dark:text-neutral-100">Browse by Category</h2>
								<p className="mt-1 text-neutral-600 dark:text-neutral-400">
									Explore our specialized blog categories to find exactly what you&apos;re looking for
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
							{blogs.map((blogCategory) => (
								<Link
									className="group flex items-center rounded-lg border border-neutral-200 bg-white p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
									href={`/blogs/${blogCategory.handle}`}
									key={blogCategory.id}
								>
									<div className="flex-1">
										<h3 className="font-medium text-neutral-900 text-sm transition-colors group-hover:text-primary dark:text-neutral-100">
											{blogCategory.title}
										</h3>
										<p className="mt-1 text-neutral-500 text-xs dark:text-neutral-400">
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
						<section className="w-full bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-black">
							<div className="container mx-auto px-4 py-12">
								<div className="mb-10 flex items-center justify-between">
									<div>
										<h2 className="font-bold text-3xl text-neutral-900 dark:text-neutral-100">Featured Articles</h2>
										<p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
											Hand-picked articles worth reading
										</p>
									</div>
								</div>
								<div className="grid gap-8 md:grid-cols-2">
									{featuredPosts.map((post) => (
										<Link
											className="group"
											href={`/blogs/${post.blogHandle}/${post.handle}`}
											key={post.id}
											prefetch={true}
										>
											<article className="relative">
												<div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-foreground/10 transition-transform hover:border-foreground/20 group-hover:scale-[1.02]">
													{post.image ? (
														<Image
															alt={post.image.altText || post.title}
															className="rounded-xl object-cover"
															fill
															sizes="(max-width: 768px) 100vw, 50vw"
															src={post.image.url}
														/>
													) : (
														<div className="absolute inset-0 flex items-center justify-center bg-neutral-100 p-4 text-center dark:bg-neutral-800">
															<div className="space-y-2">
																<p className="font-medium text-neutral-500 text-sm dark:text-neutral-400">
																	🍄 A Mushroom Pic
																</p>
																<p className="text-neutral-400 text-xs dark:text-neutral-500">Still Growing...</p>
															</div>
														</div>
													)}
													<div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/60 to-black/0" />
													<div className="absolute bottom-0 p-6 text-white">
														<p className="mb-2 font-medium text-primary/80 text-sm">{post.blogTitle}</p>
														<h3 className="mb-2 font-semibold text-2xl">{post.title}</h3>
														<div className="flex items-center gap-2 text-neutral-200 text-sm">
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
					<section className="w-full">
						<div className="container mx-auto px-4 py-12">
							<div className="mb-10 flex items-center justify-between">
								<div>
									<h2 className="font-bold text-3xl text-neutral-900 dark:text-neutral-100">All Articles</h2>
									<p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
										{pagination.totalPosts > 0
											? `Showing ${(pagination.currentPage - 1) * pagination.postsPerPage + 1}-${Math.min(
													pagination.currentPage * pagination.postsPerPage,
													pagination.totalPosts
												)} of ${pagination.totalPosts} articles`
											: "No articles available"}
									</p>
								</div>
								<div className="hidden items-center gap-4 md:flex">
									<div className="flex items-center gap-2">
										<span className="text-neutral-600 text-sm dark:text-neutral-400">Filter by:</span>
										<select
											className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm dark:border-neutral-800 dark:bg-neutral-900"
											disabled
										>
											<option>All Categories</option>
										</select>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-neutral-600 text-sm dark:text-neutral-400">Sort by:</span>
										<select
											className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm dark:border-neutral-800 dark:bg-neutral-900"
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
									<BlogCard blogHandle={post.blogHandle} key={post.id} post={post} />
								))}
							</div>

							{/* Pagination */}
							<div className="container mx-auto px-4 py-12">
								<PaginationControlsSSR
									basePath="/blogs"
									currentPage={pagination.currentPage}
									totalPages={pagination.totalPages}
								/>
							</div>
						</div>
					</section>
				</section>
			</div>
		</>
	);
}
