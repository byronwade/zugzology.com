"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const generateChartData = () =>
	Array.from({ length: 12 }, (_, i) => ({
		value: Math.floor(Math.random() * 40) + 60 + i * 2,
	}));

type StatCardVisualProps = {
	value: string;
	label: string;
	trend?: number;
	showChart?: boolean;
	disableAnimation?: boolean;
};

export function StatCardVisual({
	value,
	label,
	trend = 12,
	showChart = true,
	disableAnimation = false,
}: StatCardVisualProps) {
	const [chartData, setChartData] = useState(generateChartData());

	useEffect(() => {
		if (disableAnimation) {
			return;
		}

		const interval = setInterval(() => {
			setChartData((prev) => {
				const newData = [...prev.slice(1), { value: Math.floor(Math.random() * 20) + 80 }];
				return newData;
			});
		}, 3000);

		return () => clearInterval(interval);
	}, [disableAnimation]);

	return (
		<div className="relative h-full w-full">
			{showChart && !disableAnimation && (
				<div className="absolute inset-0 opacity-20">
					<ResponsiveContainer height="100%" width="100%">
						<AreaChart data={chartData}>
							<defs>
								<linearGradient id="colorValue" x1="0" x2="0" y1="0" y2="1">
									<stop offset="5%" stopColor="hsl(206 55 37)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="hsl(206 55 37)" stopOpacity={0} />
								</linearGradient>
							</defs>
							<Area
								animationDuration={1500}
								dataKey="value"
								fill="url(#colorValue)"
								stroke="hsl(206 55 37)"
								strokeWidth={2}
								type="monotone"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			)}

			<div className="relative z-10 flex h-full flex-col justify-center p-6">
				<motion.div
					className="mb-2 font-bold text-4xl text-foreground md:text-5xl"
					{...(disableAnimation
						? {}
						: {
								animate: { scale: [1, 1.05, 1] },
								transition: { duration: 2, repeat: Number.POSITIVE_INFINITY },
							})}
				>
					{value}
				</motion.div>
				<div className="text-muted-foreground text-sm">{label}</div>
				{trend > 0 && (
					<div className="mt-2 flex items-center gap-1 text-green-500 text-xs">
						<TrendingUp className="h-3 w-3" />
						<span>+{trend}% this month</span>
					</div>
				)}
			</div>
		</div>
	);
}

export function AnimatedCounter({
	target,
	label,
	disableAnimation = false,
}: {
	target: number;
	label: string;
	disableAnimation?: boolean;
}) {
	const [count, setCount] = useState(disableAnimation ? target : 0);

	useEffect(() => {
		if (disableAnimation) {
			setCount(target);
			return;
		}

		const duration = 2000;
		const steps = 60;
		const increment = target / steps;
		let current = 0;

		const timer = setInterval(() => {
			current += increment;
			if (current >= target) {
				setCount(target);
				clearInterval(timer);
			} else {
				setCount(Math.floor(current));
			}
		}, duration / steps);

		return () => clearInterval(timer);
	}, [target, disableAnimation]);

	return (
		<div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
			<motion.div
				className="mb-2 font-bold text-5xl text-foreground md:text-6xl"
				{...(disableAnimation
					? {}
					: {
							animate: { scale: [1, 1.1, 1] },
							transition: { duration: 3, repeat: Number.POSITIVE_INFINITY },
						})}
			>
				{count.toLocaleString()}+
			</motion.div>
			<div className="font-medium text-muted-foreground text-sm uppercase tracking-wide">{label}</div>
		</div>
	);
}
