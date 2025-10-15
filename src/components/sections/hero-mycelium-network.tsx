"use client";

import { Activity, ArrowRight, MessageCircle, Shield, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Link } from "@/components/ui/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ShopifyProduct } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import type { CollisionBox } from "@/components/ui/mycelium-background";

// Dynamic import to prevent SSR issues with Three.js
const MyceliumBackground = dynamic(
	() => import("@/components/ui/mycelium-background").then((mod) => ({ default: mod.MyceliumBackground })),
	{ ssr: false }
);

type HeroMyceliumNetworkProps = {
	products?: ShopifyProduct[];
};

export function HeroMyceliumNetwork({ products = [] }: HeroMyceliumNetworkProps) {
	const [_hoveredNode, setHoveredNode] = useState<number | null>(null);
	const [collisionBoxes, setCollisionBoxes] = useState<CollisionBox[]>([]);
	const featuredProducts = products.slice(0, 3);

	// Refs for tracking component positions
	const headlineRef = useRef<HTMLHeadingElement>(null);
	const ctaContainerRef = useRef<HTMLDivElement>(null);
	const featuresGridRef = useRef<HTMLDivElement>(null);
	const productsContainerRef = useRef<HTMLDivElement>(null);

	// Convert DOM element to simple 2D screen space collision box
	const convertToScreenSpace = (element: HTMLElement): CollisionBox | null => {
		const rect = element.getBoundingClientRect();
		if (!rect) return null;

		// Return simple screen space rectangle
		return {
			id: element.id || `element-${rect.left}-${rect.top}`,
			position: {
				x: rect.left + rect.width / 2,
				y: rect.top + rect.height / 2,
				z: 0
			},
			size: {
				width: rect.width,
				height: rect.height,
				depth: 0
			},
		};
	};

	// Update collision boxes when components mount or resize
	useEffect(() => {
		const updateCollisionBoxes = () => {
			const boxes: CollisionBox[] = [];

			if (headlineRef.current) {
				const box = convertToScreenSpace(headlineRef.current);
				if (box) boxes.push({ ...box, id: "headline" });
			}

			if (ctaContainerRef.current) {
				const box = convertToScreenSpace(ctaContainerRef.current);
				if (box) boxes.push({ ...box, id: "cta-buttons" });
			}

			if (featuresGridRef.current) {
				const box = convertToScreenSpace(featuresGridRef.current);
				if (box) boxes.push({ ...box, id: "features-grid" });
			}

			if (productsContainerRef.current) {
				const box = convertToScreenSpace(productsContainerRef.current);
				if (box) boxes.push({ ...box, id: "products" });
			}

			setCollisionBoxes(boxes);
		};

		// Update on mount
		updateCollisionBoxes();

		// Update on window resize
		window.addEventListener("resize", updateCollisionBoxes);

		// Update periodically to handle dynamic content
		const interval = setInterval(updateCollisionBoxes, 2000);

		return () => {
			window.removeEventListener("resize", updateCollisionBoxes);
			clearInterval(interval);
		};
	}, []);

	return (
		<section className="relative h-screen overflow-hidden bg-black text-white">
			{/* Fallback animated gradient background */}
			<div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-black to-teal-950">
				<div
					className="absolute inset-0 animate-pulse bg-gradient-to-tl from-cyan-900/20 via-transparent to-teal-900/20"
					style={{ animationDuration: "8s" }}
				/>
			</div>

			{/* Mycelium Network Background (3D Canvas) */}
			<MyceliumBackground collisionBoxes={collisionBoxes} color="#f5f5dc" density="ultra" />

			{/* Radial gradient overlay for depth */}
			<div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/90" />

			<div className="container relative z-10 mx-auto flex h-screen items-center px-4 pt-16 pb-8 lg:pt-24 lg:pb-12">
				<div className="grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-12">
					{/* Left Content */}
					<div className="space-y-6 lg:space-y-8">
						{/* Main Headline */}
						<div className="space-y-3 lg:space-y-4">
							<h1 ref={headlineRef} className="font-bold text-4xl leading-tight tracking-tight md:text-5xl lg:text-6xl">
								<span className="block text-white">Premium</span>
								<span className="block bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
									Mushroom
								</span>
								<span className="block text-white">Cultivation</span>
							</h1>
							<p className="max-w-xl text-gray-300 text-base leading-relaxed lg:text-lg">
								Professional-grade cultivation supplies for growers of all levels. From spore syringes to complete grow kits, everything you need to grow premium mushrooms.
							</p>
						</div>

						{/* CTAs */}
						<div ref={ctaContainerRef} className="flex flex-wrap gap-3">
							<Button
								asChild
								className="h-11 border-0 bg-gradient-to-r from-cyan-500 to-teal-500 px-6 text-white hover:from-cyan-600 hover:to-teal-600 lg:h-12 lg:px-8"
								size="lg"
							>
								<Link href="/products">Shop Products</Link>
							</Button>
							<Button
								asChild
								className="h-11 border-2 border-cyan-500/20 px-6 text-cyan-400 backdrop-blur-sm hover:border-cyan-500/40 hover:bg-cyan-500/10 lg:h-12 lg:px-8"
								size="lg"
								variant="outline"
							>
								<Link href="/collections/all">View Collections</Link>
							</Button>
						</div>

						{/* Features Grid */}
						<div ref={featuresGridRef} className="grid max-w-md grid-cols-2 gap-3 lg:gap-4">
							{[
								{ icon: Shield, label: "Quality Tested", value: "100%", color: "cyan" },
								{ icon: Zap, label: "Fast Shipping", value: "1-3 Days", color: "cyan" },
								{ icon: Activity, label: "Success Rate", value: "95%+", color: "cyan" },
								{ icon: MessageCircle, label: "Expert Support", value: "24/7", color: "cyan" },
							].map((stat, idx) => (
								<div
									className="group relative rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/30 lg:rounded-xl lg:p-4"
									key={stat.label}
									onMouseEnter={() => setHoveredNode(idx)}
									onMouseLeave={() => setHoveredNode(null)}
								>
									<div className="relative space-y-1">
										<stat.icon className="h-4 w-4 text-cyan-400 lg:h-5 lg:w-5" />
										<div className="font-bold text-xl text-white lg:text-2xl">{stat.value}</div>
										<div className="text-gray-400 text-[10px] lg:text-xs">{stat.label}</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Right - Featured Products */}
					<div className="relative hidden lg:block">
						{/* Featured Products - Compact Design */}
						<div ref={productsContainerRef} className="relative space-y-3">
							{featuredProducts.map((product, idx) => (
								<Link
									className="group relative block"
									href={`/products/${product.handle}`}
									key={product.id}
								>
									<div className="relative flex gap-3 overflow-hidden rounded-xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/50 hover:bg-black/60 hover:shadow-cyan-500/20 hover:shadow-lg">
										{/* Product Image */}
										<div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-cyan-950/20 to-black">
											{product.images?.nodes?.[0] && (
												<Image
													alt={product.title}
													className="object-cover transition-all duration-500 group-hover:scale-110"
													fill
													sizes="96px"
													src={product.images.nodes[0].url}
												/>
											)}
											{/* Featured Badge */}
											<div className="absolute top-1 left-1 rounded-md bg-cyan-500/90 px-1.5 py-0.5 backdrop-blur-sm">
												<span className="font-bold text-white text-[10px]">Featured</span>
											</div>
										</div>

										{/* Product Info */}
										<div className="flex min-w-0 flex-1 flex-col justify-between py-1">
											<div className="space-y-1.5">
												<h3 className="line-clamp-2 font-semibold text-white text-sm leading-tight transition-colors group-hover:text-cyan-400">
													{product.title}
												</h3>
												<div className="flex items-center gap-1.5">
													<div className="flex gap-0.5">
														{[...Array(5)].map((_, i) => (
															<svg
																className="h-3 w-3 fill-cyan-400"
																key={i}
																viewBox="0 0 20 20"
																xmlns="http://www.w3.org/2000/svg"
															>
																<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
															</svg>
														))}
													</div>
													<span className="text-gray-400 text-[10px]">(4.8)</span>
												</div>
											</div>

											<div className="flex items-center justify-between">
												<span className="font-bold text-cyan-400 text-lg">
													{formatPrice(
														product.variants?.nodes?.[0]?.price?.amount || "0",
														product.variants?.nodes?.[0]?.price?.currencyCode || "USD"
													)}
												</span>
												<div className="flex items-center gap-1 text-cyan-400 text-xs">
													<span className="font-medium">View</span>
													<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
												</div>
											</div>
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>

			<style jsx>{`
				.bg-gradient-radial {
					background: radial-gradient(circle at center, var(--tw-gradient-stops));
				}
			`}</style>
		</section>
	);
}
