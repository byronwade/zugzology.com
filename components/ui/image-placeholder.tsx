"use client";

import { Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
	className?: string;
	iconClassName?: string;
}

export function ImagePlaceholder({ className, iconClassName }: ImagePlaceholderProps) {
	return (
		<div className={cn("w-full h-full flex items-center justify-center bg-muted/30", className)}>
			<Sprout className={cn("w-6 h-6 text-muted-foreground/50", iconClassName)} />
		</div>
	);
}
