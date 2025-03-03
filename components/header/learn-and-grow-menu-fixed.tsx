"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
	BookOpen,
	Brain,
	Leaf,
	Sprout,
	TestTube,
	Sparkles,
	GraduationCap,
	Microscope,
	Lightbulb,
	Coffee,
	ChevronRight,
} from "lucide-react";
import type { ShopifyBlog } from "@/lib/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface LearnAndGrowMenuFixedProps {
	blogs: ShopifyBlog[];
}

export function LearnAndGrowMenuFixed({ blogs }: LearnAndGrowMenuFixedProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Check if we're on mobile when component mounts
	useEffect(() => {
		// Set initial state based on window width
		if (typeof window !== "undefined") {
			setIsMobile(window.innerWidth < 640);

			// Add event listener for window resize
			const handleResize = () => {
				setIsMobile(window.innerWidth < 640);
			};

			window.addEventListener("resize", handleResize);

			// Cleanup
			return () => window.removeEventListener("resize", handleResize);
		}
	}, []);

	const categoryStyles = {
		guide: { icon: BookOpen, color: "text-[#5c6ac4]", bg: "bg-[#f4f6f8] dark:bg-[#212b36]" },
		tutorial: { icon: TestTube, color: "text-[#50b83c]", bg: "bg-[#f4f6f8] dark:bg-[#212b36]" },
		tip: { icon: Brain, color: "text-[#eec200]", bg: "bg-[#f4f6f8] dark:bg-[#212b36]" },
		default: { icon: Leaf, color: "text-[#5c6ac4]", bg: "bg-[#f4f6f8] dark:bg-[#212b36]" },
	};

	const featuredCategories = [
		{
			title: "Getting Started",
			icon: GraduationCap,
			description: "Essential guides for beginners",
			color: "text-[#5c6ac4]",
			bg: "bg-[#f4f6f8] dark:bg-[#212b36]",
			url: "/blogs/guides",
		},
		{
			title: "Advanced Techniques",
			icon: Microscope,
			description: "Take your skills to the next level",
			color: "text-[#50b83c]",
			bg: "bg-[#f4f6f8] dark:bg-[#212b36]",
			url: "/blogs/tutorials",
		},
		{
			title: "Tips & Tricks",
			icon: Lightbulb,
			description: "Quick tips for better results",
			color: "text-[#eec200]",
			bg: "bg-[#f4f6f8] dark:bg-[#212b36]",
			url: "/blogs/tips",
		},
		{
			title: "Community Stories",
			icon: Coffee,
			description: "Learn from fellow enthusiasts",
			color: "text-[#5c6ac4]",
			bg: "bg-[#f4f6f8] dark:bg-[#212b36]",
			url: "/blogs/community",
		},
	];

	// Filter blogs by handle to organize them
	const organizedBlogs = {
		guides: blogs.filter((blog) => blog.handle === "guides"),
		tutorials: blogs.filter((blog) => blog.handle === "tutorials"),
		tips: blogs.filter((blog) => blog.handle === "tips"),
		other: blogs.filter((blog) => !["guides", "tutorials", "tips"].includes(blog.handle)),
	};

	// Mobile version uses a sheet
	if (isMobile) {
		return (
			<>
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="flex items-center gap-2 h-9 px-3 rounded-md text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-[#f9fafb] dark:hover:bg-[#212b36]"
						>
							<Sprout className="h-5 w-5 text-[#5c6ac4]" />
							<span className="text-sm font-medium">Learn</span>
						</Button>
					</SheetTrigger>
					<SheetContent
						side="left"
						className="w-full sm:max-w-md p-0 border-r border-[#c4cdd5] dark:border-[#31373d] bg-white dark:bg-gray-900"
					>
						<SheetHeader className="px-4 py-3 border-b border-[#c4cdd5] dark:border-[#31373d] bg-white dark:bg-gray-900">
							<div className="flex items-center justify-between">
								<SheetTitle className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
									<Sprout className="h-5 w-5 text-[#5c6ac4]" />
									Learn & Grow
								</SheetTitle>
								<Badge
									variant="outline"
									className="bg-[#f4f6f8] text-[#5c6ac4] border-[#c4cdd5] dark:bg-[#212b36]/20 dark:text-[#b4e0fa] dark:border-[#31373d]"
								>
									{blogs.length} Blogs
								</Badge>
							</div>
						</SheetHeader>

						<div className="overflow-y-auto h-full pb-20">
							<div className="px-4 py-4">
								<h3 className="text-xs font-semibold text-[#5c6ac4] dark:text-[#b4e0fa] uppercase tracking-wider mb-3 flex items-center gap-2">
									<Sparkles className="h-4 w-4" />
									Featured Categories
								</h3>
								<div className="grid grid-cols-1 gap-3">
									{featuredCategories.map((category) => (
										<Link
											key={category.title}
											href={category.url}
											className="flex items-center p-3 rounded-md border border-[#c4cdd5] dark:border-[#31373d] hover:border-[#5c6ac4] dark:hover:border-[#5c6ac4] transition-all group"
											onClick={() => setIsOpen(false)}
										>
											<div className={cn("w-10 h-10 rounded-md flex items-center justify-center mr-3", category.bg)}>
												<category.icon className={cn("h-5 w-5", category.color)} />
											</div>
											<div className="flex-1">
												<h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#5c6ac4] dark:group-hover:text-[#b4e0fa] transition-colors">
													{category.title}
												</h4>
												<p className="text-xs text-gray-500 dark:text-gray-400">{category.description}</p>
											</div>
											<ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#5c6ac4] dark:group-hover:text-[#b4e0fa] transition-colors" />
										</Link>
									))}
								</div>
							</div>

							<div className="px-4 py-2">
								<div className="h-px bg-gray-200 dark:bg-gray-800 my-2"></div>
							</div>

							{/* Recent Articles */}
							<div className="px-4 py-3">
								<h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Recent Articles</h3>
								<div className="space-y-1">
									{blogs.slice(0, 5).map((blog) => {
										const categoryKey =
											blog.handle === "guides"
												? "guide"
												: blog.handle === "tutorials"
												? "tutorial"
												: blog.handle === "tips"
												? "tip"
												: "default";
										const { icon: Icon, color, bg } = categoryStyles[categoryKey];

										return (
											<Link
												key={blog.id}
												href={`/blogs/${blog.handle}`}
												className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-[#f9fafb] dark:hover:bg-[#212b36] transition-all group"
												onClick={() => setIsOpen(false)}
											>
												<div className="flex items-center gap-3">
													<div className={cn("w-8 h-8 rounded-md flex items-center justify-center", bg)}>
														<Icon className={cn("h-4 w-4", color)} />
													</div>
													<span className="group-hover:text-[#5c6ac4] dark:group-hover:text-[#b4e0fa] transition-colors">
														{blog.title}
													</span>
												</div>
												<ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#5c6ac4] dark:group-hover:text-[#b4e0fa] transition-colors" />
											</Link>
										);
									})}
								</div>
							</div>
						</div>
					</SheetContent>
				</Sheet>
			</>
		);
	}

	// Desktop version uses a dropdown
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="flex items-center gap-2 h-9 px-3 rounded-md text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-[#f9fafb] dark:hover:bg-[#212b36]"
				>
					<Sprout className="h-5 w-5 text-[#5c6ac4]" />
					<span className="text-sm font-medium">Learn</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-[340px] p-0 border border-[#c4cdd5] dark:border-[#31373d] bg-white dark:bg-gray-900 shadow-lg rounded-md"
			>
				<div className="p-4 border-b border-[#c4cdd5] dark:border-[#31373d]">
					<h3 className="text-xs font-semibold text-[#5c6ac4] dark:text-[#b4e0fa] uppercase tracking-wider mb-3 flex items-center gap-2">
						<Sparkles className="h-4 w-4" />
						Featured Categories
					</h3>
					<div className="grid grid-cols-2 gap-2">
						{featuredCategories.slice(0, 4).map((category) => (
							<Link
								key={category.title}
								href={category.url}
								className="flex flex-col items-center p-3 rounded-md border border-[#c4cdd5] dark:border-[#31373d] hover:border-[#5c6ac4] dark:hover:border-[#5c6ac4] transition-all group"
							>
								<div className={cn("w-8 h-8 rounded-md flex items-center justify-center mb-2", category.bg)}>
									<category.icon className={cn("h-4 w-4", category.color)} />
								</div>
								<span className="text-xs font-medium text-gray-900 dark:text-gray-100 text-center group-hover:text-[#5c6ac4] dark:group-hover:text-[#b4e0fa] transition-colors">
									{category.title}
								</span>
							</Link>
						))}
					</div>
				</div>

				<div className="p-2">
					<h3 className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">Recent Articles</h3>
					{blogs.slice(0, 5).map((blog) => {
						const categoryKey =
							blog.handle === "guides"
								? "guide"
								: blog.handle === "tutorials"
								? "tutorial"
								: blog.handle === "tips"
								? "tip"
								: "default";
						const { icon: Icon, color, bg } = categoryStyles[categoryKey];

						return (
							<DropdownMenuItem key={blog.id} asChild className="px-2 py-1.5 cursor-pointer">
								<Link href={`/blogs/${blog.handle}`} className="flex items-center gap-2 w-full">
									<div className={cn("w-6 h-6 rounded-md flex items-center justify-center", bg)}>
										<Icon className={cn("h-3.5 w-3.5", color)} />
									</div>
									<span className="text-sm text-gray-700 dark:text-gray-300 hover:text-[#5c6ac4] dark:hover:text-[#b4e0fa] transition-colors">
										{blog.title}
									</span>
								</Link>
							</DropdownMenuItem>
						);
					})}
				</div>

				<div className="p-2 border-t border-[#c4cdd5] dark:border-[#31373d]">
					<DropdownMenuItem asChild className="px-2 py-1.5 cursor-pointer">
						<Link href="/blogs" className="flex items-center justify-between w-full">
							<span className="text-sm font-medium text-[#5c6ac4] dark:text-[#b4e0fa]">View All Blogs</span>
							<ChevronRight className="h-4 w-4 text-[#5c6ac4] dark:text-[#b4e0fa]" />
						</Link>
					</DropdownMenuItem>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
