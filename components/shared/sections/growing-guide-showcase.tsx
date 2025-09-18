import { Button } from "@/components/ui/button";
import { Link } from '@/components/ui/link';
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight, Sprout, Leaf, Microscope } from "lucide-react";
import Image from "next/image";
import type { ShopifyProduct } from "@/lib/types";
import { ProductCard } from "@/components/features/products/product-card";

interface GrowingGuideShowcaseProps {
	relatedProducts: ShopifyProduct[];
}

// Static guides data
const guides = [
	{
		id: "1",
		title: "Beginner's Guide to Mushroom Cultivation",
		excerpt: "Learn the fundamentals of mushroom growing with our comprehensive guide for beginners. Perfect for those just starting their cultivation journey.",
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
		excerpt: "Master the art of substrate preparation with our detailed guide covering sterilization, nutrition, and optimal conditions for growth.",
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
		excerpt: "Explore advanced laboratory techniques for successful cultivation, including sterile procedures and culture maintenance.",
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
		<section className="w-full py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900/50">
			<div className="container mx-auto px-4 md:px-6">
				{/* Header */}
				<div className="flex flex-col items-center text-center mb-12">
					<div className="flex items-center gap-2 mb-4">
						<BookOpen className="h-6 w-6 text-primary" />
						<Badge variant="secondary" className="bg-primary/10 text-primary">
							Expert Knowledge
						</Badge>
					</div>
					<h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">Growing Guides & Resources</h2>
					<p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">Learn from our expert guides and get all the supplies you need for successful cultivation</p>
				</div>

				{/* Guides Grid */}
				<div className="grid md:grid-cols-3 gap-8 mb-12">
					{guides.map((guide) => {
						const Icon = guide.difficulty.icon;
						return (
							<div key={guide.id} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
								<div className="aspect-[4/3] relative">
									<Image src={guide.image} alt={guide.title} fill className="object-cover" />
									<div className={`absolute inset-0 bg-gradient-to-t ${guide.difficulty.color}`} />
								</div>
								<div className="p-6">
									<div className="flex items-center gap-2 mb-4">
										<Icon className="h-5 w-5 text-primary" />
										<Badge variant="secondary" className="bg-primary/10 text-primary">
											{guide.difficulty.level}
										</Badge>
										<Badge variant="outline" className="ml-auto">
											{guide.readingTime}
										</Badge>
									</div>
									<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{guide.title}</h3>
									<p className="text-gray-600 dark:text-gray-400 mb-4">{guide.excerpt}</p>
									<Button variant="outline" className="w-full" asChild>
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
						<div className="flex items-center justify-between mb-8">
							<h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recommended Supplies</h3>
							<Button variant="outline" className="hidden sm:flex" asChild>
								<Link href="/collections/all">View All Products</Link>
							</Button>
						</div>
						<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{relatedProducts.slice(0, 4).map((product) => (
								<div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
									<ProductCard product={product} view="grid" variantId={product.variants.nodes[0]?.id} quantity={product.variants.nodes[0]?.quantityAvailable} />
								</div>
							))}
						</div>
						<Button variant="outline" className="w-full mt-8 sm:hidden" asChild>
							<Link href="/collections/all">View All Products</Link>
						</Button>
					</div>
				)}
			</div>
		</section>
	);
}
