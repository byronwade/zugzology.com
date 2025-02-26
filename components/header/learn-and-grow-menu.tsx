"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Brain, Leaf, Sprout, TestTube, Sparkles, GraduationCap, Microscope, Lightbulb, Coffee } from "lucide-react";
import type { ShopifyBlog } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface LearnAndGrowMenuProps {
	blogs: ShopifyBlog[];
}

export function LearnAndGrowMenu({ blogs }: LearnAndGrowMenuProps) {
	const [isOpen, setIsOpen] = useState(false);

	const categoryStyles = {
		guide: { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
		tutorial: { icon: TestTube, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
		tip: { icon: Brain, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
		default: { icon: Leaf, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
	};

	const featuredCategories = [
		{
			title: "Getting Started",
			icon: GraduationCap,
			description: "Essential guides for beginners",
			color: "text-emerald-500",
			bg: "bg-emerald-50 dark:bg-emerald-500/10",
		},
		{
			title: "Advanced Techniques",
			icon: Microscope,
			description: "Deep dives into complex topics",
			color: "text-indigo-500",
			bg: "bg-indigo-50 dark:bg-indigo-500/10",
		},
		{
			title: "Tips & Tricks",
			icon: Lightbulb,
			description: "Quick tips for better results",
			color: "text-amber-500",
			bg: "bg-amber-50 dark:bg-amber-500/10",
		},
		{
			title: "Community Insights",
			icon: Coffee,
			description: "Learn from experienced growers",
			color: "text-rose-500",
			bg: "bg-rose-50 dark:bg-rose-500/10",
		},
	];

	// Mobile menu
	if (typeof window !== "undefined" && window.innerWidth < 640) {
		return (
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline" size="sm" className="h-10 px-3">
						<Sprout className="h-4 w-4" />
					</Button>
				</SheetTrigger>
				<SheetContent side="bottom" className="h-[80vh] p-0">
					<ScrollArea className="h-full">
						<div className="p-6 space-y-6">
							{/* Featured Categories */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold">Featured Categories</h3>
								<div className="grid grid-cols-2 gap-3">
									{featuredCategories.map((category) => {
										const Icon = category.icon;
										return (
											<div key={category.title} className={cn("group p-4 rounded-lg transition-all duration-200", category.bg, "hover:opacity-90")}>
												<Icon className={cn("h-6 w-6 mb-2", category.color)} />
												<h4 className="font-medium">{category.title}</h4>
												<p className="text-sm text-muted-foreground">{category.description}</p>
											</div>
										);
									})}
								</div>
							</div>

							{/* Learning Paths */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold">Learning Paths</h3>
								<div className="grid gap-2">
									{blogs?.map((blog) => {
										const style = blog.handle.includes("guide") ? categoryStyles.guide : blog.handle.includes("tutorial") ? categoryStyles.tutorial : blog.handle.includes("tip") ? categoryStyles.tip : categoryStyles.default;

										const Icon = style.icon;

										return (
											<Link key={blog.id} href={`/blogs/${blog.handle}`} className={cn("flex items-center gap-3 p-3 rounded-lg", style.bg, "transition-all duration-200 hover:opacity-90")}>
												<Icon className={cn("h-5 w-5", style.color)} />
												<div>
													<h4 className="font-medium">{blog.title}</h4>
													<p className="text-sm text-muted-foreground">{blog.articles?.edges?.length || 0} articles</p>
												</div>
											</Link>
										);
									})}
								</div>
							</div>

							{/* Latest Articles */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold">Latest Articles</h3>
									<Link href="/blogs" className="text-sm text-primary hover:underline">
										View All →
									</Link>
								</div>
								<div className="space-y-3">
									{blogs?.slice(0, 2).map((blog) =>
										blog.articles?.edges?.slice(0, 2).map((article) => (
											<Link key={article.node.id} href={`/blogs/${blog.handle}/${article.node.handle}`} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200">
												<div className={cn("p-2 rounded-lg", categoryStyles.default.bg)}>
													<Leaf className={cn("h-4 w-4", categoryStyles.default.color)} />
												</div>
												<div>
													<h4 className="font-medium group-hover:text-primary transition-colors">{article.node.title}</h4>
													<p className="text-sm text-muted-foreground">
														{new Date(article.node.publishedAt).toLocaleDateString("en-US", {
															month: "short",
															day: "numeric",
														})}
													</p>
												</div>
											</Link>
										))
									)}
								</div>
							</div>
						</div>
					</ScrollArea>
				</SheetContent>
			</Sheet>
		);
	}

	// Desktop menu
	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="h-10">
					<Sprout className="h-4 w-4 sm:mr-2" />
					<span className="hidden sm:inline">Learn & Grow</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-screen max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[800px]" sideOffset={8}>
				<div className="relative flex w-full flex-col space-y-4 p-3 sm:p-4">
					{/* Featured Categories */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
						{featuredCategories.map((category) => {
							const Icon = category.icon;
							return (
								<div key={category.title} className={cn("group relative flex flex-col space-y-2 rounded-lg p-3", category.bg, "hover:opacity-90 cursor-pointer")}>
									<Icon className={cn("h-5 w-5", category.color)} />
									<div>
										<h4 className="font-medium text-sm">{category.title}</h4>
										<p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
									</div>
								</div>
							);
						})}
					</div>

					<div className="h-px bg-border" />

					{/* Main Content Grid */}
					<div className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-6">
						{/* Learning Paths */}
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<h3 className="text-sm font-medium">Learning Paths</h3>
								<Sparkles className="h-3.5 w-3.5 text-amber-500" />
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
								{blogs?.slice(0, 4).map((blog) => {
									const style = blog.handle.includes("guide") ? categoryStyles.guide : blog.handle.includes("tutorial") ? categoryStyles.tutorial : blog.handle.includes("tip") ? categoryStyles.tip : categoryStyles.default;

									const Icon = style.icon;

									return (
										<Link key={blog.id} href={`/blogs/${blog.handle}`} className={cn("flex items-center gap-3 rounded-lg p-2.5", style.bg, "transition-colors hover:opacity-90")} onClick={() => setIsOpen(false)}>
											<Icon className={cn("h-4 w-4 shrink-0", style.color)} />
											<div className="space-y-0.5">
												<h4 className="text-sm font-medium line-clamp-1">{blog.title}</h4>
												<p className="text-xs text-muted-foreground">{blog.articles?.edges?.length || 0} articles</p>
											</div>
										</Link>
									);
								})}
							</div>
						</div>

						{/* Latest Articles */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium">Latest Articles</h3>
								<Link href="/blogs" className="text-xs text-primary hover:underline" onClick={() => setIsOpen(false)}>
									View All →
								</Link>
							</div>
							<div className="space-y-2">
								{blogs?.slice(0, 2).map((blog) =>
									blog.articles?.edges?.slice(0, 2).map((article) => (
										<Link key={article.node.id} href={`/blogs/${blog.handle}/${article.node.handle}`} className="group flex items-start gap-2 rounded-lg p-2 hover:bg-muted/50 transition-colors" onClick={() => setIsOpen(false)}>
											<div className={cn("shrink-0 p-1.5 rounded", categoryStyles.default.bg)}>
												<Leaf className={cn("h-3.5 w-3.5", categoryStyles.default.color)} />
											</div>
											<div className="space-y-1 min-w-0">
												<h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">{article.node.title}</h4>
												<p className="text-xs text-muted-foreground">
													{new Date(article.node.publishedAt).toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
													})}
												</p>
											</div>
										</Link>
									))
								)}
							</div>
						</div>
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
