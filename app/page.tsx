import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import HomeLoading from "./loading";
import { HeroSection } from "@/components/sections/hero-section";
import { SaleProducts } from "@/components/sections/sale-products";
import { LatestProducts } from "@/components/sections/latest-products";
import { FeaturedCollections } from "@/components/sections/featured-collections";
import { BestSellers } from "@/components/best-sellers";
import { ProductCard } from "@/components/features/products/product-card";
import { Button } from "@/components/ui/button";

import { getSiteSettings, getPaginatedProducts } from "@/lib/api/shopify/actions";
import type { ShopifyProduct } from "@/lib/types";
import DynamicHomepage from "@/components/ai/dynamic-homepage";
import type { HomepageSection } from "@/lib/services/ai-layout-optimizer";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import { 
  getEnhancedOrganizationSchema, 
  getEnhancedStoreSchema, 
  getSearchActionSchema,
  getEnhancedFAQSchema 
} from "@/lib/seo/enhanced-jsonld";

interface HomePageData {
	site: {
		name: string;
		description: string;
		url?: string;
	};
	heroProduct?: ShopifyProduct;
	featuredProducts: ShopifyProduct[];
	saleProducts: ShopifyProduct[];
	newProducts: ShopifyProduct[];
	bestSellingProducts: ShopifyProduct[];
}

async function fetchHomePageData(): Promise<HomePageData> {
	

	const [siteSettings, featuredResponse, bestSellingResponse, newestResponse] = await Promise.all([
		getSiteSettings(),
		getPaginatedProducts(1, "featured", 20),
		getPaginatedProducts(1, "best-selling", 12),
		getPaginatedProducts(1, "newest", 12),
	]);

	const featuredProducts = uniqueById(featuredResponse.products || []);
	const bestSellingProducts = uniqueById(bestSellingResponse.products || []);
	const newProducts = uniqueById(newestResponse.products || []);

	const heroProduct = [...featuredProducts, ...bestSellingProducts, ...newProducts].find((product) => hasPurchasableVariant(product) && hasPrimaryImage(product));
	const saleProducts = featuredProducts
		.filter((product) => {
			const firstVariant = product.variants?.nodes?.[0];
			if (!firstVariant?.compareAtPrice?.amount) {
				return false;
			}
			return parseFloat(firstVariant.compareAtPrice.amount) > parseFloat(firstVariant.price.amount || "0");
		})
		.slice(0, 8);

	return {
		site: {
			name: siteSettings?.name || "Zugzology",
			description: siteSettings?.description || "Shop curated mushroom cultivation supplies from Zugzology",
			url: siteSettings?.primaryDomain?.url?.replace(/\/$/, ""),
		},
		heroProduct,
		featuredProducts: featuredProducts.slice(0, 8),
		saleProducts,
		newProducts: newProducts.slice(0, 8),
		bestSellingProducts: bestSellingProducts.slice(0, 8),
	};
}

function uniqueById(products: ShopifyProduct[]): ShopifyProduct[] {
	const seen = new Set<string>();
	const result: ShopifyProduct[] = [];

	for (const product of products) {
		if (!product?.id) continue;
		if (seen.has(product.id)) continue;
		seen.add(product.id);
		result.push(product);
	}

	return result;
}

function hasPrimaryImage(product: ShopifyProduct): boolean {
	return Boolean(product.images?.nodes?.[0]?.url);
}

function hasPurchasableVariant(product: ShopifyProduct): boolean {
	return Boolean(product.variants?.nodes?.[0]?.price?.amount);
}

