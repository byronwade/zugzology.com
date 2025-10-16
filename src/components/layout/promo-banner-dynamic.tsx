"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTENT } from "@/lib/config/wadesdesign.config";

type DynamicPromoBannerProps = {
	showPromo: boolean;
	onDismiss: () => void;
};

export function DynamicPromoBanner({ showPromo, onDismiss }: DynamicPromoBannerProps) {
	if (!showPromo) {
		return null;
	}

	return (
		<div className="bg-primary py-2 text-primary-foreground text-sm">
			<div className="container mx-auto flex items-center justify-between px-4">
				<div className="flex-1 text-center">
					<span className="font-medium">{CONTENT.promoBanner.default}</span>
				</div>
				<Button
					className="h-6 w-6 text-primary-foreground hover:bg-primary/90"
					onClick={onDismiss}
					size="icon"
					variant="ghost"
				>
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</Button>
			</div>
		</div>
	);
}
