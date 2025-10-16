"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { CheckCircle, Play, Sparkles, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PrefetchLink } from "@/components/ui/prefetch-link";
import type { ShopifyProduct } from "@/lib/types";

type HeroVideoCinematicProps = {
	products?: ShopifyProduct[];
};

export function HeroVideoCinematic({ products = [] }: HeroVideoCinematicProps) {
	const [isVideoLoaded, setIsVideoLoaded] = useState(false);
	const [isMuted, setIsMuted] = useState(true);
	const [isInView, setIsInView] = useState(true); // Start true since hero is at top
	const videoRef = useRef<HTMLVideoElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const { scrollY } = useScroll();
	const scale = useTransform(scrollY, [0, 300], [1, 1.05]); // Reduced scale for better performance

	// Intersection Observer for pause/play optimization
	useEffect(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry) {
					setIsInView(entry.isIntersecting);
				}
			},
			{
				threshold: 0.25,
				rootMargin: "50px",
			}
		);

		observer.observe(container);

		return () => {
			observer.disconnect();
		};
	}, []);

	// Video playback control based on visibility
	useEffect(() => {
		const video = videoRef.current;
		if (!video) {
			return;
		}

		const handleLoadedData = () => {
			setIsVideoLoaded(true);
		};

		const handleCanPlay = () => {
			if (isInView) {
				video.play().catch(() => {
					// Silently handle autoplay failures
				});
			}
		};

		video.addEventListener("loadeddata", handleLoadedData);
		video.addEventListener("canplay", handleCanPlay);

		// Play/pause based on visibility
		if (isInView) {
			video.play().catch(() => {
				// Silently handle autoplay failures
			});
		} else {
			video.pause();
		}

		return () => {
			video.removeEventListener("loadeddata", handleLoadedData);
			video.removeEventListener("canplay", handleCanPlay);
		};
	}, [isInView]);

	const toggleMute = useCallback(() => {
		if (videoRef.current) {
			videoRef.current.muted = !isMuted;
			setIsMuted(!isMuted);
		}
	}, [isMuted]);

	return (
		<section
			className="relative h-[calc(100vh-var(--header-height))] w-full overflow-hidden bg-black"
			ref={containerRef}
		>
			{/* Video Background */}
			<motion.div className="absolute inset-0" style={{ scale }}>
				{/* Animated gradient background - fallback while video loads */}
				<div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

				{/* Animated mycelium pattern overlay - only if video not loaded */}
				{!isVideoLoaded && (
					<div className="absolute inset-0 opacity-30">
						<div
							className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_20%_30%,hsl(206_55_37/0.15)_0%,transparent_50%)]"
							style={{ animationDuration: "8s" }}
						/>
						<div
							className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_80%_70%,hsl(206_55_37/0.1)_0%,transparent_50%)]"
							style={{ animationDuration: "10s", animationDelay: "2s" }}
						/>
					</div>
				)}

				{/* Video Element */}
				<video
					autoPlay
					className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? "opacity-100" : "opacity-0"}`}
					loop
					muted={isMuted}
					playsInline
					preload="auto"
					ref={videoRef}
					style={{
						willChange: isVideoLoaded ? "auto" : "opacity",
					}}
				>
					<source src="/videos/mushroom-hero.webm" type="video/webm" />
					<source src="/videos/mushroom-hero.mp4" type="video/mp4" />
				</video>

				{/* Vignette Overlay */}
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.8)_100%)]" />

				{/* Bottom Gradient - Fades to background color */}
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-black/80 to-transparent" />

				{/* Left Gradient for text readability */}
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

				{/* Top fade */}
				<div className="pointer-events-none absolute top-0 right-0 left-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
			</motion.div>

			{/* Content */}
			<motion.div className="relative z-10 flex h-full items-center">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-3xl lg:max-w-4xl">
						{/* Small badge */}
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md sm:mb-6"
							initial={{ opacity: 0, y: 20 }}
							transition={{ duration: 0.8, delay: 0.2 }}
						>
							<Sparkles className="h-4 w-4 text-primary" />
							<span className="text-sm text-white/90 uppercase tracking-wider">Premium Cultivation</span>
						</motion.div>

						{/* Main Headline - Netflix style */}
						<motion.h1
							animate={{ opacity: 1, y: 0 }}
							className="mb-4 font-black text-5xl text-white leading-[1.1] tracking-tight sm:mb-6 sm:text-6xl md:text-7xl lg:text-8xl"
							initial={{ opacity: 0, y: 30 }}
							transition={{ duration: 0.8, delay: 0.4 }}
						>
							<span className="block">Grow</span>
							<span className="block text-primary">Extraordinary</span>
							<span className="block">Mushrooms</span>
						</motion.h1>

						{/* Tagline */}
						<motion.p
							animate={{ opacity: 1, y: 0 }}
							className="mb-6 max-w-2xl text-lg text-white/90 leading-relaxed sm:mb-8 sm:text-xl lg:text-2xl"
							initial={{ opacity: 0, y: 30 }}
							transition={{ duration: 0.8, delay: 0.6 }}
						>
							Premium cultivation supplies for serious growers. Join 10,000+ cultivators achieving 95% success rates.
						</motion.p>

						{/* CTAs - Netflix style */}
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							className="flex flex-col gap-3 sm:flex-row sm:gap-4"
							initial={{ opacity: 0, y: 30 }}
							transition={{ duration: 0.8, delay: 0.8 }}
						>
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
						</motion.div>

						{/* Social Proof */}
						<motion.div
							animate={{ opacity: 1 }}
							className="mt-8 flex flex-wrap items-center gap-4 sm:mt-12 sm:gap-6"
							initial={{ opacity: 0 }}
							transition={{ duration: 0.8, delay: 1 }}
						>
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
						</motion.div>
					</div>
				</div>
			</motion.div>

			{/* Scroll Indicator */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="absolute right-0 bottom-8 left-0 z-20 flex justify-center"
				initial={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.8, delay: 1.2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
			>
				<div className="flex flex-col items-center gap-2">
					<span className="text-white/50 text-xs uppercase tracking-widest">Scroll</span>
					<div className="h-8 w-5 rounded-full border-2 border-white/30">
						<motion.div
							animate={{ y: [0, 12, 0] }}
							className="mx-auto mt-1.5 h-1.5 w-1.5 rounded-full bg-white/70"
							transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
						/>
					</div>
				</div>
			</motion.div>

			{/* Mute Toggle Button */}
			<button
				aria-label={isMuted ? "Unmute" : "Mute"}
				className="absolute right-4 bottom-4 z-20 rounded-full border border-white/20 bg-black/50 p-3 backdrop-blur-md transition-all hover:bg-black/70 sm:right-8 sm:bottom-8"
				onClick={toggleMute}
			>
				{isMuted ? (
					<svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
						/>
					</svg>
				) : (
					<svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
						/>
					</svg>
				)}
			</button>
		</section>
	);
}