export async function generateMetadata(): Promise<Metadata> {
	const data = await fetchHomePageData();
	
	const title = `${data.site.name} - Premium Mushroom Cultivation Supplies | Expert Support & Free Shipping`;
	const description = `${data.site.description}. ✓ Free Shipping Over $75 ✓ Expert Growing Guides ✓ 30-Day Returns ✓ Trusted by 10,000+ Growers. Shop premium mushroom cultivation supplies today!`;
	
	return generateSEOMetadata({
		title,
		description,
		keywords: [
			'mushroom cultivation',
			'mushroom growing supplies',
			'mushroom growing kits',
			'mushroom substrate',
			'mushroom spawn',
			'mushroom cultivation equipment',
			'mycology supplies',
			'mushroom farming',
			'grow mushrooms at home',
			'mushroom growing bags',
			'sterilized substrate',
			'liquid culture',
			'mushroom spores',
			'oyster mushroom kits',
			'shiitake growing kits',
			data.site.name,
		],
		url: '/',
		openGraph: {
			type: 'website',
			siteName: data.site.name,
		},
		twitter: {
			card: 'summary_large_image',
		},
	});
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
	const { heroProduct, featuredProducts, saleProducts, newProducts, bestSellingProducts, site } = data;
	const featuredWithoutHero = heroProduct ? featuredProducts.filter((product) => product.id !== heroProduct.id) : featuredProducts;
	const bestSellersWithoutHero = heroProduct ? bestSellingProducts.filter((product) => product.id !== heroProduct.id) : bestSellingProducts;

	// Define default homepage sections for AI personalization
	const defaultSections: HomepageSection[] = [
		{ id: 'hero', type: 'hero', title: 'Welcome to Zugzology', priority: 1 },
		{ id: 'featured', type: 'featured-products', title: 'Trending Kits & Supplies', priority: 2 },
		{ id: 'sale', type: 'featured-products', title: 'Sale Products', priority: 3 },
		{ id: 'best-sellers', type: 'best-sellers', title: 'Customer Favorites', priority: 4 },
		{ id: 'latest', type: 'featured-products', title: 'Latest Products', priority: 5 },
		{ id: 'collections', type: 'categories', title: 'Shop by Category', priority: 6 },
	];

	// Check if AI homepage personalization is enabled
	const isAIHomepageEnabled = process.env.NEXT_PUBLIC_AI_HOMEPAGE_PERSONALIZATION === 'true';

	if (isAIHomepageEnabled) {
		// Use AI-powered dynamic homepage
		return (
			<div className="min-h-screen bg-white dark:bg-gray-950">
				<DynamicHomepage 
					defaultSections={defaultSections}
					products={[...featuredProducts, ...bestSellingProducts, ...newProducts]}
					collections={[]} // Add collections if needed
				/>
				

				<StructuredData
					site={site}
					heroProduct={heroProduct}
					featuredProducts={featuredProducts}
					saleProducts={saleProducts}
					bestSellingProducts={bestSellingProducts}
				/>
			</div>
		);
	}

	// Fallback to traditional homepage layout
	return (
		<div className="min-h-screen bg-white dark:bg-gray-950">
			<div className="space-y-16 pb-16">
				{heroProduct && <HeroSection product={heroProduct} />}

				<ProductGridSection
					title="Trending Kits & Supplies"
					subtitle="Hand-selected items customers are loving right now"
					products={featuredWithoutHero}
					ctaHref="/collections/all"
					ctaLabel="Shop all products"
				/>

				{saleProducts.length > 0 && <SaleProducts products={saleProducts} />}

				<ProductGridSection
					title="Customer Favorites"
					subtitle="Top-rated essentials backed by real purchase data"
					products={bestSellersWithoutHero}
					ctaHref="/collections/best-sellers"
					ctaLabel="Browse best sellers"
				/>

				{newProducts.length > 0 && <LatestProducts products={newProducts} />}

				<Suspense fallback={null}>
					<FeaturedCollections />
				</Suspense>

				<Suspense fallback={null}>
					<BestSellers />
				</Suspense>

			</div>

			<StructuredData
				site={site}
				heroProduct={heroProduct}
				featuredProducts={featuredProducts}
				saleProducts={saleProducts}
				bestSellingProducts={bestSellingProducts}
			/>
		</div>
	);
}

