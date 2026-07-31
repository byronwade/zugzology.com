"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import type { HeroSectionSettings, PageLayout, PageTheme } from "@/lib/types";
import { cn } from "@/lib/utils";

type HeroSectionProps = {
	settings: HeroSectionSettings;
	layout: PageLayout;
	theme: PageTheme;
};

/**
 * Hero Section Component
 * Flexible hero with multiple layout variants
 */
export function HeroSection({ settings, layout, theme }: HeroSectionProps) {
	const { heading, subheading, ctaText, ctaLink, backgroundImage, layout: heroLayout = "full-width" } = settings;

	const sectionClasses = cn(
		"relative overflow-hidden",
		heroLayout === "full-width" && "min-h-[calc(80vh-var(--header-height))]",
		heroLayout === "split" && "min-h-[calc(60vh-var(--header-height))]",
		heroLayout === "minimal" && "py-20",
		theme === "dark" && "bg-slate-900 text-white",
		theme === "default" && "bg-background"
	);

	return (
		<section className={sectionClasses}>
			{/* Background Image */}
			{backgroundImage && (
				<div className="absolute inset-0 z-0">
					<Image
						alt={heading}
						className="object-cover"
						fill
						priority
						quality={90}
						sizes="100vw"
						src={backgroundImage.url}
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
				</div>
			)}

			{/* Content */}
			<div className={cn("relative z-10", layout === "contained" ? "container mx-auto px-4" : "px-4")}>
				<div
					className={cn(
						"flex items-center",
						heroLayout === "full-width" && "min-h-[calc(80vh-var(--header-height))]",
						heroLayout === "split" && "grid min-h-[calc(60vh-var(--header-height))] gap-12 lg:grid-cols-2",
						heroLayout === "minimal" && "py-12"
					)}
				>
					<div className={cn("max-w-3xl space-y-6", heroLayout === "split" && "max-w-none")}>
						{/* Heading */}
						<h1
							className={cn(
								"font-bold leading-tight tracking-tight",
								heroLayout === "full-width" && "text-5xl md:text-6xl lg:text-7xl",
								heroLayout === "split" && "text-4xl md:text-5xl",
								heroLayout === "minimal" && "text-3xl md:text-4xl",
								backgroundImage ? "text-white" : "text-foreground"
							)}
						>
							{heading}
						</h1>

						{/* Subheading */}
						{subheading && (
							<p
								className={cn(
									"text-lg md:text-xl lg:text-2xl",
									backgroundImage ? "text-white/90" : "text-muted-foreground"
								)}
							>
								{subheading}
							</p>
						)}

						{/* CTA Button */}
						{ctaText && ctaLink && (
							<div className="pt-4">
								<Button asChild className="h-12 px-8 text-base" size="lg">
									<Link href={ctaLink}>
										{ctaText}
										<ArrowRight className="ml-2 h-5 w-5" />
									</Link>
								</Button>
							</div>
						)}
					</div>

					{/* Optional second column for split layout */}
					{heroLayout === "split" && (
						<div className="hidden lg:flex lg:items-center lg:justify-center">
							{backgroundImage && (
								<div className="relative aspect-square w-full max-w-lg overflow-hidden rounded-2xl">
									<Image
										alt={heading}
										className="object-cover"
										fill
										sizes="(max-width: 1024px) 100vw, 50vw"
										src={backgroundImage.url}
									/>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
