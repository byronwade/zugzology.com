import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, ShoppingBag, Star } from "lucide-react";

// Components
import HomeLoading from "./loading";
import { StoreFeatures } from "@/components/store-features";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import { ValidatedLink } from "@/components/ui/validated-link";
import { BlogPreview } from "@/components/blog-preview";
import { FeaturedProduct } from "@/components/featured-product";
import { BestSellers } from "@/components/best-sellers";
import { VideoSection } from "@/components/video-section";
import { BulkDiscount } from "@/components/bulk-discount";

// API and Data
import { getProducts, getSiteSettings, getAllCollections, getPaginatedProducts } from "@/lib/api/shopify/actions";
import { ShopifyProduct, ShopifyCollection } from "@/lib/types";

// Types
interface SiteFeature {
	title: string;
	description: string;
	icon: React.ReactNode;
}

interface SiteSettings {
	title: string;
	description: string;
	features: SiteFeature[];
	categories: string[];
}

interface OptimizedProduct extends Omit<ShopifyProduct, "images"> {
	isOnSale: boolean;
	price: string;
	compareAtPrice: string | null;
	featuredImage?: {
		url: string;
		altText?: string;
		blurDataURL?: string;
	};
}

interface OptimizedCollection {
	id: string;
	title: string;
	handle: string;
	description: string;
	image?: {
		url: string;
		altText?: string;
		blurDataURL?: string;
	};
}

// Data fetching with Next.js 15 caching
async function getLocalSiteSettings(): Promise<SiteSettings> {
	"use cache";

	// Fetch site settings from Shopify
	const shopSettings = await getSiteSettings();

	return {
		title: shopSettings?.name || "Zugzology",
		description: shopSettings?.description || "Premium mushroom cultivation supplies",
		features: [
			{
				title: "Quality Guarantee",
				description: "All products tested and approved by experts",
				icon: <Check className="h-6 w-6" />,
			},
			{
				title: "Fast Shipping",
				description: "Orders ship within 24-48 hours",
				icon: <ShoppingBag className="h-6 w-6" />,
			},
			{
				title: "Expert Support",
				description: "Get help from our knowledgeable team",
				icon: <Star className="h-6 w-6" />,
			},
		],
		categories: ["Substrates", "Spawn", "Tools", "Books", "Kits"],
	};
}

// Custom function to get products by collection handle
async function getProductsByCollection(collectionHandle: string, limit: number = 4): Promise<ShopifyProduct[]> {
	//("use cache");

	// Get all products
	const allProducts = await getProducts();

	// Filter products by collection handle using tags
	// This is a simplified approach - in a real implementation, you would query products by collection
	const filteredProducts = allProducts.filter((product) => {
		return (
			product.tags.includes(collectionHandle) ||
			(collectionHandle === "best-sellers" && product.tags.includes("best-seller")) ||
			(collectionHandle === "new-arrivals" && product.tags.includes("new-arrival")) ||
			(collectionHandle === "sale" && product.variants.nodes[0]?.compareAtPrice !== null)
		);
	});

	// Return limited number of products
	return filteredProducts.slice(0, limit);
}

async function fetchHomePageData() {
	// Use "use cache" directive for caching in Next.js 15
	//("use cache");

	const collections = await getAllCollections();
	const products = await getProducts();

	// Filter products for best sellers, new arrivals, and sale items
	const bestSellers = products
		.filter((product) => product.tags.includes("best-seller"))
		.slice(0, 4)
		.map(optimizeProduct);

	const newArrivals = products
		.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
		.slice(0, 4)
		.map(optimizeProduct);

	const saleProducts = products
		.filter((product) => {
			const variant = product.variants.nodes[0];
			return (
				variant &&
				variant.compareAtPrice &&
				parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount)
			);
		})
		.slice(0, 4)
		.map(optimizeProduct);

	return {
		featuredCollections: collections.slice(0, 3).map(optimizeCollection),
		featuredProducts: products.slice(0, 4).map(optimizeProduct),
		bestSellers,
		newArrivals,
		saleProducts,
		hasSaleProducts: saleProducts.length > 0,
	};
}

