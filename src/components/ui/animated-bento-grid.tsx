"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BentoGridProps = {
	children: ReactNode;
	className?: string;
};

type BentoGridItemProps = {
	children: ReactNode;
	className?: string;
	delay?: number;
};

export function BentoGrid({ children, className }: BentoGridProps) {
	return (
		<div className={cn("grid auto-rows-[18rem] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
			{children}
		</div>
	);
}

export function BentoGridItem({ children, className, delay = 0 }: BentoGridItemProps) {
	return (
		<motion.div
			className={cn(
				"group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/10",
				className
			)}
			initial={{ opacity: 0, y: 20 }}
			transition={{
				duration: 0.5,
				delay,
				ease: [0.22, 1, 0.36, 1],
			}}
			viewport={{ once: true, margin: "-50px" }}
			whileHover={{ scale: 1.02 }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			{children}
		</motion.div>
	);
}
