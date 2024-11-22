import React from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { unstable_cache } from "@/lib/unstable-cache";
import { shopifyClient } from "@/lib/shopify";
import type { Page } from "@/lib/types/shopify";
import { Metadata, ResolvingMetadata } from "next";
import { JsonLd } from "@/components/json-ld";

export const revalidate = 3600;
export const runtime = "edge";
export const preferredRegion = "auto";
export const fetchCache = "force-cache";

// Move the query inside the file for better organization
const getPageQuery = `#graphql
  query GetPage($handle: String!) {
    page(handle: $handle) {
      id
      title
      handle
      bodySummary
      body
      bodyHtml
      createdAt
      updatedAt
      onlineStoreUrl
      seo {
        title
        description
      }
      author {
        name
      }
      publishedAt
    }
  }
`;

const getPage = unstable_cache(
	async (handle: string) => {
		if (!handle) return null;

		try {
			const response = await shopifyClient.request<{ page: Page }>(getPageQuery, {
				variables: { handle },
			});

			if (!response?.data?.page) {
				console.log("No page found for handle:", handle);
				return null;
			}

			return response.data.page;
		} catch (error) {
			console.error("Error fetching page:", error);
			return null;
		}
	},
	["page"],
	{ revalidate: 60 * 60 * 2 }
);

type Props = {
	params: { pages?: string[] };
	searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params, searchParams }: Props, parent: ResolvingMetadata): Promise<Metadata> {
	// If no pages param, this is the home page
	if (!params.pages?.length) {
		return {
			title: "Zugzology - Mushroom Store",
			description: "Your premier source for mushroom products",
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
			alternates: {
				canonical: "/",
			},
		};
	}

	const handle = params.pages.join("/");
	const page = await getPage(handle);
	const headersList = await headers();
	const domain = headersList.get("host") || "";
	const fullUrl = `https://${domain}/${handle}`;

	// Get the previous metadata
	const previousMetadata = await parent;
	const previousImages = previousMetadata.openGraph?.images || [];

	if (!page) {
		return {
			title: "Page Not Found | Zugzology",
			description: "The requested page could not be found.",
			robots: {
				index: false,
				follow: true,
			},
		};
	}

	return {
		title: page.seo?.title || `${page.title} | Zugzology`,
		description: page.seo?.description || page.bodySummary,

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
		alternates: {
			canonical: fullUrl,
		},
		openGraph: {
			title: page.seo?.title || page.title,
			description: page.seo?.description || page.bodySummary,
			url: fullUrl,
			siteName: "Zugzology",
			images: [...previousImages],
			locale: "en_US",
			type: "article",
			publishedTime: page.publishedAt,
			modifiedTime: page.updatedAt,
			authors: page.author?.name,
		},
		twitter: {
			card: "summary_large_image",
			title: page.seo?.title || page.title,
			description: page.seo?.description || page.bodySummary,
			creator: "@zugzology",
		},
	};
}

// Generate static params for important pages
export async function generateStaticParams() {
	// Add your most important pages here for static generation
	return [{ pages: ["about"] }, { pages: ["contact"] }, { pages: ["terms"] }, { pages: ["privacy"] }];
}

export default async function ShopifyPage({ params }: { params: { pages?: string[] } }) {
	// If no pages param, this is the home page
	if (!params.pages?.length) {
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-8">Welcome to Zugzology</h1>
				{/* Add your home page content here */}
			</div>
		);
	}

	const handle = params.pages.join("/");
	const page = await getPage(handle);

	if (!page) {
		console.log("Page not found for handle:", handle);
		notFound();
	}

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: page.title,
		description: page.bodySummary,
		author: {
			"@type": "Organization",
			name: page.author?.name || "Zugzology",
		},
		datePublished: page.publishedAt,
		dateModified: page.updatedAt,
		publisher: {
			"@type": "Organization",
			name: "Zugzology",
			logo: {
				"@type": "ImageObject",
				url: "https://zugzology.com/logo.png", // Update with your actual logo URL
			},
		},
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `https://${headers().get("host")}/${handle}`,
		},
	};

	return (
		<>
			<JsonLd data={jsonLd} />
			<article className="container mx-auto px-4 py-8">
				<div className="prose prose-lg max-w-none">
					<h1 className="text-3xl font-bold mb-8">{page.title}</h1>
					{/* Add structured data markup for article */}
					<div className="mt-6" dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />
					{/* Add metadata for time to read, author, date, etc. */}
					<div className="mt-4 text-sm text-gray-500">
						<time dateTime={page.publishedAt}>Published: {new Date(page.publishedAt).toLocaleDateString()}</time>
						{page.updatedAt && (
							<time dateTime={page.updatedAt} className="ml-4">
								Updated: {new Date(page.updatedAt).toLocaleDateString()}
							</time>
						)}
						{page.author?.name && <span className="ml-4">By: {page.author.name}</span>}
					</div>
				</div>
			</article>
		</>
	);
}
