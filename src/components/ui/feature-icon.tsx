"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconVariant = "float" | "pulse" | "spin" | "bounce" | "default";

type FeatureIconProps = {
	icon: LucideIcon;
	className?: string;
	variant?: IconVariant;
	color?: "primary" | "secondary" | "accent" | "destructive";
};

export function FeatureIcon({ icon: Icon, className, variant = "default", color = "primary" }: FeatureIconProps) {
	const colorClasses = {
		primary: "text-primary",
		secondary: "text-secondary",
		accent: "text-accent-foreground",
		destructive: "text-destructive",
	};

	const baseClasses = cn("rounded-lg bg-primary/10 p-3 transition-colors duration-300", colorClasses[color], className);

	const variants = {
		hidden: { opacity: 0, scale: 0.8 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.4,
				ease: [0.22, 1, 0.36, 1],
			},
		},
	};

	if (variant === "float") {
		return (
			<motion.div
				className={baseClasses}
				initial="hidden"
				variants={variants}
				viewport={{ once: true }}
				whileInView="visible"
			>
				<motion.div
					animate={{
						y: [0, -10, 0],
					}}
					transition={{
						duration: 3,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				>
					<Icon className="h-6 w-6" />
				</motion.div>
			</motion.div>
		);
	}

	if (variant === "pulse") {
		return (
			<motion.div
				className={baseClasses}
				initial="hidden"
				variants={variants}
				viewport={{ once: true }}
				whileHover={{
					scale: 1.1,
					transition: { duration: 0.2 },
				}}
				whileInView="visible"
			>
				<motion.div
					animate={{
						scale: [1, 1.1, 1],
					}}
					transition={{
						duration: 2,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				>
					<Icon className="h-6 w-6" />
				</motion.div>
			</motion.div>
		);
	}

	if (variant === "spin") {
		return (
			<motion.div
				className={baseClasses}
				initial="hidden"
				variants={variants}
				viewport={{ once: true }}
				whileHover={{
					rotate: 360,
					transition: { duration: 0.6, ease: "easeInOut" },
				}}
				whileInView="visible"
			>
				<Icon className="h-6 w-6" />
			</motion.div>
		);
	}

	if (variant === "bounce") {
		return (
			<motion.div
				className={baseClasses}
				initial="hidden"
				variants={variants}
				viewport={{ once: true }}
				whileHover={{
					y: [0, -10, 0],
					transition: { duration: 0.5, ease: "easeOut" },
				}}
				whileInView="visible"
			>
				<Icon className="h-6 w-6" />
			</motion.div>
		);
	}

	// Default variant
	return (
		<motion.div
			className={baseClasses}
			initial="hidden"
			variants={variants}
			viewport={{ once: true }}
			whileHover={{
				scale: 1.05,
				rotate: 5,
				transition: { duration: 0.2 },
			}}
			whileInView="visible"
		>
			<Icon className="h-6 w-6" />
		</motion.div>
	);
}
