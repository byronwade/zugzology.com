import { CheckCircle, Play, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrefetchLink } from "@/components/ui/prefetch-link";
import type { ShopifyProduct } from "@/lib/types";

type HeroVideoCinematicProps = {
	products?: ShopifyProduct[];
};

// Server Component - no client JS needed
// CSS animations replace Framer Motion for better performance
export function HeroVideoCinematic({ products = [] }: HeroVideoCinematicProps) {
	return (
		<section className="hero-section relative w-full overflow-hidden bg-black py-16 sm:py-20 md:h-[calc(100vh-var(--header-height))] md:py-0">
			{/* Video Background - using CSS for scale effect */}
			<div className="video-container absolute inset-0">
				{/* Animated gradient background - fallback while video loads */}
				<div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

				{/* Animated mycelium pattern overlay */}
				<div className="absolute inset-0 opacity-30">
					<div className="mycelium-glow-1 absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(206_55_37/0.15)_0%,transparent_50%)]" />
					<div className="mycelium-glow-2 absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,hsl(206_55_37/0.1)_0%,transparent_50%)]" />
				</div>

				{/* Video Element - native browser autoplay */}
				<video
					autoPlay
					className="video-hero absolute inset-0 h-full w-full object-cover"
					loop
					muted
					playsInline
					poster="https://bevgyjm5apuichhj.public.blob.vercel-storage.com/hero-poster-optimized-LKjMxN8vQp2YzBqGF5qKxTrJ9X3yE1.jpg"
					preload="none"
				>
					<source src="/videos/mushroom-hero.webm" type="video/webm" />
					<source src="/videos/mushroom-hero.mp4" type="video/mp4" />
				</video>

				{/* Vignette Overlay */}
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.8)_100%)]" />

				{/* Bottom Gradient - Fades to background color */}
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(5,12,30,0.92)] via-black/70 to-transparent dark:from-background dark:via-black/80" />

				{/* Left Gradient for text readability */}
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

				{/* Top fade */}
				<div className="pointer-events-none absolute top-0 right-0 left-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
			</div>

			{/* Content - CSS animations instead of Framer Motion */}
			<div className="hero-content relative z-10 flex items-start md:h-full md:items-center">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-3xl lg:max-w-4xl">
						{/* Small badge */}
						<div className="hero-badge mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md sm:mb-6">
							<Sparkles className="h-4 w-4 text-primary" />
							<span className="text-sm text-white/90 uppercase tracking-wider">Premium Cultivation</span>
						</div>

						{/* Main Headline */}
						<h1 className="hero-title mb-4 font-black text-5xl text-white leading-[1.1] tracking-tight sm:mb-6 sm:text-6xl md:text-7xl lg:text-8xl">
							<span className="block">Grow</span>
							<span className="block text-primary">Extraordinary</span>
							<span className="block">Mushrooms</span>
						</h1>

						{/* Tagline */}
						<p className="hero-tagline mb-6 max-w-2xl text-lg text-white/90 leading-relaxed sm:mb-8 sm:text-xl lg:text-2xl">
							Premium cultivation supplies for serious growers. Join 10,000+ cultivators achieving 95% success rates.
						</p>

						{/* CTAs */}
						<div className="hero-cta flex flex-col gap-3 sm:flex-row sm:gap-4">
							{/* Primary CTA */}
							<Button
								asChild
								className="group relative h-12 overflow-hidden rounded-md bg-primary px-8 font-semibold text-base text-white shadow-2xl transition-all hover:bg-primary/90 hover:shadow-primary/50 sm:h-14 sm:px-10 sm:text-lg"
							>
								<PrefetchLink className="flex items-center gap-2" href="/products">
									<Play className="h-5 w-5 transition-transform group-hover:scale-110" />
									Start Growing
								</PrefetchLink>
							</Button>

							{/* Secondary CTA */}
							<Button
								asChild
								className="h-12 rounded-md border-2 border-white/30 bg-white/10 px-8 font-semibold text-base text-white backdrop-blur-md transition-all hover:border-white/50 hover:bg-white/20 sm:h-14 sm:px-10 sm:text-lg"
								variant="outline"
							>
								<PrefetchLink href="/collections/all">Explore Products</PrefetchLink>
							</Button>
						</div>

						{/* Social Proof */}
						<div className="hero-social mt-8 flex flex-wrap items-center gap-4 sm:mt-12 sm:gap-6">
							<div className="flex items-center gap-2">
								<div className="-space-x-2 flex">
									{[...new Array(4)].map((_, i) => (
										<div
											className="h-8 w-8 rounded-full border-2 border-black bg-gradient-to-br from-primary/80 to-primary"
											key={i}
										/>
									))}
								</div>
								<span className="text-sm text-white/70">10,000+ Growers</span>
							</div>

							<div className="h-4 w-px bg-white/20" />

							<div className="flex items-center gap-2">
								<Star className="h-5 w-5 fill-primary text-primary" />
								<span className="text-sm text-white/70">4.9/5 Rating</span>
							</div>

							<div className="h-4 w-px bg-white/20" />

							<div className="flex items-center gap-2">
								<CheckCircle className="h-5 w-5 text-primary" />
								<span className="text-sm text-white/70">95% Success Rate</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Scroll Indicator - pure CSS */}
			<div className="scroll-indicator absolute right-0 bottom-8 left-0 z-20 flex justify-center">
				<div className="flex flex-col items-center gap-2">
					<span className="text-white/50 text-xs uppercase tracking-widest">Scroll</span>
					<div className="h-8 w-5 rounded-full border-2 border-white/30">
						<div className="scroll-dot mx-auto mt-1.5 h-1.5 w-1.5 rounded-full bg-white/70" />
					</div>
				</div>
			</div>
		</section>
	);
}
