import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getBlogByHandle, getPaginatedBlogPostsByHandle, getProducts } from "@/lib/api/shopify/actions";
import type { ShopifyBlogArticle, ShopifyBlog } from "@/lib/types";
import { BlogBreadcrumb } from "@/components/blog/blog-breadcrumb";
import { jsonLdScriptProps } from "react-schemaorg";
import type { WithContext } from "schema-dts";
import { Blog, BreadcrumbList } from "schema-dts";
import { unstable_noStore as noStore } from "next/cache";
import { PaginationControls } from "@/components/ui/pagination";
import { formatPrice } from "@/lib/utils";

// Constants for pagination
const POSTS_PER_PAGE = 12;

// Get blog data
async function getBlogData(handle: string) {
	noStore();
	return getBlogByHandle(handle);
}

export async function generateMetadata({ params }: { params: { blog: string } }): Promise<Metadata> {
	const nextParams = await params;

	// Check if blog handle is undefined
	if (!nextParams.blog || nextParams.blog === "undefined") {
		return {
			title: "Blog Not Found",
			description: "The requested blog category could not be found.",
		};
	}

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
		<Link
			href={`/blogs/${blogHandle}/${article.handle}`}
			className="group block py-8 first:pt-0 last:pb-0 border-b border-[#e6e6e6] dark:border-[#2f2f2f] hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a] transition-colors"
		>
			<article className="flex flex-col md:flex-row gap-6">
				<div className="w-full md:w-2/3 space-y-3">
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
					</div>
					<h3 className="text-xl md:text-2xl font-bold text-[#242424] dark:text-[#e6e6e6] group-hover:text-[#1a1a1a] dark:group-hover:text-white transition-colors">
						{article.title}
					</h3>
					<p className="text-base text-[#6b6b6b] dark:text-[#a8a8a8] line-clamp-2">{article.excerpt}</p>
					<div className="flex items-center gap-3">
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f0f0f0] dark:bg-[#2f2f2f] text-[#6b6b6b] dark:text-[#a8a8a8]">
							{article.blog?.title}
						</span>
						<span className="text-sm text-[#6b6b6b] dark:text-[#a8a8a8]">
							{Math.ceil((article.excerpt?.split(" ").length || 0) / 200)} min read
						</span>
					</div>
				</div>
				{article.image && (
					<div className="w-full md:w-1/3">
						<div className="aspect-[4/3] relative overflow-hidden">
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

interface BlogCategoryPageProps {
	params: Promise<{
		blog: string;
	}>;
	searchParams?: Promise<{
		page?: string;
	}>;
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

	// Get featured products for the category
	const allProducts = await getProducts();
	const featuredProducts = allProducts.slice(0, 4); // Get first 4 products

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
			<div className="min-h-screen w-full">
				<div className="max-w-[1800px] mx-auto px-4 py-8">
					<Suspense fallback={<div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-8" />}>
						<BlogBreadcrumb blogHandle={blog.handle} blogTitle={blog.title} />
					</Suspense>
					<section className="w-full bg-white dark:bg-[#121212]">
						<div className="max-w-screen-md mx-auto px-4 sm:px-6 py-12">
							<header className="mb-12 text-center">
								<h1 className="text-3xl md:text-4xl font-bold text-[#242424] dark:text-[#e6e6e6] mb-4">{blog.title}</h1>
								<p className="text-lg text-[#6b6b6b] dark:text-[#a8a8a8]">
									Explore our {blog.title.toLowerCase()} articles. Find expert insights, tips, and guides about mushroom
									cultivation and mycology.
								</p>
							</header>

							{/* Featured Products Section */}
							{featuredProducts.length > 0 && (
								<div className="mb-16 py-12 bg-[#f7f7f7] dark:bg-[#1a1a1a] -mx-4 sm:-mx-6">
									<div className="max-w-screen-lg mx-auto px-4 sm:px-6">
										<div className="text-center mb-8">
											<h2 className="text-2xl font-bold text-[#242424] dark:text-[#e6e6e6] mb-2">Featured Products</h2>
											<p className="text-[#6b6b6b] dark:text-[#a8a8a8]">
												Get started with our most popular mushroom growing supplies
											</p>
										</div>
										<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
											{featuredProducts.map((product) => (
												<Link
													key={product.id}
													href={`/products/${product.handle}`}
													className="group block bg-white dark:bg-[#242424] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
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
										<div className="text-center mt-8">
											<Link
												href="/products"
												className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-[#242424] dark:bg-[#e6e6e6] text-white dark:text-[#242424] hover:bg-[#1a1a1a] dark:hover:bg-white transition-colors"
											>
												View All Products
											</Link>
										</div>
									</div>
								</div>
							)}

							{/* Featured Posts Section - Only show if there are featured posts */}
							{featuredPosts.length > 0 && (
								<section className="mb-16">
									<div className="grid gap-8">
										{featuredPosts.map((post) => (
											<Link key={post.id} href={`/blogs/${blog.handle}/${post.handle}`} className="group block">
												<article className="space-y-4">
													<div className="aspect-[2/1] relative overflow-hidden rounded-lg">
														{post.image ? (
															<Image
																src={post.image.url}
																alt={post.image.altText || post.title}
																fill
																className="object-cover transition-transform duration-300 group-hover:scale-105"
																sizes="(max-width: 768px) 100vw, 720px"
																priority={post === featuredPosts[0]}
															/>
														) : (
															<div className="absolute inset-0 bg-[#f0f0f0] dark:bg-[#2f2f2f] flex items-center justify-center">
																<span className="text-[#6b6b6b] dark:text-[#a8a8a8]">No image available</span>
															</div>
														)}
													</div>
													<div className="space-y-3">
														<div className="flex items-center gap-2 text-sm">
															<div className="w-6 h-6 rounded-full bg-[#f0f0f0] dark:bg-[#2f2f2f] flex items-center justify-center">
																<span className="text-xs font-medium text-[#6b6b6b] dark:text-[#a8a8a8]">
																	{post.author.name.charAt(0)}
																</span>
															</div>
															<span className="text-[#6b6b6b] dark:text-[#a8a8a8]">{post.author.name}</span>
															<span className="text-[#6b6b6b] dark:text-[#a8a8a8]">·</span>
															<time dateTime={post.publishedAt} className="text-[#6b6b6b] dark:text-[#a8a8a8]">
																{new Date(post.publishedAt).toLocaleDateString("en-US", {
																	month: "short",
																	day: "numeric",
																})}
															</time>
														</div>
														<h3 className="text-2xl md:text-3xl font-bold text-[#242424] dark:text-[#e6e6e6] group-hover:text-[#1a1a1a] dark:group-hover:text-white transition-colors">
															{post.title}
														</h3>
														<p className="text-lg text-[#6b6b6b] dark:text-[#a8a8a8]">{post.excerpt}</p>
														<div className="flex items-center gap-3">
															<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f0f0f0] dark:bg-[#2f2f2f] text-[#6b6b6b] dark:text-[#a8a8a8]">
																Featured
															</span>
															<span className="text-sm text-[#6b6b6b] dark:text-[#a8a8a8]">
																{Math.ceil((post.excerpt?.split(" ").length || 0) / 200)} min read
															</span>
														</div>
													</div>
												</article>
											</Link>
										))}
									</div>
								</section>
							)}

							{/* All Articles Section */}
							{remainingPosts.length > 0 && (
								<section>
									<div className="border-t border-[#e6e6e6] dark:border-[#2f2f2f] mb-8">
										<div className="flex items-center justify-between py-6">
											<h2 className="text-xl font-bold text-[#242424] dark:text-[#e6e6e6]">Latest Articles</h2>
											<p className="text-sm text-[#6b6b6b] dark:text-[#a8a8a8]">
												{pagination.totalPosts > 0 ? `${pagination.totalPosts} articles` : "No articles available"}
											</p>
										</div>
									</div>
									<div className="divide-y divide-[#e6e6e6] dark:divide-[#2f2f2f]">
										{remainingPosts.map((article) => (
											<BlogCard key={article.id} article={article} blogHandle={blog.handle} />
										))}
									</div>

									{/* Pagination */}
									{pagination.totalPages > 1 && (
										<div className="mt-12">
											<PaginationControls
												currentPage={pagination.currentPage}
												totalPages={pagination.totalPages}
												baseUrl={`/blogs/${blog.handle}`}
											/>
										</div>
									)}
								</section>
							)}

							{/* Show message if no posts at all */}
							{posts.length === 0 && (
								<div className="text-center py-12">
									<p className="text-[#6b6b6b] dark:text-[#a8a8a8]">No articles found in this category.</p>
								</div>
							)}
						</div>
					</section>

					{/* Final CTA Section */}
					<section className="w-full bg-[#f7f7f7] dark:bg-[#1a1a1a] py-16 mt-12 -mx-4">
						<div className="max-w-screen-md mx-auto px-4 sm:px-6 text-center">
							<h2 className="text-3xl font-bold text-[#242424] dark:text-[#e6e6e6] mb-4">
								Start Your Growing Journey Today
							</h2>
							<p className="text-lg text-[#6b6b6b] dark:text-[#a8a8a8] mb-8">
								Browse our selection of high-quality mushroom cultivation supplies
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link
									href="/products"
									className="inline-flex items-center px-8 py-4 rounded-full text-base font-medium bg-[#242424] dark:bg-[#e6e6e6] text-white dark:text-[#242424] hover:bg-[#1a1a1a] dark:hover:bg-white transition-colors"
								>
									Shop All Products
								</Link>
								<Link
									href="/collections/starter-kits"
									className="inline-flex items-center px-8 py-4 rounded-full text-base font-medium bg-white dark:bg-[#242424] text-[#242424] dark:text-[#e6e6e6] border border-[#e6e6e6] dark:border-[#2f2f2f] hover:bg-[#f7f7f7] dark:hover:bg-[#1a1a1a] transition-colors"
								>
									View Starter Kits
								</Link>
							</div>
						</div>
					</section>
				</div>
			</div>
		</>
	);
}
