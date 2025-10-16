import { ArrowRight, BookOpen, Leaf, Microscope, Sprout } from "lucide-react";
import Image from "next/image";
import { ProductCard } from "@/components/features/products/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { ShopifyProduct } from "@/lib/types";

type GrowingGuideShowcaseProps = {
	relatedProducts: ShopifyProduct[];
};

// Static guides data
const guides = [
	{
		id: "1",
		title: "Beginner's Guide to Mushroom Cultivation",
		excerpt:
			"Learn the fundamentals of mushroom growing with our comprehensive guide for beginners. Perfect for those just starting their cultivation journey.",
		image: "/guides/beginners-guide.jpg",
		handle: "beginners-guide",
		difficulty: {
			level: "Beginner",
			icon: Sprout,
			color: "from-green-500/20 via-green-500/5 to-transparent",
		},
		readingTime: "10 min read",
	},
	{
		id: "2",
		title: "Advanced Substrate Preparation",
		excerpt:
			"Master the art of substrate preparation with our detailed guide covering sterilization, nutrition, and optimal conditions for growth.",
		image: "/guides/substrate-guide.jpg",
		handle: "substrate-preparation",
		difficulty: {
			level: "Intermediate",
			icon: Leaf,
			color: "from-blue-500/20 via-blue-500/5 to-transparent",
		},
		readingTime: "15 min read",
	},
	{
		id: "3",
		title: "Laboratory Techniques for Cultivation",
		excerpt:
			"Explore advanced laboratory techniques for successful cultivation, including sterile procedures and culture maintenance.",
		image: "/guides/lab-techniques.jpg",
		handle: "lab-techniques",
		difficulty: {
			level: "Advanced",
			icon: Microscope,
			color: "from-purple-500/20 via-purple-500/5 to-transparent",
		},
		readingTime: "20 min read",
	},
];

export function GrowingGuideShowcase({ relatedProducts }: GrowingGuideShowcaseProps) {
	return (
		<section className="w-full bg-gradient-to-b from-background to-muted">
			<div className="container mx-auto px-4 py-12">
				{/* Header */}
				<div className="mb-12 flex flex-col items-center text-center">
					<div className="mb-4 flex items-center gap-2">
						<BookOpen className="h-6 w-6 text-primary" />
						<Badge className="bg-primary/10 text-primary" variant="secondary">
							Expert Knowledge
						</Badge>
					</div>
					<h2 className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl">Growing Guides & Resources</h2>
					<p className="mt-4 max-w-2xl text-lg text-muted-foreground">
						Learn from our expert guides and get all the supplies you need for successful cultivation
					</p>
				</div>

				{/* Guides Grid */}
				<div className="mb-12 grid gap-8 md:grid-cols-3">
					{guides.map((guide) => {
						const Icon = guide.difficulty.icon;
						return (
							<div
								className="group relative overflow-hidden rounded-2xl bg-card shadow-lg transition-shadow hover:shadow-xl"
								key={guide.id}
							>
								<div className="relative aspect-[4/3]">
									<Image
										alt={guide.title}
										className="object-cover"
										fill
										sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
										src={guide.image}
									/>
									<div className={`absolute inset-0 bg-gradient-to-t ${guide.difficulty.color}`} />
								</div>
								<div className="p-6">
									<div className="mb-4 flex items-center gap-2">
										<Icon className="h-5 w-5 text-primary" />
										<Badge className="bg-primary/10 text-primary" variant="secondary">
											{guide.difficulty.level}
										</Badge>
										<Badge className="ml-auto" variant="outline">
											{guide.readingTime}
										</Badge>
									</div>
									<h3 className="mb-2 font-bold text-foreground text-xl">{guide.title}</h3>
									<p className="mb-4 text-muted-foreground">{guide.excerpt}</p>
									<Button asChild className="w-full" variant="outline">
										<Link href={`/guides/${guide.handle}`}>
											Read Guide <ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
								</div>
							</div>
						);
					})}
				</div>

				{/* Related Products */}
				{relatedProducts && relatedProducts.length > 0 && (
					<div className="mt-16">
						<div className="mb-8 flex items-center justify-between">
							<h3 className="font-bold text-2xl text-foreground">Recommended Supplies</h3>
							<Button asChild className="hidden sm:flex" variant="outline">
								<Link href="/collections/all">View All Products</Link>
							</Button>
						</div>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{relatedProducts.slice(0, 4).map((product) => (
								<div className="rounded-lg bg-card shadow-lg" key={product.id}>
									<ProductCard
										product={product}
										quantity={product.variants.nodes[0]?.quantityAvailable}
										variantId={product.variants.nodes[0]?.id}
										view="grid"
									/>
								</div>
							))}
						</div>
						<Button asChild className="mt-8 w-full sm:hidden" variant="outline">
							<Link href="/collections/all">View All Products</Link>
						</Button>
					</div>
				)}
			</div>
		</section>
	);
}
