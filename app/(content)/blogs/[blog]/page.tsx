import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Link } from '@/components/ui/link';
import Image from "next/image";
import type { Metadata } from "next";
import { getBlogByHandle, getPaginatedBlogPostsByHandle, getAllBlogPosts } from "@/lib/api/shopify/actions";
import { getLimitedProducts } from "@/lib/actions/shopify/index";
import type { ShopifyBlogArticle, ShopifyBlog } from "@/lib/types";
import { BlogBreadcrumb } from "@/components/blog/blog-breadcrumb";
import { unstable_noStore as noStore } from "next/cache";
import { PaginationControls } from "@/components/ui/pagination";
import { formatPrice } from "@/lib/utils";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import { getEnhancedBreadcrumbSchema, getSearchActionSchema, getEnhancedOrganizationSchema } from "@/lib/seo/enhanced-jsonld";
import Script from "next/script";

// Constants for pagination
const POSTS_PER_PAGE = 12;

// Get blog data
async function getBlogData(handle: string) {
	noStore();
	return getBlogByHandle(handle);
}

interface BlogCategoryPageProps {
	params: Promise<{
		blog: string;
	}>;
	searchParams?: Promise<{
		page?: string;
	}>;
}

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

	const blog = await getBlogData(nextParams.blog);

	if (!blog) {
		return generateSEOMetadata({
			title: "Blog Category Not Found",
			description: "The requested blog category could not be found.",
			noindex: true,
		});
	}

	const currentPage = nextSearchParams?.page ? parseInt(nextSearchParams.page) : 1;
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
			"mushroom growing advice"
		],
		url: `/blogs/${blog.handle}${currentPage > 1 ? `?page=${currentPage}` : ''}`,
		openGraph: {
			type: "website",
		},
		...(currentPage > 1 && { noindex: true }), // Don't index pagination pages beyond page 1
	});
}

interface BlogCardProps {
	article: ShopifyBlogArticle;
	blogHandle: string;
}

