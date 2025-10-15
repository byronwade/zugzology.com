import { type RefObject } from "react";
import { cn } from "@/lib/utils";
import { PrefetchLink, type PrefetchLinkProps } from "./prefetch-link";

export interface LinkProps extends PrefetchLinkProps {
	className?: string;
}

/**
 * Enhanced Link component that uses PrefetchLink by default
 * Provides NextMaster-style optimizations for all links
 */
export const Link = ({
	className,
	children,
	ref,
	...props
}: LinkProps & { ref?: RefObject<HTMLAnchorElement | null> }) => (
	<PrefetchLink className={cn("transition-colors hover:text-primary", className)} ref={ref} {...props}>
		{children}
	</PrefetchLink>
);

Link.displayName = "Link";
