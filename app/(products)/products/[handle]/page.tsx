import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/actions/shopify";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
	const product = await getProduct(params.handle);

	if (!product) {
		return {
			title: "Product Not Found",
			description: "The requested product could not be found",
			robots: {
				index: false,
			},
		};
	}

	return {
		title: `${product.title} | Mushroom Growing Supplies`,
		description: product.description,
		openGraph: {
			title: product.title,
			description: product.description,
			images: [{ url: product.images.edges[0]?.node.url }],
			type: "website",
			siteName: "Zugzology",
			url: `https://zugzology.com/products/${params.handle}`,
		},
		alternates: {
			canonical: `https://zugzology.com/products/${params.handle}`,
		},
	};
}

// Add JSON-LD for product
function generateProductJsonLd(product: any) {
	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.title,
		description: product.description,
		image: product.images.edges[0]?.node.url,
		offers: {
			"@type": "Offer",
			price: product.priceRange.minVariantPrice.amount,
			priceCurrency: product.priceRange.minVariantPrice.currencyCode,
			availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
		},
	};
}

export default async function ProductPage({ params }: { params: { handle: string } }) {
	const product = await getProduct(params.handle);

	if (!product) notFound();

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-4">{product.title}</h1>
				{/* Add your product detail view here */}
			</div>
		</div>
	);
}
