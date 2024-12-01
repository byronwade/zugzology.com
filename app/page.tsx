import { Suspense } from "react";
import { getProducts } from "@/lib/actions/shopify";
import type { Metadata } from "next";
import { ProductsContentClient } from "@/components/products/products-content-client";

// Add server runtime optimizations
export const runtime = "edge";
export const preferredRegion = "auto";
export const revalidate = 60; // Cache for 1 minute

export const metadata: Metadata = {
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
		google: "YOUR_GOOGLE_VERIFICATION_ID", // Add your Google verification ID
	},
};

// Loading component for better UX
function HomeLoading() {
	return (
		<div className="w-full animate-pulse">
			<div className="max-w-screen-xl mx-auto px-4 py-8">
				<div className="h-12 w-3/4 bg-gray-200 rounded mb-6" />
				<div className="h-6 w-1/2 bg-gray-200 rounded mb-12" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{[...Array(8)].map((_, i) => (
						<div key={i} className="bg-gray-200 rounded-lg h-64" />
					))}
				</div>
			</div>
		</div>
	);
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
	// Fetch from your CMS or Shopify metafields
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
	const siteSettings = await getSiteSettings();

	// Fetch featured products
	const products = await getProducts();
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

	// Enhanced structured data for home page
	const homeJsonLd = [
		{
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: "Zugzology",
			description: "Your trusted source for premium mushroom cultivation supplies and equipment.",
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
			name: "Zugzology",
			url: "https://zugzology.com",
			logo: {
				"@type": "ImageObject",
				url: "https://zugzology.com/logo.png",
			},
			sameAs: ["https://facebook.com/zugzology", "https://twitter.com/zugzology", "https://instagram.com/zugzology"],
			contactPoint: {
				"@type": "ContactPoint",
				telephone: "+1-XXX-XXX-XXXX",
				contactType: "customer service",
				availableLanguage: "English",
			},
		},
		{
			"@context": "https://schema.org",
			"@type": "ItemList",
			name: "Featured Products",
			itemListElement: optimizedProducts.map((product, index) => ({
				"@type": "ListItem",
				position: index + 1,
				item: {
					"@type": "Product",
					name: product.title,
					description: product.description,
					url: `https://zugzology.com/products/${product.handle}`,
					image: product.images.edges[0]?.node.url,
					brand: {
						"@type": "Brand",
						name: "Zugzology",
					},
					offers: {
						"@type": "Offer",
						price: product.priceRange.minVariantPrice.amount,
						priceCurrency: product.priceRange.minVariantPrice.currencyCode,
						availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
						url: `https://zugzology.com/products/${product.handle}`,
					},
				},
			})),
		},
	];

	return (
		<>
			{/* Inject structured data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(homeJsonLd),
				}}
			/>

			<main className="min-h-screen">
				{/* Hero Section */}
				<section className="hero-section bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20" itemScope itemType="https://schema.org/WPHeader">
					<div className="max-w-screen-xl mx-auto px-4">
						<h1 className="text-5xl font-bold mb-6" itemProp="headline">
							Premium Mushroom Cultivation Supplies
						</h1>
						<p className="text-xl mb-8 max-w-2xl" itemProp="description">
							Your trusted source for high-quality mushroom growing supplies and equipment. From beginners to experts, we have everything you need for successful cultivation.
						</p>
					</div>
				</section>

				{/* Featured Products Section */}
				<section className="featured-products-section max-w-screen-xl mx-auto px-4 py-16" itemScope itemType="https://schema.org/CollectionPage">
					<h2 className="text-3xl font-bold mb-8">Featured Products</h2>
					<Suspense fallback={<HomeLoading />}>
						<div className="featured-products">
							<ProductsContentClient collection={featuredCollection} />
						</div>
					</Suspense>
				</section>

				{/* Benefits Section */}
				<section className="benefits-section bg-gray-50 dark:bg-gray-900 py-16">
					<div className="max-w-screen-xl mx-auto px-4">
						<h2 className="text-3xl font-bold mb-12 text-center">Why Choose Zugzology</h2>
						<div className="grid md:grid-cols-3 gap-8">
							<div className="benefit-card text-center">
								<h3 className="text-xl font-semibold mb-4">Premium Quality</h3>
								<p>Only the highest quality supplies and equipment for optimal results.</p>
							</div>
							<div className="benefit-card text-center">
								<h3 className="text-xl font-semibold mb-4">Expert Support</h3>
								<p>Get guidance from our experienced team throughout your growing journey.</p>
							</div>
							<div className="benefit-card text-center">
								<h3 className="text-xl font-semibold mb-4">Fast Shipping</h3>
								<p>Quick and secure shipping to get you started as soon as possible.</p>
							</div>
						</div>
					</div>
				</section>
			</main>
		</>
	);
}
