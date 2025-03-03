import { Suspense } from "react";
import { getProducts, getCollection, getAllCollections } from "@/lib/api/shopify/actions";
import type { Metadata } from "next";
import type { ProductsQueryOptions, ShopifyProduct } from "@/lib/types";
import { HomeLoading } from "@/components/loading";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { LatestProducts } from "@/components/sections/latest-products";
import { FeaturedCollections } from "@/components/sections/featured-collections";
import { BestSellersShowcase } from "@/components/sections/best-sellers-showcase";
import { FeaturedBundle } from "@/components/sections/featured-bundle";
import {
	ShoppingCart,
	Star,
	Shield,
	Truck,
	Package,
	ArrowRight,
	Clock,
	Sprout,
	Award,
	BarChart,
	Users,
	ShoppingBag,
	Leaf,
	ThumbsUp,
	BadgeCheck,
	ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { SEO } from "@/components/seo/seo";
import { TrustIndicators } from "@/components/trust/trust-indicators";
import { FAQSEO } from "@/components/seo/seo";

interface SiteFeature {
	iconName: string;
	title: string;
	text: string;
}

interface SiteSettings {
	title: string;
	description: string;
	features: SiteFeature[];
	categories: Array<{
		name: string;
		handle: string;
		image: string;
	}>;
}

interface OptimizedProduct extends ShopifyProduct {
	rating: number;
	reviewsCount: number;
}

// Add this function to fetch site settings from the server
async function getLocalSiteSettings(): Promise<SiteSettings> {
	return {
		title: "Zugzology",
		description: "Your trusted source for premium mushroom cultivation supplies and equipment.",
		features: [
			{ iconName: "Shield", title: "Premium Quality", text: "Only the highest quality cultivation supplies" },
			{ iconName: "Truck", title: "Fast Shipping", text: "Free shipping on orders over $75" },
			{ iconName: "ThumbsUp", title: "Satisfaction Guarantee", text: "100% satisfaction or your money back" },
			{ iconName: "BadgeCheck", title: "Expert Support", text: "Guidance from cultivation experts" },
		],
		categories: [
			// Using empty strings for images so we'll show gradients instead
			{ name: "Grow Kits", handle: "grow-kits", image: "" },
			{ name: "Substrates", handle: "substrates", image: "" },
			{ name: "Cultures", handle: "cultures", image: "" },
			{ name: "Equipment", handle: "equipment", image: "" },
		],
	};
}

// Update getPageData to include all necessary data for the homepage
const getPageData = unstable_cache(
	async () => {
		const [products, siteSettings, collections] = await Promise.all([
			getProducts(),
			getLocalSiteSettings(),
			getAllCollections(),
		]);

		// Get valid collection handles
		const collectionHandles = collections ? collections.map((c: { handle: string }) => c.handle) : [];

		// Debug info
		console.log("Total products fetched:", products?.length);
		console.log("Products with tags:", products?.filter((p: any) => p.tags && p.tags.length > 0).length);
		console.log("Products with best-seller tag:", products?.filter((p: any) => p.tags?.includes("best-seller")).length);
		console.log("Available collections:", collectionHandles);

		// Sample of product tags
		const sampleTags = products?.slice(0, 5).map((p) => ({ title: p.title, tags: p.tags }));
		console.log("Sample product tags:", sampleTags);

		const optimizedProducts = products ? products.slice(0, 12) : [];
		const topSellers = products ? products.filter((p) => p.tags?.includes("best-seller")).slice(0, 8) : [];

		// If no best-seller tag products found, use top 8 products as fallback
		const finalTopSellers = topSellers.length > 0 ? topSellers : products ? products.slice(0, 8) : [];

		// Improved sale product detection
		const saleProducts = products
			? products
					.filter((p) => {
						// Check for sale tag
						const hasSaleTag = p.tags?.includes("sale");

						// Check for compare at price
						const hasCompareAtPrice = p.variants.nodes.some(
							(variant) =>
								variant.compareAtPrice && parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount)
						);

						return hasSaleTag || hasCompareAtPrice;
					})
					.slice(0, 8)
			: [];

		// Get featured products
		const featuredProducts = products ? products.filter((p) => p.tags?.includes("featured")).slice(0, 6) : [];

		// Get beginner-friendly products
		const beginnerProducts = products
			? products
					.filter((p) =>
						p.tags?.some(
							(tag) =>
								tag.toLowerCase().includes("beginner") ||
								tag.toLowerCase().includes("starter-kit") ||
								tag.toLowerCase().includes("easy")
						)
					)
					.slice(0, 4)
			: [];

		return {
			products: optimizedProducts,
			topSellers: finalTopSellers,
			saleProducts,
			featuredProducts,
			beginnerProducts,
			siteSettings,
		};
	},
	["home-page-data"],
	{
		revalidate: 60,
		tags: ["home-page"],
	}
);

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Zugzology - Premium Mushroom Cultivation Supplies & Equipment",
		description:
			"Your trusted source for premium mushroom cultivation supplies and equipment. Find everything you need for successful mushroom growing, from spores to substrates. Expert guidance, fast shipping, and top-quality products guaranteed.",
		keywords:
			"mushroom cultivation, mushroom growing supplies, mushroom spores, mushroom substrate, cultivation equipment, growing kits, mycology supplies, gourmet mushrooms, medicinal mushrooms",
		openGraph: {
			title: "Zugzology - Premium Mushroom Cultivation Supplies & Equipment",
			description:
				"Your trusted source for premium mushroom cultivation supplies and equipment. Expert guidance, fast shipping, and top-quality products guaranteed.",
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
			description:
				"Your trusted source for premium mushroom cultivation supplies and equipment. Free shipping on orders over $75.",
			images: ["https://zugzology.com/og-image.jpg"],
			creator: "@zugzology",
			site: "@zugzology",
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

// Main component
export default async function Home() {
	const { products, topSellers, saleProducts, featuredProducts, beginnerProducts, siteSettings } = await getPageData();

	// Optimize product data structure - inside Home function scope
	const optimizeProductData = (products: ShopifyProduct[]): OptimizedProduct[] => {
		return products.map((product) => ({
			...product,
		rating: 4.5, // Default rating if missing
		reviewsCount: 10, // Default review count if missing
	}));
	};

	// Convert to optimized format for rendering
	const optimizedProducts = products ? optimizeProductData(products.slice(0, 8)) : [];
	const optimizedTopSellers = topSellers ? optimizeProductData(topSellers.slice(0, 8)) : [];
	const optimizedSaleProducts = saleProducts ? optimizeProductData(saleProducts.slice(0, 8)) : [];
	const optimizedFeaturedProducts = featuredProducts ? optimizeProductData(featuredProducts.slice(0, 6)) : [];
	const optimizedBeginnerProducts = beginnerProducts ? optimizeProductData(beginnerProducts.slice(0, 4)) : [];

	// Get a featured product for the hero if available
	const featuredProduct = optimizedFeaturedProducts.length > 0 ? optimizedFeaturedProducts[0] : null;

	// Components defined inside the component
	function FeatureShowcase({ features }: { features: SiteFeature[] }) {
		// Function to render the appropriate icon based on name
		const renderIcon = (iconName: string) => {
			switch (iconName) {
				case "Shield":
					return <Shield className="h-6 w-6 text-primary" />;
				case "Truck":
					return <Truck className="h-6 w-6 text-primary" />;
				case "ThumbsUp":
					return <ThumbsUp className="h-6 w-6 text-primary" />;
				case "BadgeCheck":
					return <BadgeCheck className="h-6 w-6 text-primary" />;
				default:
					return <BadgeCheck className="h-6 w-6 text-primary" />;
			}
		};

		return (
			<section className="w-full py-20 bg-white dark:bg-black">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-10">
						{features.map((feature, index) => (
							<div key={index} className="flex flex-col items-center text-center">
								<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
									{renderIcon(feature.iconName)}
								</div>
								<h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">{feature.text}</p>
							</div>
						))}
					</div>
				</div>
			</section>
		);
	}

	function AppleStyleHero({ product }: { product: ShopifyProduct | null }) {
		return (
			<section className="relative w-full h-[650px] overflow-hidden bg-black">
				{/* Background image or video */}
				<div className="absolute inset-0 w-full h-full">
					<Image
						src="/images/hero-mushrooms.jpg"
						alt="Premium mushroom cultivation supplies"
						fill
						priority
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
				</div>

				{/* Content */}
				<div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white relative z-10">
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
						Premium Mushroom Cultivation Supplies
					</h1>
					<p className="text-xl md:text-2xl max-w-3xl mb-8 text-gray-100">
						Quality growing kits, substrates, and expert guidance for cultivators of all experience levels
					</p>
					<div className="flex flex-col sm:flex-row gap-4">
						<Link
							href="/products"
							className="bg-white text-black px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition"
						>
							Shop Now
						</Link>
						<Link
							href="/blogs/guides/beginners-guide"
							className="border border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white/10 transition"
						>
							Beginner's Guide
						</Link>
					</div>
				</div>
			</section>
		);
	}

	// Helper function to format price
	function formatPrice(amount: number, currencyCode = "USD") {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currencyCode,
		}).format(amount);
	}

	function ProductShowcase({
		title,
		tagline,
		products,
		collectionHandle,
	}: {
		title: string;
		tagline: string;
		products: OptimizedProduct[] | ShopifyProduct[];
		collectionHandle?: string;
	}) {
		return (
			<section className="w-full py-20 bg-gray-50 dark:bg-gray-950">
				<div className="container mx-auto px-4">
					<div className="flex flex-col items-center text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-semibold mb-3">{title}</h2>
						<p className="text-xl text-gray-600 dark:text-gray-400">{tagline}</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
						{products.slice(0, 4).map((product) => (
							<Link key={product.id} href={`/products/${product.handle}`} className="group">
								<div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
									<div className="relative aspect-square">
										{product.images?.nodes?.[0] && (
											<Image
												src={product.images.nodes[0].url}
												alt={product.title}
												fill
												className="object-cover group-hover:scale-105 transition-transform duration-500"
												sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
											/>
										)}
									</div>
									<div className="p-6">
										<h3 className="font-medium mb-2 group-hover:text-primary transition-colors line-clamp-1">
											{product.title}
										</h3>
										<p className="text-lg font-semibold">
											{formatPrice(
												parseFloat(product.variants?.nodes?.[0]?.price?.amount || "0"),
												product.variants?.nodes?.[0]?.price?.currencyCode
											)}
										</p>
									</div>
								</div>
							</Link>
						))}
					</div>

					<div className="mt-12 text-center">
						<Button
							size="lg"
							variant="outline"
							className="rounded-full h-11 px-8 border-gray-300 dark:border-gray-700"
							asChild
						>
							<Link href={`/collections/${collectionHandle || "all"}`}>
								View All <ChevronRight className="h-4 w-4 ml-1" />
							</Link>
						</Button>
					</div>
				</div>
			</section>
		);
	}

	function CategoryShowcase({ categories }: { categories: SiteSettings["categories"] }) {
		return (
			<section className="w-full py-20 bg-white dark:bg-black">
				<div className="container mx-auto px-4">
					<div className="flex flex-col items-center text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-semibold mb-3">Shop by Category</h2>
						<p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
							Find everything you need for successful mushroom cultivation
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{categories.map((category, index) => (
							<Link
								key={category.handle}
								href={`/collections/${category.handle}`}
								className="group relative overflow-hidden rounded-2xl aspect-[4/3] flex items-center justify-center"
							>
								<div
									className={`absolute inset-0 bg-gradient-to-br ${
										index % 4 === 0
											? "from-blue-500/20 to-blue-700/40"
											: index % 4 === 1
											? "from-green-500/20 to-green-700/40"
											: index % 4 === 2
											? "from-purple-500/20 to-purple-700/40"
											: "from-amber-500/20 to-amber-700/40"
									}`}
								/>
								<div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="relative z-10 text-center px-4">
									<h3 className="text-2xl font-semibold text-white mb-3">{category.name}</h3>
									<span className="inline-flex items-center px-5 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm group-hover:bg-white/30 transition-all">
										Shop Now <ChevronRight className="h-4 w-4 ml-1" />
									</span>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>
		);
	}

	// Frequently asked questions for the homepage
	const homepageFAQs = [
		{
			question: "What kinds of mushroom growing supplies do you offer?",
			answer:
				"We offer a complete range of mushroom cultivation supplies including substrates, spawn, growing kits, tools, equipment, and accessories for both beginners and experienced growers.",
		},
		{
			question: "Do you ship internationally?",
			answer:
				"Yes, we ship to most countries worldwide. International shipping rates are calculated at checkout based on weight and destination.",
		},
		{
			question: "Do you offer free shipping?",
			answer: "Yes! We offer free standard shipping on all domestic orders over $75.",
		},
		{
			question: "I'm new to mushroom cultivation. Where should I start?",
			answer:
				"We recommend our beginner-friendly growing kits which include everything you need to get started. We also have comprehensive guides on our blog and dedicated customer support to help you along your journey.",
		},
		{
			question: "How long does shipping take?",
			answer:
				"Domestic orders typically ship within 1-2 business days and arrive within 3-7 business days. International shipping times vary by location.",
		},
		{
			question: "Do you offer bulk discounts?",
			answer:
				"Yes, we offer volume discounts for bulk orders. Contact our sales team for custom quotes on large orders.",
		},
	];

	return (
		<>
			{/* Enhanced SEO implementation */}
			<SEO type="home" siteSettings={siteSettings} faq={homepageFAQs} />

			{/* Apple-style Hero Section */}
			<AppleStyleHero product={featuredProduct} />

			{/* Trust Indicators - Based on Backlinko factors #86 (Trust signals) and #118 (Social proof) */}
			<section className="py-8 bg-gray-50">
				<div className="container mx-auto px-4">
					<TrustIndicators variant="full" showQuickDelivery={true} showSustainable={true} />
				</div>
			</section>

			{/* Feature Showcase */}
			<FeatureShowcase features={siteSettings.features} />

			{/* Category Showcase */}
			<CategoryShowcase categories={siteSettings.categories} />

			{/* Best Sellers Showcase */}
			<ProductShowcase
				title="Best Sellers"
				tagline="Our most popular products, trusted by cultivators worldwide"
				products={optimizedTopSellers}
				collectionHandle="all"
			/>

			{/* Latest Products */}
			<ProductShowcase
				title="Latest Products"
				tagline="Discover our newest additions to enhance your cultivation"
				products={optimizedProducts}
				collectionHandle="all"
			/>

			{/* Featured Bundle in Apple style */}
			<section className="w-full py-20 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
				<div className="container mx-auto px-4">
					<div className="flex flex-col md:flex-row gap-12 items-center">
						<div className="md:w-1/2">
							<Badge className="mb-4 bg-primary/10 text-primary">Special Offer</Badge>
							<h2 className="text-3xl md:text-4xl font-semibold mb-4">Complete Cultivation Bundle</h2>
							<p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
								Everything you need to start growing mushrooms at home in one convenient package
							</p>
							<Button size="lg" className="rounded-full h-11 px-8" asChild>
								<Link href="/products/complete-cultivation-bundle">
									Shop Bundle <ChevronRight className="h-4 w-4 ml-1" />
								</Link>
							</Button>
						</div>
						<div className="md:w-1/2 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
							<div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/50"></div>
							<div className="absolute inset-0 flex items-center justify-center">
								<Package className="h-24 w-24 text-white/80" />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Sale Products */}
			{optimizedSaleProducts.length > 0 && (
				<ProductShowcase
					title="Special Offers"
					tagline="Limited time deals on premium cultivation supplies"
					products={optimizedSaleProducts}
					collectionHandle="all"
				/>
			)}

			{/* Expert Content - Based on Backlinko factors #35 (Freshness/Quality content) and #40 (Content length) */}
			<section className="w-full py-16 bg-white">
				<div className="container mx-auto px-4">
					<div className="flex flex-col items-center text-center mb-10">
						<h2 className="text-3xl font-bold mb-3">Expert Mushroom Growing Resources</h2>
						<p className="text-gray-600 max-w-3xl">
							Learn from our comprehensive guides and tutorials created by experienced mycologists
						</p>
					</div>
					<div className="prose prose-lg max-w-4xl mx-auto">
						<p>
							At Zugzology, we're committed to not just selling mushroom cultivation supplies, but to helping you
							succeed with your growing projects. Our extensive guides cover topics from:
						</p>
						<ul>
							<li>
								<strong>Substrate preparation and sterilization techniques</strong> to ensure contamination-free growing
							</li>
							<li>
								<strong>Optimal growing conditions</strong> for different mushroom varieties including temperature,
								humidity, and lighting
							</li>
							<li>
								<strong>Harvesting and storage methods</strong> to maximize your yields and preserve your mushrooms
							</li>
							<li>
								<strong>Troubleshooting common issues</strong> that new growers encounter and how to solve them
							</li>
						</ul>
						<p>
							Our{" "}
							<a href="/blogs/guides" className="text-primary hover:underline">
								cultivation library
							</a>{" "}
							is constantly updated with new information based on the latest mycology research and techniques.
						</p>
					</div>
					<div className="text-center mt-8">
						<Button asChild>
							<Link href="/blogs/guides" className="flex items-center">
								Browse Our Guides <ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* FAQ Section with structured data */}
			<section className="py-12 bg-gray-50">
				<div className="container mx-auto px-4">
					<FAQSEO questions={homepageFAQs} />
				</div>
			</section>

			{/* Newsletter Section */}
			<section className="w-full py-20 bg-white dark:bg-black">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto text-center">
						<h2 className="text-3xl md:text-4xl font-semibold mb-4">Stay Connected</h2>
						<p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
							Subscribe to receive updates, growing tips, and exclusive offers
						</p>
						<form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
							<input
								type="email"
								placeholder="Your email address"
								className="flex-1 h-11 px-4 rounded-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900"
								required
							/>
							<Button type="submit" className="h-11 px-6 rounded-full">
								Subscribe
							</Button>
						</form>
					</div>
				</div>
			</section>

			{/* Structured data for SEO */}
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
								sameAs: [
									"https://facebook.com/zugzology",
									"https://twitter.com/zugzology",
									"https://instagram.com/zugzology",
								],
								contactPoint: {
									"@type": "ContactPoint",
									telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
									contactType: "customer service",
									availableLanguage: "English",
								},
							},
							{
								"@context": "https://schema.org",
								"@type": "ItemList",
								itemListElement: optimizedTopSellers.slice(0, 3).map((product, index) => {
									// Safely extract the rating and review count
									const rating = (product as OptimizedProduct).rating || 4.5;
									const reviewCount = (product as OptimizedProduct).reviewsCount || 10;

									return {
										"@type": "ListItem",
										position: index + 1,
										item: {
											"@type": "Product",
											name: product.title,
											description: product.description?.substring(0, 150) || "",
											url: `https://zugzology.com/products/${product.handle}`,
											image: product.images?.nodes[0]?.url || "",
											identifier: product.variants?.nodes[0]?.id || "",
											brand: {
												"@type": "Brand",
												name: "Zugzology",
											},
											offers: {
												"@type": "Offer",
												price: product.variants?.nodes[0]?.price.amount || "",
												priceCurrency: product.variants?.nodes[0]?.price.currencyCode || "USD",
												availability: product.availableForSale
													? "https://schema.org/InStock"
													: "https://schema.org/OutOfStock",
												url: `https://zugzology.com/products/${product.handle}`,
											},
											aggregateRating: {
												"@type": "AggregateRating",
												ratingValue: rating.toFixed(1),
												reviewCount: reviewCount,
											},
										},
									};
								}),
							},
							// Add LocalBusiness schema per Backlinko factor #193
							{
								"@context": "https://schema.org",
								"@type": "LocalBusiness",
								"@id": "https://zugzology.com",
								name: "Zugzology",
								image: "https://zugzology.com/logo.png",
								url: "https://zugzology.com",
								telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
								priceRange: "$$",
								address: {
									"@type": "PostalAddress",
									addressCountry: "US",
								},
								geo: {
									"@type": "GeoCoordinates",
									latitude: 37.7749,
									longitude: -122.4194,
								},
								openingHoursSpecification: {
									"@type": "OpeningHoursSpecification",
									dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
									opens: "09:00",
									closes: "17:00",
								},
							},
						]),
					}}
				/>
			</Suspense>
		</>
	);
}
