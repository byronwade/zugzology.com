"use client";

import { ArrowRight, ChevronDown, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ShopifyBlog } from "@/lib/types";

type LearnAndGrowMenuFixedProps = {
	blogs: ShopifyBlog[];
};

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
					className="flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 font-medium text-muted-foreground text-xs transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
					size="sm"
					variant="ghost"
				>
					<Sprout className="h-5 w-5 text-primary" />
					<span className="font-medium text-sm">Learn</span>
					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="w-[24rem] max-w-[calc(100vw-2rem)] overflow-hidden p-0 shadow-xl"
				sideOffset={12}
			>
				<div className="border-border/60 border-b bg-gradient-to-br from-primary/5 via-background to-secondary/10 px-6 py-4">
					<h3 className="font-semibold text-foreground text-sm">Learn &amp; Grow</h3>
					<p className="mt-1 text-muted-foreground text-xs">Resources to level up your cultivation craft.</p>
				</div>

				<div className="space-y-3 px-5 py-4">
					{(featuredBlogs.length
						? featuredBlogs.map((blog) => {
								const firstArticle = blog.articles?.edges?.[0]?.node;
								return {
									title: blog.title,
									href: blog.handle ? `/blogs/${blog.handle}` : "/blogs",
									description: firstArticle?.excerpt || firstArticle?.title || blog.title,
								};
							})
						: FALLBACK_SECTIONS
					).map((item) => (
						<Link
							className="group block rounded-md border border-transparent px-3 py-2 transition hover:border-primary/30 hover:bg-muted"
							href={item.href}
							key={item.href}
						>
							<p className="font-medium text-foreground text-sm group-hover:text-primary">{item.title}</p>
							<p className="mt-1 line-clamp-2 text-muted-foreground text-xs">{item.description}</p>
						</Link>
					))}
				</div>

				<div className="flex items-center justify-between border-border/60 border-t bg-muted/40 px-5 py-3">
					<span className="text-muted-foreground text-xs">Explore tutorials, guides, and recorded workshops.</span>
					<Link
						className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-primary text-xs hover:underline"
						href="/blogs"
					>
						View all
						<ArrowRight className="h-3 w-3" />
					</Link>
				</div>
			</PopoverContent>
		</Popover>
	);
}
