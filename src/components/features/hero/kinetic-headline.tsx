"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const words = ["GROW", "EXTRAORDINARY", "MUSHROOMS"];

export function KineticHeadline() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<div className="relative overflow-hidden" ref={ref}>
			<div className="space-y-2 sm:space-y-4">
				{words.map((word, wordIndex) => {
					const letters = word.split("");
					const isMiddleWord = wordIndex === 1;

					return (
						<div className="relative overflow-hidden" key={word}>
							<div className="flex items-center justify-start gap-1 sm:gap-2">
								{letters.map((letter, letterIndex) => {
									const delay = wordIndex * 0.3 + letterIndex * 0.05;

									return (
										<motion.span
											animate={
												isInView
													? {
															opacity: 1,
															y: 0,
															scaleY: 1,
															filter: "blur(0px)",
														}
													: {}
											}
											className={`inline-block font-black tracking-tighter ${
												isMiddleWord
													? "bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent"
													: "text-white"
											}`}
											initial={{
												opacity: 0,
												y: 100,
												scaleY: 0.5,
												filter: "blur(10px)",
											}}
											key={`${word}-${letterIndex}`}
											style={{
												fontSize: "clamp(2rem, 8vw, 6rem)",
												lineHeight: 1,
											}}
											transition={{
												duration: 0.8,
												delay,
												ease: [0.22, 1, 0.36, 1],
											}}
											whileHover={{
												scale: 1.1,
												color: isMiddleWord ? undefined : "hsl(206 55 37)",
												transition: { duration: 0.2 },
											}}
										>
											{letter}
										</motion.span>
									);
								})}
							</div>

							{/* Animated underline for middle word */}
							{isMiddleWord && (
								<motion.div
									animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
									className="mt-2 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
									initial={{ scaleX: 0, opacity: 0 }}
									transition={{
										duration: 1.2,
										delay: wordIndex * 0.3 + 0.5,
										ease: [0.22, 1, 0.36, 1],
									}}
								/>
							)}
						</div>
					);
				})}
			</div>

			{/* Subtitle */}
			<motion.p
				animate={isInView ? { opacity: 1, y: 0 } : {}}
				className="mt-6 max-w-2xl text-lg text-white/70 sm:text-xl"
				initial={{ opacity: 0, y: 20 }}
				transition={{ duration: 0.8, delay: 1.2 }}
			>
				Premium cultivation supplies engineered for serious growers.
				<br />
				<span className="text-white">Science-backed. Results-driven.</span>
			</motion.p>

			{/* CTA Buttons */}
			<motion.div
				animate={isInView ? { opacity: 1, y: 0 } : {}}
				className="mt-8 flex flex-wrap gap-4"
				initial={{ opacity: 0, y: 20 }}
				transition={{ duration: 0.8, delay: 1.4 }}
			>
				<motion.button
					className="group relative overflow-hidden rounded-full bg-primary px-8 py-4 font-semibold text-white transition-all hover:shadow-2xl hover:shadow-primary/50"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					<span className="relative z-10 flex items-center gap-2">
						Start Growing
						<motion.svg
							className="h-5 w-5"
							fill="none"
							initial={{ x: 0 }}
							stroke="currentColor"
							strokeWidth="2"
							transition={{ duration: 0.3 }}
							viewBox="0 0 24 24"
							whileHover={{ x: 5 }}
						>
							<path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" />
						</motion.svg>
					</span>
					<motion.div
						className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600"
						initial={{ x: "-100%" }}
						transition={{ duration: 0.3 }}
						whileHover={{ x: 0 }}
					/>
				</motion.button>

				<motion.button
					className="rounded-full border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-xl transition-all hover:border-white/40 hover:bg-white/10"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					Explore Products
				</motion.button>
			</motion.div>

			{/* Floating particles */}
			<div className="pointer-events-none absolute inset-0">
				{[...new Array(5)].map((_, i) => (
					<motion.div
						animate={{
							y: [-20, 20, -20],
							opacity: [0, 1, 0],
						}}
						className="absolute h-1 w-1 rounded-full bg-primary/40"
						key={i}
						style={{
							left: `${20 + i * 15}%`,
							top: `${30 + i * 10}%`,
						}}
						transition={{
							duration: 3 + i,
							repeat: Number.POSITIVE_INFINITY,
							delay: i * 0.5,
						}}
					/>
				))}
			</div>
		</div>
	);
}
