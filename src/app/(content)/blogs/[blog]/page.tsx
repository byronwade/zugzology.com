import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import { Suspense } from "react";
import { BreadcrumbConfigs, UniversalBreadcrumb } from "@/components/layout";
import { Link } from "@/components/ui/link";
import { PaginationControlsSSR } from "@/components/ui/pagination";
import { getLimitedProducts } from "@/lib/actions/shopify/index";
import { getAllBlogPosts, getBlogByHandle, getPaginatedBlogPostsByHandle } from "@/lib/api/shopify/actions";
import {
	getEnhancedBreadcrumbSchema,
	getEnhancedOrganizationSchema,
	getSearchActionSchema,
} from "@/lib/seo/enhanced-jsonld";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import type { ShopifyBlogArticle } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

// Constants for pagination
const POSTS_PER_PAGE = 12;

// Get blog data
async function getBlogData(handle: string) {
	noStore();
	return getBlogByHandle(handle);
}

type BlogCategoryPageProps = {
	params: Promise<{
		blog: string;
	}>;
	searchParams?: Promise<{
		page?: string;
	}>;
};

export async function generateMetadata({ params, searchParams }: BlogCategoryPageProps): Promise<Metadata> {
	const nextParams = await params;
	const nextSearchParams = await searchParams;

	// Check if blog handle is undefined
	if (!nextParams.blog || nextParams.blog === "undefined") {
		return generateSEOMetadata({
			title: "Blog Category Not Found",
			description: "The requested blog category could not be found.",
			noindex: true,
		});
	}

	// IMPORTANT: Check if this is an article handle BEFORE calling cached blog function
	const allBlogPosts = await getAllBlogPosts();
	const possibleArticle = allBlogPosts.find((article) => article.handle === nextParams.blog);

	if (possibleArticle?.blog?.handle) {
		// This is an article, redirect immediately before any caching happens
		redirect(`/blogs/${possibleArticle.blog.handle}/${possibleArticle.handle}`);
	}

	// Now safe to get blog data
	const blog = await getBlogData(nextParams.blog);

	if (!blog) {
		return generateSEOMetadata({
			title: "Blog Category Not Found",
			description: "The requested blog category could not be found.",
			noindex: true,
		});
	}

	const currentPage = nextSearchParams?.page ? Number.parseInt(nextSearchParams.page, 10) : 1;
	const baseTitle = `${blog.title} Articles - Expert Mushroom Cultivation Blog`;
	const title = currentPage > 1 ? `${baseTitle} - Page ${currentPage}` : baseTitle;

	const description = `Explore our comprehensive ${blog.title.toLowerCase()} articles. Find expert insights, tips, and professional guides about mushroom cultivation, growing techniques, and mycology from industry experts.`;

	return generateSEOMetadata({
		title,
		description,
		keywords: [
			`${blog.title.toLowerCase()} blog`,
			`${blog.title.toLowerCase()} articles`,
			"mushroom cultivation",
			"growing guides",
			"cultivation techniques",
			"expert insights",
			"mushroom farming",
			"growing tips",
			"cultivation tutorials",
			"mushroom growing advice",
		],
		url: `/blogs/${blog.handle}${currentPage > 1 ? `?page=${currentPage}` : ""}`,
		openGraph: {
			type: "website",
		},
		...(currentPage > 1 && { noindex: true }), // Don't index pagination pages beyond page 1
	});
}

type BlogCardProps = {
	article: ShopifyBlogArticle;
	blogHandle: string;
};

