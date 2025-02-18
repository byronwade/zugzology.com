import type { Metadata } from "next";
import { getProductPageData } from "@/lib/actions/shopify";
import { notFound } from "next/navigation";
import { ProductContent } from "@/components/products/sections/product-content";
import type { ShopifyImage, ShopifyProduct } from "@/lib/types";
import { WithContext, Product } from "schema-dts";
import { jsonLdScriptProps } from "react-schemaorg";
import { unstable_noStore as noStore } from "next/cache";

// Tell Next.js this is a dynamic route that shouldn't be prerendered
export async function generateStaticParams() {
	return [];
}

// Tell Next.js to fetch fresh data on every request
export const fetchCache = "force-no-store";

interface ProductPageProps {
	params: Promise<{
		handle: string;
	}>;
	searchParams?: Promise<{
		variant?: string;
	}>;
}

// Get product data
async function getPageData(handle: string) {
	// Explicitly opt out of caching
	noStore();

	const data = await getProductPageData(handle);
	if (!data.product) {
		notFound();
	}
	return data;
}

// Error fallback component
const ProductError = () => (
	<div className="w-full min-h-[50vh] flex items-center justify-center">
		<div className="text-center">
			<h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
			<p className="text-muted-foreground">Unable to load product information</p>
		</div>
	</div>
);

// Generate metadata for the product
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	const { handle } = await params;
	const { product } = await getPageData(handle);

	const title = `${product.title} | Zugzology`;
	const description = product.description || `Buy ${product.title} from Zugzology. Premium mushroom cultivation supplies and equipment.`;
	const url = `https://zugzology.com/products/${product.handle}`;

	const productSchema: WithContext<Product> = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.title,
		description: product.description,
		image: product.images.nodes.map((node: ShopifyImage) => node.url) || [],
		brand: {
			"@type": "Brand",
			name: "Zugzology",
		},
		offers: {
			"@type": "AggregateOffer",
			priceCurrency: "USD",
			lowPrice: product.priceRange?.minVariantPrice?.amount,
			highPrice: product.priceRange?.maxVariantPrice?.amount,
			offerCount: product.variants.nodes.length || 1,
			availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
			itemCondition: "https://schema.org/NewCondition",
			seller: {
				"@type": "Organization",
				name: "Zugzology",
			},
		},
		category: product.productType || "Mushroom Cultivation Supplies",
		identifier: [
			{
				"@type": "PropertyValue",
				propertyID: "id",
				value: product.id,
			},
		],
		url,
		sameAs: [url],
		additionalProperty: [
			{
				"@type": "PropertyValue",
				name: "productType",
				value: product.productType,
			},
		],
	};

	return {
		title,
		description,
		alternates: {
			canonical: url,
		},
		openGraph: {
			title,
			description,
			type: "website",
			url,
			images: product.images.nodes.map((node: ShopifyImage) => ({
				url: node.url,
				width: node.width,
				height: node.height,
				alt: node.altText || product.title,
			})),
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: product.images.nodes.map((node: ShopifyImage) => node.url),
		},
		other: {
			"product:price:amount": product.priceRange?.minVariantPrice?.amount,
			"product:price:currency": "USD",
			"product:availability": product.availableForSale ? "instock" : "outofstock",
		},
	};
}

export default async function ProductPage({ params }: ProductPageProps) {
	const { handle } = await params;
	const { product } = await getPageData(handle);

	const productSchema: WithContext<Product> = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.title,
		description: product.description,
		image: product.images.nodes.map((node: ShopifyImage) => node.url) || [],
		brand: {
			"@type": "Brand",
			name: "Zugzology",
		},
		offers: {
			"@type": "AggregateOffer",
			priceCurrency: "USD",
			lowPrice: product.priceRange?.minVariantPrice?.amount,
			highPrice: product.priceRange?.maxVariantPrice?.amount,
			offerCount: product.variants.nodes.length || 1,
			availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
			itemCondition: "https://schema.org/NewCondition",
			seller: {
				"@type": "Organization",
				name: "Zugzology",
			},
		},
		category: product.productType || "Mushroom Cultivation Supplies",
		identifier: [
			{
				"@type": "PropertyValue",
				propertyID: "id",
				value: product.id,
			},
		],
		url: `https://zugzology.com/products/${product.handle}`,
		additionalProperty: [
			{
				"@type": "PropertyValue",
				name: "productType",
				value: product.productType,
			},
		],
	};

	return (
		<>
			<script {...jsonLdScriptProps(productSchema)} />
			<ProductContent product={product} />
		</>
	);
}
