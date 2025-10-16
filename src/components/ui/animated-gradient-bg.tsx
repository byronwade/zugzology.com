"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimatedGradientBgProps = {
	className?: string;
	colors?: string[];
	speed?: "slow" | "medium" | "fast";
	disableAnimation?: boolean;
};

export function AnimatedGradientBg({
	className,
	colors = ["hsl(206 55 37)", "hsl(206 60 55)", "hsl(206 45 60)"],
	speed = "medium",
	disableAnimation = false,
}: AnimatedGradientBgProps) {
	const durations = {
		slow: 8,
		medium: 5,
		fast: 3,
	};

	return (
		<div className={cn("absolute inset-0 overflow-hidden opacity-30", className)}>
			<motion.div
				className="absolute inset-0"
				style={{
					background: `linear-gradient(45deg, ${colors.join(", ")})`,
					backgroundSize: "200% 200%",
				}}
				{...(disableAnimation
					? {}
					: {
							animate: {
								backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
							},
							transition: {
								duration: durations[speed],
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
							},
						})}
			/>
		</div>
	);
}

export function MeshGradientBg({
	className,
	disableAnimation = false,
}: {
	className?: string;
	disableAnimation?: boolean;
}) {
	return (
		<div className={cn("absolute inset-0 overflow-hidden opacity-40", className)}>
			<motion.div
				className="-top-1/2 -left-1/2 absolute h-full w-full blur-3xl"
				style={{
					background: "radial-gradient(circle, hsl(206 55 37 / 0.4) 0%, transparent 70%)",
				}}
				{...(disableAnimation
					? {}
					: {
							animate: {
								scale: [1, 1.2, 1],
								rotate: [0, 90, 0],
							},
							transition: {
								duration: 20,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							},
						})}
			/>
			<motion.div
				className="-bottom-1/2 -right-1/2 absolute h-full w-full blur-3xl"
				style={{
					background: "radial-gradient(circle, hsl(206 60 55 / 0.3) 0%, transparent 70%)",
				}}
				{...(disableAnimation
					? {}
					: {
							animate: {
								scale: [1.2, 1, 1.2],
								rotate: [90, 0, 90],
							},
							transition: {
								duration: 15,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							},
						})}
			/>
		</div>
	);
}

export function FloatingOrbs({
	className,
	disableAnimation = false,
}: {
	className?: string;
	disableAnimation?: boolean;
}) {
	return (
		<div className={cn("absolute inset-0 overflow-hidden", className)}>
			{[...new Array(3)].map((_, i) => (
				<motion.div
					className="absolute rounded-full blur-2xl"
					key={i}
					style={{
						left: `${20 + i * 30}%`,
						top: `${30 + i * 20}%`,
						width: `${80 + i * 40}px`,
						height: `${80 + i * 40}px`,
						background: `hsl(206 ${55 + i * 5} ${37 + i * 10} / 0.2)`,
					}}
					{...(disableAnimation
						? {}
						: {
								animate: {
									x: [0, 100, 0],
									y: [0, -50, 0],
									scale: [1, 1.2, 1],
								},
								transition: {
									duration: 5 + i * 2,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
									delay: i * 0.5,
								},
							})}
				/>
			))}
		</div>
	);
}