// Helper function to optimize product data
function optimizeProduct(product: ShopifyProduct): OptimizedProduct {
	// Create blur data URL for image placeholder
	const blurDataURL =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEDQIHXG8H/QAAAABJRU5ErkJggg==";

	// Get the first variant's price
	const firstVariant = product.variants.nodes[0];
	const price = firstVariant ? firstVariant.price.amount : "0";
	const compareAtPrice = firstVariant && firstVariant.compareAtPrice ? firstVariant.compareAtPrice.amount : null;

	// Check if product is on sale
	const isOnSale = compareAtPrice ? parseFloat(price) < parseFloat(compareAtPrice) : false;

	// Get the featured image
	const featuredImage = product.images.nodes[0]
		? {
				url: product.images.nodes[0].url,
				altText: product.images.nodes[0].altText,
				blurDataURL,
		  }
		: undefined;

	return {
		...product,
		price,
		compareAtPrice,
		isOnSale,
		featuredImage,
	};
}

// Helper function to optimize collection data
function optimizeCollection(collection: ShopifyCollection): OptimizedCollection {
	// Create blur data URL for image placeholder
	const blurDataURL =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEDQIHXG8H/QAAAABJRU5ErkJggg==";

	return {
		id: collection.id,
		title: collection.title,
		handle: collection.handle,
		description: collection.description,
		image: collection.image
			? {
					url: collection.image.url,
					altText: collection.image.altText,
					blurDataURL,
			  }
			: undefined,
	};
}

export async function generateMetadata(): Promise<Metadata> {
	const siteSettings = await getLocalSiteSettings();

	return {
		title: siteSettings.title,
		description: siteSettings.description,
	};
}

export default async function HomePage() {
	return (
		<Suspense fallback={<HomeLoading />}>
			<HomeContent />
		</Suspense>
	);
}

