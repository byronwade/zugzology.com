"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type CardVariant = "default" | "shimmer" | "tilt" | "spring" | "glow";

type AnimatedCardProps = {
	children: ReactNode;
	className?: string;
	variant?: CardVariant;
	delay?: number;
};

export function AnimatedCard({ children, className, variant = "default", delay = 0 }: AnimatedCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const [isHovered, setIsHovered] = useState(false);

	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
		stiffness: 300,
		damping: 30,
	});
	const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
		stiffness: 300,
		damping: 30,
	});

	function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
		if (!cardRef.current || variant !== "tilt") {
			return;
		}

		const rect = cardRef.current.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;
		const mouseXPos = e.clientX - rect.left;
		const mouseYPos = e.clientY - rect.top;
		const xPct = mouseXPos / width - 0.5;
		const yPct = mouseYPos / height - 0.5;

		mouseX.set(xPct);
		mouseY.set(yPct);
	}

	function handleMouseLeave() {
		if (variant === "tilt") {
			mouseX.set(0);
			mouseY.set(0);
		}
		setIsHovered(false);
	}

	const baseClasses = cn(
		"relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300",
		className
	);

	const variantClasses: Record<CardVariant, string> = {
		default: "hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50",
		shimmer: "hover:shadow-lg hover:shadow-primary/20 overflow-hidden",
		tilt: "hover:shadow-xl hover:shadow-primary/20 perspective-1000",
		spring: "hover:shadow-lg hover:shadow-primary/10",
		glow: "hover:shadow-xl hover:shadow-primary/30 hover:border-primary/50",
	};

	const containerVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
		},
	};

	if (variant === "shimmer") {
		return (
			<motion.div
				className={cn(baseClasses, variantClasses[variant])}
				initial="hidden"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={handleMouseLeave}
				ref={cardRef}
				transition={{
					duration: 0.5,
					delay,
					ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
				}}
				variants={containerVariants}
				viewport={{ once: true, margin: "-50px" }}
				whileInView="visible"
			>
				{isHovered && (
					<div
						className="pointer-events-none absolute inset-0 opacity-50"
						style={{
							background: "linear-gradient(90deg, transparent 0%, hsl(206 55 37 / 0.3) 50%, transparent 100%)",
							backgroundSize: "200% 100%",
							animation: "shimmer 2s linear infinite",
						}}
					/>
				)}
				{children}
			</motion.div>
		);
	}

	if (variant === "tilt") {
		return (
			<motion.div
				className={cn(baseClasses, variantClasses[variant])}
				initial="hidden"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={handleMouseLeave}
				onMouseMove={handleMouseMove}
				ref={cardRef}
				style={{
					rotateX,
					rotateY,
					transformStyle: "preserve-3d",
				}}
				transition={{
					duration: 0.5,
					delay,
					ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
				}}
				variants={containerVariants}
				viewport={{ once: true, margin: "-50px" }}
				whileInView="visible"
			>
				<div style={{ transform: "translateZ(50px)" }}>{children}</div>
			</motion.div>
		);
	}

	if (variant === "spring") {
		return (
			<motion.div
				className={cn(baseClasses, variantClasses[variant])}
				initial="hidden"
				ref={cardRef}
				transition={{
					duration: 0.5,
					delay,
					ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
				}}
				variants={containerVariants}
				viewport={{ once: true, margin: "-50px" }}
				whileHover={{
					scale: 1.05,
					transition: { type: "spring", stiffness: 400, damping: 10 },
				}}
				whileInView="visible"
				whileTap={{ scale: 0.95 }}
			>
				{children}
			</motion.div>
		);
	}

	if (variant === "glow") {
		return (
			<motion.div
				className={cn(baseClasses, variantClasses[variant], "group")}
				initial="hidden"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={handleMouseLeave}
				ref={cardRef}
				transition={{
					duration: 0.5,
					delay,
					ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
				}}
				variants={containerVariants}
				viewport={{ once: true, margin: "-50px" }}
				whileHover={{ scale: 1.02 }}
				whileInView="visible"
			>
				{isHovered && (
					<div
						className="-inset-[1px] pointer-events-none absolute rounded-xl opacity-75 blur-sm transition-opacity duration-500"
						style={{
							background: "linear-gradient(45deg, hsl(206 55 37 / 0.5), hsl(206 55 55 / 0.5))",
						}}
					/>
				)}
				<div className="relative z-10">{children}</div>
			</motion.div>
		);
	}

	// Default variant
	return (
		<motion.div
			className={cn(baseClasses, variantClasses[variant])}
			initial="hidden"
			ref={cardRef}
			transition={{
				duration: 0.5,
				delay,
				ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
			}}
			variants={containerVariants}
			viewport={{ once: true, margin: "-50px" }}
			whileHover={{ scale: 1.02 }}
			whileInView="visible"
		>
			{children}
		</motion.div>
	);
}
