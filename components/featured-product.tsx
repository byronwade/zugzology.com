import Image from "next/image";
import { Link } from '@/components/ui/link';
import { Button } from "@/components/ui/button";
import { Check, ShoppingCart } from "lucide-react";

export function FeaturedProduct() {
	// In a real app, this data would come from an API or CMS
	const featuredProduct = {
		id: "featured-1",
		name: "Complete Mushroom Growing System",
		description:
			"Our flagship all-in-one mushroom cultivation system designed for consistent, high-yield harvests with minimal effort. Perfect for both beginners and experienced growers.",
		price: 149.99,
		image: "/placeholder.svg",
		features: [
			"Temperature and humidity controlled environment",
			"Automated lighting and air exchange system",
			"Pre-sterilized substrate included",
			"Multiple growing chambers for different varieties",
			"Detailed instruction manual and online video course access",
			"1-year warranty and lifetime customer support",
		],
	};

	return (
		<section className="py-16 bg-gradient-to-b from-white to-gray-50">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
						<Image
							src={featuredProduct.image || "/placeholder.svg"}
							alt={featuredProduct.name}
							fill
							sizes="(max-width: 1024px) 100vw, 50vw"
							className="object-cover"
						/>
					</div>
					<div className="flex flex-col">
						<div className="mb-4">
							<span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
								Featured Product
							</span>
						</div>
						<h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">{featuredProduct.name}</h2>
						<p className="text-lg text-gray-600 mb-6">{featuredProduct.description}</p>
						<ul className="space-y-3 mb-8">
							{featuredProduct.features.map((feature, index) => (
								<li key={index} className="flex items-start">
									<Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
									<span className="text-gray-700">{feature}</span>
								</li>
							))}
						</ul>
						<div className="flex items-center mb-8">
							<span className="text-3xl font-bold text-gray-900">${featuredProduct.price.toFixed(2)}</span>
							<span className="ml-2 text-sm text-gray-500">Free shipping</span>
						</div>
						<div className="flex flex-col sm:flex-row gap-4">
							<Button size="lg" className="flex items-center gap-2">
								<ShoppingCart className="h-5 w-5" />
								Add to Cart
							</Button>
							<Button variant="outline" size="lg" asChild>
								<Link href={`/products/${featuredProduct.id}`}>Learn More</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
