"use client";

import { Link } from '@/components/ui/link';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/features/products/product-card";
import type { ShopifyProduct } from "@/lib/types";
import Script from "next/script";

export default function ProductNotFound() {
	const [searchQuery, setSearchQuery] = useState("");
	const [recommendedProducts, setRecommendedProducts] = useState<ShopifyProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Track product 404 in analytics
		if (typeof window !== 'undefined' && window.gtag) {
			const productHandle = window.location.pathname.split('/').pop();
			window.gtag('event', 'page_view', {
				page_type: 'product_404',
				page_location: window.location.href,
				product_handle: productHandle,
				error_type: 'product_not_found'
			});
		}

		// Fetch recommended products
		const fetchProducts = async () => {
			try {
				const response = await fetch("/api/products?limit=4");
				const products = await response.json();
				if (Array.isArray(products)) {
					setRecommendedProducts(products);
				}
			} catch (error) {
				console.error("Failed to fetch recommended products:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProducts();
	}, []);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
		}
	};

	// Generate structured data for product 404
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		"name": "Product Not Found - Zugzology",
		"description": "The requested product could not be found. Browse our available mushroom cultivation supplies or search for something specific.",
		"url": typeof window !== 'undefined' ? window.location.href : '',
		"mainEntity": {
			"@type": "ErrorPage",
			"description": "HTTP 404 - Product Not Found"
		},
		"breadcrumb": {
			"@type": "BreadcrumbList",
			"itemListElement": [
				{
					"@type": "ListItem",
					"position": 1,
					"name": "Home",
					"item": typeof window !== 'undefined' ? window.location.origin : ''
				},
				{
					"@type": "ListItem",
					"position": 2,
					"name": "Products",
					"item": typeof window !== 'undefined' ? `${window.location.origin}/products` : ''
				},
				{
					"@type": "ListItem",
					"position": 3,
					"name": "Product Not Found",
					"item": typeof window !== 'undefined' ? window.location.href : ''
				}
			]
		}
	};

	return (
		<>
			{/* JSON-LD Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(structuredData),
				}}
			/>
			
			{/* Google Analytics for Product 404 */}
			<Script id="product-notfound-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'product_not_found',
						'page_location': window.location.href,
						'error_type': 'product_404'
					});
				`}
			</Script>
			
			<div className="container mx-auto px-4 py-16">
				{/* Breadcrumb Navigation */}
				<nav className="mb-8" aria-label="Breadcrumb">
					<ol className="flex items-center space-x-2 text-sm text-gray-600">
						<li>
							<Link href="/" className="hover:text-gray-900">Home</Link>
						</li>
						<li className="text-gray-400">/</li>
						<li>
							<Link href="/products" className="hover:text-gray-900">Products</Link>
						</li>
						<li className="text-gray-400">/</li>
						<li className="text-gray-900 font-medium">Product Not Found</li>
					</ol>
				</nav>

				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold mb-4 text-red-600">Product Not Found</h1>
					<h2 className="text-xl text-neutral-600 mb-8">Sorry, we couldn&apos;t find the product you&apos;re looking for.</h2>
					
					{/* Search Section */}
					<div className="max-w-xl mx-auto mb-8">
						<form onSubmit={handleSearch} className="flex gap-2">
							<Input 
								type="search" 
								placeholder="Search for products..." 
								value={searchQuery} 
								onChange={(e) => setSearchQuery(e.target.value)} 
								className="flex-1" 
							/>
							<Button type="submit">
								<Search className="h-4 w-4 mr-2" />
								Search
							</Button>
						</form>
					</div>

					{/* Quick Actions */}
					<div className="flex flex-wrap justify-center gap-4 mb-12">
						<Button asChild variant="default">
							<Link href="/products">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Browse All Products
							</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/collections">
								View Collections
							</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/help">
								Contact Support
							</Link>
						</Button>
					</div>
				</div>

				{/* Recommended Products */}
				{(isLoading || recommendedProducts.length > 0) && (
					<div className="mt-16">
						<h3 className="text-2xl font-semibold mb-8 text-center">You Might Like These Products</h3>
						{isLoading ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
								{[...Array(4)].map((_, i) => (
									<div key={i} className="h-64 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-lg" />
								))}
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
								{recommendedProducts.map((product) => (
									<ProductCard key={product.id} product={product} />
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</>
	);
}
