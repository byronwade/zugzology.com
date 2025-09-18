"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sprout, ChevronDown, ArrowRight } from "lucide-react";
import type { ShopifyBlog } from "@/lib/types";

interface LearnAndGrowMenuFixedProps {
	blogs: ShopifyBlog[];
}

const FALLBACK_SECTIONS = [
	{ title: "Guides", href: "/blogs/guides", description: "Step-by-step growing tutorials." },
	{ title: "Recipes", href: "/blogs/recipes", description: "Cook with your harvest." },
	{ title: "Tips & Tricks", href: "/blogs/tips", description: "Optimization insights from pros." },
];

export function LearnAndGrowMenuFixed({ blogs }: LearnAndGrowMenuFixedProps) {
	const featuredBlogs = (blogs || []).slice(0, 4);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="flex items-center gap-2 h-9 px-3 rounded-md text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-[#f9fafb] dark:hover:bg-[#212b36]"
				>
					<Sprout className="h-5 w-5 text-[#5c6ac4]" />
					<span className="text-sm font-medium">Learn</span>
					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				</Button>
			</PopoverTrigger>
		<PopoverContent
			sideOffset={12}
			align="start"
			className="w-[24rem] max-w-[calc(100vw-2rem)] p-0 overflow-hidden shadow-xl"
		>
			<div className="bg-gradient-to-br from-primary/5 via-background to-secondary/10 px-6 py-4 border-b border-border/60">
				<h3 className="text-sm font-semibold text-foreground">Learn &amp; Grow</h3>
				<p className="mt-1 text-xs text-muted-foreground">Resources to level up your cultivation craft.</p>
			</div>

			<div className="px-5 py-4 space-y-3">
					{(featuredBlogs.length ? featuredBlogs.map((blog) => {
						const firstArticle = blog.articles?.edges?.[0]?.node;
						return {
							title: blog.title,
							href: blog.handle ? `/blogs/${blog.handle}` : "/blogs",
							description: firstArticle?.excerpt || firstArticle?.title || blog.title,
						};
					}) : FALLBACK_SECTIONS).map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="group block rounded-md border border-transparent px-3 py-2 transition hover:border-primary/30 hover:bg-muted"
						>
							<p className="text-sm font-medium text-foreground group-hover:text-primary">{item.title}</p>
							<p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
						</Link>
					))}
				</div>

				<div className="flex items-center justify-between border-t border-border/60 bg-muted/40 px-5 py-3">
					<span className="text-xs text-muted-foreground">Explore tutorials, guides, and recorded workshops.</span>
					<Link
						href="/blogs"
						className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline whitespace-nowrap"
					>
						View all
						<ArrowRight className="h-3 w-3" />
					</Link>
				</div>
			</PopoverContent>
		</Popover>
	);
}
