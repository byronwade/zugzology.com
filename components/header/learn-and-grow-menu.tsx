"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BookOpen, Brain, Leaf, Sprout, TestTube, Sparkles, GraduationCap, Microscope, Lightbulb, Coffee, ChevronRight } from "lucide-react";
import type { ShopifyBlog } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface LearnAndGrowMenuProps {
	blogs: ShopifyBlog[];
}

export function LearnAndGrowMenu({ blogs }: LearnAndGrowMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Check if we're on mobile when component mounts
	useEffect(() => {
		const checkIfMobile = () => {
			setIsMobile(window.innerWidth < 640);
		};

		// Initial check
		checkIfMobile();

		// Add event listener for window resize
		window.addEventListener("resize", checkIfMobile);

		// Cleanup
		return () => window.removeEventListener("resize", checkIfMobile);
	}, []);

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

	// Render mobile menu if on mobile, otherwise render desktop menu
	if (isMobile) {
		return (
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="ghost" size="sm" className="h-9 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5">
						<BookOpen className="h-4 w-4" />
						<span>Learn</span>
					</Button>
				</SheetTrigger>
				<SheetContent side="right" className="w-full sm:max-w-md p-0 border-l border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-900">
					<SheetHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
						<div className="flex items-center justify-between">
							<SheetTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
								<GraduationCap className="h-5 w-5 text-purple-600" />
								Learn & Grow
							</SheetTitle>
							<Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
								Resources
							</Badge>
						</div>
					</SheetHeader>
					<div className="overflow-y-auto h-full">
						{/* Featured Categories */}
						<div className="px-6 py-5">
							<h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
								<Sparkles className="h-4 w-4" />
								Featured Categories
							</h3>
							<div className="grid grid-cols-2 gap-3">
								{featuredCategories.map((category) => {
									const CategoryIcon = category.icon;
									return (
										<Link key={category.title} href={`/blogs/${category.title.toLowerCase().replace(/\s+/g, "-")}`} className="flex flex-col items-center p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:border-purple-200 dark:hover:border-purple-800 group">
											<div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors", category.bg, "group-hover:opacity-90")}>
												<CategoryIcon className={cn("h-6 w-6", category.color)} />
											</div>
											<span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">{category.title}</span>
										</Link>
									);
								})}
							</div>
						</div>

						<div className="px-6 py-2">
							<div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-2"></div>
						</div>

						{/* Learning Paths */}
						<div className="px-6 py-4">
							<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
								<BookOpen className="h-4 w-4 text-purple-600" />
								Learning Paths
							</h3>
							<div className="space-y-1.5">
								{blogs?.map((blog) => {
									const style = blog.handle.includes("guide") ? categoryStyles.guide : blog.handle.includes("tutorial") ? categoryStyles.tutorial : blog.handle.includes("tip") ? categoryStyles.tip : categoryStyles.default;

									const IconComponent = style.icon;

									return (
										<Link key={blog.id} href={`/blogs/${blog.handle}`} className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all group">
											<div className="flex items-center gap-3">
												<div className={cn("w-8 h-8 rounded-md flex items-center justify-center transition-colors", style.bg)}>
													<IconComponent className={cn("h-4 w-4", style.color)} />
												</div>
												<span className="group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">{blog.title}</span>
											</div>
											<div className="flex items-center gap-2">
												<Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
													{blog.articles?.edges?.length || 0}
												</Badge>
												<ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
											</div>
										</Link>
									);
								})}
							</div>
						</div>

						{/* Latest Articles */}
						{blogs && blogs.length > 0 && (
							<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
								<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
									<Leaf className="h-4 w-4 text-green-600" />
									Latest Articles
								</h3>
								<div className="space-y-3">
									{blogs.slice(0, 3).map((blog) => (
										<Link key={blog.id} href={`/blogs/${blog.handle}`} className="block p-4 rounded-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-sm transition-all">
											<h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-purple-700 dark:hover:text-purple-400">{blog.title}</h4>
											<div className="flex items-center gap-2 mt-2">
												<Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
													{blog.articles?.edges?.length || 0} articles
												</Badge>
												<span className="text-xs text-gray-500 dark:text-gray-400">Updated recently</span>
											</div>
										</Link>
									))}
								</div>
								<div className="mt-4">
									<Button variant="outline" size="sm" className="w-full border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-700 dark:hover:text-purple-400 hover:border-purple-200 dark:hover:border-purple-800 transition-colors" asChild>
										<Link href="/blogs" className="flex items-center justify-center gap-1">
											View all articles
											<ChevronRight className="h-3.5 w-3.5" />
										</Link>
									</Button>
								</div>
							</div>
						)}
					</div>
				</SheetContent>
			</Sheet>
		);
	}

	// Desktop menu
	return (
		<div className="hidden md:block">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" className="h-9 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5">
						<BookOpen className="h-4 w-4" />
						<span>Learn</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-[600px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-0 shadow-lg rounded-lg overflow-hidden">
					<div className="grid grid-cols-2">
						<div className="p-6 border-r border-gray-200 dark:border-gray-800">
							<h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
								<Sparkles className="h-4 w-4" />
								Featured Categories
							</h3>
							<div className="grid grid-cols-2 gap-3">
								{featuredCategories.map((category) => {
									const CategoryIcon = category.icon;
									return (
										<DropdownMenuItem key={category.title} asChild className="p-0 focus:bg-transparent">
											<Link href={`/blogs/${category.title.toLowerCase().replace(/\s+/g, "-")}`} className="flex flex-col items-center p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:border-purple-200 dark:hover:border-purple-800 group w-full">
												<div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors", category.bg, "group-hover:opacity-90")}>
													<CategoryIcon className={cn("h-5 w-5", category.color)} />
												</div>
												<span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">{category.title}</span>
											</Link>
										</DropdownMenuItem>
									);
								})}
							</div>

							<div className="my-4">
								<div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
							</div>

							<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
								<BookOpen className="h-4 w-4 text-purple-600" />
								Learning Paths
							</h3>
							<div className="space-y-1.5">
								{blogs?.map((blog) => {
									const style = blog.handle.includes("guide") ? categoryStyles.guide : blog.handle.includes("tutorial") ? categoryStyles.tutorial : blog.handle.includes("tip") ? categoryStyles.tip : categoryStyles.default;

									const IconComponent = style.icon;

									return (
										<DropdownMenuItem key={blog.id} asChild className="p-0 focus:bg-transparent">
											<Link href={`/blogs/${blog.handle}`} className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 w-full group">
												<div className="flex items-center gap-2">
													<div className={cn("w-6 h-6 rounded-md flex items-center justify-center transition-colors", style.bg)}>
														<IconComponent className={cn("h-3.5 w-3.5", style.color)} />
													</div>
													<span className="group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">{blog.title}</span>
												</div>
												<div className="flex items-center gap-2">
													<Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
														{blog.articles?.edges?.length || 0}
													</Badge>
													<ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
												</div>
											</Link>
										</DropdownMenuItem>
									);
								})}
							</div>
						</div>

						{blogs && blogs.length > 0 && (
							<div className="p-6 bg-gray-50 dark:bg-gray-900/50">
								<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<Leaf className="h-4 w-4 text-green-600" />
									Latest Articles
								</h3>
								<div className="space-y-3">
									{blogs.slice(0, 3).map((blog) => (
										<DropdownMenuItem key={blog.id} asChild className="p-0 focus:bg-transparent">
											<Link href={`/blogs/${blog.handle}`} className="block p-3 rounded-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-sm transition-all w-full">
												<h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-purple-700 dark:hover:text-purple-400">{blog.title}</h4>
												<div className="flex items-center gap-2 mt-2">
													<Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
														{blog.articles?.edges?.length || 0} articles
													</Badge>
													<span className="text-xs text-gray-500 dark:text-gray-400">Updated recently</span>
												</div>
											</Link>
										</DropdownMenuItem>
									))}
								</div>
								<div className="mt-4">
									<Button variant="outline" size="sm" className="w-full border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-700 dark:hover:text-purple-400 hover:border-purple-200 dark:hover:border-purple-800 transition-colors" asChild>
										<Link href="/blogs" className="flex items-center justify-center gap-1">
											View all articles
											<ChevronRight className="h-3.5 w-3.5" />
										</Link>
									</Button>
								</div>
							</div>
						)}
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
