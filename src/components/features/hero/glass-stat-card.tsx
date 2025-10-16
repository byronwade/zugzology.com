"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type GlassStatCardProps = {
	value: string;
	label: string;
	delay?: number;
	animateValue?: boolean;
};

export function GlassStatCard({ value, label, delay = 0, animateValue = false }: GlassStatCardProps) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true });
	const [displayValue, setDisplayValue] = useState("0");

	useEffect(() => {
		if (!(isInView && animateValue)) {
			return;
		}

		// Extract number from value (e.g., "10K+" -> 10, "95%" -> 95)
		const numericValue = Number.parseInt(value.replace(/[^0-9]/g, ""), 10);
		if (Number.isNaN(numericValue)) {
			setDisplayValue(value);
			return;
		}

		const duration = 2000;
		const steps = 60;
		const increment = numericValue / steps;
		let current = 0;

		const timer = setInterval(() => {
			current += increment;
			if (current >= numericValue) {
				setDisplayValue(value);
				clearInterval(timer);
			} else {
				const suffix = value.replace(/[0-9]/g, "");
				setDisplayValue(`${Math.floor(current)}${suffix}`);
			}
		}, duration / steps);

		return () => {
			clearInterval(timer);
		};
	}, [isInView, value, animateValue]);

	return (
		<motion.div
			animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
			className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-500 hover:border-primary/30 hover:bg-white/10 hover:shadow-2xl hover:shadow-primary/20"
			initial={{ opacity: 0, y: 20, scale: 0.95 }}
			ref={ref}
			transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
			whileHover={{ y: -8, scale: 1.02 }}
		>
			{/* Gradient overlay on hover */}
			<div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
			</div>

			{/* Glow effect */}
			<div className="-inset-px pointer-events-none absolute rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
				<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-xl" />
			</div>

			{/* Content */}
			<div className="relative z-10">
				<motion.div
					animate={isInView ? { scale: 1 } : {}}
					className="mb-2 font-bold text-5xl text-white tracking-tight"
					initial={{ scale: 0.8 }}
					transition={{ duration: 0.5, delay: delay + 0.2 }}
				>
					{animateValue ? displayValue : value}
				</motion.div>
				<div className="text-sm text-white/70 uppercase tracking-wider">{label}</div>
			</div>

			{/* Animated border line */}
			<motion.div
				animate={isInView ? { scaleX: 1 } : {}}
				className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
				initial={{ scaleX: 0 }}
				transition={{ duration: 1, delay: delay + 0.4 }}
			/>
		</motion.div>
	);
}
