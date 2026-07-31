"use client";

import Image from "next/image";
import type { ContentBlockSettings, PageLayout, PageTheme } from "@/lib/types";
import { cn } from "@/lib/utils";

type ContentBlockSectionProps = {
	settings: ContentBlockSettings;
	layout: PageLayout;
	theme: PageTheme;
};

/**
 * Content Block Section Component
 * Rich content with optional image and flexible layouts
 */
export function ContentBlockSection({ settings, layout, theme }: ContentBlockSectionProps) {
	const { heading, content, image, imagePosition = "right", backgroundColor, textAlign = "left" } = settings;

	const hasImage = Boolean(image);
	const isImageLeft = imagePosition === "left";
	const isImageTop = imagePosition === "top";
	const isImageBottom = imagePosition === "bottom";

	return (
		<section
			className={cn(
				"py-16 md:py-24",
				theme === "dark" && "bg-slate-900 text-white",
				backgroundColor && `bg-[${backgroundColor}]`
			)}
		>
			<div className={cn(layout === "contained" ? "container mx-auto px-4" : "px-4")}>
				<div
					className={cn(
						hasImage && !isImageTop && !isImageBottom && "grid items-center gap-12 lg:grid-cols-2",
						isImageLeft && "lg:grid-flow-dense"
					)}
				>
					{/* Image */}
					{hasImage && image && (
						<div
							className={cn(
								"relative overflow-hidden rounded-2xl",
								(isImageTop || isImageBottom) && "mb-12 aspect-video w-full",
								!(isImageTop || isImageBottom) && "aspect-square lg:aspect-auto lg:h-[600px]",
								isImageLeft && "lg:col-start-1",
								isImageBottom && "order-2"
							)}
						>
							<Image
								alt={heading || "Content"}
								className="object-cover"
								fill
								sizes="(max-width: 1024px) 100vw, 50vw"
								src={image.url}
							/>
						</div>
					)}

					{/* Content */}
					<div className={cn("space-y-6", textAlign === "center" && "mx-auto max-w-3xl text-center")}>
						{heading && (
							<h2
								className={cn(
									"font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl",
									theme === "dark" ? "text-white" : "text-foreground"
								)}
							>
								{heading}
							</h2>
						)}

						<div
							className={cn(
								"prose prose-lg dark:prose-invert max-w-none",
								textAlign === "center" && "prose-center",
								theme === "dark" && "prose-invert"
							)}
							dangerouslySetInnerHTML={{ __html: content }}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
