"use client";

import { motion } from "framer-motion";
import {
	Award,
	Box,
	Clock,
	CreditCard,
	Headphones,
	HeartHandshake,
	Leaf,
	Package,
	Shield,
	ShieldCheck,
	Star,
	Truck,
	Users,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatedGradientBg, FloatingOrbs, MeshGradientBg } from "@/components/ui/animated-gradient-bg";
import { AnimatedCounter, StatCardVisual } from "@/components/ui/stat-card-visual";
import { cn } from "@/lib/utils";

type WhyChooseBentoV2Props = {
	brandName?: string;
	tagline?: string;
	className?: string;
};

export function WhyChooseBentoV2({
	brandName = "Zugzology",
	tagline = "Premium Mushroom Cultivation Supplies",
	className,
}: WhyChooseBentoV2Props) {
	const [isMobile, setIsMobile] = useState(true);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 640);
		};

		// Check on mount
		checkMobile();

		// Check on resize
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Disable animations on mobile
	const animateProps = (props: any) => (isMobile ? {} : props);

	return (
		<section className={cn("border-border/70 border-b bg-gradient-to-b from-background to-muted/20", className)}>
			<div className="container mx-auto px-4 py-8 sm:py-12 lg:py-20">
				{/* Header Section */}
				<motion.div
					className="mb-8 text-center sm:mb-12 lg:mb-16"
					{...animateProps({
						initial: { opacity: 0, y: 20 },
						transition: { duration: 0.6 },
						viewport: { once: true },
						whileInView: { opacity: 1, y: 0 },
					})}
				>
					<h2 className="mb-3 font-bold text-2xl text-foreground tracking-tight sm:mb-4 sm:text-4xl lg:text-5xl">
						Why Choose {brandName}?
					</h2>
					<p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">{tagline}</p>
				</motion.div>

				{/* Asymmetric Bento Grid - Apple Style */}
				<div className="mx-auto grid max-w-7xl auto-rows-[minmax(140px,auto)] grid-cols-1 gap-3 sm:auto-rows-[minmax(180px,auto)] sm:grid-cols-2 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
					{/* Large Hero Card - Community Stats */}
					<motion.div
						className="group relative min-h-[220px] overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 shadow-xl sm:col-span-2 sm:min-h-[300px] sm:p-8 md:col-span-2 md:row-span-2"
						{...animateProps({
							initial: { opacity: 0, scale: 0.95 },
							transition: { duration: 0.5, delay: 0.1 },
							viewport: { once: true },
							whileInView: { opacity: 1, scale: 1 },
						})}
					>
						<MeshGradientBg disableAnimation={isMobile} />
						<div className="relative z-10 flex h-full flex-col justify-between">
							<div className="mb-4 sm:mb-6">
								<motion.div
									className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/30 px-3 py-1.5 shadow-lg sm:mb-4 sm:gap-2 sm:px-4 sm:py-2"
									{...animateProps({
										animate: { scale: [1, 1.05, 1] },
										transition: { duration: 3, repeat: Number.POSITIVE_INFINITY },
									})}
								>
									<Users className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
									<span className="font-bold text-primary text-xs sm:text-sm">TRUSTED COMMUNITY</span>
								</motion.div>
								<h3 className="mb-2 font-bold text-foreground text-xl sm:mb-3 sm:text-3xl">Join 10,000+ Growers</h3>
								<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
									Part of a thriving community of mycology enthusiasts sharing knowledge and success stories every day.
								</p>
							</div>
							<div className="flex items-center gap-3 sm:gap-6">
								<div className="rounded-xl bg-background/60 p-2 backdrop-blur-sm sm:p-4">
									<motion.div
										className="font-bold text-2xl text-primary sm:text-4xl"
										{...animateProps({
											animate: { scale: [1, 1.1, 1] },
											transition: { duration: 2, repeat: Number.POSITIVE_INFINITY },
										})}
									>
										4.9★
									</motion.div>
									<div className="text-[10px] text-muted-foreground sm:text-xs">Avg Rating</div>
								</div>
								<div className="rounded-xl bg-background/60 p-2 backdrop-blur-sm sm:p-4">
									<div className="font-bold text-2xl text-foreground sm:text-4xl">2.5k+</div>
									<div className="text-[10px] text-muted-foreground sm:text-xs">Reviews</div>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Animated Counter Card - Orders */}
					<motion.div
						className="relative min-h-[140px] overflow-hidden rounded-2xl border-2 border-green-500/20 bg-gradient-to-br from-green-500/15 to-emerald-500/10 shadow-lg sm:col-span-2 sm:min-h-[200px] md:col-span-2 lg:col-span-2"
						{...animateProps({
							initial: { opacity: 0, y: 20 },
							transition: { duration: 0.5, delay: 0.2 },
							viewport: { once: true },
							whileHover: { scale: 1.02, borderColor: "hsl(142 76 36 / 0.4)" },
							whileInView: { opacity: 1, y: 0 },
						})}
					>
						<AnimatedGradientBg
							colors={["hsl(142 76 36)", "hsl(142 71 45)", "hsl(142 76 36)"]}
							disableAnimation={isMobile}
							speed="slow"
						/>
						<AnimatedCounter disableAnimation={isMobile} label="Orders Shipped" target={25_000} />
					</motion.div>

					{/* Fast Shipping Card with Icon Animation */}
					<motion.div
						className="group relative min-h-[140px] overflow-hidden rounded-2xl border-2 border-primary/20 bg-card p-4 shadow-lg sm:col-span-2 sm:min-h-[180px] sm:p-6 md:col-span-2 lg:col-span-2"
						{...animateProps({
							initial: { opacity: 0, x: -20 },
							transition: { duration: 0.5, delay: 0.3 },
							viewport: { once: true },
							whileHover: { scale: 1.03, rotateY: 2, borderColor: "hsl(206 55 37 / 0.4)" },
							whileInView: { opacity: 1, x: 0 },
						})}
					>
						<FloatingOrbs className="opacity-20" disableAnimation={isMobile} />
						<div className="relative z-10">
							<motion.div
								className="mb-2 inline-flex rounded-xl bg-primary/20 p-3 text-primary shadow-xl sm:mb-4 sm:p-4"
								{...animateProps({
									animate: { x: [0, 15, 0] },
									transition: { duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
								})}
							>
								<Truck className="h-8 w-8 sm:h-10 sm:w-10" />
							</motion.div>
							<h3 className="mb-1.5 font-bold text-foreground text-lg sm:mb-2 sm:text-2xl">Free Shipping</h3>
							<p className="text-muted-foreground text-sm sm:text-base">
								On orders over $50 with lightning-fast delivery
							</p>
						</div>
					</motion.div>

					{/* Quality Badge Card */}
					<motion.div
						className="group relative min-h-[220px] overflow-hidden rounded-2xl border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/15 to-orange-500/10 p-4 shadow-xl sm:col-span-2 sm:min-h-[300px] sm:p-8 md:col-span-2 md:row-span-2 lg:col-span-2"
						{...animateProps({
							initial: { opacity: 0, y: 20 },
							transition: { duration: 0.5, delay: 0.4 },
							viewport: { once: true },
							whileInView: { opacity: 1, y: 0 },
						})}
					>
						<AnimatedGradientBg
							colors={["hsl(38 92 50)", "hsl(25 95 53)", "hsl(38 92 50)"]}
							disableAnimation={isMobile}
							speed="medium"
						/>
						<div className="relative z-10 flex h-full flex-col justify-between">
							<motion.div
								className="inline-flex self-start rounded-2xl bg-amber-500/30 p-3 shadow-xl sm:p-5"
								{...animateProps({
									animate: { rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] },
									transition: { duration: 5, repeat: Number.POSITIVE_INFINITY },
								})}
							>
								<Award className="h-10 w-10 text-amber-600 drop-shadow-lg sm:h-14 sm:w-14" />
							</motion.div>
							<div>
								<h3 className="mb-2 font-bold text-foreground text-xl sm:mb-3 sm:text-3xl">Lab-Tested Quality</h3>
								<p className="mb-3 text-muted-foreground text-sm leading-relaxed sm:mb-4 sm:text-base">
									Every product undergoes rigorous testing for contamination, viability, and genetic integrity.
								</p>
								<motion.div
									className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-600/30 bg-amber-500/20 px-3 py-1.5 text-amber-700 shadow-lg sm:gap-2 sm:px-5 sm:py-2.5 dark:text-amber-400"
									{...animateProps({
										animate: { scale: [1, 1.05, 1] },
										transition: { duration: 3, repeat: Number.POSITIVE_INFINITY },
									})}
								>
									<ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
									<span className="font-bold text-xs sm:text-sm">ISO CERTIFIED</span>
								</motion.div>
							</div>
						</div>
					</motion.div>

					{/* Expert Support Card with Pulse */}
					<motion.div
						className="relative hidden min-h-[140px] overflow-hidden rounded-2xl border-2 border-primary/20 bg-card p-4 shadow-lg sm:col-span-2 sm:block sm:min-h-[180px] sm:p-6 md:col-span-2 lg:col-span-2"
						{...animateProps({
							initial: { opacity: 0, scale: 0.9 },
							transition: { duration: 0.5, delay: 0.5 },
							viewport: { once: true },
							whileHover: { scale: 1.05, rotate: 3, borderColor: "hsl(206 55 37 / 0.4)" },
							whileInView: { opacity: 1, scale: 1 },
						})}
					>
						<div className="relative z-10">
							<div className="relative mb-2 inline-flex sm:mb-4">
								<motion.div
									className="absolute inset-0 rounded-2xl bg-primary/40 blur-2xl"
									{...animateProps({
										animate: { scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] },
										transition: { duration: 3, repeat: Number.POSITIVE_INFINITY },
									})}
								/>
								<div className="relative rounded-2xl bg-primary/20 p-3 text-primary shadow-xl sm:p-4">
									<Leaf className="h-8 w-8 sm:h-10 sm:w-10" />
								</div>
							</div>
							<h3 className="mb-1.5 font-bold text-foreground text-lg sm:mb-2 sm:text-2xl">Expert Mycologists</h3>
							<p className="text-muted-foreground text-sm sm:text-base">
								Get answers from our team of certified cultivation experts
							</p>
						</div>
					</motion.div>

					{/* Particle Card - Discreet Shipping */}
					<motion.div
						className="group relative min-h-[140px] overflow-hidden rounded-2xl border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/15 to-pink-500/10 p-4 shadow-lg sm:col-span-2 sm:min-h-[180px] sm:p-6 md:col-span-2 lg:col-span-2"
						{...animateProps({
							initial: { opacity: 0, x: 20 },
							transition: { duration: 0.5, delay: 0.6 },
							viewport: { once: true },
							whileHover: { scale: 1.05, borderColor: "hsl(280 60 50 / 0.4)" },
							whileInView: { opacity: 1, x: 0 },
						})}
					>
						<FloatingOrbs disableAnimation={isMobile} />
						<div className="relative z-10">
							<motion.div
								className="mb-2 inline-flex rounded-2xl bg-purple-500/20 p-3 text-purple-600 shadow-xl sm:mb-4 sm:p-4 dark:text-purple-400"
								{...animateProps({
									animate: { y: [0, -15, 0] },
									transition: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
								})}
							>
								<Box className="h-8 w-8 sm:h-10 sm:w-10" />
							</motion.div>
							<h3 className="mb-1.5 font-bold text-foreground text-lg sm:mb-2 sm:text-2xl">100% Discreet</h3>
							<p className="text-muted-foreground text-sm sm:text-base">
								Plain packaging, zero branding, complete privacy guaranteed
							</p>
						</div>
					</motion.div>

					{/* Stats Card - Response Time */}
					<motion.div
						className="relative hidden min-h-[140px] overflow-hidden rounded-2xl border-2 border-primary/20 bg-card shadow-lg sm:col-span-2 sm:block sm:min-h-[200px] md:col-span-2 lg:col-span-2 lg:row-span-2"
						{...animateProps({
							initial: { opacity: 0, y: 20 },
							transition: { duration: 0.5, delay: 0.7 },
							viewport: { once: true },
							whileHover: { scale: 1.03, borderColor: "hsl(206 55 37 / 0.4)" },
							whileInView: { opacity: 1, y: 0 },
						})}
					>
						<StatCardVisual
							disableAnimation={isMobile}
							label="Avg Response Time"
							showChart={true}
							trend={-15}
							value="< 2h"
						/>
					</motion.div>

					{/* 24/7 Support Card */}
					<motion.div
						className="group relative min-h-[220px] overflow-hidden rounded-2xl border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/15 to-cyan-500/10 p-4 shadow-xl sm:col-span-2 sm:min-h-[300px] sm:p-8 md:col-span-2 md:row-span-2 lg:col-span-2"
						{...animateProps({
							initial: { opacity: 0, scale: 0.9 },
							transition: { duration: 0.5, delay: 0.8 },
							viewport: { once: true },
							whileInView: { opacity: 1, scale: 1 },
						})}
					>
						<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(206_55_37_/_0.1),transparent_50%)]" />
						<div className="relative z-10 flex h-full flex-col justify-between">
							<div>
								<div className="mb-3 flex items-center gap-3 sm:mb-6 sm:gap-4">
									<motion.div
										className="rounded-2xl bg-blue-500/20 p-3 text-blue-600 shadow-lg sm:p-4 dark:text-blue-400"
										{...animateProps({
											animate: { rotate: 360 },
											transition: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
										})}
									>
										<Clock className="h-8 w-8 sm:h-10 sm:w-10" />
									</motion.div>
									<div className="flex items-baseline gap-1.5 sm:gap-2">
										<motion.span
											className="font-bold text-3xl text-foreground sm:text-5xl"
											{...animateProps({
												animate: { scale: [1, 1.1, 1] },
												transition: { duration: 2, repeat: Number.POSITIVE_INFINITY },
											})}
										>
											24
										</motion.span>
										<span className="text-2xl text-muted-foreground sm:text-3xl">/</span>
										<motion.span
											className="font-bold text-3xl text-foreground sm:text-5xl"
											{...animateProps({
												animate: { scale: [1, 1.1, 1] },
												transition: { duration: 2, delay: 0.5, repeat: Number.POSITIVE_INFINITY },
											})}
										>
											7
										</motion.span>
									</div>
								</div>
								<h3 className="mb-1.5 font-bold text-foreground text-lg sm:mb-2 sm:text-2xl">Always Available</h3>
								<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
									Comprehensive knowledge base and support system ready whenever you need help
								</p>
							</div>
							<div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
								{[...new Array(3)].map((_, i) => (
									<motion.div
										className="h-1.5 rounded-full bg-blue-500 shadow-blue-500/50 shadow-lg sm:h-2"
										key={i}
										{...animateProps({
											animate: { opacity: [0.2, 1, 0.2], scale: [1, 1.1, 1] },
											transition: {
												duration: 2,
												repeat: Number.POSITIVE_INFINITY,
												delay: i * 0.4,
											},
										})}
									/>
								))}
							</div>
						</div>
					</motion.div>

					{/* Guarantee Card with Badge */}
					<motion.div
						className="group relative min-h-[140px] overflow-hidden rounded-2xl border-2 border-rose-500/20 bg-gradient-to-br from-rose-500/15 to-pink-500/10 p-4 shadow-lg sm:col-span-2 sm:min-h-[180px] sm:p-6 md:col-span-2 lg:col-span-2"
						{...animateProps({
							initial: { opacity: 0, x: -20 },
							transition: { duration: 0.5, delay: 0.9 },
							viewport: { once: true },
							whileHover: { scale: 1.05, rotate: -3, borderColor: "hsl(350 70 50 / 0.4)" },
							whileInView: { opacity: 1, x: 0 },
						})}
					>
						<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_hsl(350_70_50_/_0.15),transparent_60%)]" />
						<div className="relative z-10">
							<motion.div
								className="mb-2 inline-flex rounded-2xl bg-rose-500/20 p-3 text-rose-600 shadow-xl sm:mb-4 sm:p-4 dark:text-rose-400"
								{...animateProps({
									animate: {
										scale: [1, 1.15, 1],
										rotate: [0, 10, -10, 0],
									},
									transition: { duration: 5, repeat: Number.POSITIVE_INFINITY },
								})}
							>
								<HeartHandshake className="h-8 w-8 sm:h-10 sm:w-10" />
							</motion.div>
							<div className="mb-1.5 flex items-center gap-1.5 sm:mb-2 sm:gap-2">
								<h3 className="font-bold text-foreground text-lg sm:text-2xl">30-Day</h3>
								<motion.span
									className="rounded-full border-2 border-rose-500/30 bg-rose-500/20 px-2.5 py-0.5 font-bold text-rose-600 text-xs shadow-lg sm:px-4 sm:py-1 sm:text-sm dark:text-rose-400"
									{...animateProps({
										animate: { scale: [1, 1.1, 1] },
										transition: { duration: 2, repeat: Number.POSITIVE_INFINITY },
									})}
								>
									GUARANTEE
								</motion.span>
							</div>
							<p className="text-muted-foreground text-sm sm:text-base">
								100% money-back if you're not completely satisfied
							</p>
						</div>
					</motion.div>

					{/* Premium Products - Large Visual Card - Hidden on Mobile */}
					<motion.div
						className="group relative hidden min-h-[280px] overflow-hidden rounded-2xl border-2 border-border bg-card shadow-2xl sm:col-span-2 sm:block sm:min-h-[400px] md:col-span-4 md:row-span-2 lg:col-span-4"
						{...animateProps({
							initial: { opacity: 0, y: 20 },
							transition: { duration: 0.5, delay: 1 },
							viewport: { once: true },
							whileInView: { opacity: 1, y: 0 },
						})}
					>
						<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
						<FloatingOrbs className="opacity-30" disableAnimation={isMobile} />

						<div className="relative z-10 grid h-full gap-6 p-4 sm:gap-8 sm:p-8 md:grid-cols-2">
							{/* Left side - Content */}
							<div className="flex flex-col justify-center">
								<motion.div
									className="mb-4 inline-flex self-start rounded-2xl bg-primary/20 p-3 text-primary shadow-xl sm:mb-6 sm:p-5"
									{...animateProps({
										animate: { rotate: [0, 360] },
										transition: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
									})}
								>
									<ShieldCheck className="h-8 w-8 sm:h-12 sm:w-12" />
								</motion.div>
								<h3 className="mb-2 font-bold text-2xl text-foreground sm:mb-3 sm:text-4xl">Premium Selection</h3>
								<p className="mb-4 text-muted-foreground text-sm leading-relaxed sm:mb-6 sm:text-base">
									Every product is carefully selected, tested, and verified for maximum cultivation success.
								</p>
								<div className="space-y-3">
									{["Lab Tested", "Quality Verified", "Contamination Free"].map((item, i) => (
										<motion.div
											className="flex items-center gap-3"
											key={item}
											{...animateProps({
												animate: { x: [0, 8, 0] },
												transition: { duration: 2, delay: i * 0.3, repeat: Number.POSITIVE_INFINITY },
											})}
										>
											<motion.div
												className="h-3 w-3 rounded-full bg-primary shadow-lg shadow-primary/50"
												{...animateProps({
													animate: { scale: [1, 1.3, 1] },
													transition: {
														duration: 2,
														delay: i * 0.3,
														repeat: Number.POSITIVE_INFINITY,
													},
												})}
											/>
											<span className="font-medium text-foreground">{item}</span>
										</motion.div>
									))}
								</div>
							</div>

							{/* Right side - Visual Element */}
							<div className="flex items-center justify-center">
								<div className="relative h-64 w-64">
									{/* Animated Rings */}
									{[...new Array(3)].map((_, i) => (
										<motion.div
											className="absolute inset-0 rounded-full border-2 border-primary"
											key={i}
											style={{
												width: `${140 + i * 50}px`,
												height: `${140 + i * 50}px`,
												left: "50%",
												top: "50%",
												transform: "translate(-50%, -50%)",
											}}
											{...animateProps({
												animate: { scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] },
												transition: {
													duration: 4,
													repeat: Number.POSITIVE_INFINITY,
													delay: i * 0.7,
													ease: "easeInOut",
												},
											})}
										/>
									))}
									{/* Center Icon */}
									<motion.div
										className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-2xl"
										{...animateProps({
											animate: { rotate: 360 },
											transition: { duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
										})}
									>
										<motion.div
											{...animateProps({
												animate: { scale: [1, 1.2, 1] },
												transition: { duration: 2, repeat: Number.POSITIVE_INFINITY },
											})}
										>
											<Star className="h-20 w-20 text-white drop-shadow-lg" fill="currentColor" />
										</motion.div>
									</motion.div>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Lightning Fast Card - Hidden on Mobile */}
					<motion.div
						className="group relative hidden min-h-[140px] overflow-hidden rounded-2xl border-2 border-yellow-500/20 bg-gradient-to-br from-yellow-500/15 to-amber-500/10 p-4 shadow-lg sm:col-span-2 sm:block sm:min-h-[180px] sm:p-6 md:col-span-2 lg:col-span-2"
						{...animateProps({
							initial: { opacity: 0, scale: 0.9 },
							transition: { duration: 0.5, delay: 1.1 },
							viewport: { once: true },
							whileHover: { scale: 1.05, borderColor: "hsl(45 93 47 / 0.5)" },
							whileInView: { opacity: 1, scale: 1 },
						})}
					>
						<div className="pointer-events-none absolute inset-0">
							<motion.div
								className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_hsl(45_93_47_/_0.2),transparent_60%)]"
								{...animateProps({
									animate: { opacity: [0.2, 0.4, 0.2] },
									transition: { duration: 2, repeat: Number.POSITIVE_INFINITY },
								})}
							/>
						</div>
						<div className="relative z-10">
							<motion.div
								className="mb-2 inline-flex rounded-2xl bg-yellow-500/20 p-3 text-yellow-600 shadow-xl sm:mb-4 sm:p-4 dark:text-yellow-400"
								{...animateProps({
									animate: {
										scale: [1, 1.3, 1],
										rotate: [0, 180, 360],
									},
									transition: { duration: 3, repeat: Number.POSITIVE_INFINITY },
								})}
							>
								<Zap className="h-8 w-8 sm:h-10 sm:w-10" fill="currentColor" />
							</motion.div>
							<h3 className="mb-1.5 font-bold text-foreground text-lg sm:mb-2 sm:text-2xl">Lightning Fast</h3>
							<p className="text-muted-foreground text-sm sm:text-base">
								Same-day processing on orders placed before 2PM EST
							</p>
						</div>
					</motion.div>

					{/* Package Tracking Card - Hidden on Mobile */}
					<motion.div
						className="relative hidden min-h-[160px] overflow-hidden rounded-2xl border-2 border-primary/20 bg-card p-4 shadow-lg sm:col-span-2 sm:block sm:min-h-[220px] sm:p-6 md:col-span-2 lg:col-span-2"
						initial={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.5, delay: 1.2 }}
						viewport={{ once: true }}
						whileHover={{ scale: 1.03, borderColor: "hsl(206 55 37 / 0.4)" }}
						whileInView={{ opacity: 1, y: 0 }}
					>
						<div className="relative z-10">
							<motion.div
								animate={{ y: [0, -20, 0] }}
								className="mb-2 inline-flex rounded-2xl bg-primary/20 p-3 text-primary shadow-xl sm:mb-4 sm:p-4"
								transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
							>
								<Package className="h-8 w-8 sm:h-10 sm:w-10" />
							</motion.div>
							<h3 className="mb-1.5 font-bold text-foreground text-lg sm:mb-2 sm:text-2xl">Real-Time Tracking</h3>
							<p className="mb-3 text-muted-foreground text-sm sm:mb-4 sm:text-base">
								Follow your order from our facility to your doorstep
							</p>
							<div className="flex h-12 items-end gap-1 sm:h-16">
								{[...new Array(5)].map((_, i) => (
									<motion.div
										animate={{ height: ["30%", "100%", "30%"] }}
										className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/60 shadow-lg"
										key={i}
										transition={{
											duration: 1.8,
											repeat: Number.POSITIVE_INFINITY,
											delay: i * 0.2,
											ease: "easeInOut",
										}}
									/>
								))}
							</div>
						</div>
					</motion.div>

					{/* Secure Checkout - SSL Card - Hidden on Mobile */}
					<motion.div
						className="group relative hidden min-h-[140px] overflow-hidden rounded-2xl border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 to-teal-500/10 p-4 shadow-lg sm:col-span-2 sm:block sm:min-h-[200px] sm:p-6 md:col-span-2 lg:col-span-2"
						initial={{ opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.5, delay: 1.3 }}
						viewport={{ once: true }}
						whileHover={{ scale: 1.05, borderColor: "hsl(142 71 45 / 0.4)" }}
						whileInView={{ opacity: 1, scale: 1 }}
					>
						<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(142_71_45_/_0.15),transparent_60%)]" />
						<div className="relative z-10">
							<div className="relative mb-2 inline-flex sm:mb-4">
								<motion.div
									animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
									className="absolute inset-0 rounded-2xl bg-emerald-500/40 blur-xl"
									transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
								/>
								<div className="relative rounded-2xl bg-emerald-500/20 p-3 text-emerald-600 shadow-xl sm:p-4 dark:text-emerald-400">
									<Shield className="h-8 w-8 sm:h-10 sm:w-10" />
								</div>
							</div>
							<h3 className="mb-1.5 font-bold text-foreground text-lg sm:mb-2 sm:text-2xl">Secure Checkout</h3>
							<p className="mb-2 text-muted-foreground text-sm sm:mb-3 sm:text-base">
								SSL encrypted payment with bank-level security
							</p>
							<div className="flex gap-1.5 sm:gap-2">
								{["SSL", "PCI-DSS", "256-bit"].map((item, i) => (
									<motion.div
										animate={{ opacity: [0.5, 1, 0.5], y: [0, -3, 0] }}
										className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-2 py-0.5 font-bold text-[10px] text-emerald-700 sm:px-3 sm:py-1 sm:text-xs dark:text-emerald-400"
										key={item}
										transition={{
											duration: 2,
											delay: i * 0.4,
											repeat: Number.POSITIVE_INFINITY,
										}}
									>
										{item}
									</motion.div>
								))}
							</div>
						</div>
					</motion.div>

					{/* Quick Delivery - Ships within 24hrs - Hidden on Mobile */}
					<motion.div
						className="relative hidden min-h-[140px] overflow-hidden rounded-2xl border-2 border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-violet-500/10 p-4 shadow-lg sm:col-span-2 sm:block sm:min-h-[180px] sm:p-6 md:col-span-2 lg:col-span-2"
						initial={{ opacity: 0, x: 20 }}
						transition={{ duration: 0.5, delay: 1.4 }}
						viewport={{ once: true }}
						whileHover={{ scale: 1.05, borderColor: "hsl(239 84 67 / 0.4)" }}
						whileInView={{ opacity: 1, x: 0 }}
					>
						<div className="relative z-10">
							<motion.div
								animate={{
									x: [0, 20, 0],
									rotate: [0, 15, -15, 0],
								}}
								className="mb-2 inline-flex rounded-2xl bg-indigo-500/20 p-3 text-indigo-600 shadow-xl sm:mb-4 sm:p-4 dark:text-indigo-400"
								transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
							>
								<Package className="h-8 w-8 sm:h-10 sm:w-10" />
							</motion.div>
							<h3 className="mb-1.5 font-bold text-foreground text-lg sm:mb-2 sm:text-2xl">Ships in 24 Hours</h3>
							<p className="mb-2 text-muted-foreground text-sm sm:mb-3 sm:text-base">
								Order today, ships tomorrow - guaranteed
							</p>
							<motion.div
								animate={{ scale: [1, 1.1, 1] }}
								className="inline-flex items-center gap-1.5 rounded-full border-2 border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-indigo-700 shadow-lg sm:gap-2 sm:px-4 sm:py-2 dark:text-indigo-400"
								transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
							>
								<Clock className="h-3 w-3 sm:h-4 sm:w-4" />
								<span className="font-bold text-[10px] sm:text-xs">24-HR FULFILLMENT</span>
							</motion.div>
						</div>
					</motion.div>

					{/* Expert Support Hours - Hidden on Mobile */}
					<motion.div
						className="relative hidden min-h-[140px] overflow-hidden rounded-2xl border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/15 to-amber-500/10 p-4 shadow-lg sm:col-span-2 sm:block sm:min-h-[180px] sm:p-6 md:col-span-2 lg:col-span-3"
						initial={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.5, delay: 1.5 }}
						viewport={{ once: true }}
						whileHover={{ scale: 1.05, borderColor: "hsl(25 95 53 / 0.4)" }}
						whileInView={{ opacity: 1, y: 0 }}
					>
						<div className="relative z-10">
							<div className="relative mb-2 inline-flex sm:mb-4">
								<motion.div
									animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 360] }}
									className="absolute inset-0 rounded-2xl bg-orange-500/40 blur-xl"
									transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
								/>
								<div className="relative rounded-2xl bg-orange-500/20 p-3 text-orange-600 shadow-xl sm:p-4 dark:text-orange-400">
									<Headphones className="h-8 w-8 sm:h-10 sm:w-10" />
								</div>
							</div>
							<h3 className="mb-1.5 font-bold text-foreground text-lg sm:mb-2 sm:text-2xl">Expert Support</h3>
							<p className="mb-1.5 text-muted-foreground text-sm sm:mb-2 sm:text-base">
								Professional mycologists ready to help with your questions
							</p>
							<div className="font-bold text-orange-600 text-xs sm:text-sm dark:text-orange-400">
								Mon-Fri, 9am-5pm EST
							</div>
						</div>
					</motion.div>

					{/* Payment Options Card - Hidden on Mobile */}
					<motion.div
						className="relative hidden min-h-[140px] overflow-hidden rounded-2xl border-2 border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 to-blue-500/10 p-4 shadow-lg sm:col-span-2 sm:block sm:min-h-[200px] sm:p-6 md:col-span-2 lg:col-span-3"
						initial={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.5, delay: 1.6 }}
						viewport={{ once: true }}
						whileHover={{ scale: 1.03, borderColor: "hsl(189 94 43 / 0.4)" }}
						whileInView={{ opacity: 1, x: 0 }}
					>
						<div className="relative z-10">
							<motion.div
								animate={{ rotateY: [0, 180, 360] }}
								className="mb-2 inline-flex rounded-2xl bg-cyan-500/20 p-3 text-cyan-600 shadow-xl sm:mb-4 sm:p-4 dark:text-cyan-400"
								style={{ transformStyle: "preserve-3d" }}
								transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
							>
								<CreditCard className="h-8 w-8 sm:h-10 sm:w-10" />
							</motion.div>
							<h3 className="mb-1.5 font-bold text-foreground text-lg sm:mb-2 sm:text-2xl">All Payment Methods</h3>
							<p className="mb-3 text-muted-foreground text-sm sm:mb-4 sm:text-base">
								Credit cards, PayPal, Apple Pay, Shop Pay accepted
							</p>
							<div className="flex flex-wrap gap-1.5 sm:gap-2">
								{["Visa", "Mastercard", "Amex", "PayPal", "Shop Pay"].map((card, i) => (
									<motion.div
										animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
										className="rounded-lg border-2 border-cyan-600/20 bg-cyan-500/10 px-2 py-1 font-bold text-[10px] text-cyan-700 sm:px-3 sm:py-1.5 sm:text-xs dark:text-cyan-400"
										key={card}
										transition={{
											duration: 2,
											delay: i * 0.3,
											repeat: Number.POSITIVE_INFINITY,
										}}
									>
										{card}
									</motion.div>
								))}
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
