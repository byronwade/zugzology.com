"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

interface AdPlaceholderProps {
	type?: "display" | "banner" | "sidebar" | "advertise";
	className?: string;
}

export function AdPlaceholder({ type = "display", className = "" }: AdPlaceholderProps) {
	const sizes = {
		display: "min-h-[250px] w-full max-w-[970px]",
		banner: "h-[90px] w-full max-w-[728px]",
		sidebar: "h-[600px] w-full max-w-full",
		advertise: "w-full h-[300px]",
	};

	if (type === "advertise") {
		return (
			<div className={`${sizes[type]} ${className} bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden flex items-center justify-center w-full`}>
				<div className="text-center px-4">
					<h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">Advertise with Us</h3>
					<p className="text-sm text-purple-700 dark:text-purple-300 mb-4">Reach thousands of mushroom enthusiasts and growers</p>
					<Button asChild variant="outline" className="bg-white hover:bg-purple-50 border-purple-200 text-purple-700 hover:text-purple-800">
						<Link href="/contact">Contact for Advertising</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className={`relative ${sizes[type]} ${className} bg-zinc-50 border border-zinc-200 rounded-sm overflow-hidden`}>
			<div className="absolute top-0 right-0 px-2 py-1 bg-zinc-100 text-[10px] text-zinc-400">Advertisement</div>
			<div className="flex items-center justify-center h-full w-full">
				<div className="text-center p-4">
					<div className="w-16 h-16 bg-zinc-200 rounded-full mx-auto mb-4 animate-pulse" />
					<div className="h-4 w-32 bg-zinc-200 mx-auto mb-2 animate-pulse rounded" />
					<div className="h-3 w-24 bg-zinc-200 mx-auto animate-pulse rounded" />
				</div>
			</div>
		</div>
	);
}
