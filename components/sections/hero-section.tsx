import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import { formatPrice } from "@/lib/utils";

interface HeroSectionProps {
	product: {
		title: string;
		description?: string;
		excerpt?: string;
		images: { nodes: { url: string }[] };
		handle: string;
		variants: {
			nodes: {
				id: string;
				price: { amount: string; currencyCode: string };
			}[];
		};
	};
}

export function HeroSection({ product }: HeroSectionProps) {
	const price = parseFloat(product.variants.nodes[0]?.price.amount || "0");
	const currencyCode = product.variants.nodes[0]?.price.currencyCode;

	return (
		<section className="relative overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-200">
			{/* Chess Board Pattern Background */}
			<div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.02]">
				<div className="absolute inset-0 grid grid-cols-8 aspect-square">
					{[...Array(64)].map((_, i) => {
						const isEvenRow = Math.floor(i / 8) % 2 === 0;
						const isEvenCol = i % 2 === 0;
						const shouldBeDark = isEvenRow ? isEvenCol : !isEvenCol;
						return <div key={i} className={`${shouldBeDark ? "bg-black" : "bg-transparent"} aspect-square transition-colors`} />;
					})}
				</div>
			</div>

			<div className="container relative z-10 mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
				<div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
					<div className="max-w-2xl">
						<Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30" variant="secondary">
							Featured Product
						</Badge>
						<h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl lg:text-5xl xl:text-6xl">{product.title}</h1>
						<p className="mb-6 text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300">{product.excerpt || product.description?.split(".")[0]}</p>

						<div className="flex flex-col sm:flex-row gap-4">
							<Button size="lg" className="bg-primary hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary/80 transition-colors" asChild>
								<Link href={`/products/${product.handle}`}>
									<ShoppingCart className="mr-2 h-5 w-5" />
									Shop Now {formatPrice(price, currencyCode)}
								</Link>
							</Button>
							<Button size="lg" variant="outline" className="border-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800" asChild>
								<Link href="/help">View Growing Guides</Link>
							</Button>
						</div>

						<div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
							<div className="flex items-center">
								{[...Array(5)].map((_, i) => (
									<Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-yellow-400" />
								))}
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								<span className="font-medium text-gray-900 dark:text-gray-200">4.9/5</span> from over 1,000+ reviews
							</p>
						</div>
					</div>

					<div className="relative group">
						<div className="relative aspect-[4/3] border border-gray-200 dark:border-gray-800">
							<div className="absolute inset-0 rounded-lg overflow-hidden">
								<Image src={product.images.nodes[0]?.url || "/placeholder.svg"} alt={product.title} fill className="object-cover object-center transition-transform duration-500 group-hover:scale-105 rounded-lg overflow-hidden" priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw" />
							</div>

							<div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-800">
								<p className="font-bold text-lg text-gray-900 dark:text-gray-100">{formatPrice(price, currencyCode)}</p>
							</div>
						</div>

						<div className="absolute -bottom-6 left-4 right-4 bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl p-4 transform group-hover:-translate-y-1 transition-transform duration-300">
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center">
									<ShoppingCart className="h-6 w-6 text-gray-900 dark:text-gray-100" />
								</div>
								<div className="flex-1">
									<div className="flex items-center justify-between">
										<p className="font-medium text-gray-900 dark:text-gray-100">Free Shipping</p>
										<Badge variant="secondary" className="border-gray-200 dark:border-gray-800">
											Worldwide
										</Badge>
									</div>
									<p className="text-sm text-gray-600 dark:text-gray-400">On All Orders • No Minimum Purchase</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
