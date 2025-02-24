import { Suspense } from "react";
import { getProducts, getCollection } from "@/lib/actions/shopify";
import type { Metadata } from "next";
import type { ProductsQueryOptions, ShopifyProduct } from "@/lib/types";
import { ProductsContentClient } from "@/components/products/products-content-client";
import { HomeLoading } from "@/components/loading";
import { CollectionsGrid } from "@/components/collections/collections-grid";
import { Marquee } from "@/components/ui/marquee";
import { DetailsSection } from "@/components/sections/details-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { ProductSlideshow } from "@/components/sections/product-slideshow";
import { HeroSection } from "@/components/sections/hero-section";
import { LatestProducts } from "@/components/sections/latest-products";
import { PromotionalSection } from "@/components/sections/promotional-section";
import { SaleProducts } from "@/components/sections/sale-products";
import { FeaturedCollections } from "@/components/sections/featured-collections";
import { GrowingGuideShowcase } from "@/components/sections/growing-guide-showcase";
import { BestSellersShowcase } from "@/components/sections/best-sellers-showcase";
import { FeaturedBundle } from "@/components/sections/featured-bundle";
import Image from "next/image";
import { Link } from "@/components/ui/link";
import { ShoppingCart, Star, Shield, Truck, Package, ArrowRight, Clock, Sprout, Award, BarChart, Users, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { AdSenseScript } from "@/components/google/adsense-script";
import { AdPlaceholder } from "@/components/ads/ad-placeholder";
import { unstable_cache } from "next/cache";

interface SiteFeature {
	icon: string;
	text: string;
}

interface SiteSettings {
	title: string;
	description: string;
	features: SiteFeature[];
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
			{ icon: "Shield", text: "Premium Quality Guaranteed" },
			{ icon: "Truck", text: "Fast & Free Shipping" },
			{ icon: "Gift", text: "Gift Wrapping Available" },
			{ icon: "Info", text: "Expert Support" },
		],
	};
}

// Update getPageData to include sale products
const getPageData = unstable_cache(
	async () => {
		const [products, siteSettings] = await Promise.all([getProducts(), getLocalSiteSettings()]);

		const optimizedProducts = products ? products.slice(0, 8) : [];
		const topSellers = products ? products.filter((p) => p.tags?.includes("best-seller")).slice(0, 6) : [];

		// Improved sale product detection
		const saleProducts = products
			? products
					.filter((p) => {
						// Check for sale tag
						const hasSaleTag = p.tags?.includes("sale");

						// Check for compare at price
						const hasCompareAtPrice = p.variants.nodes.some((variant) => variant.compareAtPrice && parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount));

						return hasSaleTag || hasCompareAtPrice;
					})
					.slice(0, 8)
			: [];

		// Log for debugging
		console.log(`Found ${saleProducts.length} products on sale`);
		if (saleProducts.length > 0) {
			console.log(
				"Sale products:",
				saleProducts.map((p) => ({
					title: p.title,
					price: p.variants.nodes[0]?.price.amount,
					compareAtPrice: p.variants.nodes[0]?.compareAtPrice?.amount,
				}))
			);
		}

		return {
			products: optimizedProducts,
			topSellers,
			saleProducts,
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
function optimizeProductData(products: ShopifyProduct[]): OptimizedProduct[] {
	return products.map((product) => ({
		...product,
		rating: 5, // Default rating
		reviewsCount: 0, // Default review count
	}));
}

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
	const { products, topSellers, saleProducts, siteSettings } = await getPageData();
	const optimizedProducts = products ? optimizeProductData(products) : [];
	const optimizedTopSellers = topSellers ? optimizeProductData(topSellers) : [];
	const optimizedSaleProducts = saleProducts ? optimizeProductData(saleProducts) : [];

	const featuredProduct = products.find((p) => p.availableForSale && p.tags?.some((tag) => tag.toLowerCase().includes("featured"))) || products.find((p) => p.availableForSale) || products[0];

	const latestProducts = [...products].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 12);

	// Get related products for the growing guide showcase
	const relatedProducts = products.filter((p) => p.tags?.some((tag) => tag.toLowerCase().includes("beginner") || tag.toLowerCase().includes("kit") || tag.toLowerCase().includes("starter"))).slice(0, 4);

	return (
		<>
			<HeroSection product={featuredProduct} />
			<FeaturedCollections />
			<LatestProducts products={latestProducts} />
			{/* <GrowingGuideShowcase relatedProducts={relatedProducts} /> */}
			<BestSellersShowcase products={optimizedTopSellers} />
			<FeaturedBundle />
			<PromotionalSection />
			<SaleProducts products={optimizedSaleProducts} />

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
		</>
	);
}
