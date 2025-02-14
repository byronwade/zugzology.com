"use cache";

import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogByHandle, getAllBlogPosts, getProducts } from "@/lib/actions/shopify";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { RelatedPosts } from "@/components/blog/related-posts";
import { findRelatedPosts } from "@/lib/utils/related-posts";
import { ProductAd } from "@/components/blog/product-ad";
import { BlogBreadcrumb } from "@/components/blog/blog-breadcrumb";

export async function generateMetadata({ params }: { params: { blog: string; slug: string } }): Promise<Metadata> {
	const nextjs15Params = await params;
	const blog = await getBlogByHandle(nextjs15Params.blog);
	const article = blog?.articles.edges.find(({ node }) => node.handle === nextjs15Params.slug)?.node;

	if (!article) return notFound();

	const title = `${article.title} | Zugzology Blog`;
	const description = article.excerpt;

	return {
		title,
		description,
		keywords: `mushroom cultivation, ${article.title.toLowerCase()}, mushroom growing, research`,
		openGraph: {
			title,
			description,
			type: "article",
			url: `https://zugzology.com/blogs/${nextjs15Params.blog}/${nextjs15Params.slug}`,
			siteName: "Zugzology",
			locale: "en_US",
			authors: [article.author.name],
			publishedTime: article.publishedAt,
			modifiedTime: article.publishedAt,
			section: nextjs15Params.blog,
			images: article.image
				? [
						{
							url: article.image.url,
							width: article.image.width,
							height: article.image.height,
							alt: article.image.altText || article.title,
						},
				  ]
				: [],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: article.image ? [article.image.url] : [],
		},
		alternates: {
			canonical: `https://zugzology.com/blogs/${nextjs15Params.blog}/${nextjs15Params.slug}`,
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	};
}

export default async function BlogPostPage({ params }: { params: { blog: string; slug: string } }) {
	const startTime = performance.now();
	const nextjs15Params = await params;
	const blog = await getBlogByHandle(nextjs15Params.blog);
	const article = blog?.articles.edges.find(({ node }) => node.handle === nextjs15Params.slug)?.node;

	if (!article || !article.contentHtml) {
		console.log(`❌ [Blog Post] Not found: ${params.blog}/${params.slug}`);
		return notFound();
	}

	// Get all posts from all blogs for related posts
	const allPosts = await getAllBlogPosts();
	const currentPostWithBlog = {
		...article,
		blogHandle: nextjs15Params.blog,
		blogTitle: blog.title,
	};
	const relatedPosts = allPosts?.length > 0 ? findRelatedPosts(currentPostWithBlog, allPosts) : [];

	// Get featured products
	const allProducts = await getProducts();
	const featuredProducts =
		allProducts?.length > 0
			? allProducts
					.filter((product) => product && !product.isGiftCard) // Only show non-gift card products and ensure product exists
					.sort(() => Math.random() - 0.5) // Randomize order
					.slice(0, 5) // Take first 5 products
			: [];

	// Calculate reading time (assuming average reading speed of 200 words per minute)
	const wordCount = article.contentHtml.replace(/<[^>]*>/g, "").split(/\s+/).length;
	const readingTime = Math.ceil(wordCount / 200);

	const duration = performance.now() - startTime;
	console.log(`⚡ [Blog Post ${article.title}] ${duration.toFixed(2)}ms`, {
		hasImage: !!article.image,
		contentSize: (article.contentHtml.length / 1024).toFixed(2) + "KB",
		relatedPosts: relatedPosts?.length ?? 0,
		featuredProducts: featuredProducts?.length ?? 0,
	});

	const articleJsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		"@id": `https://zugzology.com/blogs/${nextjs15Params.blog}/${nextjs15Params.slug}`,
		headline: article.title,
		description: article.excerpt,
		articleBody: article.content,
		url: `https://zugzology.com/blogs/${nextjs15Params.blog}/${nextjs15Params.slug}`,
		datePublished: article.publishedAt,
		dateModified: article.publishedAt,
		author: {
			"@type": "Person",
			name: article.author.name,
		},
		publisher: {
			"@type": "Organization",
			name: "Zugzology",
			logo: {
				"@type": "ImageObject",
				url: "https://zugzology.com/logo.png",
			},
		},
		image: article.image
			? {
					"@type": "ImageObject",
					url: article.image.url,
					width: article.image.width,
					height: article.image.height,
					caption: article.image.altText,
			  }
			: undefined,
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `https://zugzology.com/blogs/${nextjs15Params.blog}/${nextjs15Params.slug}`,
		},
		articleSection: nextjs15Params.blog,
		keywords: ["mushroom cultivation", "mushroom growing", "research", article.title.toLowerCase()],
	};

	return (
		<section className="w-full min-h-screen bg-background">
			{/* Main Content Area */}
			<div className="container mx-auto px-4 max-w-7xl">
				{/* Content and Featured Products Sidebar */}
				<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,650px)_300px] xl:grid-cols-[minmax(0,800px)_300px] gap-8 py-8 mx-auto justify-center">
					{/* Main Article Content */}
					<article className="prose prose-neutral dark:prose-invert max-w-none w-full [&>img]:w-full [&>img]:rounded-lg [&>p]:max-w-[650px] [&>h1]:max-w-[650px] [&>h2]:max-w-[650px] [&>h3]:max-w-[650px] [&>ul]:max-w-[650px] [&>ol]:max-w-[650px] mx-auto">
						<h1 className="mb-2 text-3xl font-bold text-center lg:text-left">{article.title}</h1>

						<div className="mb-8 not-prose overflow-hidden">
							<div className="flex items-center whitespace-nowrap overflow-x-auto scrollbar-hide">
								<BlogBreadcrumb blogHandle={nextjs15Params.blog} blogTitle={blog.title} articleTitle={article.title} />
							</div>
						</div>

						<div className="flex items-start gap-3 mb-8 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg max-w-[650px] mx-auto lg:mx-0">
							<div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
								<span className="text-sm font-medium text-purple-900 dark:text-purple-100">
									{article.author.name
										.split(" ")
										.map((name) => name[0])
										.join("")}
								</span>
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-base font-medium text-neutral-900 dark:text-neutral-100">{article.author.name}</p>
								<p className="text-sm text-neutral-500 dark:text-neutral-400">
									{new Date(article.publishedAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}{" "}
									• {readingTime} min read
								</p>
							</div>
						</div>

						<div className="mx-auto lg:mx-0 [&>p]:mx-auto [&>h2]:mx-auto [&>h3]:mx-auto [&>ul]:mx-auto [&>ol]:mx-auto lg:[&>p]:mx-0 lg:[&>h2]:mx-0 lg:[&>h3]:mx-0 lg:[&>ul]:mx-0 lg:[&>ol]:mx-0" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
					</article>

					{/* Featured Products Sidebar */}
					<aside className="w-full max-w-[300px] mx-auto lg:max-w-none">
						<div className="sticky top-[126px] space-y-6">{featuredProducts?.length > 0 && <ProductAd products={featuredProducts.slice(0, 3)} />}</div>
					</aside>
				</div>

				{/* Combined Related Posts and Products Section */}
				<div className="border-t py-16">
					<h2 className="text-2xl font-bold mb-8 text-center">Related Content</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 xl:gap-8 max-w-[1400px] mx-auto">
						{[...relatedPosts.map((post) => ({ type: "post" as const, content: post })), ...featuredProducts.map((product) => ({ type: "product" as const, content: product })), ...(relatedPosts.length + featuredProducts.length < 8 ? featuredProducts.slice(0, 8 - (relatedPosts.length + featuredProducts.length)).map((product) => ({ type: "product" as const, content: product })) : [])]
							.slice(0, Math.max(8, relatedPosts.length + featuredProducts.length))
							.sort(() => Math.random() - 0.5)
							.map((item, index) => {
								// Common image container styles
								const imageContainerClasses = "aspect-[4/3] relative overflow-hidden rounded-lg mb-4 bg-neutral-100 dark:bg-neutral-800";
								const imageClasses = "object-cover transition-transform duration-300 group-hover:scale-105";
								const placeholderClasses = "w-full h-full flex items-center justify-center text-sm";

								return (
									<div key={item.content.id} className="group w-full bg-card rounded-lg border border-border/50 hover:border-border p-3 sm:p-4 transition-colors duration-200">
										{item.type === "post" ? (
											<Link href={`/blogs/${item.content.blogHandle}/${item.content.handle}`} className="block space-y-3">
												<div className={imageContainerClasses}>
													{item.content.image ? (
														<Image src={item.content.image.url} alt={item.content.image.altText || item.content.title} fill className={imageClasses} sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" priority={index < 4} />
													) : (
														<div className={placeholderClasses}>
															<span className="text-muted-foreground">Blog Post Image</span>
														</div>
													)}
												</div>
												<div className="space-y-2">
													<h3 className="font-semibold text-base sm:text-lg line-clamp-2 group-hover:text-primary transition-colors">{item.content.title}</h3>
													<p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{item.content.excerpt}</p>
												</div>
											</Link>
										) : (
											<Link href={`/products/${item.content.handle}`} className="block space-y-3">
												<div className={imageContainerClasses}>
													{item.content.images?.edges[0]?.node ? (
														<Image src={item.content.images.edges[0].node.url} alt={item.content.images.edges[0].node.altText || item.content.title} fill className={imageClasses} sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" priority={index < 4} />
													) : (
														<div className={placeholderClasses}>
															<span className="text-muted-foreground">Product Image</span>
														</div>
													)}
												</div>
												<div className="space-y-2">
													<h3 className="font-semibold text-base sm:text-lg line-clamp-2 group-hover:text-primary transition-colors">{item.content.title}</h3>
													<p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{item.content.description || item.content.productType}</p>
												</div>
											</Link>
										)}
									</div>
								);
							})}
					</div>
				</div>
			</div>
		</section>
	);
}