async function HomeContent() {
	const data = await fetchHomePageData();

	return (
		<div className="min-h-screen">
			<AppleStyleHero />

			<section className="py-10 md:py-16">
				<div className="container mx-auto px-4">
					<h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Featured Collections</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
						{data.featuredCollections.map((collection) => (
							<div key={collection.id} className="group">
								<div className="relative overflow-hidden rounded-lg">
									<ValidatedLink href={`/collections/${collection.handle}`}>
										<Image
											src={collection.image?.url || "/placeholder-collection.png"}
											alt={collection.title}
											width={400}
											height={300}
											className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
											sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
											loading="lazy"
											blurDataURL={collection.image?.blurDataURL}
											placeholder={collection.image?.blurDataURL ? "blur" : "empty"}
										/>
									</ValidatedLink>
									<div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-4">
										<h3 className="text-white text-xl font-semibold">{collection.title}</h3>
									</div>
								</div>
								<div className="mt-2">
									<ValidatedLink href={`/collections/${collection.handle}`} className="text-primary hover:underline">
										View Collection
									</ValidatedLink>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<BestSellers />

			<VideoSection />

			<FeaturedProduct />

			<BlogPreview />

			<StoreFeatures />

			<BulkDiscount />

			<FAQSection />
			<NewsletterSection />
			<StructuredData />
		</div>
	);
}

// Hero Section Component
function AppleStyleHero() {
	return (
		<section className="relative w-full min-h-[80vh] flex items-center">
			<div className="absolute inset-0 z-0">
				<Image
					src="/mycelium-roots1.png"
					alt="Glowing mycelium roots"
					fill
					className="object-cover brightness-[0.7]"
					priority
					sizes="100vw"
					placeholder="blur"
					blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEDQIHXG8H/QAAAABJRU5ErkJggg=="
				/>
			</div>
			<div className="container relative z-10 mx-auto px-4 py-24 sm:px-6 lg:px-8">
				<div className="max-w-2xl">
					<h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
						<span className="block">Grow Your Own</span>
						<span className="block text-primary">Gourmet Mushrooms</span>
					</h1>
					<p className="mt-6 max-w-lg text-xl text-white">
						Zugzology provides premium mushroom cultivation supplies for beginners and experts alike. Start your
						mycology journey today.
					</p>
					<div className="mt-10 flex flex-col sm:flex-row gap-4">
						<Button size="lg" asChild>
							<ValidatedLink href="/collections/all-products">Shop Now</ValidatedLink>
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
							asChild
						>
							<ValidatedLink href="/blogs/guides/getting-started">Learn More</ValidatedLink>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}

// Product Card Component
function ProductCard({ product }: { product: OptimizedProduct }) {
	return (
		<ValidatedLink href={`/products/${product.handle}`} className="group block">
			<div className="relative overflow-hidden rounded-lg mb-3 bg-gray-100">
				<Image
					src={product.featuredImage?.url || "/placeholder-product.png"}
					alt={product.featuredImage?.altText || product.title}
					width={300}
					height={300}
					className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
					sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
					loading="lazy"
					blurDataURL={product.featuredImage?.blurDataURL}
					placeholder={product.featuredImage?.blurDataURL ? "blur" : "empty"}
				/>
				{product.isOnSale && (
					<div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Sale</div>
				)}
			</div>
			<h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">{product.title}</h3>
			<div className="mt-1 flex items-center">
				<span className={`text-gray-900 ${product.isOnSale ? "font-bold text-red-600" : ""}`}>
					{formatProductPrice(product.price)}
				</span>
				{product.isOnSale && product.compareAtPrice && (
					<span className="ml-2 text-sm text-gray-500 line-through">{formatProductPrice(product.compareAtPrice)}</span>
				)}
			</div>
		</ValidatedLink>
	);
}

// Helper function to format prices
function formatProductPrice(price: string): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(parseFloat(price));
}

// Define the missing components
function FAQSection() {
	// Define FAQ data
	const homepageFAQs = [
		{
			question: "What types of mushroom cultivation supplies do you offer?",
			answer:
				"We offer a complete range of mushroom cultivation supplies including substrates, spawn, growing kits, tools, equipment, and accessories for both beginners and experienced growers.",
		},
		{
			question: "Do you ship internationally?",
			answer:
				"Yes, we ship to most countries worldwide. International shipping rates are calculated at checkout based on weight and destination.",
		},
		{
			question: "How long does shipping take?",
			answer:
				"Domestic orders typically ship within 1-2 business days and arrive within 3-7 business days. International shipping times vary by location.",
		},
		{
			question: "Do you offer resources for beginners?",
			answer:
				"Yes, we provide comprehensive guides, tutorials, and support for growers of all experience levels. Check out our blog for helpful resources.",
		},
	];

	return (
		<section className="py-10 md:py-16">
			<div className="container mx-auto px-4">
				<h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
				<div className="max-w-3xl mx-auto divide-y divide-gray-200 dark:divide-gray-700">
					{homepageFAQs.map((faq, index) => (
						<div key={index} className="py-5">
							<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{faq.question}</h3>
							<p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function StructuredData() {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify({
					"@context": "https://schema.org",
					"@graph": [
						{
							"@type": "WebSite",
							"@id": "https://zugzology.com/#website",
							url: "https://zugzology.com/",
							name: "Zugzology",
							description: "Premium Mushroom Cultivation Supplies",
						},
						{
							"@type": "Organization",
							"@id": "https://zugzology.com/#organization",
							name: "Zugzology",
							logo: {
								"@type": "ImageObject",
								url: "https://zugzology.com/logo.png",
							},
						},
						{
							"@type": "FAQPage",
							"@id": "https://zugzology.com/#faq",
							mainEntity: [
								{
									"@type": "Question",
									name: "What types of mushroom cultivation supplies do you offer?",
									acceptedAnswer: {
										"@type": "Answer",
										text: "We offer a complete range of mushroom cultivation supplies including substrates, spawn, growing kits, tools, equipment, and accessories for both beginners and experienced growers.",
									},
								},
								{
									"@type": "Question",
									name: "Do you ship internationally?",
									acceptedAnswer: {
										"@type": "Answer",
										text: "Yes, we ship to most countries worldwide. International shipping rates are calculated at checkout based on weight and destination.",
									},
								},
								{
									"@type": "Question",
									name: "How long does shipping take?",
									acceptedAnswer: {
										"@type": "Answer",
										text: "Domestic orders typically ship within 1-2 business days and arrive within 3-7 business days. International shipping times vary by location.",
									},
								},
								{
									"@type": "Question",
									name: "Do you offer resources for beginners?",
									acceptedAnswer: {
										"@type": "Answer",
										text: "Yes, we provide comprehensive guides, tutorials, and support for growers of all experience levels. Check out our blog for helpful resources.",
									},
								},
							],
						},
					],
				}),
			}}
		/>
	);
}

// Add the NewsletterSection component
function NewsletterSection() {
	return (
		<section className="bg-primary text-white py-10 md:py-16">
			<div className="container mx-auto px-4 text-center">
				<h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated</h2>
				<p className="max-w-md mx-auto mb-6">
					Subscribe to our newsletter for growing tips, new product announcements, and exclusive offers.
				</p>
				<form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
					<input
						type="email"
						placeholder="Your email address"
						className="flex-grow px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
						required
					/>
					<button
						type="submit"
						className="bg-white text-primary px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
					>
						Subscribe
					</button>
				</form>
			</div>
		</section>
	);
}
