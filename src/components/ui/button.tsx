import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Buttons stay in the body face — the mono voice is reserved for labels and data,
 * so commerce actions never turn into technical jargon. Hover changes the light
 * on the surface rather than flooding it with a new colour.
 */
const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm tracking-[-0.005em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/88",
				flush: "bg-flush text-flush-foreground shadow-sm hover:bg-flush/88",
				destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/88",
				outline: "border border-border bg-transparent hover:border-foreground/35 hover:bg-foreground/[0.04]",
				secondary: "bg-secondary text-secondary-foreground hover:bg-foreground/[0.07]",
				ghost: "hover:bg-foreground/[0.06] hover:text-foreground",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-8 px-3 text-xs",
				lg: "h-11 px-8",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = ({
	className,
	variant,
	size,
	asChild = false,
	ref,
	...props
}: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
	const Comp = asChild ? Slot : "button";
	return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
};
Button.displayName = "Button";

export { Button, buttonVariants };