function BlogCard({ article, blogHandle }: BlogCardProps) {
	return (
		<Link
			className="group block overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md"
			href={`/blogs/${blogHandle}/${article.handle}`}
		>
			<article className="flex flex-col md:flex-row">
				<div className="flex w-full flex-col justify-center p-6 md:w-2/3">
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-sm">
							<div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f0f0f0] dark:bg-[#2f2f2f]">
								<span className="font-medium text-[#6b6b6b] text-xs dark:text-[#a8a8a8]">
									{article.author.name.charAt(0)}
								</span>
							</div>
							<span className="text-[#6b6b6b] dark:text-[#a8a8a8]">{article.author.name}</span>
							<span className="text-[#6b6b6b] dark:text-[#a8a8a8]">·</span>
							<time className="text-[#6b6b6b] dark:text-[#a8a8a8]" dateTime={article.publishedAt}>
								{new Date(article.publishedAt).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								})}
							</time>
							<span className="text-[#6b6b6b] dark:text-[#a8a8a8]">·</span>
							<span className="text-[#6b6b6b] dark:text-[#a8a8a8]">
								{Math.ceil((article.excerpt?.split(" ").length || 0) / 200)} min read
							</span>
						</div>
						<h3 className="font-bold text-[#242424] text-xl transition-colors group-hover:text-primary md:text-2xl dark:text-[#e6e6e6]">
							{article.title}
						</h3>
						<p className="line-clamp-3 text-[#6b6b6b] text-base dark:text-[#a8a8a8]">{article.excerpt}</p>
						<div className="flex items-center gap-3">
							<span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs">
								{article.blog?.title}
							</span>
						</div>
					</div>
				</div>
				{article.image && (
					<div className="w-full md:w-1/3">
						<div className="relative aspect-square overflow-hidden md:aspect-auto md:h-full">
							<Image
								alt={article.image.altText || article.title}
								className="object-cover transition-transform duration-300 group-hover:scale-105"
								fill
								sizes="(max-width: 768px) 100vw, 33vw"
								src={article.image.url}
							/>
						</div>
					</div>
				)}
			</article>
		</Link>
	);
}

// Loading component
const _BlogLoading = () => (
	<div className="min-h-screen w-full">
		<div className="mx-auto max-w-[1800px] px-4 py-8">
			<div className="mb-8 h-12 w-1/4 rounded bg-neutral-200 dark:bg-neutral-700" />
			<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{[...new Array(8)].map((_, i) => (
					<div className="animate-pulse" key={i}>
						<div className="mb-4 aspect-video rounded-lg bg-neutral-200 dark:bg-neutral-700" />
						<div className="mb-2 h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
						<div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
					</div>
				))}
			</div>
		</div>
	</div>
);

