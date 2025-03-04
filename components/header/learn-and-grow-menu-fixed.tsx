"use client";

import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";
import type { ShopifyBlog } from "@/lib/types";

interface LearnAndGrowMenuFixedProps {
	blogs: ShopifyBlog[];
}

export function LearnAndGrowMenuFixed({ blogs }: LearnAndGrowMenuFixedProps) {
	return (
		<Button
			variant="ghost"
			size="sm"
			className="flex items-center gap-2 h-9 px-3 rounded-md text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-[#f9fafb] dark:hover:bg-[#212b36]"
		>
			<Sprout className="h-5 w-5 text-[#5c6ac4]" />
			<span className="text-sm font-medium">Learn</span>
		</Button>
	);
} 