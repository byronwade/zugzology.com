import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Badges are labels, so they take the mono voice: uppercase, spaced, small.
 * Same family the slate uses, which keeps every label on the page in one register.
 */
const badgeVariants = cva(
	"inline-flex items-center rounded-sm border px-2 py-1 font-medium font-mono text-[0.625rem] uppercase leading-none tracking-[0.14em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary text-primary-foreground",
				flush: "border-transparent bg-flush text-flush-foreground",
				secondary: "border-transparent bg-foreground/[0.07] text-foreground",
				destructive: "border-transparent bg-destructive text-destructive-foreground",
				outline: "border-border text-muted-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
