import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductPageData } from "@/lib/actions/shopify";
import { ProductServerWrapper } from "@/components/products/product-server-wrapper";
import { ErrorBoundary } from "@/components/ui/error-boundary";

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
}

// Generate metadata for the product
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	try {
		// In Next.js 15, we need to await params
		const { handle } = await params;
		const { product } = await getProductPageData(handle);

		if (!product) {
			return {
				title: "Product Not Found",
				description: "The requested product could not be found.",
			};
		}

		return {
			title: product.title,
			description: product.description || `${product.title} - Available at Zugzology`,
			openGraph: {
				type: "website",
				title: product.title,
				description: product.description || `${product.title} - Available at Zugzology`,
				images: product.images?.nodes?.[0]?.url
					? [
							{
								url: product.images.nodes[0].url,
								width: product.images.nodes[0].width || 1200,
								height: product.images.nodes[0].height || 630,
								alt: product.images.nodes[0].altText || product.title,
							},
					  ]
					: [],
			},
		};
	} catch (error) {
		console.error("Error generating metadata:", error);
		return {
			title: "Product - Zugzology",
			description: "View our premium mushroom cultivation supplies.",
		};
	}
}

// Error fallback component
function ProductError() {
	return (
		<div className="w-full min-h-[50vh] flex items-center justify-center">
			<div className="text-center">
				<h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
				<p className="text-muted-foreground">Unable to load product information</p>
				<a href="/" className="mt-4 inline-block text-primary hover:underline">
					Return to Home
				</a>
			</div>
		</div>
	);
}

export default async function ProductPage({ params }: ProductPageProps) {
	try {
		// In Next.js 15, we need to await params
		const { handle } = await params;
		const { product, relatedProducts } = await getProductPageData(handle);

		if (!product) {
			notFound();
		}

		return (
			<ErrorBoundary fallback={<ProductError />}>
				<ProductServerWrapper product={product} relatedProducts={relatedProducts} />
			</ErrorBoundary>
		);
	} catch (error) {
		console.error("Error loading product page:", error);
		return <ProductError />;
	}
}
