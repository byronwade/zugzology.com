import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import Image from "next/image";
import type { ShopifyProduct } from "@/lib/types";

interface HeroSectionProps {
	product?: ShopifyProduct | null;
}

export function HeroSection(props: HeroSectionProps) {
	// Immediately destructure with a default value to prevent null access
	const { product = null } = props;

	// Default hero section when no product is available
	if (!product) {
		return (
			<section className="relative bg-gray-50 dark:bg-gray-900/50">
				<div className="container mx-auto px-4 py-12 md:py-24">
					<div className="grid gap-8 md:grid-cols-2 items-center">
						<div className="space-y-6">
							<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">Welcome to Zugzology</h1>
							<p className="text-gray-600 dark:text-gray-400 text-lg">Your trusted source for premium mushroom cultivation supplies and equipment.</p>
							<div className="flex flex-col sm:flex-row gap-4">
								<Button size="lg" asChild>
									<Link href="/products">Browse Products</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	// For product section, only access properties after all safety checks
	const variant = product?.variants?.nodes?.[0];
	const image = product?.images?.nodes?.[0];
	const price = variant?.price?.amount ? parseFloat(variant.price.amount) : 0;
	const currency = variant?.price?.currencyCode || "USD";

	return (
		<section className="relative bg-gray-50 dark:bg-gray-900/50">
			<div className="container mx-auto px-4 py-12 md:py-24">
				<div className="grid gap-8 md:grid-cols-2 items-center">
					<div className="space-y-6">
						<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">{product.title || "Welcome to Zugzology"}</h1>
						{product.description && <p className="text-gray-600 dark:text-gray-400 text-lg">{product.description}</p>}
						{price > 0 && (
							<p className="text-2xl font-bold">
								{new Intl.NumberFormat("en-US", {
									style: "currency",
									currency,
								}).format(price)}
							</p>
						)}
						<div className="flex flex-col sm:flex-row gap-4">
							<Button size="lg" asChild>
								<Link href={`/products/${product.handle}`}>Shop Now</Link>
							</Button>
							<Button variant="outline" size="lg" asChild>
								<Link href="/products">View All Products</Link>
							</Button>
						</div>
					</div>
					{image && (
						<div className="relative aspect-square">
							<Image src={image.url} alt={image.altText || product.title} fill className="object-cover rounded-lg" priority />
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
