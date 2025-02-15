import { Suspense } from "react";
import { getProducts, getCollections } from "@/lib/actions/shopify";
import type { Metadata } from "next";
import type { ProductsQueryOptions } from "@/lib/types";
import { ProductsContentClient } from "@/components/products/products-content-client";
import { HomeLoading } from "@/components/loading";
import { CollectionsGrid } from "@/components/collections/collections-grid";
import { Marquee } from "@/components/ui/marquee";
import { DetailsSection } from "@/components/sections/details-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { ProductSlideshow } from "@/components/sections/product-slideshow";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Shield, Truck, Package, ArrowRight, Clock, Sprout, Award, BarChart, Users, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { AdSenseScript } from "@/components/google/adsense-script";

interface SiteFeature {
	icon: string;
	text: string;
}

interface SiteSettings {
	title: string;
	description: string;
	features: SiteFeature[];
}

// Add this function to fetch site settings from the server
async function getSiteSettings(): Promise<SiteSettings> {
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

// Update getPageData to include collections
async function getPageData() {
	const topSellersOptions: ProductsQueryOptions = {
		first: 6,
		sortKey: "BEST_SELLING",
	};

	const [products, collections, siteSettings, topSellers] = await Promise.all([getProducts(), getCollections(), getSiteSettings(), getProducts(topSellersOptions)]);

	return {
		products,
		collections,
		siteSettings,
		topSellers,
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
		descriptionHtml: product.descriptionHtml || product.description || "",
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

const shopFeatures = [
	{
		icon: Truck,
		title: "Fast & Free Shipping",
		description: "Free shipping on orders over $50. Quick delivery to your doorstep.",
	},
	{
		icon: Package,
		title: "Discreet Packaging",
		description: "Your privacy matters. All orders shipped in plain, unmarked boxes.",
	},
	{
		icon: Sprout,
		title: "Expert Growing Advice",
		description: "Access to our knowledge base and expert support for successful grows.",
	},
	{
		icon: Award,
		title: "Quality Guaranteed",
		description: "Premium products tested for optimal growth and contamination resistance.",
	},
];

const growingGuides = [
	{
		id: 1,
		title: "Beginner's Guide to Mushroom Growing",
		description: "Learn the basics of mushroom cultivation with our comprehensive guide.",
		image: "/placeholder.svg",
		difficulty: "Beginner",
	},
	{
		id: 2,
		title: "Advanced Substrate Preparation",
		description: "Master the art of preparing the perfect growing medium.",
		image: "/placeholder.svg",
		difficulty: "Advanced",
	},
	{
		id: 3,
		title: "Troubleshooting Common Issues",
		description: "Solutions to common problems in mushroom cultivation.",
		image: "/placeholder.svg",
		difficulty: "Intermediate",
	},
];

const sellerBenefits = [
	{
		title: "Reach Mushroom Enthusiasts",
		description: "Connect with a targeted audience of mushroom growers",
		icon: Users,
	},
	{
		title: "Easy Selling Process",
		description: "List your products and manage inventory with ease",
		icon: ShoppingBag,
	},
	{
		title: "Grow Your Business",
		description: "Expand your reach and increase your sales",
		icon: BarChart,
	},
];

export default async function Home() {
	const { products, collections, siteSettings, topSellers } = await getPageData();
	const optimizedProducts = products ? optimizeProductData(products.slice(0, 8)) : [];
	const optimizedTopSellers = topSellers ? optimizeProductData(topSellers) : [];

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

	// Get featured product (first product with inventory)
	const featuredProduct = products.find((p) => p.availableForSale) || products[0];

	// Get products on sale
	const dailyDeals = products
		.filter((p) => {
			const variant = p.variants.edges[0]?.node;
			return variant?.compareAtPrice && parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount);
		})
		.slice(0, 3)
		.map((p) => {
			const variant = p.variants.edges[0]?.node;
			const price = parseFloat(variant?.price.amount || "0");
			const comparePrice = parseFloat(variant?.compareAtPrice?.amount || "0");
			return {
				id: p.id,
				name: p.title,
				price: price,
				originalPrice: comparePrice,
				timeLeft: "Limited Time", // You can add actual countdown if needed
				image: p.images.edges[0]?.node.url || "/placeholder.svg",
				discount: `${Math.round(((comparePrice - price) / comparePrice) * 100)}% OFF`,
			};
		});

	// Get featured products (products with tags containing 'featured')
	const featuredProducts = products
		.filter((p) => p.tags.some((tag) => tag.toLowerCase().includes("featured")))
		.slice(0, 4)
		.map((p) => {
			const variant = p.variants.edges[0]?.node;
			return {
				id: p.id,
				handle: p.handle,
				name: p.title,
				price: parseFloat(variant?.price.amount || "0"),
				rating: p.rating || 4.8,
				reviews: p.reviewsCount || 156,
				image: p.images.edges[0]?.node.url || "/placeholder.svg",
				badge: p.tags.find((tag) => ["Best Seller", "Popular", "New"].includes(tag)),
			};
		});

	// Get new arrivals (sort by creation date)
	const newArrivals = [...products]
		.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
		.slice(0, 4)
		.map((p) => {
			const variant = p.variants.edges[0]?.node;
			return {
				id: p.id,
				handle: p.handle,
				name: p.title,
				price: parseFloat(variant?.price.amount || "0"),
				rating: p.rating || 4.5,
				reviews: p.reviewsCount || 12,
				image: p.images.edges[0]?.node.url || "/placeholder.svg",
			};
		});

	// Get best sellers (products with highest sales or featured tag)
	const bestSellers = products
		.filter((p) => p.tags.some((tag) => tag.toLowerCase().includes("best seller")))
		.slice(0, 4)
		.map((p) => {
			const variant = p.variants.edges[0]?.node;
			return {
				id: p.id,
				handle: p.handle,
				name: p.title,
				price: parseFloat(variant?.price.amount || "0"),
				rating: p.rating || 4.9,
				reviews: p.reviewsCount || 520,
				sold: 1500,
				image: p.images.edges[0]?.node.url || "/placeholder.svg",
			};
		});

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

			<main className="min-h-screen bg-zinc-50">
				{/* Hero Section with Featured Product */}
				{featuredProduct && (
					<section className="w-full py-8 bg-white border-b">
						<div className="container mx-auto max-w-[1440px] px-4 md:px-6">
							<div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
								<div className="flex flex-col justify-center space-y-4">
									<Badge className="w-fit" variant="secondary">
										Featured Product
									</Badge>
									<div className="space-y-2">
										<h1 className="text-2xl font-bold tracking-tight sm:text-3xl xl:text-4xl">{featuredProduct.title}</h1>
										<div className="flex items-center space-x-2">
											<div className="flex">
												{[1, 2, 3, 4, 5].map((i) => (
													<Star key={i} className="w-4 h-4 fill-primary text-primary" />
												))}
											</div>
											<span className="text-sm text-zinc-500">(4.8 out of 5)</span>
										</div>
										<p className="text-xl font-bold">{formatPrice(parseFloat(featuredProduct.variants.edges[0]?.node.price.amount || "0"), featuredProduct.variants.edges[0]?.node.price.currencyCode)}</p>
										<div className="mt-4 text-zinc-600 text-sm leading-relaxed line-clamp-4">{featuredProduct.description}</div>
										{featuredProduct.description.length > 300 && (
											<Link href={`/products/${featuredProduct.handle}`} className="text-sm text-primary hover:underline">
												Read more
											</Link>
										)}
									</div>
									<div className="inline-flex items-center gap-4">
										<Button size="lg" asChild>
											<Link href={`/checkout?variantId=${featuredProduct.variants.edges[0]?.node.id}`}>
												<ArrowRight className="w-4 h-4 mr-2" />
												Buy Now
											</Link>
										</Button>
										<AddToCartButton variantId={featuredProduct.variants.edges[0]?.node.id} availableForSale={featuredProduct.availableForSale} quantity={1} className="bg-transparent hover:bg-transparent border-2 border-primary text-primary hover:bg-primary/10" />
									</div>
									<div className="grid grid-cols-3 gap-4 pt-4">
										<div className="flex items-center space-x-2">
											<Truck className="w-4 h-4 text-primary" />
											<span className="text-sm">Free Shipping</span>
										</div>
										<div className="flex items-center space-x-2">
											<Shield className="w-4 h-4 text-primary" />
											<span className="text-sm">Guaranteed</span>
										</div>
										<div className="flex items-center space-x-2">
											<Package className="w-4 h-4 text-primary" />
											<span className="text-sm">Discreet Box</span>
										</div>
									</div>
								</div>
								<div className="relative aspect-square">
									<Image src={featuredProduct.images.edges[0]?.node.url || "/placeholder.svg"} alt={featuredProduct.title} fill className="object-cover rounded-lg" priority />
								</div>
							</div>
						</div>
					</section>
				)}

				{/* Google AdSense Ad Unit */}
				<section className="w-full py-4 bg-white border-b">
					<div className="container mx-auto max-w-[1440px] px-4 md:px-6">
						<div className="flex justify-center">
							<div className="w-full h-[250px] max-w-[970px] bg-zinc-50" style={{ minHeight: "250px" }}>
								<ins className="adsbygoogle" style={{ display: "block" }} data-ad-client="ca-pub-5329391577972523" data-ad-slot="YOUR_AD_SLOT_ID" data-ad-format="auto" data-full-width-responsive="true" />
								<AdSenseScript />
							</div>
						</div>
					</div>
				</section>

				{/* Daily Deals Section */}
				{dailyDeals.length > 0 && (
					<section className="w-full py-8 bg-white border-b">
						<div className="container mx-auto max-w-[1440px] px-4 md:px-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold tracking-tight">Today's Deals</h2>
								<Link href="/products" className="text-primary hover:underline flex items-center">
									View all deals
									<ArrowRight className="w-4 h-4 ml-1" />
								</Link>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{dailyDeals.map((deal) => (
									<div key={deal.id} className="bg-white rounded-lg shadow-sm border p-4 relative">
										<div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">{deal.discount}</div>
										<div className="aspect-square relative mb-4">
											<Image src={deal.image} alt={deal.name} fill className="object-cover rounded-md" />
										</div>
										<h3 className="font-semibold text-lg mb-2">{deal.name}</h3>
										<div className="flex items-center justify-between mb-4">
											<div className="space-y-1">
												<span className="font-bold text-xl">{formatPrice(deal.price)}</span>
												<span className="text-sm text-zinc-500 line-through block">{formatPrice(deal.originalPrice)}</span>
											</div>
											<div className="flex items-center text-sm text-zinc-500">
												<Clock className="w-4 h-4 mr-1" />
												{deal.timeLeft}
											</div>
										</div>
										<Button className="w-full">
											<ShoppingCart className="w-4 h-4 mr-2" />
											Add to Cart
										</Button>
									</div>
								))}
							</div>
						</div>
					</section>
				)}

				{/* Shop Features Section */}
				<section className="w-full py-8 bg-zinc-50 border-b">
					<div className="container mx-auto max-w-[1440px] px-4 md:px-6">
						<h2 className="text-2xl font-bold tracking-tight mb-6">Why Shop With Us</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{shopFeatures.map((feature, index) => (
								<div key={index} className="bg-white rounded-lg shadow-sm border p-6 flex flex-col items-center text-center">
									<feature.icon className="w-12 h-12 text-primary mb-4" />
									<h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
									<p className="text-zinc-500 text-sm">{feature.description}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Featured Products Grid */}
				{featuredProducts.length > 0 && (
					<section className="w-full py-8 bg-white border-b">
						<div className="container mx-auto max-w-[1440px] px-4 md:px-6">
							<h2 className="text-2xl font-bold tracking-tight mb-6">Featured Products</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
								{featuredProducts.map((product) => (
									<Link key={product.id} href={`/products/${product.handle}`} className="block">
										<div className="bg-white rounded-lg shadow-sm border p-4 relative hover:shadow-md transition-shadow">
											{product.badge && (
												<Badge variant="secondary" className="absolute top-4 right-4">
													{product.badge}
												</Badge>
											)}
											<div className="aspect-square relative mb-4">
												<Image src={product.image} alt={product.name} fill className="object-cover rounded-md" />
											</div>
											<h3 className="font-semibold mb-2">{product.name}</h3>
											<div className="flex items-center space-x-1 mb-2">
												<div className="flex">
													{[1, 2, 3, 4, 5].map((i) => (
														<Star key={i} className={`w-4 h-4 ${i <= Math.floor(product.rating) ? "fill-primary text-primary" : "fill-zinc-200 text-zinc-200"}`} />
													))}
												</div>
												<span className="text-sm text-zinc-500">({product.reviews})</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="font-bold text-lg">{formatPrice(product.price)}</span>
												<Button size="sm" variant="outline">
													<ShoppingCart className="w-4 h-4" />
												</Button>
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>
					</section>
				)}

				{/* New Arrivals Carousel */}
				{newArrivals.length > 0 && (
					<section className="w-full py-8 bg-zinc-50 border-b">
						<div className="container mx-auto max-w-[1440px] px-4 md:px-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold tracking-tight">New Arrivals</h2>
								<Link href="/products" className="text-primary hover:underline flex items-center">
									See all new products
									<ArrowRight className="w-4 h-4 ml-1" />
								</Link>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
								{newArrivals.map((product) => (
									<Link key={product.id} href={`/products/${product.handle}`} className="block group">
										<div className="aspect-square relative overflow-hidden rounded-lg mb-3">
											<Image src={product.image} alt={product.name} fill className="object-cover w-full h-full transition-transform group-hover:scale-105" />
											<div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
												<Button variant="secondary" size="icon">
													<ShoppingCart className="h-4 w-4" />
												</Button>
											</div>
										</div>
										<h3 className="font-semibold mb-1">{product.name}</h3>
										<div className="flex items-center justify-between">
											<span className="font-bold">{formatPrice(product.price)}</span>
											<div className="flex items-center">
												<Star className="w-4 h-4 fill-current text-yellow-500" />
												<span className="ml-1 text-sm text-zinc-500">
													{product.rating} ({product.reviews})
												</span>
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>
					</section>
				)}

				{/* Best Sellers Grid */}
				{bestSellers.length > 0 && (
					<section className="w-full py-8 bg-white border-b">
						<div className="container mx-auto max-w-[1440px] px-4 md:px-6">
							<h2 className="text-2xl font-bold tracking-tight mb-6">Best Sellers</h2>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
								{bestSellers.map((product) => (
									<Link key={product.id} href={`/products/${product.handle}`} className="block group">
										<div className="aspect-square relative overflow-hidden rounded-lg mb-3">
											<Image src={product.image} alt={product.name} fill className="object-cover w-full h-full transition-transform group-hover:scale-105" />
											<div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
												<Button variant="secondary" size="icon">
													<ShoppingCart className="h-4 w-4" />
												</Button>
											</div>
										</div>
										<h3 className="font-semibold mb-1">{product.name}</h3>
										<div className="flex items-center justify-between mb-1">
											<span className="font-bold">{formatPrice(product.price)}</span>
											<div className="flex items-center">
												<Star className="w-4 h-4 fill-current text-yellow-500" />
												<span className="ml-1 text-sm text-zinc-500">
													{product.rating} ({product.reviews})
												</span>
											</div>
										</div>
										<p className="text-sm text-zinc-500">{product.sold} sold</p>
									</Link>
								))}
							</div>
						</div>
					</section>
				)}

				{/* Growing Guides */}
				<section className="w-full py-8 bg-zinc-50 border-b">
					<div className="container mx-auto max-w-[1440px] px-4 md:px-6">
						<h2 className="text-2xl font-bold tracking-tight mb-6">Growing Guides</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{growingGuides.map((guide) => (
								<div key={guide.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
									<div className="aspect-video relative">
										<Image src={guide.image} alt={guide.title} fill className="object-cover" />
									</div>
									<div className="p-4">
										<div className="text-sm text-primary mb-2">{guide.difficulty}</div>
										<h3 className="font-semibold text-lg mb-2">{guide.title}</h3>
										<p className="text-zinc-500 text-sm mb-4">{guide.description}</p>
										<Button variant="outline" className="w-full">
											Read Guide
											<ArrowRight className="w-4 h-4 ml-2" />
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Sell With Us Section */}
				<section className="w-full py-12 bg-white border-t">
					<div className="container mx-auto max-w-[1440px] px-4 md:px-6">
						<div className="bg-white rounded-lg shadow-sm border p-6 max-w-5xl mx-auto">
							<h2 className="text-2xl font-bold tracking-tight mb-4">Sell Your Products With Us</h2>
							<p className="text-zinc-500 mb-6">Are you a supplier of quality mushroom growing supplies? Partner with us to reach more customers and grow your business.</p>
							<div className="grid gap-6 md:grid-cols-3 mb-6">
								{sellerBenefits.map((benefit) => (
									<div key={benefit.title} className="flex flex-col items-center text-center">
										<benefit.icon className="w-10 h-10 text-primary mb-2" />
										<h3 className="font-semibold mb-1">{benefit.title}</h3>
										<p className="text-sm text-zinc-500">{benefit.description}</p>
									</div>
								))}
							</div>
							<div className="flex justify-center">
								<Button size="lg" className="px-8">
									Apply to Sell
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* Newsletter Section */}
				<section className="w-full py-12 bg-primary text-primary-foreground">
					<div className="container mx-auto max-w-[1440px] px-4 md:px-6">
						<div className="flex flex-col items-center text-center space-y-4">
							<h2 className="text-2xl font-bold tracking-tight">Stay Updated</h2>
							<p className="text-lg">Get exclusive deals and growing tips straight to your inbox.</p>
							<form className="flex w-full max-w-sm space-x-2">
								<Input type="email" placeholder="Enter your email" className="bg-primary-foreground text-primary" />
								<Button type="submit" variant="secondary">
									Subscribe
								</Button>
							</form>
						</div>
					</div>
				</section>
			</main>
		</>
	);
}
