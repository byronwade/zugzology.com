import { ArrowRight } from "lucide-react";
import { PrefetchLink } from "@/components/ui/prefetch-link";
import { cn } from "@/lib/utils";

export type SectionHeadingProps = {
	/**
	 * The rule that selected these items — "newest first", "ranked by units sold".
	 * The eyebrow states why this row exists, so it carries information rather than
	 * decorating the heading.
	 */
	eyebrow: string;
	title: string;
	subtitle?: string;
	ctaHref?: string;
	ctaLabel?: string;
	align?: "start" | "center";
};

export function SectionHeading({
	eyebrow,
	title,
	subtitle,
	ctaHref,
	ctaLabel,
	align = "start",
}: SectionHeadingProps): React.ReactElement {
	const centered = align === "center";

	return (
		<div className={cn("mb-10 sm:mb-12", centered && "text-center")}>
			<div
				className={cn(
					"flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8",
					centered && "sm:flex-col sm:items-center"
				)}
			>
				<div className={cn("max-w-2xl", centered && "mx-auto")}>
					<div className={cn("mb-4 flex items-center gap-3", centered && "justify-center")}>
						<span className="h-px w-8 bg-flush" />
						<span className="slate text-flush">{eyebrow}</span>
					</div>

					<h2 className="display-wide font-display font-semibold text-[clamp(1.75rem,4.5vw,3rem)] text-foreground leading-[0.95] tracking-[-0.025em]">
						{title}
					</h2>

					{subtitle && <p className="mt-4 text-base text-muted-foreground leading-relaxed">{subtitle}</p>}
				</div>

				{ctaHref && ctaLabel && (
					<PrefetchLink
						className="group inline-flex shrink-0 items-center gap-2 rounded-sm py-2 text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
						href={ctaHref}
					>
						<span className="slate border-current border-b pb-1">{ctaLabel}</span>
						<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
					</PrefetchLink>
				)}
			</div>

			{/* Hairline closes the header block and sets the top edge of the grid. */}
			<div className="mt-8 h-px w-full bg-border" />
		</div>
	);
}
