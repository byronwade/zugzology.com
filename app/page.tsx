"use cache";

import { Suspense } from "react";
import { getProducts } from "@/lib/actions/shopify";
import type { Metadata } from "next";
import { ProductsContentClient } from "@/components/products/products-content-client";
import { HomeLoading } from "@/components/loading";

// Parallel data fetching
async function getPageData() {
	const [products, siteSettings] = await Promise.all([getProducts(), getSiteSettings()]);

	return {
		products,
		siteSettings,
	};
}

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Zugzology - Premium Mushroom Cultivation Supplies & Equipment",
		description: "Your trusted source for premium mushroom cultivation supplies and equipment. Find everything you need for successful mushroom growing, from spores to substrates. Expert guidance and top-quality products.",
		keywords: "mushroom cultivation, mushroom growing supplies, mushroom spores, mushroom substrate, cultivation equipment, growing kits, mycology supplies",
		openGraph: {
			title: "Zugzology - Premium Mushroom Cultivation Supplies & Equipment",
			description: "Your trusted source for premium mushroom cultivation supplies and equipment. Expert guidance and top-quality products.",
			url: "https://zugzology.com",
			siteName: "Zugzology",
			type: "website",
			locale: "en_US",
			images: [
				{
					url: "https://zugzology.com/og-image.jpg",
					width: 1200,
					height: 630,
					alt: "Zugzology - Premium Mushroom Cultivation Supplies",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: "Premium Mushroom Cultivation Supplies & Equipment",
			description: "Your trusted source for premium mushroom cultivation supplies and equipment.",
			images: ["https://zugzology.com/og-image.jpg"],
		},
		alternates: {
			canonical: "https://zugzology.com",
		},
		robots: {
			index: true,
			follow: true,
			nocache: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
		verification: {
			google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_ID,
		},
	};
}

// Optimize product data structure
function optimizeProductData(products: any[]) {
	return products.map((product) => ({
		id: product.id,
		title: product.title,
		handle: product.handle,
		description: product.description,
		availableForSale: product.availableForSale,
		productType: product.productType || "",
		vendor: product.vendor || "",
		tags: product.tags || [],
		options: product.options || [],
		publishedAt: product.publishedAt || new Date().toISOString(),
		priceRange: product.priceRange,
		images: {
			edges: product.images.edges.slice(0, 1), // Only keep first image for initial render
		},
		variants: {
			edges: [product.variants.edges[0]], // Only keep first variant for initial render
		},
	}));
}

// Add this function to fetch site settings from the server
async function getSiteSettings() {
	return {
		title: "Zugzology",
		description: "Your trusted source for premium mushroom cultivation supplies and equipment.",
		features: [
			{ icon: "Shield", text: "Premium Quality Guaranteed" },
			{ icon: "Truck", text: "Fast & Free Shipping" },
			{ icon: "Gift", text: "Gift Wrapping Available" },
			{ icon: "Info", text: "Expert Support" },
		],
	};
}

export default async function Home() {
	const { products, siteSettings } = await getPageData();
	const optimizedProducts = products ? optimizeProductData(products.slice(0, 8)) : [];

	const featuredCollection = {
		id: "featured",
		handle: "featured",
		title: "Featured Products",
		description: "Our selection of premium mushroom cultivation supplies and equipment.",
		products: {
			edges: optimizedProducts.map((product) => ({
				node: product,
			})),
		},
	};

	return (
		<>
			<Suspense>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify([
							{
								"@context": "https://schema.org",
								"@type": "WebSite",
								name: siteSettings.title,
								description: siteSettings.description,
								url: "https://zugzology.com",
								potentialAction: {
									"@type": "SearchAction",
									target: {
										"@type": "EntryPoint",
										urlTemplate: "https://zugzology.com/search?q={search_term_string}",
									},
									"query-input": "required name=search_term_string",
								},
							},
							{
								"@context": "https://schema.org",
								"@type": "Organization",
								name: siteSettings.title,
								url: "https://zugzology.com",
								logo: {
									"@type": "ImageObject",
									url: "https://zugzology.com/logo.png",
								},
								sameAs: ["https://facebook.com/zugzology", "https://twitter.com/zugzology", "https://instagram.com/zugzology"],
								contactPoint: {
									"@type": "ContactPoint",
									telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
									contactType: "customer service",
									availableLanguage: "English",
								},
							},
						]),
					}}
				/>
			</Suspense>

			<main className="min-h-screen">
				{/* Hero Section */}
				<section className="hero-section bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
					<div className="max-w-screen-xl mx-auto px-4">
						<h1 className="text-5xl font-bold mb-6">Premium Mushroom Cultivation Supplies</h1>
						<p className="text-xl mb-8 max-w-2xl">Your trusted source for high-quality mushroom growing supplies and equipment. From beginners to experts, we have everything you need for successful cultivation.</p>
					</div>
				</section>

				{/* Featured Products Section */}
				<section className="featured-products-section max-w-screen-xl mx-auto px-4 py-16">
					<h2 className="text-3xl font-bold mb-8">Featured Products</h2>
					<Suspense fallback={<HomeLoading />}>
						<ProductsContentClient collection={featuredCollection} />
					</Suspense>
				</section>

				{/* Benefits Section */}
				<section className="benefits-section bg-gray-50 dark:bg-gray-900 py-16">
					<div className="max-w-screen-xl mx-auto px-4">
						<h2 className="text-3xl font-bold mb-12 text-center">Why Choose Zugzology</h2>
						<div className="grid md:grid-cols-3 gap-8">
							{siteSettings.features.map((feature, index) => (
								<div key={index} className="benefit-card text-center">
									<h3 className="text-xl font-semibold mb-4">{feature.text}</h3>
									<p>{feature.text}</p>
								</div>
							))}
						</div>
					</div>
				</section>
			</main>
		</>
	);
}
