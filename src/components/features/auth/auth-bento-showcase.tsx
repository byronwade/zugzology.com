"use client";

import { Heart, HelpCircle, Lock, Package, ShieldCheck, Sparkles, TrendingUp, Users } from "lucide-react";
import { BentoGrid } from "@/components/ui/animated-bento-grid";
import type { CardVariant } from "@/components/ui/animated-card";
import { AnimatedCard } from "@/components/ui/animated-card";
import type { IconVariant } from "@/components/ui/feature-icon";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { cn } from "@/lib/utils";

type Feature = {
	icon: typeof Lock;
	iconVariant: IconVariant;
	title: string;
	description: string;
	cardVariant: CardVariant;
	className?: string;
};

const features: Feature[] = [
	{
		icon: Lock,
		iconVariant: "pulse",
		title: "Secure Account Access",
		description: "Your data is protected with enterprise-grade encryption and Shopify's secure authentication.",
		cardVariant: "shimmer",
		className: "md:col-span-2",
	},
	{
		icon: Package,
		iconVariant: "float",
		title: "Order Tracking",
		description: "Track your mushroom cultivation supplies from warehouse to doorstep in real-time.",
		cardVariant: "tilt",
	},
	{
		icon: Heart,
		iconVariant: "pulse",
		title: "Wishlist Sync",
		description: "Save your favorite products and get notified when they're back in stock or on sale.",
		cardVariant: "glow",
	},
	{
		icon: Sparkles,
		iconVariant: "spin",
		title: "Exclusive Deals",
		description: "Access member-only discounts, early product launches, and seasonal promotions.",
		cardVariant: "spring",
		className: "md:col-span-2",
	},
	{
		icon: Users,
		iconVariant: "bounce",
		title: "Growing Community",
		description: "Join thousands of mycology enthusiasts sharing tips, techniques, and success stories.",
		cardVariant: "default",
	},
	{
		icon: TrendingUp,
		iconVariant: "float",
		title: "Growth Insights",
		description: "Get personalized product recommendations based on your cultivation journey.",
		cardVariant: "shimmer",
	},
	{
		icon: HelpCircle,
		iconVariant: "bounce",
		title: "Expert Support",
		description: "Priority access to our mycology experts for cultivation advice and troubleshooting.",
		cardVariant: "glow",
	},
	{
		icon: ShieldCheck,
		iconVariant: "pulse",
		title: "Quality Guarantee",
		description: "100% satisfaction guarantee on all products with easy returns and exchanges.",
		cardVariant: "tilt",
		className: "md:col-span-2",
	},
];

type AuthBentoShowcaseProps = {
	className?: string;
};

export function AuthBentoShowcase({ className }: AuthBentoShowcaseProps) {
	return (
		<div className={cn("w-full py-12", className)}>
			<div className="container mx-auto px-4">
				{/* Header Section */}
				<div className="mb-12 text-center">
					<h2 className="mb-4 font-bold text-3xl text-foreground md:text-4xl">Everything You Need to Grow</h2>
					<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
						Join Zugzology to unlock premium features, exclusive deals, and a thriving community of mycology
						enthusiasts.
					</p>
				</div>

				{/* Bento Grid */}
				<BentoGrid className="mx-auto max-w-7xl">
					{features.map((feature, index) => (
						<AnimatedCard
							className={cn("flex flex-col", feature.className)}
							delay={index * 0.1}
							key={feature.title}
							variant={feature.cardVariant}
						>
							<div className="mb-4">
								<FeatureIcon color="primary" icon={feature.icon} variant={feature.iconVariant} />
							</div>
							<h3 className="mb-2 font-semibold text-foreground text-xl">{feature.title}</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
						</AnimatedCard>
					))}
				</BentoGrid>
			</div>
		</div>
	);
}