// Helper function to get random featured posts
function getRandomFeaturedPosts(posts: ShopifyBlogArticle[], count = 3) {
	const shuffled = [...posts].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

export default async function BlogCategoryPage({ params, searchParams }: BlogCategoryPageProps) {
	const startTime = performance.now();

	// Always await params and searchParams in Next.js 15
	const nextParams = await params;
	const nextSearchParams = await searchParams;

	// Check if blog handle is undefined
	if (!nextParams.blog || nextParams.blog === "undefined") {
		return notFound();
	}

	const currentPage = nextSearchParams?.page ? Number.parseInt(nextSearchParams.page, 10) : 1;

	// IMPORTANT: Check if this might be an article handle BEFORE calling cached functions
	// This prevents Next.js 15 from caching the redirect error
	const allBlogPosts = await getAllBlogPosts();
	const possibleArticle = allBlogPosts.find((article) => article.handle === nextParams.blog);

	if (possibleArticle?.blog?.handle) {
		// This is an article handle, not a blog category - redirect immediately
		redirect(`/blogs/${possibleArticle.blog.handle}/${possibleArticle.handle}`);
	}

	// Now it's safe to call the cached function since we know it's a blog category
	const { posts, blog, pagination } = await getPaginatedBlogPostsByHandle(nextParams.blog, currentPage, POSTS_PER_PAGE);

	if (!blog) {
		// If we couldn't find it as a blog category or article, show 404
		return notFound();
	}

	// If no posts found and we're not on the first page, redirect to first page
	if (posts.length === 0 && currentPage > 1) {
		return notFound();
	}

	// Get featured posts (only on first page)
	const featuredPosts = currentPage === 1 ? getRandomFeaturedPosts(posts) : [];

	// Filter out featured posts from the main list if we're on the first page
	const remainingPosts =
		currentPage === 1 ? posts.filter((post) => !featuredPosts.find((fp) => fp.id === post.id)) : posts;
	const featuredProducts = await getLimitedProducts(4); // Get only 4 products

	const _duration = performance.now() - startTime;

	// Generate enhanced structured data
	const breadcrumbs = [
		{ name: "Home", url: "/" },
		{ name: "Blog", url: "/blogs" },
		{ name: blog.title, url: `/blogs/${blog.handle}` },
	];

	const breadcrumbSchema = getEnhancedBreadcrumbSchema(breadcrumbs);
	const websiteSchema = getSearchActionSchema();
	const organizationSchema = getEnhancedOrganizationSchema();

	// Enhanced blog category schema
	const blogCategorySchema = {
		"@context": "https://schema.org",
		"@type": "Blog",
		"@id": `https://zugzology.com/blogs/${blog.handle}#blog`,
		name: `${blog.title} - Zugzology Blog`,
		description: `Explore our comprehensive ${blog.title.toLowerCase()} articles. Find expert insights, tips, and professional guides about mushroom cultivation, growing techniques, and mycology from industry experts.`,
		url: `https://zugzology.com/blogs/${blog.handle}`,
		inLanguage: "en-US",
		publisher: organizationSchema,
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `https://zugzology.com/blogs/${blog.handle}`,
		},
		author: organizationSchema,
		numberOfPages: pagination.totalPages,
		about: {
			"@type": "Thing",
			name: blog.title,
			description: `Everything related to ${blog.title.toLowerCase()} in mushroom cultivation`,
		},
		blogPost: posts.slice(0, 10).map((article: ShopifyBlogArticle) => ({
			"@type": "BlogPosting",
			headline: article.title,
			description: article.excerpt || "",
			datePublished: article.publishedAt,
			author: {
				"@type": "Person",
				name: article.author?.name || "Expert Team",
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

	return (
		<>
			{/* JSON-LD Structured Data */}
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
				type="application/ld+json"
			/>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(blogCategorySchema),
				}}
				type="application/ld+json"
			/>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteSchema),
				}}
				type="application/ld+json"
			/>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(organizationSchema),
				}}
				type="application/ld+json"
			/>

			{/* Google Analytics for Blog Category */}
			<Script id="blog-category-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'blog_category',
						'page_location': window.location.href,
						'content_category': 'blog',
						'blog_category': '${blog.title.replace(/'/g, "\\'")}',
						'blog_handle': '${blog.handle}',
						'total_posts': ${pagination.totalPosts},
						'current_page': ${currentPage},
						'total_pages': ${pagination.totalPages}
					});
					
					// Track blog category view event
					window.dataLayer.push({
						'event': 'view_item_list',
						'item_list_id': '${blog.handle}',
						'item_list_name': '${blog.title.replace(/'/g, "\\'")} Articles',
						'items': ${JSON.stringify(
							posts.slice(0, 10).map((post, index) => ({
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

			<div className="min-h-screen w-full bg-background">
				<div className="container mx-auto px-4 py-12">
					<Suspense fallback={<div className="mb-8 h-12 w-1/4 rounded bg-neutral-200 dark:bg-neutral-700" />}>
						<UniversalBreadcrumb
							className="mb-4 hidden md:block"
							items={BreadcrumbConfigs.blog(blog.title, blog.handle)}
						/>
					</Suspense>

					{/* Hero Section */}
					<section className="w-full py-12">
						<div className="w-full">
							<div className="mb-16 text-center">
								<h1 className="mb-6 font-bold text-4xl text-[#242424] md:text-5xl lg:text-6xl dark:text-[#e6e6e6]">
									{blog.title}
								</h1>
								<p className="mx-auto max-w-3xl text-[#6b6b6b] text-xl md:text-2xl dark:text-[#a8a8a8]">
									Explore our collection of articles about {blog.title.toLowerCase()}. Find expert insights, tips, and
									guides.
								</p>
							</div>
						</div>
					</section>

					{/* Featured Posts Section - Only show if there are featured posts */}
					{featuredPosts.length > 0 && (
						<section className="mb-16 w-full">
							<div className="w-full">
								<div className="mb-10 flex items-center justify-between">
									<h2 className="font-bold text-3xl text-[#242424] dark:text-[#e6e6e6]">Featured Articles</h2>
								</div>
								<div className="grid gap-8 md:grid-cols-3">
									{featuredPosts.map((post) => (
										<Link
											className="group block overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md"
											href={`/blogs/${blog.handle}/${post.handle}`}
											key={post.id}
										>
											<article className="flex h-full flex-col">
												{post.image && (
													<div className="relative aspect-[16/9] overflow-hidden">
														<Image
															alt={post.image.altText || post.title}
															className="object-cover transition-transform duration-300 group-hover:scale-105"
															fill
															sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
															src={post.image.url}
														/>
														<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
														<div className="absolute bottom-0 p-4 text-white">
															<span className="mb-2 inline-flex items-center rounded-full bg-primary/80 px-2.5 py-0.5 font-medium text-white text-xs">
																Featured
															</span>
														</div>
													</div>
												)}
												<div className="flex flex-grow flex-col p-5">
													<h3 className="mb-2 font-bold text-[#242424] text-xl transition-colors group-hover:text-primary dark:text-[#e6e6e6]">
														{post.title}
													</h3>
													<p className="mb-4 line-clamp-3 flex-grow text-[#6b6b6b] dark:text-[#a8a8a8]">
														{post.excerpt}
													</p>
													<div className="flex items-center gap-2 border-[#e6e6e6] border-t pt-2 text-[#6b6b6b] text-sm dark:border-[#2f2f2f] dark:text-[#a8a8a8]">
														<span>{post.author.name}</span>
														<span>•</span>
														<time dateTime={post.publishedAt}>
															{new Date(post.publishedAt).toLocaleDateString("en-US", {
																month: "short",
																day: "numeric",
															})}
														</time>
														<span>•</span>
														<span>{Math.ceil((post.excerpt?.split(" ").length || 0) / 200)} min read</span>
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
					<section className="mb-16 w-full">
						<div className="w-full">
							<div className="mb-10 flex items-center justify-between">
								<div>
									<h2 className="font-bold text-3xl text-[#242424] dark:text-[#e6e6e6]">All Articles</h2>
									<p className="mt-2 text-[#6b6b6b] text-lg dark:text-[#a8a8a8]">
										{pagination.totalPosts > 0
											? `Showing ${(pagination.currentPage - 1) * pagination.postsPerPage + 1}-${Math.min(
													pagination.currentPage * pagination.postsPerPage,
													pagination.totalPosts
												)} of ${pagination.totalPosts} articles`
											: "No articles available"}
									</p>
								</div>
							</div>

							{remainingPosts.length > 0 ? (
								<div className="space-y-8">
									{remainingPosts.map((article) => (
										<BlogCard article={article} blogHandle={blog.handle} key={article.id} />
									))}
								</div>
							) : (
								<div className="rounded-xl bg-[#f9f9f9] py-12 text-center dark:bg-[#161616]">
									<p className="text-[#6b6b6b] dark:text-[#a8a8a8]">No more articles available.</p>
								</div>
							)}

							{/* Pagination */}
							{pagination.totalPages > 1 && (
								<div className="mt-16">
									<PaginationControlsSSR
										basePath={`/blogs/${blog.handle}`}
										currentPage={pagination.currentPage}
										totalPages={pagination.totalPages}
									/>
								</div>
							)}
						</div>
					</section>

					{/* Featured Products Section */}
					{featuredProducts.length > 0 && (
						<section className="my-16 w-full bg-[#f7f7f7] dark:bg-[#1a1a1a]">
							<div className="container mx-auto px-4 py-12">
								<div className="mb-10 text-center">
									<h2 className="mb-3 font-bold text-3xl text-[#242424] dark:text-[#e6e6e6]">Shop Our Best Sellers</h2>
									<p className="mx-auto max-w-2xl text-[#6b6b6b] text-lg dark:text-[#a8a8a8]">
										Discover our most popular mushroom growing supplies
									</p>
								</div>
								<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
									{featuredProducts.map((product) => (
										<Link
											className="group block overflow-hidden rounded-lg bg-card shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md"
											href={`/products/${product.handle}`}
											key={product.id}
										>
											{product.images?.nodes[0] && (
												<div className="relative aspect-square">
													<Image
														alt={product.images.nodes[0].altText || product.title}
														className="object-cover transition-transform duration-300 group-hover:scale-105"
														fill
														sizes="(max-width: 768px) 50vw, 25vw"
														src={product.images.nodes[0].url}
													/>
												</div>
											)}
											<div className="p-4">
												<h3 className="font-medium text-[#242424] transition-colors group-hover:text-[#1a1a1a] dark:text-[#e6e6e6] dark:group-hover:text-white">
													{product.title}
												</h3>
												<p className="mt-1 text-[#6b6b6b] dark:text-[#a8a8a8]">
													From {formatPrice(product.priceRange.minVariantPrice.amount)}
												</p>
											</div>
										</Link>
									))}
								</div>
								<div className="mt-10 text-center">
									<Link
										className="inline-flex items-center rounded-full bg-[#242424] px-6 py-3 font-medium text-sm text-white transition-colors hover:bg-[#1a1a1a] dark:bg-[#e6e6e6] dark:text-[#242424] dark:hover:bg-white"
										href="/products"
									>
										View All Products
									</Link>
								</div>
							</div>
						</section>
					)}
				</div>
			</div>
		</>
	);
}