function BlogCard({ article, blogHandle }: BlogCardProps) {
	return (
		<Link
			href={`/blogs/${blogHandle}/${article.handle}`}
			className="group block bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]"
		>
			<article className="flex flex-col md:flex-row">
				<div className="w-full md:w-2/3 p-6 flex flex-col justify-center">
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-sm">
							<div className="w-6 h-6 rounded-full bg-[#f0f0f0] dark:bg-[#2f2f2f] flex items-center justify-center">
								<span className="text-xs font-medium text-[#6b6b6b] dark:text-[#a8a8a8]">
									{article.author.name.charAt(0)}
								</span>
							</div>
							<span className="text-[#6b6b6b] dark:text-[#a8a8a8]">{article.author.name}</span>
							<span className="text-[#6b6b6b] dark:text-[#a8a8a8]">·</span>
							<time dateTime={article.publishedAt} className="text-[#6b6b6b] dark:text-[#a8a8a8]">
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
						<h3 className="text-xl md:text-2xl font-bold text-[#242424] dark:text-[#e6e6e6] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
							{article.title}
						</h3>
						<p className="text-base text-[#6b6b6b] dark:text-[#a8a8a8] line-clamp-3">{article.excerpt}</p>
						<div className="flex items-center gap-3">
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
								{article.blog?.title}
							</span>
						</div>
					</div>
				</div>
				{article.image && (
					<div className="w-full md:w-1/3">
						<div className="aspect-square md:aspect-auto md:h-full relative overflow-hidden">
							<Image
								src={article.image.url}
								alt={article.image.altText || article.title}
								fill
								className="object-cover transition-transform duration-300 group-hover:scale-105"
								sizes="(max-width: 768px) 100vw, 33vw"
							/>
						</div>
					</div>
				)}
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

export default async function BlogCategoryPage({ params, searchParams }: BlogCategoryPageProps) {
	const startTime = performance.now();

	// Always await params and searchParams in Next.js 15
	const nextParams = await params;
	const nextSearchParams = await searchParams;

	// Check if blog handle is undefined
	if (!nextParams.blog || nextParams.blog === "undefined") {
		console.error(`❌ [Blog Category] Invalid handle: ${nextParams.blog || "undefined"}`);
		return notFound();
	}

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
	const remainingPosts =
		currentPage === 1 ? posts.filter((post) => !featuredPosts.find((fp) => fp.id === post.id)) : posts;

	// Get featured products for the category - use optimized function
	console.time("blogCategoryProductFetch");
	const featuredProducts = await getLimitedProducts(4); // Get only 4 products
	console.timeEnd("blogCategoryProductFetch");

	const duration = performance.now() - startTime;
	console.log(`⚡ [Blog Category ${blog.title}] ${duration.toFixed(2)}ms`, {
		articles: posts.length,
		hasImages: posts.filter((a: ShopifyBlogArticle) => a.image).length,
		page: currentPage,
		totalPages: pagination.totalPages,
	});

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
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(blogCategorySchema),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteSchema),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(organizationSchema),
				}}
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
						'items': ${JSON.stringify(posts.slice(0, 10).map((post, index) => ({
							item_id: post.id,
							item_name: post.title,
							item_category: 'blog_post',
							item_brand: 'Zugzology',
							index: index,
						})))}
					});
				`}
			</Script>

			<div className="min-h-screen w-full bg-white dark:bg-black">
				<div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<Suspense fallback={<div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-8" />}>
						<BlogBreadcrumb blogHandle={blog.handle} blogTitle={blog.title} />
					</Suspense>

					{/* Hero Section */}
					<section className="w-full py-12">
						<div className="w-full">
							<div className="text-center mb-16">
								<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#242424] dark:text-[#e6e6e6] mb-6">
									{blog.title}
								</h1>
								<p className="text-xl md:text-2xl text-[#6b6b6b] dark:text-[#a8a8a8] max-w-3xl mx-auto">
									Explore our collection of articles about {blog.title.toLowerCase()}. Find expert insights, tips, and
									guides.
								</p>
							</div>
						</div>
					</section>

					{/* Featured Posts Section - Only show if there are featured posts */}
					{featuredPosts.length > 0 && (
						<section className="w-full mb-16">
							<div className="w-full">
								<div className="flex items-center justify-between mb-10">
									<h2 className="text-3xl font-bold text-[#242424] dark:text-[#e6e6e6]">Featured Articles</h2>
								</div>
								<div className="grid gap-8 md:grid-cols-3">
									{featuredPosts.map((post) => (
										<Link
											key={post.id}
											href={`/blogs/${blog.handle}/${post.handle}`}
											className="group block bg-white dark:bg-[#242424] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]"
										>
											<article className="h-full flex flex-col">
												{post.image && (
													<div className="aspect-[16/9] relative overflow-hidden">
														<Image
															src={post.image.url}
															alt={post.image.altText || post.title}
															fill
															className="object-cover transition-transform duration-300 group-hover:scale-105"
															sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
														/>
														<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
														<div className="absolute bottom-0 p-4 text-white">
															<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-600/80 text-white mb-2">
																Featured
															</span>
														</div>
													</div>
												)}
												<div className="p-5 flex flex-col flex-grow">
													<h3 className="text-xl font-bold text-[#242424] dark:text-[#e6e6e6] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2">
														{post.title}
													</h3>
													<p className="text-[#6b6b6b] dark:text-[#a8a8a8] line-clamp-3 mb-4 flex-grow">
														{post.excerpt}
													</p>
													<div className="flex items-center gap-2 text-sm text-[#6b6b6b] dark:text-[#a8a8a8] pt-2 border-t border-[#e6e6e6] dark:border-[#2f2f2f]">
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
					<section className="w-full mb-16">
						<div className="w-full">
							<div className="flex items-center justify-between mb-10">
								<div>
									<h2 className="text-3xl font-bold text-[#242424] dark:text-[#e6e6e6]">All Articles</h2>
									<p className="mt-2 text-lg text-[#6b6b6b] dark:text-[#a8a8a8]">
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
										<BlogCard key={article.id} article={article} blogHandle={blog.handle} />
									))}
								</div>
							) : (
								<div className="text-center py-12 bg-[#f9f9f9] dark:bg-[#161616] rounded-xl">
									<p className="text-[#6b6b6b] dark:text-[#a8a8a8]">No more articles available.</p>
								</div>
							)}

							{/* Pagination */}
							{pagination.totalPages > 1 && (
								<div className="mt-16">
									<PaginationControls {...pagination} />
								</div>
							)}
						</div>
					</section>

					{/* Featured Products Section */}
					{featuredProducts.length > 0 && (
						<section className="w-full bg-[#f7f7f7] dark:bg-[#1a1a1a] py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 my-16">
							<div className="w-full">
								<div className="text-center mb-10">
									<h2 className="text-3xl font-bold text-[#242424] dark:text-[#e6e6e6] mb-3">Shop Our Best Sellers</h2>
									<p className="text-lg text-[#6b6b6b] dark:text-[#a8a8a8] max-w-2xl mx-auto">
										Discover our most popular mushroom growing supplies
									</p>
								</div>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
									{featuredProducts.map((product) => (
										<Link
											key={product.id}
											href={`/products/${product.handle}`}
											className="group block bg-white dark:bg-[#242424] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]"
										>
											{product.images?.nodes[0] && (
												<div className="aspect-square relative">
													<Image
														src={product.images.nodes[0].url}
														alt={product.images.nodes[0].altText || product.title}
														fill
														className="object-cover transition-transform duration-300 group-hover:scale-105"
														sizes="(max-width: 768px) 50vw, 25vw"
													/>
												</div>
											)}
											<div className="p-4">
												<h3 className="font-medium text-[#242424] dark:text-[#e6e6e6] group-hover:text-[#1a1a1a] dark:group-hover:text-white transition-colors">
													{product.title}
												</h3>
												<p className="text-[#6b6b6b] dark:text-[#a8a8a8] mt-1">
													From {formatPrice(product.priceRange.minVariantPrice.amount)}
												</p>
											</div>
										</Link>
									))}
								</div>
								<div className="text-center mt-10">
									<Link
										href="/products"
										className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-[#242424] dark:bg-[#e6e6e6] text-white dark:text-[#242424] hover:bg-[#1a1a1a] dark:hover:bg-white transition-colors"
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
