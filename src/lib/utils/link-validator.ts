"use server";

import { unstable_cache } from "next/cache";
import { getAllBlogPosts, getAllCollections, getBlogs, getProducts } from "@/lib/api/shopify/actions";
import { CACHE_TAGS, CACHE_TIMES } from "@/lib/api/shopify/cache-config";
import type { ShopifyBlogArticle, ShopifyCollection, ShopifyProduct } from "@/lib/types";

// Define interfaces for link mappings
type LinkMapping = {
	exists: boolean;
	actualLink: string;
	title: string;
};

type LinkMappings = {
	collections: Record<string, LinkMapping>;
	products: Record<string, LinkMapping>;
	blogs: Record<string, LinkMapping>;
	blogPosts: Record<string, LinkMapping>;
};

// Cache the link mappings
export const getLinkMappings = unstable_cache(
	async (): Promise<LinkMappings> => {
		// Fetch all data in parallel
		const [collections, products, blogs, blogPosts] = await Promise.all([
			getAllCollections(),
			getProducts(),
			getBlogs(),
			getAllBlogPosts(),
		]);

		// Build collection mappings
		const collectionMappings: Record<string, LinkMapping> = {};
		collections.forEach((collection: ShopifyCollection) => {
			collectionMappings[collection.handle] = {
				exists: true,
				actualLink: `/collections/${collection.handle}`,
				title: collection.title,
			};
		});

		// Add special collection mappings
		const specialCollections = [
			"best-sellers",
			"new-arrivals",
			"featured",
			"sale",
			"all",
			"grow-bags",
			"substrates",
			"equipment",
			"supplies",
			"bulk",
			"starter-kits",
		];

		specialCollections.forEach((handle) => {
			if (!collectionMappings[handle]) {
				// If the collection doesn't exist, find a suitable alternative
				const alternativeCollection = findAlternativeCollection(collections, handle);
				collectionMappings[handle] = {
					exists: false,
					actualLink: alternativeCollection ? `/collections/${alternativeCollection.handle}` : "/collections/all",
					title: formatTitle(handle),
				};
			}
		});

		// Build product mappings
		const productMappings: Record<string, LinkMapping> = {};
		products.forEach((product: ShopifyProduct) => {
			productMappings[product.handle] = {
				exists: true,
				actualLink: `/products/${product.handle}`,
				title: product.title,
			};
		});

		// Add special product mappings
		if (!productMappings["complete-cultivation-bundle"]) {
			const alternativeProduct = findAlternativeProduct(products, "bundle");
			productMappings["complete-cultivation-bundle"] = {
				exists: false,
				actualLink: alternativeProduct ? `/products/${alternativeProduct.handle}` : "/products",
				title: "Complete Cultivation Bundle",
			};
		}

		// Build blog mappings
		const blogMappings: Record<string, LinkMapping> = {};
		blogs.forEach((blog: any) => {
			blogMappings[blog.handle] = {
				exists: true,
				actualLink: `/blogs/${blog.handle}`,
				title: blog.title,
			};
		});

		// Add special blog mappings
		const specialBlogs = ["guides", "news"];
		specialBlogs.forEach((handle) => {
			if (!blogMappings[handle]) {
				const alternativeBlog = findAlternativeBlog(blogs, handle);
				blogMappings[handle] = {
					exists: false,
					actualLink: alternativeBlog ? `/blogs/${alternativeBlog.handle}` : "/blogs",
					title: formatTitle(handle),
				};
			}
		});

		// Build blog post mappings
		const blogPostMappings: Record<string, LinkMapping> = {};
		blogPosts.forEach((post: ShopifyBlogArticle) => {
			if (post.blog) {
				const key = `${post.blog.handle}/${post.handle}`;
				blogPostMappings[key] = {
					exists: true,
					actualLink: `/blogs/${post.blog.handle}/${post.handle}`,
					title: post.title,
				};
			}
		});

		// Add special blog post mappings
		const specialBlogPosts = ["guides/substrate-preparation", "guides/growing-conditions", "guides/troubleshooting"];

		specialBlogPosts.forEach((path) => {
			if (!blogPostMappings[path]) {
				const [blogHandle, postHandle] = path.split("/");
				const alternativePost = findAlternativeBlogPost(blogPosts, blogHandle, postHandle);

				blogPostMappings[path] = {
					exists: false,
					actualLink: alternativePost?.blog
						? `/blogs/${alternativePost.blog.handle}/${alternativePost.handle}`
						: blogMappings[blogHandle]?.exists
							? `/blogs/${blogHandle}`
							: "/blogs",
					title: formatTitle(postHandle),
				};
			}
		});

		return {
			collections: collectionMappings,
			products: productMappings,
			blogs: blogMappings,
			blogPosts: blogPostMappings,
		};
	},
	["link-mappings"],
	{
		revalidate: CACHE_TIMES.COLLECTIONS,
		tags: [CACHE_TAGS.COLLECTION, CACHE_TAGS.PRODUCT, CACHE_TAGS.BLOG],
	}
);

// Helper function to find an alternative collection
function findAlternativeCollection(collections: ShopifyCollection[], handle: string): ShopifyCollection | undefined {
	// Try to find a collection with a similar name
	const keywords = handle.split("-");

	// First, look for collections that contain the exact handle
	const exactMatch = collections.find(
		(c) => c.handle.includes(handle) || c.title.toLowerCase().includes(handle.replace(/-/g, " "))
	);

	if (exactMatch) {
		return exactMatch;
	}

	// Then look for collections that match any of the keywords
	for (const keyword of keywords) {
		if (keyword.length < 3) {
			continue; // Skip short keywords
		}

		const match = collections.find((c) => c.handle.includes(keyword) || c.title.toLowerCase().includes(keyword));

		if (match) {
			return match;
		}
	}

	// If no match found, return the first collection or undefined
	return collections[0];
}

