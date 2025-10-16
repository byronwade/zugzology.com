"use client";

import { CheckCircle2, Leaf, ShieldCheck, Sparkles, Star, Zap } from "lucide-react";
import Image from "next/image";
import type { FeatureGridSettings, PageLayout, PageTheme } from "@/lib/types";
import { cn } from "@/lib/utils";

type FeatureGridSectionProps = {
	settings: FeatureGridSettings;
	layout: PageLayout;
	theme: PageTheme;
};

// Icon mapping for predefined icons
const iconMap = {
	sparkles: Sparkles,
	check: CheckCircle2,
	shield: ShieldCheck,
	star: Star,
	zap: Zap,
	leaf: Leaf,
};

/**
 * Feature Grid Section Component
 * Displays features in a responsive grid with icons or images
 */
export function FeatureGridSection({ settings, layout, theme }: FeatureGridSectionProps) {
	const { heading, subheading, features, columns = 3 } = settings;

	const gridClasses = {
		2: "md:grid-cols-2",
		3: "md:grid-cols-3",
		4: "md:grid-cols-2 lg:grid-cols-4",
	};

	return (
		<section
			className={cn(
				"py-16 md:py-24",
				theme === "dark" && "bg-slate-900 text-white",
				theme === "default" && "bg-muted/30"
			)}
		>
			<div className={cn(layout === "contained" ? "container mx-auto px-4" : "px-4")}>
				{/* Header */}
				<div className="mb-16 text-center">
					<h2 className="mb-4 font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl">{heading}</h2>
					{subheading && <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl">{subheading}</p>}
				</div>

				{/* Features Grid */}
				<div className={cn("grid gap-8", gridClasses[columns])}>
					{features.map((feature, index) => {
						// Get icon component if specified
						const IconComponent = feature.icon ? iconMap[feature.icon as keyof typeof iconMap] : null;

						return (
							<div
								className={cn(
									"group relative rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-lg",
									theme === "dark" && "border-white/10 bg-white/5"
								)}
								key={index}
							>
								{/* Icon or Image */}
								<div className="mb-6">
									{feature.image ? (
										<div className="relative h-16 w-16 overflow-hidden rounded-xl">
											<Image alt={feature.title} className="object-cover" fill sizes="64px" src={feature.image.url} />
										</div>
									) : IconComponent ? (
										<div
											className={cn(
												"flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10",
												theme === "dark" && "bg-primary/20"
											)}
										>
											<IconComponent className="h-8 w-8 text-primary" />
										</div>
									) : (
										<div
											className={cn(
												"flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 font-bold text-2xl text-primary",
												theme === "dark" && "bg-primary/20"
											)}
										>
											{index + 1}
										</div>
									)}
								</div>

								{/* Content */}
								<h3 className="mb-3 font-semibold text-xl">{feature.title}</h3>
								<p className="text-muted-foreground leading-relaxed">{feature.description}</p>

								{/* Hover effect indicator */}
								<div
									className={cn(
										"absolute top-0 right-0 bottom-0 left-0 rounded-2xl opacity-0 ring-2 ring-primary transition-opacity duration-300 group-hover:opacity-100"
									)}
								/>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
