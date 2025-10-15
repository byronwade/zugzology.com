import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { ProductCard } from "@/components/features/products/product-card";
import { BestSellersShowcase } from "@/components/sections/best-sellers-showcase";
import { FeaturedCollections } from "@/components/sections/featured-collections";
import { PrefetchLink } from "@/components/ui/prefetch-link";
import { HeroModern } from "@/components/sections/hero-modern";
import { LatestProducts } from "@/components/sections/latest-products";
import { SaleProducts } from "@/components/sections/sale-products";
import { Button } from "@/components/ui/button";
import { getPaginatedProducts, getSiteSettings } from "@/lib/api/shopify/actions";
import {
	getEnhancedFAQSchema,
	getEnhancedLocalBusinessSchema,
	getEnhancedOrganizationSchema,
	getEnhancedStoreSchema,
	getSearchActionSchema,
} from "@/lib/seo/enhanced-jsonld";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
// Removed AI layout optimizer types
import type { ShopifyProduct } from "@/lib/types";
import HomeLoading from "./loading";

type HomePageData = {
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
};

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

	const heroProduct = [...featuredProducts, ...bestSellingProducts, ...newProducts].find(
		(product) => hasPurchasableVariant(product) && hasPrimaryImage(product)
	);
	const saleProducts = featuredProducts
		.filter((product) => {
			const firstVariant = product.variants?.nodes?.[0];
			if (!firstVariant?.compareAtPrice?.amount) {
				return false;
			}
			return (
				Number.parseFloat(firstVariant.compareAtPrice.amount) > Number.parseFloat(firstVariant.price.amount || "0")
			);
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
		if (!product?.id) {
			continue;
		}
		if (seen.has(product.id)) {
			continue;
		}
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

export function generateMetadata(): Metadata {
	const title = "Zugzology - Premium Mushroom Cultivation Supplies | Expert Support & Free Shipping";
	const description =
		"Shop curated mushroom cultivation supplies from Zugzology. ✓ Free Shipping Over $75 ✓ Expert Growing Guides ✓ 30-Day Returns ✓ Trusted by 10,000+ Growers. Shop premium mushroom cultivation supplies today!";

	return generateSEOMetadata({
		title,
		description,
		keywords: [
			"mushroom cultivation",
			"mushroom growing supplies",
			"mushroom growing kits",
			"mushroom substrate",
			"mushroom spawn",
			"mushroom cultivation equipment",
			"mycology supplies",
			"mushroom farming",
			"grow mushrooms at home",
			"mushroom growing bags",
			"sterilized substrate",
			"liquid culture",
			"mushroom spores",
			"oyster mushroom kits",
			"shiitake growing kits",
			"Zugzology",
		],
		url: "/",
		openGraph: {
			type: "website",
			siteName: "Zugzology",
		},
		twitter: {
			card: "summary_large_image",
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
	const featuredWithoutHero = heroProduct
		? featuredProducts.filter((product) => product.id !== heroProduct.id)
		: featuredProducts;
	const bestSellersWithoutHero = heroProduct
		? bestSellingProducts.filter((product) => product.id !== heroProduct.id)
		: bestSellingProducts;

	// Traditional homepage layout
	return (
		<div className="min-h-screen bg-background">
			<div className="space-y-0">
				{/* Modern Minimal Hero */}
				<HeroModern products={featuredProducts.slice(0, 3)} />

				<ProductGridSection
					ctaHref="/collections/all"
					ctaLabel="Shop all products"
					products={featuredWithoutHero}
					subtitle="Hand-selected items customers are loving right now"
					title="Trending Kits & Supplies"
				/>

				{saleProducts.length > 0 && <SaleProducts products={saleProducts} />}

				<ProductGridSection
					ctaHref="/collections/best-sellers"
					ctaLabel="Browse best sellers"
					products={bestSellersWithoutHero}
					subtitle="Top-rated essentials backed by real purchase data"
					title="Customer Favorites"
				/>

				{newProducts.length > 0 && <LatestProducts products={newProducts} />}

				<Suspense fallback={null}>
					<FeaturedCollections />
				</Suspense>

				<Suspense fallback={null}>
					<BestSellersShowcase products={bestSellingProducts} />
				</Suspense>
			</div>

			<StructuredData
				bestSellingProducts={bestSellingProducts}
				featuredProducts={featuredProducts}
				heroProduct={heroProduct}
				saleProducts={saleProducts}
				site={site}
			/>
		</div>
	);
}

type ProductGridSectionProps = {
	title: string;
	subtitle?: string;
	products: ShopifyProduct[];
	ctaHref?: string;
	ctaLabel?: string;
};

function ProductGridSection({ title, subtitle, products, ctaHref, ctaLabel }: ProductGridSectionProps) {
	if (!products?.length) {
		return null;
	}

	return (
		<section className="bg-background">
			<div className="container mx-auto px-4 py-12">
				<div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2 className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl">{title}</h2>
						{subtitle && <p className="mt-2 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>}
					</div>
					{ctaHref && ctaLabel && (
						<Button asChild variant="outline">
							<PrefetchLink href={ctaHref}>{ctaLabel}</PrefetchLink>
						</Button>
					)}
				</div>

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{products.map((product) => {
						const firstVariant = product.variants?.nodes?.[0];
						if (!firstVariant) {
							return null;
						}

						return (
							<div className="group relative" key={product.id}>
								<ProductCard
									product={product}
									quantity={firstVariant.quantityAvailable}
									variantId={firstVariant.id}
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

type StructuredDataProps = {
	site: HomePageData["site"];
	heroProduct?: ShopifyProduct;
	featuredProducts: ShopifyProduct[];
	saleProducts: ShopifyProduct[];
	bestSellingProducts: ShopifyProduct[];
};

function StructuredData({
	site,
	heroProduct,
	featuredProducts,
	saleProducts,
	bestSellingProducts,
}: StructuredDataProps) {
	const siteUrl = site.url || "https://zugzology.com";

	// Get comprehensive schemas
	const organizationSchema = getEnhancedOrganizationSchema();
	const storeSchema = getEnhancedStoreSchema();
	const localBusinessSchema = getEnhancedLocalBusinessSchema();
	const searchSchema = getSearchActionSchema();

	// Common FAQs for home page
	const homeFAQs = [
		{
			question: "What types of mushroom growing supplies do you offer?",
			answer:
				"We offer a complete range of mushroom cultivation supplies including growing kits, sterilized substrates, liquid cultures, spawn, cultivation equipment, and educational resources for both beginners and commercial growers.",
		},
		{
			question: "Do you offer free shipping?",
			answer:
				"Yes! We offer free shipping on all orders over $75 within the United States. Orders are typically processed within 1-2 business days.",
		},
		{
			question: "What's your return policy?",
			answer:
				"We offer a 30-day satisfaction guarantee on all products. If you're not completely satisfied with your purchase, contact our support team for a full refund or replacement.",
		},
		{
			question: "How do I get started with mushroom cultivation?",
			answer:
				"We recommend starting with one of our beginner-friendly growing kits that include everything you need. We also provide free growing guides and expert support to help ensure your success.",
		},
		{
			question: "Do you ship internationally?",
			answer:
				"Currently we ship within the United States. For international orders, please contact our support team for special arrangements.",
		},
	];

	const faqSchema = getEnhancedFAQSchema(homeFAQs);

	const graph: any[] = [organizationSchema, storeSchema, localBusinessSchema, searchSchema, faqSchema];

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
		datePublished: "2024-01-01T00:00:00Z",
		dateModified: "2024-01-01T00:00:00Z",
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
			image: images.map((img) => ({
				"@type": "ImageObject",
				url: img.url,
				width: img.width,
				height: img.height,
			})),
			offers: variant
				? {
						"@type": "Offer",
						price: variant.price.amount,
						priceCurrency: variant.price.currencyCode,
						availability: variant.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
						url: `${siteUrl}/products/${heroProduct.handle}`,
						priceValidUntil: "2025-12-31T00:00:00Z",
						seller: {
							"@type": "Organization",
							name: site.name,
						},
					}
				: undefined,
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
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@graph": graph.filter(Boolean),
					}),
				}}
				type="application/ld+json"
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
									currency: product.priceRange?.minVariantPrice?.currencyCode || "USD",
									index,
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