// Helper function to find an alternative product
function findAlternativeProduct(products: ShopifyProduct[], keyword: string): ShopifyProduct | undefined {
	// Try to find a product with a similar name
	const match = products.find(
		(p) =>
			p.handle.includes(keyword) ||
			p.title.toLowerCase().includes(keyword) ||
			p.tags.some((tag) => tag.toLowerCase().includes(keyword))
	);

	return match || products[0];
}

// Helper function to find an alternative blog
function findAlternativeBlog(blogs: any[], handle: string): any | undefined {
	// Try to find a blog with a similar name
	const match = blogs.find(
		(b) => b.handle.includes(handle) || b.title.toLowerCase().includes(handle.replace(/-/g, " "))
	);

	return match || blogs[0];
}

// Helper function to find an alternative blog post
function findAlternativeBlogPost(
	posts: ShopifyBlogArticle[],
	blogHandle: string,
	postHandle: string
): ShopifyBlogArticle | undefined {
	// First try to find posts in the same blog
	const sameBlogPosts = posts.filter((p) => p.blog?.handle === blogHandle);

	if (sameBlogPosts.length > 0) {
		// Try to find a post with a similar name in the same blog
		const match = sameBlogPosts.find(
			(p) => p.handle.includes(postHandle) || p.title.toLowerCase().includes(postHandle.replace(/-/g, " "))
		);

		if (match) {
			return match;
		}

		// If no match, return the first post from the same blog
		return sameBlogPosts[0];
	}

	// If no posts in the same blog, try to find a post with a similar name in any blog
	const match = posts.find(
		(p) => p.handle.includes(postHandle) || p.title.toLowerCase().includes(postHandle.replace(/-/g, " "))
	);

	return match || posts[0];
}

// Helper function to format a handle into a title
function formatTitle(handle: string): string {
	return handle
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

// Function to get a valid collection link
export async function getValidCollectionLink(handle: string): Promise<string> {
	const mappings = await getLinkMappings();
	return mappings.collections[handle]?.actualLink || `/collections/${handle}`;
}

// Function to get a valid product link
export async function getValidProductLink(handle: string): Promise<string> {
	const mappings = await getLinkMappings();
	return mappings.products[handle]?.actualLink || `/products/${handle}`;
}

// Function to get a valid blog link
export async function getValidBlogLink(handle: string): Promise<string> {
	const mappings = await getLinkMappings();
	return mappings.blogs[handle]?.actualLink || `/blogs/${handle}`;
}

// Function to get a valid blog post link
export async function getValidBlogPostLink(blogHandle: string, postHandle: string): Promise<string> {
	const mappings = await getLinkMappings();
	const key = `${blogHandle}/${postHandle}`;
	return mappings.blogPosts[key]?.actualLink || `/blogs/${blogHandle}/${postHandle}`;
}

/**
 * Validates a link and returns information about its validity
 * @param href The link to validate
 * @returns Object containing validation information
 */
export async function validateLink(href: string): Promise<{ isValid: boolean; actualLink: string; title: string }> {
	// Parse the URL to extract the path
	const segments = href.split("/").filter(Boolean);

	if (segments.length === 0) {
		// Home page is always valid
		return { isValid: true, actualLink: "/", title: "Home" };
	}

	const type = segments[0];
	const handle = segments[1];
	const subHandle = segments[2];

	try {
		// Validate based on path type
		if (type === "collections" && handle) {
			const validLink = await getValidCollectionLink(handle);
			return {
				isValid: !!validLink,
				actualLink: validLink || href,
				title: validLink ? `Collection: ${handle}` : "",
			};
		}
		if (type === "products" && handle) {
			const validLink = await getValidProductLink(handle);
			return {
				isValid: !!validLink,
				actualLink: validLink || href,
				title: validLink ? `Product: ${handle}` : "",
			};
		}
		if (type === "blogs") {
			if (handle && subHandle) {
				const validLink = await getValidBlogPostLink(handle, subHandle);
				return {
					isValid: !!validLink,
					actualLink: validLink || href,
					title: validLink ? `Blog Post: ${subHandle}` : "",
				};
			}
			if (handle) {
				const validLink = await getValidBlogLink(handle);
				return {
					isValid: !!validLink,
					actualLink: validLink || href,
					title: validLink ? `Blog: ${handle}` : "",
				};
			}
		}

		// For other paths, assume they're valid
		return { isValid: true, actualLink: href, title: "" };
	} catch (_error) {
		return { isValid: false, actualLink: href, title: "" };
	}
}

// Function to get all valid collections
export async function getValidCollections(): Promise<Array<{ handle: string; title: string; exists: boolean }>> {
	const mappings = await getLinkMappings();

	return Object.entries(mappings.collections).map(([handle, mapping]) => ({
		handle,
		title: mapping.title,
		exists: mapping.exists,
	}));
}

// Function to get all valid blogs
export async function getValidBlogs(): Promise<Array<{ handle: string; title: string; exists: boolean }>> {
	const mappings = await getLinkMappings();

	return Object.entries(mappings.blogs).map(([handle, mapping]) => ({
		handle,
		title: mapping.title,
		exists: mapping.exists,
	}));
}