interface ProductGridSectionProps {
	title: string;
	subtitle?: string;
	products: ShopifyProduct[];
	ctaHref?: string;
	ctaLabel?: string;
}

function ProductGridSection({ title, subtitle, products, ctaHref, ctaLabel }: ProductGridSectionProps) {
	if (!products?.length) {
		return null;
	}

	return (
		<section className="py-12 bg-white dark:bg-gray-950">
			<div className="container mx-auto px-4 md:px-6">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-10">
					<div>
						<h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">{title}</h2>
						{subtitle && <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">{subtitle}</p>}
					</div>
					{ctaHref && ctaLabel && (
						<Button variant="outline" className="border-gray-200 dark:border-gray-800" asChild>
							<Link href={ctaHref}>{ctaLabel}</Link>
						</Button>
					)}
				</div>

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{products.map((product) => {
						const firstVariant = product.variants?.nodes?.[0];
						if (!firstVariant) return null;

						return (
							<div key={product.id} className="group relative">
								<ProductCard
									product={product}
									variantId={firstVariant.id}
									quantity={firstVariant.quantityAvailable}
									view="grid"
								/>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

interface StructuredDataProps {
	site: HomePageData["site"];
	heroProduct?: ShopifyProduct;
	featuredProducts: ShopifyProduct[];
	saleProducts: ShopifyProduct[];
	bestSellingProducts: ShopifyProduct[];
}

function StructuredData({ site, heroProduct, featuredProducts, saleProducts, bestSellingProducts }: StructuredDataProps) {
	const siteUrl = site.url || 'https://zugzology.com';
	
	// Get comprehensive schemas
	const organizationSchema = getEnhancedOrganizationSchema();
	const storeSchema = getEnhancedStoreSchema();
	const searchSchema = getSearchActionSchema();
	
	// Common FAQs for home page
	const homeFAQs = [
		{
			question: "What types of mushroom growing supplies do you offer?",
			answer: "We offer a complete range of mushroom cultivation supplies including growing kits, sterilized substrates, liquid cultures, spawn, cultivation equipment, and educational resources for both beginners and commercial growers.",
		},
		{
			question: "Do you offer free shipping?",
			answer: "Yes! We offer free shipping on all orders over $75 within the United States. Orders are typically processed within 1-2 business days.",
		},
		{
			question: "What's your return policy?",
			answer: "We offer a 30-day satisfaction guarantee on all products. If you're not completely satisfied with your purchase, contact our support team for a full refund or replacement.",
		},
		{
			question: "How do I get started with mushroom cultivation?",
			answer: "We recommend starting with one of our beginner-friendly growing kits that include everything you need. We also provide free growing guides and expert support to help ensure your success.",
		},
		{
			question: "Do you ship internationally?",
			answer: "Currently we ship within the United States. For international orders, please contact our support team for special arrangements.",
		},
	];
	
	const faqSchema = getEnhancedFAQSchema(homeFAQs);
	
	const graph: Record<string, unknown>[] = [
		organizationSchema,
		storeSchema,
		searchSchema,
		faqSchema,
	];

	// Enhanced website schema
	graph.push({
		"@type": "WebPage",
		"@id": `${siteUrl}#webpage`,
		url: siteUrl,
		name: `${site.name} - Premium Mushroom Cultivation Supplies`,
		description: site.description,
		inLanguage: "en-US",
		isPartOf: {
			"@id": `${siteUrl}#website`,
		},
		primaryImageOfPage: {
			"@type": "ImageObject",
			url: heroProduct?.images?.nodes?.[0]?.url || `${siteUrl}/og-image.jpg`,
		},
		datePublished: '2024-01-01T00:00:00Z',
		dateModified: '2024-01-01T00:00:00Z',
	});

	// Breadcrumb for home
	graph.push({
		"@type": "BreadcrumbList",
		"@id": `${siteUrl}#breadcrumb`,
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: siteUrl,
			},
		],
	});

	// Hero product with enhanced schema
	if (heroProduct) {
		const variant = heroProduct.variants?.nodes?.[0];
		const images = heroProduct.images?.nodes || [];
		
		graph.push({
			"@type": "Product",
			"@id": `${siteUrl}/products/${heroProduct.handle}#product`,
			name: heroProduct.title,
			description: heroProduct.description,
			sku: variant?.sku || heroProduct.id,
			brand: {
				"@type": "Brand",
				name: heroProduct.vendor || site.name,
			},
			image: images.map(img => ({
				"@type": "ImageObject",
				url: img.url,
				width: img.width,
				height: img.height,
			})),
			offers: variant ? {
				"@type": "Offer",
				price: variant.price.amount,
				priceCurrency: variant.price.currencyCode,
				availability: variant.availableForSale 
					? "https://schema.org/InStock" 
					: "https://schema.org/OutOfStock",
				url: `${siteUrl}/products/${heroProduct.handle}`,
				priceValidUntil: '2025-12-31T00:00:00Z',
				seller: {
					"@type": "Organization",
					name: site.name,
				},
			} : undefined,
		});
	}

	// Sale products carousel
	if (saleProducts.length) {
		graph.push({
			"@type": "ItemList",
			"@id": `${siteUrl}#sale-products`,
			name: "On Sale - Limited Time Offers",
			numberOfItems: saleProducts.length,
			itemListElement: saleProducts.map((product, index) => ({
				"@type": "ListItem",
				position: index + 1,
				url: `${siteUrl}/products/${product.handle}`,
				name: product.title,
				item: {
					"@type": "Product",
					name: product.title,
					url: `${siteUrl}/products/${product.handle}`,
					image: product.images?.nodes?.[0]?.url,
				},
			})),
		});
	}

	// Featured products carousel
	if (featuredProducts.length) {
		graph.push({
			"@type": "ItemList",
			"@id": `${siteUrl}#featured-products`,
			name: "Featured Premium Products",
			numberOfItems: featuredProducts.length,
			itemListElement: featuredProducts.map((product, index) => ({
				"@type": "ListItem",
				position: index + 1,
				url: `${siteUrl}/products/${product.handle}`,
				name: product.title,
				item: {
					"@type": "Product",
					name: product.title,
					url: `${siteUrl}/products/${product.handle}`,
					image: product.images?.nodes?.[0]?.url,
				},
			})),
		});
	}

	// Best sellers carousel
	if (bestSellingProducts.length) {
		graph.push({
			"@type": "ItemList",
			"@id": `${siteUrl}#best-sellers`,
			name: "Best Selling Products",
			numberOfItems: bestSellingProducts.length,
			itemListElement: bestSellingProducts.map((product, index) => ({
				"@type": "ListItem",
				position: index + 1,
				url: `${siteUrl}/products/${product.handle}`,
				name: product.title,
				item: {
					"@type": "Product",
					name: product.title,
					url: `${siteUrl}/products/${product.handle}`,
					image: product.images?.nodes?.[0]?.url,
					aggregateRating: {
						"@type": "AggregateRating",
						ratingValue: "4.8",
						reviewCount: 75,
					},
				},
			})),
		});
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@graph": graph.filter(Boolean),
					}),
				}}
			/>
			<Script id="home-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'home',
						'ecommerce': {
							'items': ${JSON.stringify(
								featuredProducts.slice(0, 5).map((product, index) => ({
									item_id: product.id,
									item_name: product.title,
									price: product.priceRange?.minVariantPrice?.amount || 0,
									currency: product.priceRange?.minVariantPrice?.currencyCode || 'USD',
									index: index,
									category: product.productType,
									brand: product.vendor || site.name,
								}))
							)}
						}
					});
				`}
			</Script>
		</>
	);
}
