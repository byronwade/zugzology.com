"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { CTABannerSettings, PageLayout, PageTheme } from "@/lib/types";
import { cn } from "@/lib/utils";

type CTABannerSectionProps = {
	settings: CTABannerSettings;
	layout: PageLayout;
	theme: PageTheme;
};

/**
 * CTA Banner Section Component
 * Eye-catching call-to-action with optional background image
 */
export function CTABannerSection({ settings, layout, theme }: CTABannerSectionProps) {
	const {
		heading,
		description,
		ctaText,
		ctaLink,
		backgroundImage,
		theme: ctaTheme = "primary",
		size = "medium",
	} = settings;

	const themeClasses = {
		primary: "bg-primary text-primary-foreground",
		secondary: "bg-secondary text-secondary-foreground",
		accent: "bg-accent text-accent-foreground",
	};

	const sizeClasses = {
		small: "py-12",
		medium: "py-16 md:py-20",
		large: "py-20 md:py-28",
	};

	return (
		<section className={cn("relative overflow-hidden", sizeClasses[size], !backgroundImage && themeClasses[ctaTheme])}>
			{/* Background Image */}
			{backgroundImage && (
				<div className="absolute inset-0 z-0">
					<Image alt={heading} className="object-cover" fill quality={90} sizes="100vw" src={backgroundImage.url} />
					<div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
				</div>
			)}

			{/* Content */}
			<div className={cn("relative z-10", layout === "contained" ? "container mx-auto px-4" : "px-4")}>
				<div className="mx-auto max-w-3xl text-center">
					<h2
						className={cn(
							"mb-6 font-bold leading-tight tracking-tight",
							size === "small" && "text-3xl md:text-4xl",
							size === "medium" && "text-4xl md:text-5xl",
							size === "large" && "text-5xl md:text-6xl",
							backgroundImage ? "text-white" : ""
						)}
					>
						{heading}
					</h2>

					{description && (
						<p className={cn("mb-8 text-lg md:text-xl", backgroundImage ? "text-white/90" : "text-inherit opacity-90")}>
							{description}
						</p>
					)}

					<Button
						asChild
						className={cn(
							"h-12 px-8 text-base shadow-lg",
							backgroundImage && "bg-white text-primary hover:bg-white/90"
						)}
						size="lg"
					>
						<Link href={ctaLink}>
							{ctaText}
							<ArrowRight className="ml-2 h-5 w-5" />
						</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
