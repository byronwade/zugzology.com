"use client";

import dynamic from "next/dynamic";
import type { PageLayout, PageSection, PageTheme } from "@/lib/types";

// Dynamically import section components for code splitting
const HeroSection = dynamic(() => import("./sections/hero-section").then((mod) => mod.HeroSection), {
	loading: () => <SectionSkeleton type="hero" />,
});

const ContentBlockSection = dynamic(
	() => import("./sections/content-block-section").then((mod) => mod.ContentBlockSection),
	{
		loading: () => <SectionSkeleton type="content" />,
	}
);

const ProductCarouselSection = dynamic(
	() => import("./sections/product-carousel-section").then((mod) => mod.ProductCarouselSection),
	{
		loading: () => <SectionSkeleton type="products" />,
	}
);

const CTABannerSection = dynamic(() => import("./sections/cta-banner-section").then((mod) => mod.CTABannerSection), {
	loading: () => <SectionSkeleton type="cta" />,
});

const FeatureGridSection = dynamic(
	() => import("./sections/feature-grid-section").then((mod) => mod.FeatureGridSection),
	{
		loading: () => <SectionSkeleton type="features" />,
	}
);

type SectionRendererProps = {
	section: PageSection;
	layout: PageLayout;
	theme: PageTheme;
};

/**
 * Client Component that routes to the appropriate section component
 * based on the section type. Enables dynamic section rendering.
 */
export function SectionRenderer({ section, layout, theme }: SectionRendererProps) {
	const { type, settings } = section;

	// Route to appropriate section component
	switch (type) {
		case "hero":
			return <HeroSection layout={layout} settings={settings as any} theme={theme} />;

		case "content":
			return <ContentBlockSection layout={layout} settings={settings as any} theme={theme} />;

		case "products":
			return <ProductCarouselSection layout={layout} settings={settings as any} theme={theme} />;

		case "cta":
			return <CTABannerSection layout={layout} settings={settings as any} theme={theme} />;

		case "features":
			return <FeatureGridSection layout={layout} settings={settings as any} theme={theme} />;
		default:
			return (
				<div className="py-12">
					<div className="container mx-auto px-4">
						<div className="rounded-lg border border-muted-foreground/20 border-dashed bg-muted/10 p-8 text-center">
							<p className="text-muted-foreground">
								Section type <strong>"{type}"</strong> is not yet implemented.
							</p>
							<p className="mt-2 text-muted-foreground text-sm">
								Add a component for this section type in components/features/pages/sections/
							</p>
						</div>
					</div>
				</div>
			);
	}
}

/**
 * Generic section skeleton for loading states
 */
function SectionSkeleton({ type }: { type: string }) {
	return (
		<div className="animate-pulse py-12">
			<div className="container mx-auto px-4">
				{type === "hero" && (
					<div className="flex min-h-[60vh] items-center justify-center">
						<div className="w-full max-w-4xl space-y-4">
							<div className="h-12 w-3/4 rounded bg-muted" />
							<div className="h-6 w-1/2 rounded bg-muted" />
							<div className="h-12 w-32 rounded bg-muted" />
						</div>
					</div>
				)}
				{type === "products" && (
					<div className="space-y-4">
						<div className="h-8 w-48 rounded bg-muted" />
						<div className="grid gap-6 md:grid-cols-3">
							<div className="h-64 rounded bg-muted" />
							<div className="h-64 rounded bg-muted" />
							<div className="h-64 rounded bg-muted" />
						</div>
					</div>
				)}
				{(type === "content" || type === "cta" || type === "features") && (
					<div className="mx-auto max-w-2xl space-y-4">
						<div className="h-8 w-1/2 rounded bg-muted" />
						<div className="h-4 w-full rounded bg-muted" />
						<div className="h-4 w-3/4 rounded bg-muted" />
					</div>
				)}
			</div>
		</div>
	);
}
