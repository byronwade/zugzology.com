"use client";

import { Award, Box, Clock, HeartHandshake, Leaf, ShieldCheck, Truck, Users } from "lucide-react";
import { BentoGrid } from "@/components/ui/animated-bento-grid";
import { AnimatedCard, type CardVariant } from "@/components/ui/animated-card";
import { FeatureIcon, type IconVariant } from "@/components/ui/feature-icon";
import { cn } from "@/lib/utils";

type Feature = {
	icon: typeof Award;
	iconVariant: IconVariant;
	title: string;
	description: string;
	cardVariant: CardVariant;
	className?: string;
};

const features: Feature[] = [
	{
		icon: Award,
		iconVariant: "pulse",
		title: "Quality Guaranteed",
		description: "Lab-tested supplies for optimal growth success with rigorous quality control standards.",
		cardVariant: "shimmer",
		className: "md:col-span-2",
	},
	{
		icon: Leaf,
		iconVariant: "float",
		title: "Expert Support",
		description: "Access our comprehensive knowledge base and expert cultivation guidance.",
		cardVariant: "tilt",
	},
	{
		icon: Box,
		iconVariant: "bounce",
		title: "Discreet Shipping",
		description: "Plain, unmarked packaging for complete privacy on all orders worldwide.",
		cardVariant: "default",
	},
	{
		icon: Truck,
		iconVariant: "spin",
		title: "Fast & Free Shipping",
		description: "Free shipping on orders over $50 with expedited delivery options available.",
		cardVariant: "spring",
		className: "md:col-span-2",
	},
	{
		icon: ShieldCheck,
		iconVariant: "pulse",
		title: "Premium Products",
		description: "Carefully curated and selected supplies for guaranteed best cultivation results.",
		cardVariant: "glow",
	},
	{
		icon: Clock,
		iconVariant: "float",
		title: "24/7 Support",
		description: "Round-the-clock help available through our extensive knowledge base and support team.",
		cardVariant: "shimmer",
	},
	{
		icon: Users,
		iconVariant: "bounce",
		title: "Growing Community",
		description: "Join thousands of growers sharing experiences, tips, and success stories daily.",
		cardVariant: "tilt",
		className: "md:col-span-2",
	},
	{
		icon: HeartHandshake,
		iconVariant: "pulse",
		title: "30-Day Guarantee",
		description: "Complete satisfaction guarantee with hassle-free returns and full money-back promise.",
		cardVariant: "glow",
		className: "md:col-span-2",
	},
];

type WhyChooseBentoProps = {
	brandName?: string;
	tagline?: string;
	className?: string;
};

export function WhyChooseBento({
	brandName = "Zugzology",
	tagline = "Premium Mushroom Cultivation Supplies",
	className,
}: WhyChooseBentoProps) {
	return (
		<section className={cn("border-border/70 border-b bg-card/50", className)}>
			<div className="container mx-auto px-4 py-16">
				{/* Header Section with Animation */}
				<div className="mb-12 text-center">
					<h2 className="mb-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
						Why Choose {brandName}?
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-muted-foreground">{tagline}</p>
				</div>

				{/* Animated Bento Grid */}
				<BentoGrid className="mx-auto max-w-7xl">
					{features.map((feature, index) => (
						<AnimatedCard
							className={cn("flex flex-col", feature.className)}
							delay={index * 0.08}
							key={feature.title}
							variant={feature.cardVariant}
						>
							<div className="mb-4">
								<FeatureIcon color="primary" icon={feature.icon} variant={feature.iconVariant} />
							</div>
							<h3 className="mb-2 font-semibold text-foreground text-lg">{feature.title}</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
						</AnimatedCard>
					))}
				</BentoGrid>
			</div>
		</section>
	);
}
