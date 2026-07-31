import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrefetchLink } from "@/components/ui/prefetch-link";
import type { ShopifyProduct } from "@/lib/types";

type HeroVideoCinematicProps = {
	products?: ShopifyProduct[];
};

/**
 * The slate — a clapperboard's data row, doubling as the bottom letterbox bar.
 * The frame carries the information instead of decorating it.
 */
const SLATE_ROWS = [
	{ label: "Growers", value: "10,000+" },
	{ label: "Rating", value: "4.9 / 5" },
	{ label: "Success rate", value: "95%" },
	{ label: "Shipping", value: "Free over $75" },
] as const;

/** Corner crop marks, drawn as two borders each. */
const CROP_MARKS = [
	{ key: "tl", position: "top-0 left-0", edges: "border-t-2 border-l-2" },
	{ key: "tr", position: "top-0 right-0", edges: "border-t-2 border-r-2" },
	{ key: "bl", position: "bottom-0 left-0", edges: "border-b-2 border-l-2" },
	{ key: "br", position: "bottom-0 right-0", edges: "border-b-2 border-r-2" },
] as const;

// Server Component — the whole title sequence is CSS, so this ships no JS.
export function HeroVideoCinematic(_props: HeroVideoCinematicProps) {
	return (
		<section className="hero-section relative flex w-full flex-col overflow-hidden bg-[hsl(205_45%_3%)] md:h-[calc(100vh-var(--header-height))]">
			{/* ---------------------------------------------------------- *
			 * The plate
			 * ---------------------------------------------------------- */}
			<div className="absolute inset-0">
				{/* Held frame while the video decodes */}
				<div className="absolute inset-0 bg-[radial-gradient(75%_65%_at_35%_35%,hsl(202_35%_14%)_0%,hsl(205_45%_4%)_70%)]" />

				<video
					autoPlay
					className="video-hero absolute inset-0 h-full w-full object-cover"
					loop
					muted
					playsInline
					poster="/banner3.webp"
					preload="none"
				>
					<source src="/videos/mushroom-hero.webm" type="video/webm" />
					<source src="/videos/mushroom-hero.mp4" type="video/mp4" />
				</video>

				{/* The grade. One warm key from the top left, cool fill everywhere else. */}
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_12%_0%,hsl(var(--flush)/0.16)_0%,transparent_62%)] mix-blend-screen" />
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_70%_at_100%_100%,hsl(var(--primary)/0.14)_0%,transparent_60%)] mix-blend-screen" />

				{/* Readability: the type side of the frame goes deep, the plate side stays open. */}
				<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(205_50%_3%/0.88)_0%,hsl(205_50%_3%/0.55)_40%,hsl(205_50%_3%/0.1)_80%,transparent_100%)]" />
				<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,hsl(205_50%_3%)_0%,hsl(205_50%_3%/0.5)_32%,transparent_68%)]" />

				{/* Vignette — the lens, not a gradient for its own sake. */}
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_35%,hsl(205_60%_2%/0.55)_100%)]" />
			</div>

			{/* Top letterbox bar */}
			<div
				aria-hidden="true"
				className="letterbox absolute inset-x-0 top-0 z-20 h-[clamp(12px,3vh,30px)] bg-[hsl(205_55%_2%)]"
				style={{ "--letterbox-origin": "top" } as React.CSSProperties}
			/>

			{/* ---------------------------------------------------------- *
			 * The framed content
			 * ---------------------------------------------------------- */}
			<div className="relative z-10 flex flex-1 items-center py-20 sm:py-28 md:py-0">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="relative">
						{/* Crop marks bracket the content, not the viewport. */}
						<div
							aria-hidden="true"
							className="-inset-x-2 -inset-y-8 sm:-inset-x-8 sm:-inset-y-10 pointer-events-none absolute"
						>
							{CROP_MARKS.map((mark) => (
								<span
									className={`crop-mark absolute block h-5 w-5 border-white/45 sm:h-7 sm:w-7 ${mark.position} ${mark.edges}`}
									key={mark.key}
								/>
							))}
						</div>

						<div className="max-w-3xl lg:max-w-4xl">
							{/* Eyebrow — a reel marker, set on the slate. */}
							<div className="hero-badge mb-6 flex items-center gap-3 sm:mb-8">
								<span className="h-px w-8 bg-[hsl(36_84%_60%)] sm:w-12" />
								<span className="slate text-[hsl(36_84%_60%)]">Premium cultivation</span>
							</div>

							{/* The headline widens as it rises. Widescreen, stated in motion. */}
							<h1 className="hero-title mb-6 font-display font-semibold text-[clamp(2.5rem,7.2vw,6.25rem)] text-white leading-[0.88] tracking-[-0.03em] sm:mb-8">
								<span className="block">Grow</span>
								<span className="block text-[hsl(36_84%_60%)]">extraordinary</span>
								<span className="block">mushrooms</span>
							</h1>

							<p className="hero-tagline mb-8 max-w-xl text-base text-white/70 leading-relaxed sm:mb-10 sm:text-lg">
								Premium cultivation supplies for serious growers. Join 10,000+ cultivators achieving 95% success rates.
							</p>

							<div className="hero-cta flex flex-col gap-3 sm:flex-row sm:gap-4">
								<Button
									asChild
									className="group h-12 rounded-[var(--radius)] bg-primary px-8 font-medium text-base text-primary-foreground shadow-bloom transition-colors hover:bg-primary/90 sm:h-14 sm:px-10"
								>
									<PrefetchLink className="flex items-center gap-2.5" href="/products">
										Start growing
										<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
									</PrefetchLink>
								</Button>

								<Button
									asChild
									className="h-12 rounded-[var(--radius)] border border-white/30 bg-transparent px-8 font-medium text-base text-white backdrop-blur-sm transition-colors hover:border-white/60 hover:bg-white/10 hover:text-white sm:h-14 sm:px-10"
									variant="outline"
								>
									<PrefetchLink href="/collections/all">Explore products</PrefetchLink>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ---------------------------------------------------------- *
			 * Bottom letterbox bar, carrying the slate data
			 * ---------------------------------------------------------- */}
			<div className="hero-social relative z-20 border-white/10 border-t bg-[hsl(205_55%_2%)]">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<dl className="grid grid-cols-2 divide-x divide-white/10 sm:grid-cols-4">
						{SLATE_ROWS.map((row) => (
							<div className="px-4 py-4 first:pl-0 sm:py-5" key={row.label}>
								<dt className="slate text-white/40">{row.label}</dt>
								<dd className="mt-2 font-mono text-sm text-white tabular-nums sm:text-base">{row.value}</dd>
							</div>
						))}
					</dl>
				</div>
			</div>
		</section>
	);
}
