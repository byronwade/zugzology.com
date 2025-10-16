"use client";

import { Lock, RotateCcw, Sparkles, Star, Truck } from "lucide-react";
import { Suspense } from "react";
import { GlassStatCard } from "@/components/features/hero/glass-stat-card";
import { GrowthAnimation } from "@/components/features/hero/growth-animation";
import { KineticHeadline } from "@/components/features/hero/kinetic-headline";
import { Mushroom3D } from "@/components/features/hero/mushroom-3d";
import { ProductPreviewCard } from "@/components/features/hero/product-preview-card";
import type { ShopifyProduct } from "@/lib/types";

type HeroGrowthLabProps = {
	products?: ShopifyProduct[];
};

export function HeroGrowthLab({ products = [] }: HeroGrowthLabProps) {
	const featuredProduct = products[0];

	return (
		<section className="relative min-h-[calc(100vh-var(--header-height))] overflow-hidden bg-black">
			{/* Animated gradient background */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(206_55_37/0.15),transparent_50%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(206_55_37/0.1),transparent_50%)]" />

			{/* Grid pattern overlay */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(206_55_37/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(206_55_37/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" />

			<div className="container relative z-10 mx-auto px-4 py-12 sm:py-16 lg:py-20">
				{/* Bento Grid Layout */}
				<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 lg:grid-rows-[auto_auto_auto] lg:gap-6">
					{/* Main Headline - Spans full width on mobile, left side on desktop */}
					<div className="lg:col-span-7 lg:row-span-2">
						<KineticHeadline />
					</div>

					{/* 3D Mushroom - Top right, tall */}
					<div className="h-[400px] lg:col-span-5 lg:row-span-3 lg:h-auto">
						<Suspense
							fallback={
								<div className="flex h-full w-full items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl">
									<div className="text-center">
										<Sparkles className="mx-auto mb-2 h-12 w-12 text-primary" />
										<p className="text-sm text-white/60">Loading 3D Model...</p>
									</div>
								</div>
							}
						>
							<Mushroom3D />
						</Suspense>
					</div>

					{/* Stats Row - Below headline */}
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:col-span-7 lg:grid-cols-3">
						<GlassStatCard animateValue delay={0.2} label="Growers" value="10K+" />
						<GlassStatCard animateValue delay={0.3} label="Success Rate" value="95%" />
						<GlassStatCard delay={0.4} label="Support" value="24/7" />
					</div>

					{/* Growth Animation - Middle left */}
					<div className="h-[300px] sm:h-[400px] lg:col-span-4 lg:row-span-2 lg:h-auto">
						<GrowthAnimation />
					</div>

					{/* Product Preview - Bottom right */}
					<div className="h-[400px] sm:h-[500px] lg:col-span-3 lg:row-span-2 lg:h-auto">
						{featuredProduct ? (
							<ProductPreviewCard product={featuredProduct} />
						) : (
							<div className="flex h-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl">
								<p className="text-white/60">Loading products...</p>
							</div>
						)}
					</div>
				</div>

				{/* Trust Indicators */}
				<div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:mt-16">
					{[
						{ icon: Truck, text: "Free Shipping $75+" },
						{ icon: Lock, text: "Secure Checkout" },
						{ icon: RotateCcw, text: "30-Day Returns" },
						{ icon: Star, text: "4.9/5 Rating" },
					].map((item, index) => (
						<div
							className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
							key={index}
						>
							<item.icon className="h-6 w-6 text-primary" />
							<span className="text-sm text-white/80">{item.text}</span>
						</div>
					))}
				</div>

				{/* Scroll indicator */}
				<div className="mt-16 flex justify-center lg:mt-20">
					<div className="flex flex-col items-center gap-2">
						<p className="text-white/40 text-xs uppercase tracking-widest">Scroll to explore</p>
						<div className="h-12 w-6 rounded-full border border-white/20">
							<div className="mx-auto mt-2 h-2 w-2 animate-bounce rounded-full bg-primary" />
						</div>
					</div>
				</div>
			</div>

			{/* Bottom fade */}
			<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t from-background to-transparent" />
		</section>
	);
}
