import Image from "next/image";
import { Link } from '@/components/ui/link';
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export function BlogPreview() {
	const blogPosts = [
		{
			id: 1,
			title: "5 Common Mistakes Beginners Make When Growing Mushrooms",
			excerpt:
				"Learn how to avoid the most common pitfalls that new growers encounter and set yourself up for success from the start.",
			image: "/placeholder.svg",
			date: "March 15, 2023",
			readTime: "8 min read",
			slug: "common-beginner-mistakes",
		},
		{
			id: 2,
			title: "The Ultimate Guide to Substrate Preparation",
			excerpt:
				"Discover the science behind creating the perfect growing medium for different mushroom varieties and how it affects your yields.",
			image: "/placeholder.svg",
			date: "April 2, 2023",
			readTime: "12 min read",
			slug: "substrate-preparation-guide",
		},
		{
			id: 3,
			title: "Medicinal Mushrooms: Benefits and Growing Tips",
			excerpt:
				"Explore the health benefits of medicinal mushrooms like reishi, lion's mane, and turkey tail, plus how to cultivate them at home.",
			image: "/placeholder.svg",
			date: "May 10, 2023",
			readTime: "10 min read",
			slug: "medicinal-mushroom-benefits",
		},
	];

	return (
		<section className="py-16">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
					<div>
						<h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Cultivation Knowledge</h2>
						<p className="mt-4 text-lg text-gray-600 max-w-2xl">
							Expert tips, guides, and insights to help you master the art and science of mushroom cultivation.
						</p>
					</div>
					<Button variant="link" className="mt-4 md:mt-0 p-0 h-auto" asChild>
						<Link href="/blog" className="flex items-center text-primary">
							View all articles
							<ArrowRight className="ml-1 h-4 w-4" />
						</Link>
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{blogPosts.map((post) => (
						<div key={post.id} className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border">
							<div className="relative h-48 overflow-hidden">
								<Image
									src={post.image || "/placeholder.svg"}
									alt={post.title}
									fill
									sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
									className="object-cover transition-transform group-hover:scale-105"
								/>
							</div>
							<div className="flex-1 p-6 flex flex-col">
								<div className="flex items-center text-sm text-gray-500 mb-3">
									<Calendar className="h-4 w-4 mr-1" />
									<span>{post.date}</span>
									<span className="mx-2">•</span>
									<Clock className="h-4 w-4 mr-1" />
									<span>{post.readTime}</span>
								</div>
								<h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
								<p className="text-gray-600 mb-4 flex-1">{post.excerpt}</p>
								<Link
									href={`/blog/${post.slug}`}
									className="text-primary font-medium hover:underline inline-flex items-center"
								>
									Read more
									<ArrowRight className="ml-1 h-4 w-4" />
								</Link>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
