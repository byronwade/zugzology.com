import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from '@/components/ui/link';
import Image from "next/image";
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

	// Get a clean, concise description
	const shortDescription =
		product.excerpt ||
		(product.description ? product.description.split(".")[0] + "." : "Premium quality mushroom cultivation supplies.");

	// Ensure we have a valid image URL
	const imageUrl = product.images?.nodes?.[0]?.url || "/placeholder.svg";

	// Log for debugging purposes
	console.log("Hero product image:", {
		imageUrl,
		hasImages: Boolean(product.images),
		nodesLength: product.images?.nodes?.length,
		firstNode: product.images?.nodes?.[0],
	});

	return (
		<section className="relative overflow-hidden">
			{/* Background elements */}
			<div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900"></div>
			<div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-gray-100 to-transparent dark:from-gray-800/20 dark:to-transparent"></div>
			<div className="absolute -top-48 -right-48 w-96 h-96 bg-gradient-radial from-gray-200/40 to-transparent dark:from-gray-700/20 rounded-full blur-3xl"></div>
			<div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-radial from-gray-200/30 to-transparent dark:from-gray-700/10 rounded-full blur-3xl"></div>

			<div className="container relative mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32 xl:py-40">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
					{/* Left content: Text and CTA */}
					<div className="lg:col-span-5 lg:pr-8 max-w-xl mx-auto lg:mx-0">
						<div>
							<div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 mb-6">
								<span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
								Featured Product
							</div>

							<h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
								{product.title}
							</h1>

							<p className="text-lg text-gray-600 dark:text-gray-300 mb-8 font-light leading-relaxed">
								{shortDescription}
							</p>

							<div className="flex flex-wrap items-center gap-4 mb-8">
								<div className="flex items-baseline">
									<span className="text-3xl font-medium text-gray-900 dark:text-white mr-2">
										{formatPrice(price, currencyCode)}
									</span>
									<span className="text-sm text-gray-500 dark:text-gray-400">Free shipping</span>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-4 sm:items-center">
								<Button
									size="lg"
									className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full px-8 h-14"
									asChild
								>
									<Link href={`/products/${product.handle}`}>Shop Now</Link>
								</Button>

								<Button
									variant="ghost"
									className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 -ml-2 pl-2 h-11 sm:h-12"
									asChild
								>
									<Link href="/collections/all" className="flex items-center">
										Browse Collection <ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
							</div>
						</div>

						{/* Trust badges */}
						<div className="hidden sm:grid grid-cols-3 gap-4 mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
							<div className="flex flex-col items-center text-center">
								<div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="text-gray-700 dark:text-gray-300"
									>
										<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
									</svg>
								</div>
								<span className="text-xs font-medium text-gray-700 dark:text-gray-300">Quality Guaranteed</span>
							</div>
							<div className="flex flex-col items-center text-center">
								<div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="text-gray-700 dark:text-gray-300"
									>
										<rect width="20" height="14" x="2" y="3" rx="2" />
										<line x1="8" x2="16" y1="21" y2="21" />
										<line x1="12" x2="12" y1="17" y2="21" />
									</svg>
								</div>
								<span className="text-xs font-medium text-gray-700 dark:text-gray-300">Expert Support</span>
							</div>
							<div className="flex flex-col items-center text-center">
								<div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="text-gray-700 dark:text-gray-300"
									>
										<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
										<circle cx="12" cy="10" r="3" />
									</svg>
								</div>
								<span className="text-xs font-medium text-gray-700 dark:text-gray-300">Worldwide Shipping</span>
							</div>
						</div>
					</div>

					{/* Right content: Image showcase */}
					<div className="lg:col-span-7 relative">
						{/* Main image container */}
						<div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
							{/* Decorative elements */}
							<div className="absolute top-5 left-5 h-20 w-20 rounded-full border-8 border-gray-100 dark:border-gray-700 opacity-30"></div>
							<div className="absolute bottom-12 right-12 h-16 w-16 rounded-full border-4 border-gray-200 dark:border-gray-600 opacity-20"></div>
							<div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 dark:from-white/10 dark:to-black/30 z-10"></div>

							{/* Product image */}
							<div className="absolute inset-0 flex items-center justify-center p-8 relative">
								<Image
									src={imageUrl}
									alt={product.title}
									fill
									className="object-contain transition-all duration-700 ease-out hover:scale-[1.02] z-20"
									priority
								/>
							</div>

							{/* Quick view button */}
							<Link
								href={`/products/${product.handle}`}
								className="absolute right-6 bottom-6 z-30 flex items-center gap-1 px-4 py-2 bg-white/90 dark:bg-black/80 backdrop-blur-sm text-xs font-medium text-gray-800 dark:text-gray-200 rounded-full shadow-lg transform transition-transform hover:scale-105"
							>
								Quick View <ArrowUpRight size={14} />
							</Link>
						</div>

						{/* Floating elements */}
						<div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-yellow-100 dark:bg-yellow-900/30 -z-10 blur-xl opacity-70"></div>
						<div className="absolute -bottom-8 left-1/4 w-32 h-32 rounded-full bg-green-100 dark:bg-green-900/20 -z-10 blur-xl opacity-50"></div>

						{/* Mobile trust badges */}
						<div className="flex sm:hidden justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
							<div className="flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-gray-700 dark:text-gray-300 mr-2"
								>
									<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
								</svg>
								<span className="text-xs font-medium text-gray-700 dark:text-gray-300">Quality</span>
							</div>
							<div className="flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-gray-700 dark:text-gray-300 mr-2"
								>
									<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
									<circle cx="12" cy="10" r="3" />
								</svg>
								<span className="text-xs font-medium text-gray-700 dark:text-gray-300">Worldwide</span>
							</div>
							<div className="flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-gray-700 dark:text-gray-300 mr-2"
								>
									<rect width="20" height="14" x="2" y="3" rx="2" />
									<line x1="8" x2="16" y1="21" y2="21" />
									<line x1="12" x2="12" y1="17" y2="21" />
								</svg>
								<span className="text-xs font-medium text-gray-700 dark:text-gray-300">Support</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
