"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function GrowthAnimation() {
	const [rings, setRings] = useState<number[]>([]);

	useEffect(() => {
		// Add growth rings progressively
		const interval = setInterval(() => {
			setRings((prev) => {
				if (prev.length >= 8) {
					return prev;
				}
				return [...prev, prev.length];
			});
		}, 400);

		return () => {
			clearInterval(interval);
		};
	}, []);

	return (
		<div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black via-primary/5 to-black p-8 backdrop-blur-xl">
			{/* Animated gradient background */}
			<div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_50%,hsl(206_55_37/0.1),transparent_50%)]" />

			{/* Growth rings */}
			<div className="relative h-64 w-64">
				<svg className="h-full w-full" viewBox="0 0 200 200">
					{/* Center point */}
					<motion.circle
						animate={{ scale: 1, opacity: 1 }}
						className="fill-primary"
						cx="100"
						cy="100"
						initial={{ scale: 0, opacity: 0 }}
						r="4"
						transition={{ duration: 0.5 }}
					/>

					{/* Pulsing center glow */}
					<motion.circle
						animate={{
							scale: [1, 1.5, 1],
							opacity: [0.5, 0, 0.5],
						}}
						className="fill-primary/20"
						cx="100"
						cy="100"
						r="8"
						transition={{
							duration: 2,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					/>

					{/* Growth rings */}
					{rings.map((ring, index) => {
						const radius = 15 + index * 10;
						return (
							<motion.circle
								animate={{ scale: 1, opacity: 1 }}
								className="fill-none stroke-primary/30"
								cx="100"
								cy="100"
								initial={{ scale: 0, opacity: 0 }}
								key={ring}
								r={radius}
								strokeWidth="1"
								transition={{
									duration: 0.8,
									delay: index * 0.1,
									ease: [0.22, 1, 0.36, 1],
								}}
							/>
						);
					})}

					{/* Connecting lines (mycelium-like) */}
					{rings.length > 2 &&
						[...new Array(12)].map((_, i) => {
							const angle = (i * 360) / 12;
							const rad = (angle * Math.PI) / 180;
							const x1 = 100 + Math.cos(rad) * 20;
							const y1 = 100 + Math.sin(rad) * 20;
							const x2 = 100 + Math.cos(rad) * (15 + rings.length * 10);
							const y2 = 100 + Math.sin(rad) * (15 + rings.length * 10);

							return (
								<motion.line
									animate={{ pathLength: 1, opacity: 1 }}
									className="stroke-primary/20"
									initial={{ pathLength: 0, opacity: 0 }}
									key={i}
									strokeWidth="0.5"
									transition={{
										duration: 1,
										delay: 0.5 + i * 0.05,
										ease: "easeOut",
									}}
									x1={x1}
									x2={x2}
									y1={y1}
									y2={y2}
								/>
							);
						})}
				</svg>

				{/* Overlay text */}
				<motion.div
					animate={{ opacity: 1 }}
					className="absolute inset-0 flex items-center justify-center"
					initial={{ opacity: 0 }}
					transition={{ delay: 2, duration: 1 }}
				>
					<div className="text-center">
						<div className="font-bold text-2xl text-white">Growing</div>
						<div className="text-sm text-white/60">Network</div>
					</div>
				</motion.div>
			</div>

			{/* Corner accent */}
			<div className="absolute top-4 right-4">
				<motion.div
					animate={{
						scale: [1, 1.5, 1],
						opacity: [0.5, 1, 0.5],
					}}
					className="h-2 w-2 rounded-full bg-primary"
					transition={{
						duration: 2,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>
			</div>
		</div>
	);
}
