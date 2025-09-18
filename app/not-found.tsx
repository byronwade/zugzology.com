"use client";

import { Link } from '@/components/ui/link';
import { useEffect, useState, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/features/products/product-card";
import type { ShopifyProduct } from "@/lib/types";
import Script from "next/script";

interface NotFoundContentProps {
	storeName: string;
	storeUrl: string;
}

interface ExtendedShopifyProduct extends ShopifyProduct {
	selectedVariantId?: string;
}

// Enhanced structured data for 404 page
function getStructuredData(storeName: string, storeUrl: string) {
	const pageStructuredData = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		"name": `Page Not Found - 404 Error | ${storeName}`,
		"description": `The requested page could not be found on ${storeName}. Try searching for what you're looking for or browse our popular products.`,
		"url": `${storeUrl}/404`,
		"publisher": {
			"@type": "Organization",
			"name": storeName,
			"logo": {
				"@type": "ImageObject",
				"url": `${storeUrl}/logo.png`,
			},
		},
		"potentialAction": [
			{
				"@type": "SearchAction",
				"target": {
					"@type": "EntryPoint",
					"urlTemplate": `${storeUrl}/search?q={search_term_string}`
				},
				"query-input": "required name=search_term_string"
			}
		],
		"mainEntity": {
			"@type": "ErrorPage",
			"description": "HTTP 404 - Page Not Found"
		}
	};

	const breadcrumbStructuredData = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": [
			{
				"@type": "ListItem",
				"position": 1,
				"name": "Home",
				"item": storeUrl,
			},
			{
				"@type": "ListItem",
				"position": 2,
				"name": "404 Not Found",
				"item": `${storeUrl}/404`,
			},
		],
	};

	return { pageStructuredData, breadcrumbStructuredData };
}

function NotFoundContent() {
	const [settings, setSettings] = useState({
		storeName: "Zugzology",
		storeUrl: "https://zugzology.com",
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [recommendedProducts, setRecommendedProducts] = useState<ExtendedShopifyProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Track 404 error in analytics
				if (typeof window !== 'undefined' && window.gtag) {
					window.gtag('event', 'page_view', {
						page_type: '404_error',
						page_location: window.location.href,
						page_title: 'Page Not Found'
					});
				}

				// Fetch settings and products in parallel
				const [settingsRes, productsRes] = await Promise.all([
					fetch("/api/settings").catch(() => ({ json: () => null })),
					fetch("/api/products?limit=4").catch(() => ({ json: () => [] })),
				]);

				// Parse the JSON responses
				const settingsData = await settingsRes.json().catch(() => null);
				const productsData = await productsRes.json().catch(() => []);

				// Update settings if we have valid data
				if (settingsData) {
					setSettings({
						storeName: settingsData.name || "Zugzology",
						storeUrl: settingsData.url || "https://zugzology.com",
					});
				}

				// Update products if we have valid data
				if (Array.isArray(productsData)) {
					setRecommendedProducts(productsData);
				}
			} catch (error) {
				console.error("Failed to fetch data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	const { pageStructuredData, breadcrumbStructuredData } = getStructuredData(settings.storeName, settings.storeUrl);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
		}
	};

	const quickLinks = [
		{ href: "/products", label: "All Products" },
		{ href: "/collections/sale", label: "Products on Sale" },
		{ href: "/help", label: "Help Center & Support" },
	];

	return (
		<>
			{/* JSON-LD Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(pageStructuredData),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbStructuredData),
				}}
			/>
			
			{/* Google Analytics for 404 Tracking */}
			<Script id="notfound-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': '404_not_found',
						'page_location': window.location.href,
						'page_title': 'Page Not Found - 404',
						'error_type': 'page_not_found'
					});
				`}
			</Script>
			
			<div className="container mx-auto px-4 py-12 max-w-7xl">
				{/* Breadcrumb Navigation */}
				<nav className="mb-8" aria-label="Breadcrumb">
					<ol className="flex items-center space-x-2 text-sm text-gray-600">
						<li>
							<Link href="/" className="hover:text-gray-900">Home</Link>
						</li>
						<li className="text-gray-400">/</li>
						<li className="text-gray-900 font-medium">404 Not Found</li>
					</ol>
				</nav>
				<div className="text-center mb-12">
					<h1 className="text-8xl font-bold text-primary mb-4">404</h1>
					<h2 className="text-3xl font-semibold mb-4">Oops! Page Not Found</h2>
						<p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>

					{/* Search Section */}
					<div className="max-w-xl mx-auto mb-12">
						<form onSubmit={handleSearch} className="flex gap-2">
							<Input type="search" placeholder="Try searching for something..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
							<Button type="submit">
								<Search className="h-4 w-4 mr-2" />
								Search
							</Button>
						</form>
					</div>

					{/* Quick Links */}
					<div className="mb-12">
						<h3 className="text-xl font-semibold mb-4">Quick Links</h3>
						<div className="flex flex-wrap justify-center gap-4">
							{quickLinks.map((link) => (
								<Link key={link.href} href={link.href} className="px-6 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
									{link.label}
								</Link>
							))}
						</div>
					</div>

					{/* Product Recommendations */}
					{(isLoading || recommendedProducts.length > 0) && (
						<div className="mt-16">
							<h3 className="text-2xl font-semibold mb-8">You Might Be Interested In</h3>
							{isLoading ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
									{[...Array(4)].map((_, i) => (
										<div key={i} className="h-64 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-lg" />
									))}
								</div>
							) : (
								<Suspense fallback={
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
										{[...Array(4)].map((_, i) => (
											<div key={i} className="h-64 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-lg" />
										))}
									</div>
								}>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
										{recommendedProducts.map((product) => (
											<ProductCard key={product.id} product={product} variantId={product.selectedVariantId} />
										))}
									</div>
								</Suspense>
							)}
						</div>
					)}

					<div className="mt-12">
						<Link href="/" className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-medium transition-colors">
							Return to {settings.storeName}
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}

export default function NotFound() {
	return (
		<Suspense fallback={
			<div className="container mx-auto px-4 py-12 max-w-7xl">
				<div className="text-center">
					<h1 className="text-8xl font-bold text-primary mb-4">404</h1>
					<h2 className="text-3xl font-semibold mb-4">Loading...</h2>
				</div>
			</div>
		}>
			<NotFoundContent />
		</Suspense>
	);
}
