"use client";

import React, { useEffect, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { ShopifyProductCard } from "@/components/product-card";

interface OptimizedProduct {
	id: string;
	title: string;
	handle: string;
	description: string;
	price: string;
	compareAtPrice: string | null;
	isOnSale: boolean;
	featuredImage?: {
		url: string;
		altText?: string;
		blurDataURL?: string;
	};
	tags?: string[];
}

export function BestSellers() {
	const [products, setProducts] = useState<OptimizedProduct[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Fetch products from an API endpoint instead of using server components
		fetch("/api/best-sellers")
			.then((response) => response.json())
			.then((data) => {
				setProducts(data.products || []);
				setLoading(false);
			})
			.catch((error) => {
				console.error("Error fetching best sellers:", error);
				setLoading(false);
			});
	}, []);

	return (
		<section className="py-10 md:py-16 bg-gray-50">
			<div className="container mx-auto px-4">
				<SectionHeading
					title="Best Sellers"
					description="Our most popular products, loved by mushroom enthusiasts"
					linkText="View All Products"
					linkHref="/collections/all-products"
				/>

				{loading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="bg-gray-200 animate-pulse h-64 rounded-lg"></div>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
						{products.map((product) => (
							<ShopifyProductCard key={product.id} product={product} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
